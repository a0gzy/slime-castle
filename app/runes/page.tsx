'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';

const RUNES = [
    { id: 'attack' },
    { id: 'attack_speed' },
    { id: 'crit_chance' },
    { id: 'crit_damage' },
    { id: 'crit_resist' },
    { id: 'hit_rate' },
    { id: 'double_attack_damage' },
    { id: 'range_damage' },
    { id: 'multi_attack' },
    { id: 'splash_chance' },
    { id: 'splash_damage' },
    { id: 'skill_crit_chance' },
    { id: 'skill_crit_mult' },
    { id: 'health' },
    { id: 'regeneration' },
    { id: 'dodge_chance' },
    { id: 'damage_return' },
    { id: 'shield_hp' },
    { id: 'life_steal' },
    { id: 'dead_hit' },
    { id: 'grievous_wound' },
];

type DupeItem = { id: string; checked: boolean };

export default function RunesPage() {
    const { lang, t } = useLanguage();
    const [grid, setGrid] = useState<Record<string, boolean[]>>({});
    const [dupesList, setDupesList] = useState<Record<number, DupeItem[]>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedGrid = localStorage.getItem('slime_runes_grid');
        if (savedGrid) {
            try { setGrid(JSON.parse(savedGrid)); } catch (e) { console.error(e); }
        } else {
            const initial: Record<string, boolean[]> = {};
            RUNES.forEach(r => initial[r.id] = [false, false, false, false]);
            setGrid(initial);
        }

        const savedDupes = localStorage.getItem('slime_runes_dupelist_v2');
        if (savedDupes) {
            try { setDupesList(JSON.parse(savedDupes)); } catch (e) { console.error(e); }
        }

        setMounted(true);
    }, []);

    const saveGrid = (newGrid: Record<string, boolean[]>) => {
        setGrid(newGrid);
        localStorage.setItem('slime_runes_grid', JSON.stringify(newGrid));
    };

    const saveDupesList = (newList: Record<number, DupeItem[]>) => {
        setDupesList(newList);
        localStorage.setItem('slime_runes_dupelist_v2', JSON.stringify(newList));
    };

    const toggleCell = (runeId: string, colIdx: number) => {
        const newGrid = { ...grid };
        if (!newGrid[runeId]) newGrid[runeId] = [false, false, false, false];
        newGrid[runeId][colIdx] = !newGrid[runeId][colIdx];
        saveGrid(newGrid);
    };

    const handleRightClick = (e: React.MouseEvent, runeId: string, colIdx: number) => {
        e.preventDefault();
        const newList = { ...dupesList };
        if (!newList[colIdx]) newList[colIdx] = [];

        // Add new instance (allow infinite)
        newList[colIdx] = [...newList[colIdx], { id: runeId, checked: false }];
        saveDupesList(newList);
    };

    const handleDupeRightClick = (e: React.MouseEvent, gearIdx: number, itemIdx: number) => {
        e.preventDefault();
        const newList = { ...dupesList };
        if (newList[gearIdx]) {
            newList[gearIdx] = newList[gearIdx].filter((_, idx) => idx !== itemIdx);
            saveDupesList(newList);
        }
    };

    const toggleDupeChecked = (gearIdx: number, itemIdx: number) => {
        const newList = { ...dupesList };
        if (newList[gearIdx] && newList[gearIdx][itemIdx]) {
            newList[gearIdx][itemIdx].checked = !newList[gearIdx][itemIdx].checked;
            saveDupesList(newList);
        }
    };

    const clearAll = () => {
        if (confirm(t('common.clear_tracker'))) {
            const initial: Record<string, boolean[]> = {};
            RUNES.forEach(r => initial[r.id] = [false, false, false, false]);
            saveGrid(initial);
            saveDupesList({});
        }
    };

    if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;

    return (
        <div className="flex flex-col p-4 md:p-8 bg-black items-center min-h-[calc(100vh-64px)] text-zinc-300">

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full max-w-7xl justify-center items-start">

                {/* Main Mythic Rune Tracker Table (LEFT) */}
                <div className="flex flex-col shrink-0 w-full lg:w-auto">
                    <div className="overflow-x-auto pb-4 scrollbar-hide">
                        <div className="min-w-[480px]">
                            <div className="flex items-center mb-6 gap-4 px-2">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-600 w-40 md:w-56 text-right tracking-tight leading-tight shrink-0">
                                    {t('runesPage.title')}
                                </h1>
                                <div className="flex gap-2.5 md:gap-3 ml-2 shrink-0">
                                    {['sword', 'armor', 'helmet', 'amulet'].map((name, i) => (
                                        <div key={i} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                                            <img
                                                src={`/icons/${name}.png`}
                                                alt={name}
                                                className="w-6 h-6 md:w-8 md:h-8 object-contain"
                                                style={{ filter: 'sepia(1) saturate(5) hue-rotate(-20deg) brightness(0.9) contrast(1.2)' }}
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-zinc-500 font-bold ml-4 text-lg md:text-xl shrink-0">%</div>
                            </div>

                            <div className="flex flex-col gap-1.5 text-[14px] font-medium tracking-tight">
                                {RUNES.map(rune => {
                                    const rowProg = grid[rune.id] ? grid[rune.id].filter(Boolean).length / 4 * 100 : 0;
                                    return (
                                        <div key={rune.id} className="flex items-center gap-4 hover:bg-zinc-900/40 rounded-lg py-1 px-2 transition-colors">
                                            <div className="w-40 md:w-56 text-right pr-3 text-zinc-400 font-bold text-sm md:text-base shrink-0">
                                                {t(`runes.${rune.id}`)}
                                            </div>
                                            <div className="flex gap-2.5 md:gap-3 ml-2 shrink-0">
                                                {[0, 1, 2, 3].map(colIdx => {
                                                    const isActive = grid[rune.id] && grid[rune.id][colIdx];
                                                    return (
                                                        <button
                                                            key={colIdx}
                                                            onClick={() => toggleCell(rune.id, colIdx)}
                                                            onContextMenu={(e) => handleRightClick(e, rune.id, colIdx)}
                                                            className={`w-8 h-8 md:w-10 md:h-10 rounded-md flex items-center justify-center transition-all border-2 ${isActive
                                                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                                : 'bg-zinc-900/80 border-[#27272a] text-transparent hover:border-zinc-500'
                                                                }`}
                                                        >
                                                            <svg className="w-5 h-5 md:w-6 md:h-6 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className={`w-14 text-right font-mono ml-4 text-base md:text-lg font-bold shrink-0 ${rowProg === 100 ? 'text-[#ff9d00]' : 'text-[#ff9d00]/70'}`}>
                                                {Math.round(rowProg)}%
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="flex items-center gap-4 px-2 py-6 mt-4 border-t border-zinc-800/50">
                                    <div className="w-40 md:w-56 text-right pr-3 text-emerald-600 font-extrabold text-base md:text-lg shrink-0">
                                        {t('runesPage.allRunes')}
                                    </div>
                                    <div className="flex gap-2.5 md:gap-3 ml-2 shrink-0">
                                        {[0, 1, 2, 3].map(colIdx => {
                                            let count = 0;
                                            RUNES.forEach(r => count += (grid[r.id]?.[colIdx] ? 1 : 0));
                                            const prog = Math.round((count / RUNES.length) * 100);
                                            return (
                                                <div key={colIdx} className="w-8 md:w-10 text-center font-mono text-emerald-600 font-bold text-sm md:text-base">
                                                    {prog}%
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="w-14 text-right font-mono font-extrabold text-emerald-600 ml-4 text-base md:text-lg shrink-0">
                                        {(() => {
                                            let tCount = 0;
                                            RUNES.forEach(r => tCount += (grid[r.id]?.filter(Boolean).length || 0));
                                            return ((tCount / (RUNES.length * 4)) * 100).toFixed(1);
                                        })()}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* RIGHT SIDEBAR (INFO + DUPLICATES) */}
                <div className="flex flex-col gap-8 w-full lg:max-w-md sticky top-24">

                    {/* INFO BLOCK (Bingo Style) */}
                    <div className="flex flex-col w-full bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                            {t('runesPage.reroll_secrets')}
                        </h3>
                        <div className="space-y-4">
                            <div className="px-4 py-3 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg text-blue-100/90 text-[14px] leading-relaxed">
                                <p className="font-semibold mb-1 text-blue-400 uppercase text-xs tracking-wider">
                                    {t('runesPage.quick_actions')}
                                </p>
                                <ul className="list-disc pl-4 space-y-1 mb-3">
                                    <li>{t('runesPage.action_left')}</li>
                                    <li>{t('runesPage.action_right')}</li>
                                </ul>

                                <p className="font-semibold mb-1 text-blue-400 uppercase text-xs tracking-wider">
                                    {t('runesPage.dupes_list')}
                                </p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>{t('runesPage.dupes_left')}</li>
                                    <li>{t('runesPage.dupes_right')}</li>
                                </ul>
                            </div>
                            <p className="text-zinc-500 text-xs px-1 leading-relaxed italic">
                                {t('runesPage.desc')}
                            </p>
                        </div>
                    </div>

                    {/* DUPLICATES BLOCK */}
                    <div className="flex flex-col bg-[#0c0c0e] border border-zinc-900 border-opacity-50 rounded-2xl p-7 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500/20 to-transparent" />
                        <div className="text-zinc-500 font-bold mb-6 uppercase text-xs tracking-[0.2em] flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-zinc-800" />
                            {t('runesPage.duplicates')}
                        </div>

                        <div className="flex flex-col gap-5">
                            {[0, 1, 2, 3].map(gearIdx => {
                                const list = dupesList[gearIdx] || [];
                                const iconNames = ['sword', 'armor', 'helmet', 'amulet'];

                                return (
                                    <div key={gearIdx} className="flex items-start gap-4 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/40 min-h-[70px] transition-all hover:bg-zinc-900/50">
                                        <div className="w-10 flex justify-center shrink-0 items-center h-full pt-1">
                                            <img
                                                src={`/icons/${iconNames[gearIdx]}.png`}
                                                alt={iconNames[gearIdx]}
                                                className="w-7 h-7 object-contain"
                                                style={{ filter: 'sepia(1) saturate(3) hue-rotate(-20deg) brightness(0.8)' }}
                                                onError={(e) => e.currentTarget.style.display = 'none'}
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-wrap gap-2.5 items-center">
                                            {list.length === 0 && (
                                                <span className="text-zinc-700 text-xs italic opacity-80 my-auto py-2">
                                                    {t('runesPage.click_hint')}
                                                </span>
                                            )}
                                            {list.map((item, itemIdx) => {
                                                const rune = RUNES.find(r => r.id === item.id);
                                                return (
                                                    <button
                                                        key={`${item.id}-${itemIdx}`}
                                                        onClick={() => toggleDupeChecked(gearIdx, itemIdx)}
                                                        onContextMenu={(e) => handleDupeRightClick(e, gearIdx, itemIdx)}
                                                        className={`px-3.5 py-1.5 text-xs rounded-lg transition-all border font-bold ${item.checked
                                                            ? 'bg-emerald-500/5 text-emerald-500/40 border-emerald-500/10 line-through'
                                                            : 'bg-[#1e1e21] text-zinc-300 border-[#2d2d30] shadow-md hover:border-zinc-500 hover:text-white active:scale-95'
                                                            }`}
                                                    >
                                                        {rune ? t(`runes.${rune.id}`) : item.id}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center mt-10">
                            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{t('runesPage.title')} v2.5</div>
                            <button
                                onClick={clearAll}
                                className="px-5 py-2.5 bg-red-500/5 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-xs font-bold uppercase tracking-wider"
                            >
                                {t('runesPage.reset')}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
