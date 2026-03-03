'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import ru from '../../locales/ru.json';
import en from '../../locales/en.json';

const messages: Record<string, any> = { ru, en };

type LanguageContextType = {
    lang: 'ru' | 'en';
    setLang: (lang: 'ru' | 'en') => void;
    t: (key: string) => any;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<'ru' | 'en'>('ru');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('lang') as 'ru' | 'en';
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
        localStorage.setItem('lang', newLang);
    };

    const t = (key: string): any => {
        const keys = key.split('.');
        let val = messages[lang];
        for (const k of keys) {
            if (val === undefined || val === null) break;
            val = val[k];
        }
        return val !== undefined ? val : key;
    };

    // Prevent hydration mismatch by rendering default or nothing until mounted,
    // but for global context we can just render context and let children handle hydration
    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {mounted ? children : <div className="min-h-screen bg-zinc-950" />}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
}
