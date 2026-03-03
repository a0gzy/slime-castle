'use client';

import { useLanguage } from '../../components/providers/LanguageProvider';

export default function WikiPage() {
    const { t } = useLanguage();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">{t('wiki.title')}</h1>
            <p className="text-zinc-400 max-w-md">
                {t('wiki.soon')}
            </p>
        </div>
    );
}
