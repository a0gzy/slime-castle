'use client';

import Link from 'next/link';
import { Home, Grid3X3, Beaker, FileText, UserCircle, LogOut, Coins } from 'lucide-react';
import { useLanguage } from './providers/LanguageProvider';
import { useAuth } from './providers/AuthProvider';

export function Navbar() {
    const { lang, setLang, t } = useLanguage();
    const { user, login, logout } = useAuth();

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

                            <Link href="/wiki" className="flex items-center gap-1.5 transition-colors hover:text-zinc-50">
                                <FileText className="h-4 w-4 hidden md:block" />
                                <span>{t('nav.wiki')}</span>
                            </Link>
                            <Link href="/runes" className="flex items-center gap-1.5 transition-colors hover:text-zinc-50">
                                <Beaker className="h-4 w-4 hidden md:block" />
                                <span>{t('nav.runes')}</span>
                            </Link>

                            <div className="w-px h-4 bg-zinc-800 hidden md:block mx-1"></div>

                            <Link href="/bingo" className="flex items-center gap-1.5 transition-colors hover:text-zinc-50">
                                <Grid3X3 className="h-4 w-4 hidden md:block" />
                                <span>{t('nav.bingo')}</span>
                            </Link>
                            <Link href="/monopoly" className="flex items-center gap-1.5 transition-colors hover:text-zinc-50">
                                <Coins className="h-4 w-4 hidden md:block" />
                                <span>{t('nav.monopoly')}</span>
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

                        {user ? (
                            <div className="flex items-center gap-3">
                                {user.photoURL && (
                                    <Link href="/profile" className="hover:opacity-80 transition-opacity">
                                        <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-zinc-800" />
                                    </Link>
                                )}
                                <button
                                    onClick={logout}
                                    className="text-zinc-400 hover:text-red-400 transition-colors"
                                    title={t('nav.logout')}
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={login}
                                className="text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                                title={t('nav.login')}
                            >
                                <UserCircle className="h-6 w-6" />
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}
