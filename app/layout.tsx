import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Slime Castle Helper | Bingo, Runes & Monopoly Tracker",
  description: "Your ultimate companion for Slime Castle. Track mythic runes, calculate optimal bingo moves, and manage monopoly events. / Помощник для Slime Castle: трекер рун, расчет бинго и прогресс монополии.",
  keywords: [
    "Slime Castle", "Bingo Helper", "Rune Tracker", "Monopoly Event", "Slime Castle Wiki", "Slime Castle Site", "Slime Castle Gifts",
    "Бинго Слайм Кастл", "Трекер рун", "Монополия гайд", "Слайм Кастл Сайт", "Слайм Кастл Гифты",],
  authors: [{ name: "a0g" }],
  openGraph: {
    title: "Slime Castle Helper",
    description: "Track runes, calculate bingo moves, and manage events. / Трекер рун, расчет бинго и управление ивентами.",
    url: "https://slime-castle.helper",
    siteName: "Slime Castle Hub",
    images: [
      {
        url: "/icons/icon.webp",
        width: 512,
        height: 512,
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slime Castle Helper",
    description: "Your ultimate companion for Slime Castle - track runes, events, and bingo.",
    images: ["/icons/icon.webp"],
  },
  icons: {
    icon: "/icons/icon.ico",
    shortcut: "/icons/icon.ico",
    apple: "/icons/icon.webp",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-50 min-h-screen flex flex-col`}>
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
