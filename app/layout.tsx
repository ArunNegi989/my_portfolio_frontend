
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Anton, JetBrains_Mono, Space_Grotesk } from "next/font/google";

import { InlineScript } from "@/components/shared/InlineScript";
import { introBootScript } from "@/components/animations/introStore";
import { getProfile, getSettings } from "@/lib/data";

import "./globals.css";

const GA_MEASUREMENT_ID = "G-CNK469PTR5";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [settings, profile] = await Promise.all([
    getSettings(),
    getProfile(),
  ]);

  return {
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
      images: [
        {
          url: settings.defaultOgImage,
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#050608",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <html
      lang="en"
      className={`${anton.variable} ${grotesk.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;

            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>

        {/* Intro Animation Boot Script */}
        <InlineScript html={introBootScript(settings.introEnabled)} />
      </head>

      <body>
        {children}
      </body>
    </html>
  );
}
