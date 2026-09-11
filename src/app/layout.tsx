import type { Metadata, Viewport } from "next";
import { Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#161619",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    template: "%s | GameBoy Engine",
    default: "GameBoy Game Engine - Web-based Retro Console",
  },
  description: "A gorgeous, fully playable GameBoy-inspired game engine built with Next.js, React, and TypeScript. Play classics like Pong, Tetris, Snake, Space Invaders, Bomberman, and Flappy Bird directly in your browser.",
  keywords: ["GameBoy", "Emulator", "React", "Next.js", "TypeScript", "Retro Games", "Web Game Engine", "Tetris", "Snake", "Space Invaders", "Bomberman", "Flappy Bird"],
  authors: [{ name: "Hussain Ahmed", url: "https://github.com/hussain-ahmed2" }],
  creator: "Hussain Ahmed",
  openGraph: {
    title: "GameBoy Game Engine - Web-based Retro Console",
    description: "A fully playable GameBoy-inspired game engine built with React and TypeScript.",
    url: "https://gameboy-engine.vercel.app",
    siteName: "GameBoy Engine",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GameBoy Game Engine",
    description: "Play classic retro games in a beautifully crafted virtual GameBoy.",
    creator: "@hussainahmed",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${pressStart.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}