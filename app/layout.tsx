import type { Metadata, Viewport } from "next";
import { Anton, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { InlineScript } from "@/components/shared/InlineScript";
import { INTRO_BOOT_SCRIPT } from "@/components/animations/introStore";
import { profile } from "@/data/profile";
import { settings } from "@/data/settings";
import "./globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"], display: "swap" });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(settings.siteUrl),
  title: {
    default: settings.siteName,
    template: `%s | ${profile.name}`,
  },
  description: settings.tagline,
  applicationName: settings.siteName,
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    siteName: settings.siteName,
    images: [{ url: settings.defaultOgImage, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#050608",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${grotesk.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <InlineScript html={INTRO_BOOT_SCRIPT} />
      </head>
      <body>{children}</body>
    </html>
  );
}
