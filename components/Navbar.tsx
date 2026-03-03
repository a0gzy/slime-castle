'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Grid3X3, Beaker, FileText, UserCircle, LogOut, Coins, Menu, X } from 'lucide-react';
import { useLanguage } from './providers/LanguageProvider';
import { useAuth } from './providers/AuthProvider';

export function Navbar() {
    const { lang, setLang, t } = useLanguage();
    const { user, login, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: '/wiki', label: t('nav.wiki'), icon: <FileText className="h-4 w-4" /> },
        { href: '/runes', label: t('nav.runes'), icon: <Beaker className="h-4 w-4" /> },
        { href: '/bingo', label: t('nav.bingo'), icon: <Grid3X3 className="h-4 w-4" /> },
        { href: '/monopoly', label: t('nav.monopoly'), icon: <Coins className="h-4 w-4" /> },
    ];

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60 transition-all">
                <div className="container mx-auto max-w-7xl flex h-16 items-center px-4 md:px-8">
                    <div className="flex w-full justify-between items-center">

                        <div className="flex items-center gap-4 md:gap-8">
                            <Link href="/" className="flex items-center gap-2 transition-colors hover:text-zinc-300">
                                <img src="/icons/icon.webp" alt="Logo" className="w-6 h-6 object-contain rounded-lg" />
                                <span className="font-bold shrink-0">Slime Castle <span className="hidden sm:inline">Hub</span></span>
                            </Link>

                            {/* Desktop Nav */}
                            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-zinc-400">
                                {navLinks.map((link) => (
                                    <Link key={link.href} href={link.href} className="flex items-center gap-1.5 transition-colors hover:text-zinc-50">
                                        {link.icon}
                                        <span>{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Language Switcher */}
                            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 md:p-1">
                                <button
                                    className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold rounded transition-colors ${lang === 'ru' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
                                    onClick={() => setLang('ru')}
                                >
                                    RU
                                </button>
                                <button
                                    className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold rounded transition-colors ${lang === 'en' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
                                    onClick={() => setLang('en')}
                                >
                                    EN
                                </button>
                            </div>

                            {/* Desktop Auth */}
                            <div className="hidden md:flex items-center gap-4">
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        {user.photoURL && (
                                            <Link href="/profile" className="hover:opacity-80 transition-opacity">
                                                <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-zinc-800" />
                                            </Link>
                                        )}
                                        <button onClick={logout} className="text-zinc-400 hover:text-red-400 transition-colors">
                                            <LogOut className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={login} className="text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-2">
                                        <UserCircle className="h-6 w-6" />
                                    </button>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>

                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 z-60 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Sidebar Content */}
            <div
                className={`fixed top-0 right-0 z-70 h-full w-64 bg-zinc-950 border-l border-zinc-800 p-6 shadow-2xl transition-transform duration-300 ease-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-10">
                        <span className="font-bold text-zinc-100">Меню</span>
                        <button onClick={() => setIsMenuOpen(false)} className="text-zinc-500"><X className="h-6 w-6" /></button>
                    </div>

                    <div className="flex flex-col gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 text-lg font-medium text-zinc-400 hover:text-zinc-50 transition-colors"
                            >
                                <span className="p-2 bg-zinc-900 rounded-lg">{link.icon}</span>
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-zinc-900">
                        {user ? (
                            <div className="flex flex-col gap-4">
                                <Link
                                    href="/profile"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 text-zinc-300"
                                >
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border border-zinc-800" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold">{user.email?.[0]}</div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold truncate max-w-[140px] tracking-tight">{user.displayName || user.email}</span>
                                        <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Профиль</span>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => { logout(); setIsMenuOpen(false); }}
                                    className="flex items-center gap-2 text-red-500 font-bold text-sm bg-red-500/5 p-3 rounded-xl border border-red-500/10"
                                >
                                    <LogOut className="h-4 w-4" /> {t('nav.logout')}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { login(); setIsMenuOpen(false); }}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                            >
                                <UserCircle className="h-5 w-5" /> {t('nav.login')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
