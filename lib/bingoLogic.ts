export class Line {
    cells: Cell[] = [];
    get isComplete(): boolean {
        return this.cells.every(c => c.used);
    }
}

export class Cell {
    id: number;
    field: Field;
    row: Line;
    column: Line;
    used: boolean = false;
    lines: Line[] = [];

    constructor(id: number, field: Field, row: Line, column: Line) {
        this.id = id;
        this.field = field;
        this.row = row;
        this.column = column;
        this.lines.push(row, column);
    }

    getLineCompletionDesc(): number[] {
        return this.lines.map(line => line.cells.filter(c => c.used).length).sort((a, b) => b - a);
    }

    use() {
        this.used = true;
    }
}

export class Field {
    size: number;
    rows: Line[] = [];
    columns: Line[] = [];
    diagonals: Line[] = [new Line(), new Line()];
    cells: Cell[] = [];
    lines: Line[] = [];

    constructor(size: number = 5) {
        this.size = size;
        for (let i = 0; i < size; i++) {
            const row = new Line();
            this.rows.push(row);
            for (let j = 0; j < size; j++) {
                if (i === 0) this.columns.push(new Line());
                const column = this.columns[j];
                const cell = new Cell(i * size + j + 1, this, row, column);
                row.cells.push(cell);
                column.cells.push(cell);
                this.cells.push(cell);
                if (i === j) {
                    this.diagonals[0].cells.push(cell);
                    cell.lines.push(this.diagonals[0]);
                }
                if (i + j + 1 === size) {
                    this.diagonals[1].cells.push(cell);
                    cell.lines.push(this.diagonals[1]);
                }
            }
        }
        this.lines = [...this.columns, ...this.rows, ...this.diagonals];
    }

    get linesCompleted(): number {
        return this.lines.filter(l => l.isComplete).length;
    }

    get usedCellCount(): number {
        return this.cells.filter(c => c.used).length;
    }

    reset() {
        this.cells.forEach(c => c.used = false);
    }

    finishable(targetPattern: Field, maxMoves: number): boolean {
        let movesNeeded = 0;
        for (let i = 0; i < this.cells.length; i++) {
            if (targetPattern.cells[i].used && !this.cells[i].used) {
                movesNeeded++;
                if (movesNeeded > maxMoves) return false;
            }
        }
        return true;
    }

    clone(): Field {
        const clone = new Field(this.size);
        for (let i = 0; i < this.cells.length; i++) {
            clone.cells[i].used = this.cells[i].used;
        }
        return clone;
    }
}

function getMostCompleteCell(cells: Cell[]): Cell | null {
    let bestCell: Cell | null = null;
    let bestCounts: number[] = [];
    for (const cell of cells) {
        if (cell.used) continue;
        const counts = cell.getLineCompletionDesc();
        for (let i = 0; i < counts.length || i < bestCounts.length; i++) {
            if (bestCounts[i] === undefined || counts[i] > bestCounts[i]) {
                bestCounts = counts;
                bestCell = cell;
                break;
            } else if (counts[i] === undefined || counts[i] < bestCounts[i]) {
                break;
            }
        }
    }
    return bestCell;
}

function createPatterns(
    targetLines: number = 4,
    maxMoves: number = 16,
    field: Field = new Field(),
    line: number = 1,
    index: number = 0,
    indices: number[] = [],
    patterns: Record<number, Field[]> = {}
): Record<number, Field[]> {
    for (; index < field.lines.length - targetLines + line; index++) {
        indices.push(index);
        if (line === targetLines) {
            for (const lineIndex of indices) {
                for (let cellIndex = 0; cellIndex < field.lines[lineIndex].cells.length; cellIndex++) {
                    field.lines[lineIndex].cells[cellIndex].used = true;
                }
            }
            const moves = field.cells.filter(c => c.used).length;
            if (moves <= maxMoves) {
                if (!patterns[moves]) patterns[moves] = [];
                patterns[moves].push(field.clone());
            }
            field.reset();
        } else {
            createPatterns(targetLines, maxMoves, field, line + 1, index + 1, indices, patterns);
        }
        indices.pop();
    }
    return patterns;
}

