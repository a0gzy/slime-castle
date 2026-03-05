'use client';

import { WikiEntity, SlimeMetadata } from "@/lib/wiki";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Shield, Sparkles, Star } from "lucide-react";

export function SlimeCard({ entity }: { entity: WikiEntity }) {
    const { t } = useLanguage();
    const meta = entity.metadata as SlimeMetadata;

    const getTranslation = (key: string) => {
        if (!key) return '';
        const translated = t(key);
        return translated === key ? key.split('.').pop() || key : translated;
    };

    const name = getTranslation(entity.nameKey);

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 font-sans">
            <div className="flex justify-between items-center px-4">
                <h1 className="text-4xl font-black text-rose-500 tracking-wider uppercase">{name}</h1>
                <div className="flex items-center gap-4 text-emerald-400 font-bold text-xl">
                    <div className="flex items-center gap-2">Total: 385 <span className="text-blue-400">💎</span></div>
                    <div className="flex items-center gap-2">49236 <span className="text-blue-400">💎</span></div>
                </div>
            </div>

            {/* Top Grid: Portrait, Stats, Bonuses */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1.5fr] gap-4">
                {/* Left: Portrait & Base Info */}
                <div className="border border-rose-900/50 bg-[#0a0a0c] p-4 flex flex-col items-center">
                    <div className="w-full aspect-square relative flex items-center justify-center bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 mb-4">
                        {entity.image ? (
                            <img src={entity.image} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <Ghost className="w-20 h-20 text-zinc-700" />
                        )}
                        <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] pointer-events-none" />
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4 text-center mt-2">
                        <div>
                            <div className="text-zinc-500 text-xs mb-1">Rank</div>
                            <div className="text-3xl font-black italic text-rose-400">{meta.rank || 'SSS'}</div>
                        </div>
                        <div>
                            <div className="text-zinc-500 text-xs mb-1">Element</div>
                            <div className="text-lg font-bold text-blue-400 mt-2">{meta.element || 'Water'}</div>
                        </div>
                    </div>

                    <div className="w-full mt-6 text-center border-t border-rose-900/30 pt-4">
                        <div className="text-zinc-500 text-xs mb-1">Unlock Cost:</div>
                        <div className="text-zinc-300 font-semibold">{meta.unlockCost || 'Event'}</div>
                    </div>
                </div>

                {/* Middle: Level Stats Box */}
                <div className="border border-rose-900/50 bg-[#0a0a0c] text-sm">
                    {meta.stats.map((stat, i) => (
                        <div key={i} className={`flex items-start md:items-center p-3 sm:px-4 sm:py-2 gap-4 ${i % 2 === 0 ? 'bg-rose-950/10' : ''}`}>
                            <div className="w-16 text-zinc-400 shrink-0">Lv. {stat.level}</div>
                            <div className="flex-1 text-zinc-300 leading-snug">{stat.label}</div>
                            <div className="w-20 text-right flex justify-end items-center gap-1.5 shrink-0 text-zinc-300 font-semibold">
                                {stat.crystals > 0 ? (
                                    <>{stat.crystals} <span className="text-blue-400 text-xs">💎</span></>
                                ) : (
                                    <span className="text-zinc-600">-</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Bonus Unlocks Box */}
                <div className="border border-rose-900/50 bg-[#0a0a0c] flex flex-col">
                    <div className="grid grid-cols-[3fr_7fr] border-b border-rose-900/50">
                        <div className="p-3 text-center text-zinc-500 text-xs font-bold">Star</div>
                        <div className="p-3 text-center text-rose-500 text-xs font-bold">Bonus unlock</div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        {meta.bonusUnlock.map((bonus, i) => (
                            <div key={i} className={`grid grid-cols-[3fr_7fr] text-sm ${i % 2 === 0 ? 'bg-rose-950/10' : ''}`}>
                                <div className="p-2 flex justify-center items-center gap-2 border-r border-rose-900/30">
                                    <span className="text-zinc-400 w-4 text-center">{bonus.star}</span>
                                    <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                                    <span className="text-zinc-300 text-xs w-8 text-right">{bonus.shards}</span>
                                </div>
                                <div className="p-2 text-zinc-300 flex items-center px-4">
                                    {bonus.bonus}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Bottom Stats Summary */}
                    <div className="grid grid-cols-2 text-sm border-t border-rose-900/50 bg-rose-950/20">
                        <div className="p-3 text-center text-zinc-500 text-xs flex flex-col justify-center border-r border-rose-900/30">
                            Stats at<br />level 250
                        </div>
                        <div className="grid grid-cols-2">
                            <div className="p-3 flex items-center justify-center gap-2 border-r border-rose-900/30 text-zinc-300">
                                <Sword className="w-4 h-4 text-yellow-500" /> 101400
                            </div>
                            <div className="p-3 flex items-center justify-center gap-2 text-zinc-300">
                                <Heart className="w-4 h-4 text-red-500" /> 116600
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active Skill */}
                <div className="border border-rose-900/50 bg-[#0a0a0c] p-4">
                    <div className="flex items-center justify-center gap-4 mb-4 border-b border-rose-900/30 pb-4">
                        <div className="w-12 h-12 rounded bg-indigo-900 flex items-center justify-center border border-indigo-500/50 overflow-hidden">
                            {meta.activeSkill?.icon ? (
                                <img src={meta.activeSkill.icon} alt="" className="w-full h-full object-contain" />
                            ) : (
                                <Sparkles className="w-6 h-6 text-indigo-300" />
                            )}
                        </div>
                        <div className="text-center">
                            <div className="text-emerald-400 text-sm font-bold">Active Skill</div>
                            <div className="text-zinc-200">
                                {getTranslation(meta.activeSkill?.name) || 'Unknown'} <span className="text-zinc-500 ml-2">| CD {meta.activeSkill?.cd || 0}s.</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-zinc-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: getTranslation(meta.activeSkill?.descKey) }} />
                </div>

                {/* Passive Skills */}
                {meta.passiveSkills.map((passive, i) => (
                    <div key={i} className="border border-rose-900/50 bg-[#0a0a0c] p-4">
                        <div className="flex items-center justify-center gap-4 mb-4 border-b border-rose-900/30 pb-4">
                            <div className="w-12 h-12 rounded bg-purple-900 flex items-center justify-center border border-purple-500/50">
                                <Shield className="w-6 h-6 text-purple-300" />
                            </div>
                            <div className="text-center">
                                <div className="text-rose-400 text-sm font-bold">Passive Skill</div>
                                <div className="text-zinc-200 uppercase tracking-wide text-sm">{passive.name}</div>
                            </div>
                        </div>
                        <div className="text-zinc-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: getTranslation(passive.descKey) }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Temporary internal icons for layout mapping until actual assets are loaded
import { Ghost, Sword, Heart } from "lucide-react";
