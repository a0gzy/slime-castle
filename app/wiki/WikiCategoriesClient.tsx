'use client';

import { WikiCategory } from "@/lib/wikiCategories";
import { WikiEntity } from "@/lib/wiki";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { LayoutGrid, Ghost, Sword, Shield, Box, Book, FileText, Sparkles, Star, Skull, Target, Gem, Crown, Zap, Heart, Edit, ScrollText, Tag } from "lucide-react";

const iconMap: Record<string, any> = {
    Ghost, Sword, Shield, Box, Book, FileText, Sparkles, Star, Skull, Target, Gem, Crown, Zap, Heart, LayoutGrid
};

export function WikiCategoriesClient({ categories, latestChangelog }: { categories: WikiCategory[]; latestChangelog?: WikiEntity | null }) {
    const { t } = useLanguage();
    const { isAdmin } = useAuth();

    const getTranslation = (key: string) => {
        if (!key) return '';
        const translated = t(key);
        return translated === key ? key.split('.').pop() || key : translated;
    };

    const colorsByIndex = [
        { border: 'border-blue-900/50', glow: 'bg-blue-500/10', text: 'text-blue-400', iconBg: 'bg-blue-950/50' },
        { border: 'border-red-900/50', glow: 'bg-red-500/10', text: 'text-red-400', iconBg: 'bg-red-950/50' },
        { border: 'border-purple-900/50', glow: 'bg-purple-500/10', text: 'text-purple-400', iconBg: 'bg-purple-950/50' },
        { border: 'border-orange-900/50', glow: 'bg-orange-500/10', text: 'text-orange-400', iconBg: 'bg-orange-950/50' },
        { border: 'border-emerald-900/50', glow: 'bg-emerald-500/10', text: 'text-emerald-400', iconBg: 'bg-emerald-950/50' },
        { border: 'border-cyan-900/50', glow: 'bg-cyan-500/10', text: 'text-cyan-400', iconBg: 'bg-cyan-950/50' },
        { border: 'border-pink-900/50', glow: 'bg-pink-500/10', text: 'text-pink-400', iconBg: 'bg-pink-950/50' },
        { border: 'border-amber-900/50', glow: 'bg-amber-500/10', text: 'text-amber-400', iconBg: 'bg-amber-950/50' },
    ];

    return (
        <div className="flex-1 p-6 md:p-12 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-8 pb-32">

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

                    {/* LEFT COLUMN */}
                    <div className="space-y-8">

                        {/* Intro Header — like the screenshot */}
                        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -mt-32 -mr-32" />
                            <div className="relative z-10 flex items-start gap-5">
                                <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-900/50 shadow-[0_0_20px_rgba(16,185,129,0.1)] shrink-0">
                                    <LayoutGrid className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">Slime Castle Wiki</h1>
                                    <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                                        {getTranslation('wiki.intro')}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <Link href="/admin/wiki-editor" className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 hover:text-white transition-colors">
                                        <Edit className="w-4 h-4" /> Edit
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Content label */}
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-px bg-zinc-700" />
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t('wiki.content_label') !== 'wiki.content_label' ? t('wiki.content_label') : 'Content'}</span>
                            <span className="flex-1 h-px bg-zinc-800" />
                        </div>

                        {/* Category Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {categories.filter(c => c.id !== 'changelogs').map((cat, idx) => {
                                const colors = colorsByIndex[idx % colorsByIndex.length];
                                const isCustomSvg = cat.icon?.startsWith('svg:');
                                const isImage = cat.icon?.startsWith('img:');
                                const Icon = (!isCustomSvg && !isImage) ? (iconMap[cat.icon] || FileText) : null;
                                const customSvgHtml = isCustomSvg ? cat.icon.slice(4) : '';
                                const imageUrl = isImage ? cat.icon.slice(4) : '';
                                const name = getTranslation(cat.nameKey);
                                const desc = getTranslation(cat.descriptionKey);

                                return (
                                    <Link
                                        key={cat.id}
                                        href={`/wiki/${cat.id}`}
                                        className={`relative flex flex-col gap-4 bg-[#0c0c0e] border ${colors.border} p-6 rounded-2xl hover:bg-zinc-900/80 transition-all group hover:shadow-xl hover:scale-[1.02] overflow-hidden`}
                                    >
                                        <div className={`absolute top-0 right-0 w-40 h-40 ${colors.glow} rounded-full blur-[60px] pointer-events-none -mt-16 -mr-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                        <div className={`w-14 h-14 rounded-xl ${colors.iconBg} border ${colors.border} flex items-center justify-center relative z-10 overflow-hidden`}>
                                            {isImage ? (
                                                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                                            ) : isCustomSvg ? (
                                                <div className={`w-7 h-7 ${colors.text} [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-current`} dangerouslySetInnerHTML={{ __html: customSvgHtml }} />
                                            ) : (
                                                <Icon className={`w-7 h-7 ${colors.text}`} />
                                            )}
                                        </div>
                                        <div className="relative z-10">
                                            <h2 className="text-xl font-bold text-white mb-1 group-hover:text-white/90 transition-colors">
                                                {name}
                                            </h2>
                                            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">
                                                {desc || 'Explore this section of the wiki.'}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="space-y-6">

                        {/* Current Version Block */}
                        <div className="bg-[#0c0c0e] border border-amber-900/40 rounded-2xl p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none -mt-16 -mr-16" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Tag className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{t('wiki.current_version') !== 'wiki.current_version' ? t('wiki.current_version') : 'Current Version'}</span>
                                </div>
                                <div className="text-2xl font-black text-white">
                                    {t('wiki.version') !== 'wiki.version' ? t('wiki.version') : '1.0'}
                                </div>
                            </div>
                        </div>

                        {/* Latest Changelog */}
                        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-4">
                                <ScrollText className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{t('wiki.changelog') !== 'wiki.changelog' ? t('wiki.changelog') : 'Changelog'}</span>
                            </div>

                            {latestChangelog ? (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-white">
                                        {getTranslation(latestChangelog.nameKey)}
                                    </h3>
                                    {latestChangelog.content && (
                                        <div
                                            className="prose prose-invert prose-sm max-w-none text-zinc-400 line-clamp-12 [&_ul]:list-disc [&_ul]:ml-4 [&_li]:text-xs [&_p]:text-xs [&_p]:mb-1"
                                            dangerouslySetInnerHTML={{ __html: getTranslation(latestChangelog.content) }}
                                        />
                                    )}
                                    <Link
                                        href="/wiki/changelogs"
                                        className="inline-block text-xs text-blue-400 hover:text-blue-300 font-semibold mt-2 transition-colors"
                                    >
                                        {t('wiki.all_changelogs') !== 'wiki.all_changelogs' ? t('wiki.all_changelogs') : 'View all changelogs →'}
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-sm text-zinc-600">
                                    {t('wiki.no_changelogs') !== 'wiki.no_changelogs' ? t('wiki.no_changelogs') : 'No changelogs yet.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
