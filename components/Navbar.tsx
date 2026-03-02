'use client';

import Link from 'next/link';
import { Home, Grid3X3, Beaker, FileText, UserCircle } from 'lucide-react';
import { useLanguage } from './providers/LanguageProvider';

export function Navbar() {
    const { lang, setLang } = useLanguage();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
            <div className="container mx-auto max-w-7xl flex h-16 items-center px-4 md:px-8">
                <div className="flex w-full justify-between items-center">

                    <div className="flex items-center gap-4 md:gap-8">
                        <Link href="/" className="flex items-center gap-2 transition-colors hover:text-zinc-300">
                            <Home className="h-5 w-5" />
                            <span className="hidden font-bold sm:inline-block">Slime Castle Hub</span>
                        </Link>

                        <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
                            <Link href="/bingo" className="flex items-center gap-1.5 transition-colors hover:text-zinc-50">
                                <Grid3X3 className="h-4 w-4 hidden md:block" />
                                <span>Bingo</span>
                            </Link>
                            <Link href="/runes" className="flex items-center gap-1.5 transition-colors hover:text-zinc-50">
                                <Beaker className="h-4 w-4 hidden md:block" />
                                <span>Runes</span>
                            </Link>
                            <Link href="/guide" className="flex items-center gap-1.5 transition-colors hover:text-zinc-50">
                                <FileText className="h-4 w-4 hidden md:block" />
                                <span>Guide</span>
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                            <button
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${lang === 'ru' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
                                onClick={() => setLang('ru')}
                            >
                                RU
                            </button>
                            <button
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${lang === 'en' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
                                onClick={() => setLang('en')}
                            >
                                EN
                            </button>
                        </div>

                        <button className="text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-2" title={lang === 'ru' ? 'Войти (В разработке)' : 'Login (Coming soon)'}>
                            <UserCircle className="h-6 w-6" />
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );
}
