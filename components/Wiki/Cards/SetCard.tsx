'use client';

import { WikiEntity, SetMetadata } from "@/lib/wiki";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Sparkles, Box } from "lucide-react";

export function SetCard({ entity }: { entity: WikiEntity }) {
    const { t } = useLanguage();
    const meta = entity.metadata as SetMetadata;

    const getTranslation = (key: string) => {
        if (!key) return '';
        const translated = t(key);
        return translated === key ? key.split('.').pop() || key : translated;
    };

    const name = getTranslation(entity.nameKey);

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 font-sans">
            {/* Header: Title and Splash (if any) */}
            <div className="relative overflow-hidden rounded-3xl border border-purple-900/50 bg-[#0a0a0c] shadow-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 z-0">
                    {entity.image && (
                        <>
                            <img src={entity.image} className="w-full h-full object-cover opacity-20" alt="splash" />
                            <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0c]/80 via-transparent to-[#0a0a0c]" />
                        </>
                    )}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-600/10 blur-[100px] pointer-events-none" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="px-4 py-1 border border-purple-500/50 text-purple-400 font-bold bg-purple-950/50 rounded-full tracking-widest text-sm shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                        {meta.rarity || 'SS'} TIER
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black text-white tracking-widest uppercase drop-shadow-md">
                        {name || meta.name}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Component Items */}
                <div className="flex flex-col gap-6">
                    <div className="text-purple-400 font-bold uppercase text-xs tracking-widest flex items-center gap-3">
                        <span className="w-6 h-px bg-purple-700" /> Set Components
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {meta.items.map((item, i) => (
                            <div key={i} className="flex flex-col bg-[#0a0a0c] border border-purple-900/30 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors group">
                                <div className="p-4 flex items-center gap-4 border-b border-purple-900/20 bg-purple-950/10">
                                    <div className="w-14 h-14 bg-zinc-900 rounded-xl border border-zinc-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                                        {item.icon ? <img src={item.icon} alt={item.name} className="w-4/5 h-4/5 object-contain" /> : <Box className="w-6 h-6 text-zinc-700" />}
                                    </div>
                                    <div className="font-bold text-zinc-200">{item.name}</div>
                                </div>
                                <div className="p-4 flex flex-col gap-2">
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Base Stats</div>
                                    <div className="flex flex-col gap-1">
                                        {item.stats.map((stat, sIdx) => (
                                            <div key={sIdx} className="text-sm font-semibold text-emerald-400 font-mono bg-emerald-950/20 px-2 py-1 rounded inline-block w-fit border border-emerald-900/30">
                                                {stat}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Set Effects */}
                <div className="flex flex-col gap-6">
                    <div className="text-purple-400 font-bold uppercase text-xs tracking-widest flex items-center gap-3">
                        <span className="w-6 h-px bg-purple-700" /> Set Effects
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* 2-Piece */}
                        {meta.setEffect2?.descKey && (
                            <div className="bg-[#0c0c0e] border border-purple-900/50 rounded-2xl p-6 relative overflow-hidden">
                                <Sparkles className="absolute right-6 top-6 w-24 h-24 text-purple-600/10 pointer-events-none" />
                                <div className="text-xl font-black text-white italic mb-4 flex items-center gap-2">
                                    <span className="text-purple-500">2</span> PIECE
                                </div>
                                <div className="text-zinc-300 leading-relaxed text-sm">
                                    <div dangerouslySetInnerHTML={{ __html: getTranslation(meta.setEffect2.descKey) }} />
                                </div>
                            </div>
                        )}

                        {/* 4-Piece */}
                        {meta.setEffect4?.descKey && (
                            <div className="bg-[#0c0c0e] border border-orange-900/50 rounded-2xl p-6 relative overflow-hidden">
                                <Sparkles className="absolute right-6 top-6 w-24 h-24 text-orange-600/10 pointer-events-none" />
                                <div className="text-xl font-black text-white italic mb-4 flex items-center gap-2">
                                    <span className="text-orange-500">4</span> PIECE
                                </div>
                                <div className="text-zinc-300 leading-relaxed text-sm">
                                    <div dangerouslySetInnerHTML={{ __html: getTranslation(meta.setEffect4.descKey) }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
