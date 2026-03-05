'use client';

import { WikiEntity } from "@/lib/wiki";
import { WikiCategory } from "@/lib/wikiCategories";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { ArrowLeft, Edit, Ghost, Sword, Shield, Box, Book, FileText, Sparkles, Star, Skull, Target, Gem, Crown, Zap, Heart, LayoutGrid } from "lucide-react";
import { SlimeCard } from "@/components/Wiki/Cards/SlimeCard";
import { ArtifactCard } from "@/components/Wiki/Cards/ArtifactCard";
import { SetCard } from "@/components/Wiki/Cards/SetCard";
import { BossCard } from "@/components/Wiki/Cards/BossCard";

const iconMap: Record<string, any> = {
    Ghost, Sword, Shield, Box, Book, FileText, Sparkles, Star, Skull, Target, Gem, Crown, Zap, Heart, LayoutGrid
};

function EntityCard({ entity }: { entity: WikiEntity }) {
    const { t } = useLanguage();
    const { isAdmin } = useAuth();

    const getTranslation = (key: string) => {
        if (!key) return '';
        const translated = t(key);
        return translated === key ? key.split('.').pop() || key : translated;
    };

    const editorPath = entity.category === 'slimes' ? 'slime'
        : entity.category === 'artifacts' ? 'artifact'
            : entity.category === 'sets' ? 'set'
                : entity.category === 'bosses' ? 'boss'
                    : 'standard';

    // Render the correct card based on category
    if (entity.category === 'slimes') return (
        <div className="relative">
            {isAdmin && (
                <Link href={`/admin/wiki-editor/${editorPath}?id=${entity.id}`} className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/90 hover:bg-zinc-700 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors border border-zinc-700/50">
                    <Edit className="w-3 h-3" /> Edit
                </Link>
            )}
            <SlimeCard entity={entity} />
        </div>
    );

    if (entity.category === 'artifacts') return (
        <div className="relative">
            {isAdmin && (
                <Link href={`/admin/wiki-editor/${editorPath}?id=${entity.id}`} className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/90 hover:bg-zinc-700 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors border border-zinc-700/50">
                    <Edit className="w-3 h-3" /> Edit
                </Link>
            )}
            <ArtifactCard entity={entity} />
        </div>
    );

    if (entity.category === 'sets') return (
        <div className="relative">
            {isAdmin && (
                <Link href={`/admin/wiki-editor/${editorPath}?id=${entity.id}`} className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/90 hover:bg-zinc-700 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors border border-zinc-700/50">
                    <Edit className="w-3 h-3" /> Edit
                </Link>
            )}
            <SetCard entity={entity} />
        </div>
    );

    if (entity.category === 'bosses') return (
        <div className="relative">
            {isAdmin && (
                <Link href={`/admin/wiki-editor/${editorPath}?id=${entity.id}`} className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/90 hover:bg-zinc-700 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors border border-zinc-700/50">
                    <Edit className="w-3 h-3" /> Edit
                </Link>
            )}
            <BossCard entity={entity} />
        </div>
    );

    // Fallback: standard page / guide
    const name = getTranslation(entity.nameKey);
    const description = getTranslation(entity.descriptionKey);

    return (
        <div className="relative bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-lg overflow-hidden">
            {isAdmin && (
                <Link href={`/admin/wiki-editor/${editorPath}?id=${entity.id}`} className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/90 hover:bg-zinc-700 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors border border-zinc-700/50">
                    <Edit className="w-3 h-3" /> Edit
                </Link>
            )}
            <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
            {description && <p className="text-zinc-400 mb-4">{description}</p>}
            {entity.content && (
                <div className="prose prose-invert prose-emerald max-w-none" dangerouslySetInnerHTML={{ __html: getTranslation(entity.content) }} />
            )}
        </div>
    );
}

export function CategoryPageClient({ category, entities }: { category: WikiCategory; entities: WikiEntity[] }) {
    const { t } = useLanguage();
    const { isAdmin } = useAuth();

    const getTranslation = (key: string) => {
        if (!key) return '';
        const translated = t(key);
        return translated === key ? key.split('.').pop() || key : translated;
    };

    const isCustomSvg = category.icon?.startsWith('svg:');
    const isImage = category.icon?.startsWith('img:');
    const Icon = (!isCustomSvg && !isImage) ? (iconMap[category.icon] || FileText) : null;
    const customSvgHtml = isCustomSvg ? category.icon.slice(4) : '';
    const imageUrl = isImage ? category.icon.slice(4) : '';
    const catName = getTranslation(category.nameKey);

    return (
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-32">
                {/* Nav */}
                <div className="flex items-center justify-between">
                    <Link href="/wiki" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold text-sm">Back to Wiki</span>
                    </Link>
                    {isAdmin && (
                        <Link href={`/admin/wiki-editor/category?id=${category.id}`} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 hover:text-white transition-colors">
                            <Edit className="w-4 h-4" /> Edit Category
                        </Link>
                    )}
                </div>

                {/* Category Header */}
                <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mt-32 -mr-32" />
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                            {isImage ? (
                                <img src={imageUrl} alt={catName} className="w-8 h-8 object-cover rounded" />
                            ) : isCustomSvg ? (
                                <div className="w-8 h-8 text-emerald-400 [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-current" dangerouslySetInnerHTML={{ __html: customSvgHtml }} />
                            ) : (
                                <Icon className="w-8 h-8 text-emerald-400" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{catName}</h1>
                            <p className="text-zinc-500 mt-1 text-sm">{getTranslation(category.descriptionKey)}</p>
                        </div>
                    </div>
                </div>

                {/* Intro Content */}
                {category.introContent && (
                    <div className="bg-[#0c0c0e] border border-zinc-800/50 rounded-2xl p-6">
                        <div className="prose prose-invert prose-emerald max-w-none" dangerouslySetInnerHTML={{ __html: getTranslation(category.introContent) }} />
                    </div>
                )}

                {/* Entity list */}
                {entities.length === 0 ? (
                    <div className="text-center text-zinc-500 py-20 text-sm">
                        No entries in this category yet.
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {entities.map(entity => (
                            <EntityCard key={entity.id} entity={entity} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
