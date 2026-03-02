'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type LanguageContextType = {
    lang: 'ru' | 'en';
    setLang: (lang: 'ru' | 'en') => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<'ru' | 'en'>('ru');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('bingo_lang') as 'ru' | 'en';
        if (savedLang) {
            setLangState(savedLang);
        } else {
            const systemLang = navigator.language.toLowerCase();
            if (systemLang.startsWith('ru')) setLangState('ru');
            else setLangState('en');
        }
        setMounted(true);
    }, []);

    const setLang = (newLang: 'ru' | 'en') => {
        setLangState(newLang);
        localStorage.setItem('bingo_lang', newLang);
    };

    // Prevent hydration mismatch by rendering default or nothing until mounted,
    // but for global context we can just render context and let children handle hydration
    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {mounted ? children : <div className="min-h-screen bg-zinc-950" />}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
}
