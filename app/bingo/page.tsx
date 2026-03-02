'use client';

import { useState, useEffect } from 'react';
import styles from './bingo.module.css';
import { getHint } from '../../lib/bingoLogic';
import { useLanguage } from '../../components/providers/LanguageProvider';

type Board = number[]; // 0 = empty, 1 = occupied
type CompletedLine = { type: 'row' | 'col' | 'diag1' | 'diag2'; index: number };

const SIZE = 5;
const MAX_MOVES = 16;
const TARGET_LINES = 4;

type HistoryItem = { id: string; date: string; lines: number; targetLines: number };

export default function BingoHelper() {
  const [board, setBoard] = useState<Board>(Array(25).fill(0));
  const [completedLines, setCompletedLines] = useState<CompletedLine[]>([]);
  const [hint, setHint] = useState<string>('');
  const [bestMove, setBestMove] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<number[]>([]);
  const [phase, setPhase] = useState<'yours' | 'random'>('yours');
  const [gameHistory, setGameHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<number[] | null>(null);
  const { lang } = useLanguage();

  const content = {
    ru: {
      moves: "Ходы",
      lines: "Линии",
      undo: "Отмена хода",
      reset: "Новая игра",
      history: "История игр",
      emptyHistory: "История пока пуста",
      clearHistory: "Очистить список",
      heatmap: "Показать Heatmap (Веса ячеек)",
      gameOver: "Игра окончена",
      calculateHint: "Оптимальный ход",
      waitTurn: "🔢 Отметьте число, которое выпало",
      gameFinished: "🎉 Завершено! Собрано линий",
      allMovesDone: "Все возможные ходы завершены",
      descTitle: "Как это работает?",
      descText: "Этот инструмент анализирует все возможные комбинации для получения 4 линий и строит тепловую карту (Heatmap). Синим цветом подсвечивается наиболее выгодный ход.",
      howItWorks: [
        "Если у нескольких ячеек одинаковый вес, алгоритм выбирает ту, у которой больше активных соседних ячеек на пересекающихся линиях.",
        "Приоритетное завершение: 4 линии (26% вероятности), если недоступно — 3 или 2 линии.",
        "Режим Heatmap показывает число оставшихся выигрышных паттернов для каждой ячейки."
      ]
    },
    en: {
      moves: "Moves",
      lines: "Lines",
      undo: "Undo Move",
      reset: "New Game",
      history: "Game History",
      emptyHistory: "History is empty",
      clearHistory: "Clear List",
      heatmap: "Show Heatmap (Cell Weights)",
      gameOver: "Game Over",
      calculateHint: "Recommended move",
      waitTurn: "🔢 Mark the number that dropped",
      gameFinished: "🎉 Finished! Lines collected",
      allMovesDone: "All possible moves finished",
      descTitle: "How it works?",
      descText: "This tool finds finishable 4-line patterns and calculates a heatmap. The blue highlight suggests the best strategic move.",
      howItWorks: [
        "If cells have equal weight, it prioritizes those with more active neighbors on crossing lines.",
        "Targeting: 4 lines (26% chance), falling back to 3 or 2 lines if needed.",
        "Heatmap mode displays how many winning patterns participate in each cell."
      ]
    }
  };

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('bingo_history');
    if (savedHistory) {
      try {
        setGameHistory(JSON.parse(savedHistory));
      } catch (e) { console.error('History load error', e); }
    }
  }, []);

  // Re-calculate hint when language changes to update translation immediately
  useEffect(() => {
    if (moveHistory.length === 0 && board.every(v => v === 0)) {
      calculateHint(board, 0);
      return;
    }
    if (moveHistory.length >= MAX_MOVES) {
      setHint(`${content[lang].gameFinished}: ${completedLines.length}`);
      return;
    }

    if (phase === 'yours') {
      calculateHint(board, moveHistory.length);
    } else {
      setHint(content[lang].waitTurn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Save history to localstorage
  const saveToHistory = (lines: number) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      lines,
      targetLines: TARGET_LINES,
    };
    const updated = [newItem, ...gameHistory].slice(0, 20); // Keep last 20
    setGameHistory(updated);
    localStorage.setItem('bingo_history', JSON.stringify(updated));
  };

  const getLines = (b: Board): CompletedLine[] => {
    const lines: CompletedLine[] = [];
    for (let r = 0; r < SIZE; r++) {
      if (b.slice(r * SIZE, r * SIZE + SIZE).every(x => x)) {
        lines.push({ type: 'row', index: r });
      }
    }
    for (let c = 0; c < SIZE; c++) {
      if (Array.from({ length: SIZE }, (_, r) => b[r * SIZE + c]).every(x => x)) {
        lines.push({ type: 'col', index: c });
      }
    }
    if (Array.from({ length: SIZE }, (_, i) => b[i * SIZE + i]).every(x => x)) {
      lines.push({ type: 'diag1', index: -1 });
    }
    if (Array.from({ length: SIZE }, (_, i) => b[i * SIZE + (SIZE - 1 - i)]).every(x => x)) {
      lines.push({ type: 'diag2', index: -1 });
    }
    return lines;
  };

  const getLineIndices = (line: CompletedLine): number[] => {
    if (line.type === 'row') return Array.from({ length: SIZE }, (_, c) => line.index * SIZE + c);
    if (line.type === 'col') return Array.from({ length: SIZE }, (_, r) => r * SIZE + line.index);
    if (line.type === 'diag1') return Array.from({ length: SIZE }, (_, i) => i * SIZE + i);
    if (line.type === 'diag2') return Array.from({ length: SIZE }, (_, i) => i * SIZE + (SIZE - 1 - i));
    return [];
  };

  const completedIndices = completedLines.flatMap(getLineIndices);

  const calculateHint = (b: Board, currentMoves: number) => {
    if (currentMoves >= MAX_MOVES) {
      setBestMove(null);
      setHeatmapData(null);
      setHint(content[lang].gameOver);
      return;
    }

    const { bestMoveIndex, heatmap } = getHint(b, MAX_MOVES - currentMoves);

    setBestMove(bestMoveIndex);
    setHeatmapData(heatmap);

    if (bestMoveIndex !== null) {
      setHint(`${content[lang].calculateHint}: №${bestMoveIndex + 1}`);
    } else {
      setHint(content[lang].allMovesDone);
    }
  };

  const handleClick = (idx: number) => {
    if (board[idx] || moveHistory.length >= MAX_MOVES) return;

    const newBoard = [...board];
    newBoard[idx] = 1;
    const newHistory = [...moveHistory, idx];
    const newPhase = phase === 'yours' ? 'random' : 'yours';

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setPhase(newPhase);

    const lines = getLines(newBoard);
    setCompletedLines(lines);

    if (newHistory.length === MAX_MOVES) {
      const linesCount = lines.length;
      setHint(`${content[lang].gameFinished}: ${linesCount}`);
      setBestMove(null);
      setHeatmapData(null);
      saveToHistory(linesCount);
      setTimeout(reset, 4000);
    } else {
      if (newPhase === 'random') {
        setBestMove(null);
        setHeatmapData(null);
        setHint(content[lang].waitTurn);
      } else {
        calculateHint(newBoard, newHistory.length);
      }
    }
  };

  const undo = () => {
    if (moveHistory.length === 0) return;
    const newHistory = moveHistory.slice(0, -1);
    const newBoard = Array(25).fill(0);
    newHistory.forEach(i => newBoard[i] = 1);
    const newPhase = newHistory.length % 2 === 0 ? 'yours' : 'random';

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setPhase(newPhase);

    const lines = getLines(newBoard);
    setCompletedLines(lines);

    if (newPhase === 'yours') {
      calculateHint(newBoard, newHistory.length);
    } else {
      setBestMove(null);
      setHeatmapData(null);
      setHint(content[lang].waitTurn);
    }
  };

  const reset = () => {
    setBoard(Array(25).fill(0));
    setMoveHistory([]);
    setPhase('yours');
    setCompletedLines([]);
    calculateHint(Array(25).fill(0), 0);
  };

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate dynamic heatmap colors
  const getHeatmapStyle = (val: number, isBest: boolean, idx: number) => {
    if (val || isBest || !showHeatmap || !heatmapData || !heatmapData[idx]) return {};
    const max = Math.max(...heatmapData);
    const min = Math.min(...heatmapData.filter(v => v > 0) || [0]);
    if (max === min && max > 0) return { backgroundColor: 'rgb(255, 100, 100)', color: 'white' };

    // Scale from dark grey (0%) to bright pink/red (100%)
    const normalized = (heatmapData[idx] - min) / (max - min); // 0.0 to 1.0
    const colorShade = Math.round(100 - (100 * normalized));
    return {
      backgroundColor: `rgb(255, ${100 + colorShade}, ${100 + colorShade})`,
      color: 'black',
      border: 'none'
    };
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainLayout}>
        {/* CENTER COLUMN: GAME (Moves to 1st position on mobile) */}
        <div className={styles.centerColumn}>
          <div className={styles.header}>
            <h1 className={styles.title}>BINGO HELPER</h1>
          </div>

          <div className={styles.info}>
            <div className={styles.statsRow}>
              <span>{content[lang].moves}: {moveHistory.length} / {MAX_MOVES}</span>
              <span>{content[lang].lines}: {completedLines.length} / {TARGET_LINES}</span>
            </div>
            <div className={styles.hint}>{hint}</div>
          </div>

          <div className={styles.grid}>
            {board.map((val, idx) => {
              const inLine = completedIndices.includes(idx);
              const isBest = phase === 'yours' && bestMove === idx;
              const heatStyle = getHeatmapStyle(val, isBest, idx);

              return (
                <div
                  key={idx}
                  className={`${styles.cell} ${val ? (inLine ? styles.lineCell : styles.occupiedCell) : ''
                    } ${isBest ? styles.bestMove : ''}`}
                  style={heatStyle}
                  onClick={() => handleClick(idx)}
                >
                  {val ? '✓' : idx + 1}
                  {!val && showHeatmap && heatmapData && heatmapData[idx] > 0 && (
                    <span className={styles.heatmapVal}>{heatmapData[idx]}</span>
                  )}
                </div>
              );
            })}
          </div>

          <label className={styles.heatmapToggle}>
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
            />
            {content[lang].heatmap}
          </label>

          <div className={styles.controls}>
            <button
              onClick={undo}
              className={`${styles.btn} ${styles.undoBtn}`}
              disabled={moveHistory.length === 0}
            >
              {content[lang].undo}
            </button>
            <button onClick={reset} className={`${styles.btn} ${styles.resetBtn}`}>
              {content[lang].reset}
            </button>
          </div>
        </div>

        {/* SIDE COLUMN: HISTORY */}
        <div className={`${styles.sideColumn} ${styles.historyColumn}`}>
          <div className={styles.historyContainer}>
            <button
              className={styles.historyToggle}
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            >
              <span>{content[lang].history}</span>
              <span>{isHistoryOpen ? '▲' : '▼'}</span>
            </button>

            {isHistoryOpen && (
              <div className={styles.historyList}>
                {gameHistory.length === 0 ? (
                  <div className={styles.historyItem} style={{ justifyContent: 'center', color: 'var(--text-muted)' }}>
                    {content[lang].emptyHistory}
                  </div>
                ) : (
                  gameHistory.map(item => (
                    <div key={item.id} className={styles.historyItem}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.date.split(',')[0]}</span>
                      <span style={{ fontWeight: 600, color: item.lines >= item.targetLines ? 'var(--accent-green)' : 'var(--text-main)' }}>
                        {item.lines} / {item.targetLines} {lang === 'ru' ? 'лин.' : 'lines'}
                      </span>
                    </div>
                  ))
                )}
                {gameHistory.length > 0 && (
                  <button
                    onClick={() => {
                      setGameHistory([]);
                      localStorage.removeItem('bingo_history');
                    }}
                    className={styles.btn}
                    style={{ marginTop: '12px', fontSize: '0.8rem', padding: '8px' }}
                  >
                    {content[lang].clearHistory}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SIDE COLUMN: DESCRIPTION */}
        <div className={styles.sideColumn}>
          <div className={styles.descriptionSection}>
            <div className={styles.descriptionHeader}>
              <h3>{content[lang].descTitle}</h3>
            </div>
            <p className={styles.mainDesc}>{content[lang].descText}</p>
            <ul className={styles.descList}>
              {content[lang].howItWorks.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}