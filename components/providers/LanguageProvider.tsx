'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import enFallback from '../../locales/en.json';

type LanguageContextType = {
    lang: string;
    setLang: (lang: string) => void;
    t: (key: string) => any;
    availableLanguages: string[];
    languagesLoaded: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState('EN');
    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState<Record<string, any>>({ EN: enFallback });
    const [availableLanguages, setAvailableLanguages] = useState<string[]>(['EN']);
    const [languagesLoaded, setLanguagesLoaded] = useState(false);
    const [enFetched, setEnFetched] = useState(false);

    // Fetch available languages from Firestore
    useEffect(() => {
        const loadAvailable = async () => {
            try {
                const snap = await getDocs(collection(db, 'languages'));
                // console.log(snap.docs);
                const langs = snap.docs.map(doc => doc.id.toUpperCase());
                if (!langs.includes('EN')) langs.push('EN');
                setAvailableLanguages(Array.from(new Set(langs)));
            } catch (e) {
                console.error('Failed to load available languages from Firestore:', e);
                setAvailableLanguages(['EN']);
            }
        };
        loadAvailable();
    }, []);

    // Fetch translation content using jsDelivr when language changes
    useEffect(() => {
        const fetchLangContent = async () => {
            const upLang = lang.toUpperCase();

            // Skip if already fetched (except EN we try once)
            if (upLang !== 'EN' && messages[upLang]) {
                setLanguagesLoaded(true);
                return;
            }
            if (upLang === 'EN' && enFetched) {
                setLanguagesLoaded(true);
                return;
            }

            setLanguagesLoaded(false);
            try {
                const owner = 'a0gzy';
                const repo = 'slime-castle-data';
                const url = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/lang/${lang.toLowerCase()}.json`;

                console.log(`[LanguageProvider] Loading ${upLang} from ${url}`);
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    console.log(`[LanguageProvider] Successfully loaded ${upLang} from GitHub`);
                    setMessages(prev => ({ ...prev, [upLang]: data }));
                    if (upLang === 'EN') setEnFetched(true);
                } else {
                    console.warn(`[LanguageProvider] ${upLang} file not found on GitHub, falling back to local.`);
                    if (upLang === 'EN') setEnFetched(true);
                }
            } catch (e) {
                console.error(`[LanguageProvider] Failed to load ${upLang}:`, e);
                if (upLang === 'EN') setEnFetched(true);
            } finally {
                setLanguagesLoaded(true);
            }
        };

        if (availableLanguages.includes(lang.toUpperCase())) {
            fetchLangContent();
        }
    }, [lang, availableLanguages, enFetched]);

    useEffect(() => {
        const savedLang = localStorage.getItem('lang');
        if (savedLang) {
            setLangState(savedLang.toUpperCase());
        } else {
            const systemLang = navigator.language.toLowerCase();
            if (systemLang.startsWith('ru')) setLangState('RU');
            else setLangState('EN');
        }
        setMounted(true);
    }, []);

    const setLang = (newLang: string) => {
        const upper = newLang.toUpperCase();
        setLangState(upper);
        localStorage.setItem('lang', upper);
    };

    const t = (key: string): any => {
        if (!key) return '';

        const process = (val: any) => {
            if (typeof val === 'string') {
                return val.replace(/\\(.*?)\\/g, '$1');
            }
            return val;
        };

        const keys = key.split('.');
        // Try current language first, then fall back to 'en'
        let val = messages[lang];
        for (const k of keys) {
            if (val === undefined || val === null) break;
            val = val[k];
        }
        if (val !== undefined && val !== null) return process(val);

        // Fallback to EN if key not found
        if (lang !== 'EN') {
            let fallback = messages['EN'];
            for (const k of keys) {
                if (fallback === undefined || fallback === null) break;
                fallback = fallback[k];
            }
            if (fallback !== undefined && fallback !== null) return process(fallback);
        }

        return process(key);
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, availableLanguages, languagesLoaded }}>
            {mounted ? children : <div className="min-h-screen bg-zinc-950" />}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
}
