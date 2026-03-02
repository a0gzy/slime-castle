'use client';

import Link from 'next/link';
import { Grid3X3, Beaker, FileText, ArrowRight, Sparkles, Coins } from 'lucide-react';
import { useLanguage } from '../components/providers/LanguageProvider';

export default function LandingPage() {
  const { lang } = useLanguage();

  const t = {
    ru: {
      title: "Ваш идеальный помощник для Slime Castle",
      subtitle: "Отслеживайте руны, рассчитывайте оптимальные ходы в бинго и изучайте официальные гайды — всё в одном месте.",
      primaryBtn: "Открыть Бинго",
      secondaryBtn: "Читать Гайды",
      trusted: "Используется топовыми игроками и гильдиями",
      bingoTitle: "Bingo Helper",
      bingoDesc: "Умный алгоритм и тепловые карты для максимизации закрытых линий бинго.",
      runesTitle: "Rune Tracker",
      runesDesc: "Удобный инструмент для поиска лучших комбинаций мифических рун.",
      monopolyTitle: "Monopoly Tracker",
      monopolyDesc: "Отслеживание бросков и расчет лучшего маршрута (В разработке).",
      guideTitle: "Официальные Гайды",
      guideDesc: "Полные стратегии и советы от комьюнити Slime Castle."
    },
    en: {
      title: "Your ultimate companion for Slime Castle",
      subtitle: "Track runes, calculate optimal bingo moves, and explore official guides—all in one place.",
      primaryBtn: "Open Bingo",
      secondaryBtn: "Read Guides",
      trusted: "Trusted by top players and guilds",
      bingoTitle: "Bingo Helper",
      bingoDesc: "Smart algorithm and heatmaps to maximize your completed bingo lines.",
      runesTitle: "Rune Tracker",
      runesDesc: "Convenient tool to find the best mythic rune combinations.",
      monopolyTitle: "Monopoly Tracker",
      monopolyDesc: "Roll tracking and best route calculation (Coming soon).",
      guideTitle: "Official Guides",
      guideDesc: "Comprehensive strategies and tips from the Slime Castle community."
    }
  }[lang];

  return (
    <div className="flex-1 flex flex-col items-center pt-20 pb-16 px-6 bg-zinc-950">
      {/* Hero Section */}
      <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-8 mt-8">

        {/* Big Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          {t.title.split('Slime Castle')[0]}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Slime Castle
          </span>
          {t.title.split('Slime Castle')[1]}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          {t.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Link
            href="/bingo"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            {t.primaryBtn}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/guide"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 border border-zinc-800 transition-colors"
          >
            {t.secondaryBtn}
          </Link>
        </div>
      </div>

      {/* Social Proof Placeholder */}
      <div className="mt-24 mb-12 w-full overflow-hidden opacity-60">
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-10 text-center">
          {t.trusted}
        </p>

        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-16 py-4">
            <span className="text-zinc-600 font-bold text-2xl">TRS</span>
            <span className="text-zinc-600 font-bold text-2xl">SCA ZOO</span>
            <span className="text-zinc-600 font-bold text-2xl">WTF</span>
            <span className="text-zinc-600 font-bold text-2xl">RoKings</span>
            <span className="text-zinc-600 font-bold text-2xl">Rimuru City</span>
            <span className="text-zinc-600 font-bold text-2xl">MrPug</span>
            {/* Duplicate for seamless scroll */}
            <span className="text-zinc-600 font-bold text-2xl">TRS</span>
            <span className="text-zinc-600 font-bold text-2xl">SCA ZOO</span>
            <span className="text-zinc-600 font-bold text-2xl">WTF</span>
            <span className="text-zinc-600 font-bold text-2xl">RoKings</span>
            <span className="text-zinc-600 font-bold text-2xl">Rimuru City</span>
            <span className="text-zinc-600 font-bold text-2xl">MrPug</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">

        <Link href="/bingo" className="group flex flex-col p-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:bg-zinc-800/60 transition-all duration-300 hover:border-blue-500/50">
          <div className="h-12 w-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Grid3X3 className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{t.bingoTitle}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t.bingoDesc}
          </p>
        </Link>

        <Link href="/runes" className="group flex flex-col p-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:bg-zinc-800/60 transition-all duration-300 hover:border-emerald-500/50">
          <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Beaker className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{t.runesTitle}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t.runesDesc}
          </p>
        </Link>

        <div className="group flex flex-col p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl opacity-75 cursor-not-allowed relative overflow-hidden">
          <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 px-2 py-1 rounded">Soon</div>
          <div className="h-12 w-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center mb-6 transition-transform">
            <Coins className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{t.monopolyTitle}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t.monopolyDesc}
          </p>
        </div>

        <Link href="/guide" className="group flex flex-col p-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:bg-zinc-800/60 transition-all duration-300 hover:border-purple-500/50">
          <div className="h-12 w-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{t.guideTitle}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t.guideDesc}
          </p>
        </Link>

      </div>
    </div>
  );
}
