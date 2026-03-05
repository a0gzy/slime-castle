'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, FolderOpen, Languages, Users, Settings, ArrowLeft } from 'lucide-react';

export default function AdminPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, loading, router]);

    if (loading) return <div className="flex-1 flex items-center justify-center bg-zinc-950 text-zinc-400">Loading...</div>;
    if (!isAdmin) return null;

    const sections = [
        {
            title: 'Wiki Editor',
            desc: 'Create and edit wiki entities: slimes, artifacts, sets, bosses, and categories.',
            icon: BookOpen,
            href: '/admin/wiki-editor',
            color: 'text-emerald-400',
            border: 'border-emerald-900/50',
            bg: 'bg-emerald-950/20 hover:bg-emerald-900/20'
        },
        {
            title: 'File Manager',
            desc: 'Browse, upload, move, and delete files hosted on GitHub.',
            icon: FolderOpen,
            href: '/admin/files',
            color: 'text-amber-400',
            border: 'border-amber-900/50',
            bg: 'bg-amber-950/20 hover:bg-amber-900/20'
        },
        {
            title: 'Language Editor',
            desc: 'Edit translation files. Create new languages, modify keys, and manage localizations.',
            icon: Languages,
            href: '/admin/lang-editor',
            color: 'text-blue-400',
            border: 'border-blue-900/50',
            bg: 'bg-blue-950/20 hover:bg-blue-900/20'
        },
        {
            title: 'Users & Roles',
            desc: 'Manage user roles, permissions, and allowed languages.',
            icon: Users,
            href: '/admin/users',
            color: 'text-purple-400',
            border: 'border-purple-900/50',
            bg: 'bg-purple-950/20 hover:bg-purple-900/20'
        },
    ];

    return (
        <div className="flex-1 flex flex-col p-6 md:p-12 bg-zinc-950 text-zinc-300">
            <div className="max-w-4xl w-full mx-auto space-y-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                        Admin Panel
                    </h1>
                    <p className="text-zinc-500">Manage content, files, translations, and users.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sections.map(s => (
                        <Link
                            key={s.href}
                            href={s.href}
                            className={`flex items-start gap-4 p-6 rounded-2xl border transition-all text-left ${s.border} ${s.bg}`}
                        >
                            <div className={`p-3 rounded-xl bg-black/50 ${s.color}`}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white mb-1">{s.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
