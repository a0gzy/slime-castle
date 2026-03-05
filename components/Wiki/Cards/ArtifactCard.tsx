'use client';

import { WikiEntity, ArtifactMetadata } from "@/lib/wiki";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Sword, Star, Info } from "lucide-react";

export function ArtifactCard({ entity }: { entity: WikiEntity }) {
    const { t } = useLanguage();
    const meta = entity.metadata as ArtifactMetadata;

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
                <div className="px-4 py-1 border border-rose-500/50 text-rose-400 font-bold bg-rose-950/30 rounded-full tracking-widest text-sm">
                    {meta.rarity || 'MYTHIC'}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-6">
                {/* Left Side: Avatar & Stars */}
                <div className="flex flex-col gap-4">
                    <div className="border border-rose-900/50 bg-[#0a0a0c] p-6 flex flex-col items-center">
                        <div className="w-full aspect-square relative flex items-center justify-center bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] mb-6">
                            {entity.image ? (
                                <img src={entity.image} alt={name} className="w-4/5 h-4/5 object-contain drop-shadow-2xl" />
                            ) : (
                                <Sword className="w-20 h-20 text-zinc-700" />
                            )}
                        </div>

                        {meta.exclusive && (
                            <div className="w-full flex items-center justify-between text-sm mb-2 border-b border-rose-900/30 pb-2">
                                <span className="text-zinc-500">Exclusive</span>
                                <span className="text-zinc-200 font-semibold">{meta.exclusive}</span>
                            </div>
                        )}

                        <div className="w-full mt-4 flex flex-col gap-2">
                            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center mb-2">Star Costs</div>
                            {meta.stars.map((s, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 bg-rose-950/10 rounded border border-rose-900/20">
                                    <div className="flex flex-col items-center">
                                        <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                                        <span className="text-zinc-600 text-[10px] uppercase font-bold">Lvl {s.star}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-bold text-zinc-300">
                                        {s.cost} <span className="text-blue-400 text-xs">💎</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Skills */}
                <div className="flex flex-col gap-4">
                    {meta.skills.map((skill, skIdx) => (
                        <div key={skIdx} className="border border-rose-900/50 bg-[#0a0a0c] overflow-hidden flex flex-col">
                            {/* Skill Header */}
                            <div className="bg-rose-950/30 border-b border-rose-900/50 p-4 flex gap-4">
                                <div className="w-14 h-14 rounded-lg bg-red-950/50 border border-red-500/30 flex items-center justify-center shrink-0">
                                    <img src={entity.image || ''} alt="" className="w-10 h-10 object-contain opacity-70" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="text-rose-400 font-bold text-lg">{skill.name}</div>
                                    {skill.upgradeLevels && (
                                        <div className="text-xs text-zinc-500 capitalize">
                                            Upgrades at: {skill.upgradeLevels} ★
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Skill Description */}
                            <div className="p-5 text-sm leading-relaxed text-zinc-300 relative border-b border-rose-900/30">
                                <Info className="absolute right-5 top-5 w-5 h-5 text-rose-900/50" />
                                <div dangerouslySetInnerHTML={{ __html: getTranslation(skill.descKey) }} />
                            </div>

                            {/* Skill Scaling Table */}
                            {skill.levels.length > 0 && (
                                <div className="flex flex-col text-sm">
                                    <div className="grid grid-cols-[1fr_2fr_2fr] bg-rose-950/20 px-4 py-2 border-b border-rose-900/30 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        <div className="text-center">Skill Lvl</div>
                                        <div className="text-center">Multiplier</div>
                                        <div>Stun/Duration</div>
                                    </div>
                                    {skill.levels.map((lvl, lvIdx) => (
                                        <div key={lvIdx} className={`grid grid-cols-[1fr_2fr_2fr] px-4 py-3 items-center ${lvIdx % 2 === 0 ? '' : 'bg-rose-950/10'}`}>
                                            <div className="font-bold text-rose-500 text-center">{lvl.level}</div>
                                            <div className="text-emerald-400 font-mono text-center">{lvl.multiplier}</div>
                                            <div className="text-zinc-300">{lvl.stun}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
