'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { FileText, Ghost, Sword, Shield, Box, ArrowLeft, LayoutGrid } from 'lucide-react';

export default function WikiEditorHub() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();

    if (loading) return null;
    if (!isAdmin || !user) {
        if (!loading) router.push('/');
        return null;
    }

    const options = [
        {
            title: 'Standard Page',
            desc: 'Create text-heavy pages like Changelogs, Guides, or lore entries.',
            icon: FileText,
            href: '/admin/wiki-editor/standard',
            color: 'text-zinc-300',
            bg: 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
        },
        {
            title: 'Slime',
            desc: 'Graphic editor to input Slime stats, skills, and unlock bonuses.',
            icon: Ghost,
            href: '/admin/wiki-editor/slime',
            color: 'text-blue-400',
            bg: 'bg-blue-950/20 hover:bg-blue-900/30 border-blue-900/50'
        },
        {
            title: 'Artifact',
            desc: 'Graphic editor for Artifact skill levels and star costs.',
            icon: Sword,
            href: '/admin/wiki-editor/artifact',
            color: 'text-red-400',
            bg: 'bg-red-950/20 hover:bg-red-900/30 border-red-900/50'
        },
        {
            title: 'Item Set',
            desc: 'Graphic editor for Set items and set effects.',
            icon: Shield,
            href: '/admin/wiki-editor/set',
            color: 'text-purple-400',
            bg: 'bg-purple-950/20 hover:bg-purple-900/30 border-purple-900/50'
        },
        {
            title: 'Boss',
            desc: 'Graphic editor for Boss stats and skill phases.',
            icon: Box,
            href: '/admin/wiki-editor/boss',
            color: 'text-orange-400',
            bg: 'bg-orange-950/20 hover:bg-orange-900/30 border-orange-900/50'
        },
        {
            title: 'Category',
            desc: 'Create or edit wiki categories (sections like Slimes, Bosses, Guides).',
            icon: LayoutGrid,
            href: '/admin/wiki-editor/category',
            color: 'text-emerald-400',
            bg: 'bg-emerald-950/20 hover:bg-emerald-900/30 border-emerald-900/50'
        }
    ];

    return (
        <div className="flex-1 flex flex-col p-6 md:p-12 bg-black text-white h-[calc(100vh-64px)] overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin')} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-zinc-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold font-serif">Wiki CMS Hub</h1>
                        <p className="text-zinc-400 mt-1">Select an entity type to create or edit.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map(opt => (
                        <button
                            key={opt.title}
                            onClick={() => router.push(opt.href)}
                            className={`flex items-start gap-4 p-6 rounded-2xl border transition-all text-left ${opt.bg}`}
                        >
                            <div className={`p-3 rounded-xl bg-black/50 ${opt.color}`}>
                                <opt.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white mb-1">{opt.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">{opt.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
