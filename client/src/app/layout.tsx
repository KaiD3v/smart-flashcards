import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/providers/providers";
import { env } from "@/lib/env";
import { absoluteUrl } from "@/lib/seo/url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${env.siteName} – Study smarter with AI flashcards`,
    template: `%s · ${env.siteName}`,
  },
  description:
    "AI-generated flashcards with science-backed spaced repetition. Create subjects, generate decks, and review smarter.",
  applicationName: env.siteName,
  authors: [{ name: env.siteName }],
  keywords: [
    "flashcards",
    "AI",
    "spaced repetition",
    "FSRS",
    "study",
    "learning",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: env.siteName,
    title: `${env.siteName} – Study smarter with AI flashcards`,
    description:
      "AI-generated flashcards with science-backed spaced repetition. Create subjects, generate decks, and review smarter.",
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${env.siteName} – Study smarter with AI flashcards`,
    description:
      "AI-generated flashcards with science-backed spaced repetition.",
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a12" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
