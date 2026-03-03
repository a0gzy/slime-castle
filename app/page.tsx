'use client';

import Link from 'next/link';
import { Grid3X3, Beaker, FileText, ArrowRight, Sparkles, Coins } from 'lucide-react';
import { useLanguage } from '../components/providers/LanguageProvider';

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col items-center pt-20 pb-16 px-6 bg-zinc-950">
      {/* Hero Section */}
      <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-10 mt-12 mb-20">

        {/* Glow behind title */}
        <div className="absolute top-40 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Big Heading */}
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[1] select-none">
          {t('landing.title1')}
          <span className="block italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">
            {t('landing.title2') || "Slime Castle"}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl leading-relaxed font-medium">
          {t('landing.subtitle')}
        </p>

        {/* CTA Button - Scroll Down */}
        <button
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          className="group relative flex items-center justify-center gap-3 px-10 py-4 bg-white text-zinc-950 font-black rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] overflow-hidden"
        >
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-50"></div>
          {t('landing.primaryBtn')}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Social Proof Section */}
      <div className="w-full overflow-hidden opacity-40 py-12 border-y border-zinc-900/50 bg-zinc-900/20">
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-8 text-center">
          {t('landing.trusted')}
        </p>

        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee t-25 whitespace-nowrap flex items-center gap-16 py-2">
            {(() => {
              const names = [
                "TRS", "SCA", "ZOO", "WTF", "RoKings", "Авангард", "SF", "Rimuru City", " ",
                "MrPug", "BadWinner", "EnricoN", "ANRISE", "ArchBishop", "Sion", "Swan", "Sugar", "Andrey", "a0g <3", " "
              ];
              return [...names, ...names].map((name, i) => (
                <span key={i} className="text-zinc-700 font-black text-3xl italic tracking-tighter">{name}</span>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32 relative">

        {/* Abstract Background Elements */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Card 1: Bingo */}
        <Link href="/bingo" className="group relative flex flex-col p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] hover:bg-zinc-900/60 transition-all duration-500 hover:border-blue-500/30 hover:-translate-y-2 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <div className="h-16 w-16 bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20 text-blue-400 rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-blue-500/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <Grid3X3 className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{t('landing.bingoTitle')}</h3>
          <p className="text-zinc-400 leading-relaxed font-medium">
            {t('landing.bingoDesc')}
          </p>
          <div className="mt-auto pt-8 flex items-center gap-2 text-blue-400/50 group-hover:text-blue-400 font-bold text-xs uppercase tracking-widest transition-colors">
            Explore <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Card 2: Runes */}
        <Link href="/runes" className="group relative flex flex-col p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] hover:bg-zinc-900/60 transition-all duration-500 hover:border-emerald-500/30 hover:-translate-y-2 backdrop-blur-xl overflow-hidden">
          <div className="h-16 w-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-emerald-500/5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
            <Beaker className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{t('landing.runesTitle')}</h3>
          <p className="text-zinc-400 leading-relaxed font-medium">
            {t('landing.runesDesc')}
          </p>
          <div className="mt-auto pt-8 flex items-center gap-2 text-emerald-400/50 group-hover:text-emerald-400 font-bold text-xs uppercase tracking-widest transition-colors">
            Manage <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Card 3: Monopoly */}
        <Link href="/monopoly" className="group relative flex flex-col p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] hover:bg-zinc-900/60 transition-all duration-500 hover:border-amber-500/30 hover:-translate-y-2 backdrop-blur-xl overflow-hidden">
          <div className="h-16 w-16 bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/20 text-amber-500 rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-amber-500/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <Coins className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 group-hover:text-amber-400 transition-colors uppercase tracking-tight">{t('landing.monopolyTitle')}</h3>
          <p className="text-zinc-400 leading-relaxed font-medium">
            {t('landing.monopolyDesc')}
          </p>
          <div className="mt-auto pt-8 flex items-center gap-2 text-amber-400/50 group-hover:text-amber-400 font-bold text-xs uppercase tracking-widest transition-colors">
            Track <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Card 4: Wiki */}
        <Link href="/wiki" className="group relative flex flex-col p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] hover:bg-zinc-900/60 transition-all duration-500 hover:border-purple-500/30 hover:-translate-y-2 backdrop-blur-xl overflow-hidden">
          <div className="h-16 w-16 bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/20 text-purple-400 rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-purple-500/5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 group-hover:text-purple-400 transition-colors uppercase tracking-tight">{t('landing.wikiTitle')}</h3>
          <p className="text-zinc-400 leading-relaxed font-medium">
            {t('landing.wikiDesc')}
          </p>
          <div className="mt-auto pt-8 flex items-center gap-2 text-purple-400/50 group-hover:text-purple-400 font-bold text-xs uppercase tracking-widest transition-colors">
            Learn <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

      </div>
    </div>
  );
}
