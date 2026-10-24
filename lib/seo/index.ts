import type { Metadata } from "next";
import { pageSeo } from "@/data/seo";
import { settings } from "@/data/settings";
import { absoluteUrl } from "@/lib/utils";

interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  canonical?: string;
  type?: "website" | "article";
  publishedTime?: string;
}

export function buildMetadata({ title, description, path, image, canonical, type = "website", publishedTime }: BuildMetadataInput): Metadata {
  const ogImage = image || settings.defaultOgImage;
  const url = canonical || absoluteUrl(settings.siteUrl, path);
  return {
    // The home page title is used as-is; other pages go through the root layout's title template.
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: settings.siteName,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

/** Metadata for a static page, read from data/seo.ts. */
export function pageMetadata(path: string): Metadata {
  const entry = pageSeo.find((p) => p.path === path);
  if (!entry) return {};
  return buildMetadata({
    title: entry.title,
    description: entry.description,
    path,
    image: entry.ogImage,
    canonical: entry.canonical,
  });
}