const fourLinePatterns = createPatterns(4, 16);
const allFourLinePatterns = [...(fourLinePatterns[14] || []), ...(fourLinePatterns[15] || []), ...(fourLinePatterns[16] || [])];

const threeLinePatterns = createPatterns(3, 16);
const allThreeLinePatterns = [...(threeLinePatterns[12] || []), ...(threeLinePatterns[13] || []), ...(threeLinePatterns[14] || []), ...(threeLinePatterns[15] || []), ...(threeLinePatterns[16] || [])].filter(Boolean);

const twoLinePatterns = createPatterns(2, 16);
const allTwoLinePatterns = Object.values(twoLinePatterns).flat();

const patternLibs = [
    { lines: 4, patterns: allFourLinePatterns, remainingMovesOffset: 2 },
    { lines: 4, patterns: allFourLinePatterns, remainingMovesOffset: 1 },
    { lines: 4, patterns: allFourLinePatterns, remainingMovesOffset: 0 },
    { lines: 3, patterns: allThreeLinePatterns, remainingMovesOffset: 1 },
    { lines: 3, patterns: allThreeLinePatterns, remainingMovesOffset: 0 },
    { lines: 2, patterns: allTwoLinePatterns, remainingMovesOffset: 1 },
    { lines: 2, patterns: allTwoLinePatterns, remainingMovesOffset: 0 },
];

function createHeatmap(patterns: Field[]): number[] {
    const heatmap = Array(patterns[0].cells.length).fill(0);
    for (const pattern of patterns) {
        for (let i = 0; i < pattern.cells.length; i++) {
            if (pattern.cells[i].used) heatmap[i]++;
        }
    }
    return heatmap;
}

export function getHint(boardValues: number[], movesLeft: number): { bestMoveIndex: number | null, heatmap: number[] | null, message: string } {
    const field = new Field();
    for (let i = 0; i < 25; i++) {
        field.cells[i].used = boardValues[i] === 1;
    }

    if (field.usedCellCount === 25) return { bestMoveIndex: null, heatmap: null, message: 'All cells used' };

    let heatmap: number[] | null = null;
    let message = '';

    function getHeatMapOfBestPatterns(f: Field, remMoves: number): number[] | null {
        let patterns: Field[] = [];
        for (let i = 0; i < patternLibs.length; i++) {
            const lib = patternLibs[i];
            patterns = lib.patterns.filter(p => f.finishable(p, remMoves - lib.remainingMovesOffset));
            if (patterns.length > 0) {
                message = `${lib.lines}-line patterns finishable with ${16 - lib.remainingMovesOffset} total moves`;
                return createHeatmap(patterns);
            }
        }
        message = 'None - only 1-line solutions possible.';
        return null;
    }

    heatmap = getHeatMapOfBestPatterns(field, movesLeft);

    if (!heatmap) {
        const bestCell = getMostCompleteCell(field.cells);
        return { bestMoveIndex: bestCell ? bestCell.id - 1 : null, heatmap: null, message };
    }

    let baseCells = field.cells;
    let hotCells: Cell[] = [];
    let currentRemMoves = movesLeft;
    let currentHeatmap = heatmap;

    do {
        let maxHeat = Number.NEGATIVE_INFINITY;
        for (const cell of baseCells) {
            if (cell.used) continue;
            const heat = currentHeatmap[cell.id - 1];
            if (heat > maxHeat) {
                maxHeat = heat;
                hotCells = [cell];
            } else if (heat === maxHeat) {
                hotCells.push(cell);
            }
        }

        if (hotCells.length === 1) break;
        currentRemMoves--;
        const nextHeatmap = getHeatMapOfBestPatterns(field, currentRemMoves);
        if (!nextHeatmap || currentRemMoves <= 1) break;
        currentHeatmap = nextHeatmap;
        baseCells = hotCells;
    } while (true);

    const bestCell = getMostCompleteCell(hotCells);
    return { bestMoveIndex: bestCell ? bestCell.id - 1 : null, heatmap, message };
}
