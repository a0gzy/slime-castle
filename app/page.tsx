'use client';

import Link from 'next/link';
import { Grid3X3, Beaker, FileText, ArrowRight, Sparkles, Coins } from 'lucide-react';
import { useLanguage } from '../components/providers/LanguageProvider';

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col items-center pt-20 pb-16 px-6 bg-zinc-950">
      {/* Hero Section */}
      <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-8 mt-8">

        {/* Big Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          {t('landing.title1')}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Slime Castle
          </span>
          {t('landing.title2')}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          {t('landing.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Link
            href="/bingo"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            {t('landing.primaryBtn')}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/wiki"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 border border-zinc-800 transition-colors"
          >
            {t('landing.secondaryBtn')}
          </Link>
        </div>
      </div>

      {/* Social Proof Placeholder */}
      <div className="mt-24 mb-12 w-full overflow-hidden opacity-60">
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-10 text-center">
          {t('landing.trusted')}
        </p>

        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 py-4">
            {(() => {
              const names = [
                "TRS", "SCA", "ZOO", "WTF", "RoKings", "Авангард", "SF", "Rimuru City", " ",
                "MrPug", "BadWinner", "EnricoN", "ANRISE", "ArchBishop", "Sion", "Swan", "Sugar", "Andrey", "a0g <3", " "
              ];
              // Double the array for a perfect 50% loop
              return [...names, ...names].map((name, i) => (
                <span key={i} className="text-zinc-600 font-bold text-2xl">{name}</span>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">

        <Link href="/bingo" className="group flex flex-col p-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:bg-zinc-800/60 transition-all duration-300 hover:border-blue-500/50">
          <div className="h-12 w-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Grid3X3 className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{t('landing.bingoTitle')}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('landing.bingoDesc')}
          </p>
        </Link>

        <Link href="/runes" className="group flex flex-col p-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:bg-zinc-800/60 transition-all duration-300 hover:border-emerald-500/50">
          <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Beaker className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{t('landing.runesTitle')}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('landing.runesDesc')}
          </p>
        </Link>

        <Link href="/monopoly" className="group flex flex-col p-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:bg-zinc-800/60 transition-all duration-300 hover:border-amber-500/50">
          <div className="h-12 w-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Coins className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{t('landing.monopolyTitle')}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('landing.monopolyDesc')}
          </p>
        </Link>

        <Link href="/wiki" className="group flex flex-col p-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:bg-zinc-800/60 transition-all duration-300 hover:border-purple-500/50">
          <div className="h-12 w-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{t('landing.wikiTitle')}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t('landing.wikiDesc')}
          </p>
        </Link>

      </div>
    </div>
  );
}
