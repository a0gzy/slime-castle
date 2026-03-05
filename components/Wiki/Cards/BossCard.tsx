'use client';

import { WikiEntity, BossMetadata } from "@/lib/wiki";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Skull, Ghost, Target } from "lucide-react";

export function BossCard({ entity }: { entity: WikiEntity }) {
    const { t } = useLanguage();
    const meta = entity.metadata as BossMetadata;

    const getTranslation = (key: string) => {
        if (!key) return '';
        const translated = t(key);
        return translated === key ? key.split('.').pop() || key : translated;
    };

    const name = getTranslation(entity.nameKey);

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 font-sans">
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Visual / Intro Left Side */}
                <div className="lg:w-1/3 flex flex-col gap-4">
                    <div className="w-full aspect-square border-4 border-orange-900/50 rounded-2xl bg-zinc-900 overflow-hidden relative shadow-[0_0_50px_rgba(234,88,12,0.15)] flex items-center justify-center">
                        {entity.image ? (
                            <img src={entity.image} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <Skull className="w-24 h-24 text-orange-900/50" />
                        )}
                        <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black via-black/80 to-transparent">
                            <h1 className="text-3xl font-black text-white uppercase tracking-widest text-center drop-shadow-lg">{name}</h1>
                        </div>
                    </div>

                    <div className="bg-[#0c0c0e] border border-orange-900/30 rounded-2xl p-6">
                        <div className="flex flex-col gap-4 text-sm divide-y divide-orange-900/20">
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-zinc-500 font-bold uppercase">HP Threshold</span>
                                <span className="font-mono text-orange-400 font-bold bg-orange-950/30 px-2 py-1 rounded">{meta.hpThreshold || '???'}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <span className="text-zinc-500 font-bold uppercase">Weakness</span>
                                <div className="flex gap-2">
                                    {meta.weakness.length > 0 ? meta.weakness.map((w, i) => (
                                        <span key={i} className="px-2 py-0.5 border border-red-500/50 bg-red-950/50 text-red-400 font-bold rounded capitalize">{w}</span>
                                    )) : <span className="text-zinc-600 font-bold">None</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Skills */}
                <div className="lg:w-2/3 flex flex-col gap-4">
                    <div className="bg-[#0c0c0e] border border-orange-900/30 rounded-2xl p-6 sm:p-8 flex-1">
                        <div className="flex items-center gap-3 mb-8 border-b border-orange-900/30 pb-4">
                            <Target className="w-6 h-6 text-orange-500" />
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest">Boss Mechanics</h2>
                        </div>

                        <div className="flex flex-col gap-6">
                            {meta.skills.map((skill, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row gap-4 group">
                                    <div className="w-16 h-16 shrink-0 rounded-xl bg-orange-950/20 border border-orange-900/50 flex flex-col items-center justify-center relative overflow-hidden">
                                        <div className="absolute top-0 w-full h-full bg-orange-600/5 group-hover:bg-orange-600/10 transition-colors" />
                                        <Ghost className="w-6 h-6 text-orange-400 mb-1" />
                                        <div className="text-[10px] font-black font-mono text-zinc-400">{skill.chance}</div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 flex-1 p-2 sm:p-0">
                                        <h3 className="text-lg font-bold text-orange-100">{skill.name}</h3>
                                        <div className="text-zinc-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: getTranslation(skill.descKey) }} />
                                    </div>
                                </div>
                            ))}
                            {meta.skills.length === 0 && (
                                <div className="text-zinc-500 italic py-10 text-center">No mechanics documented yet.</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
