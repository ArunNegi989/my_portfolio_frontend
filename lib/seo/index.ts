import type { Metadata } from "next";
import { getPageSeo, getSettings } from "@/lib/data";
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

export async function buildMetadata({ title, description, path, image, canonical, type = "website", publishedTime }: BuildMetadataInput): Promise<Metadata> {
  const settings = await getSettings();
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

/** Metadata for a static page, from the per-page SEO entries managed in the admin SEO screen. */
export async function pageMetadata(path: string): Promise<Metadata> {
  const entry = await getPageSeo(path);
  if (!entry) return {};
  return buildMetadata({
    title: entry.title,
    description: entry.description,
    path,
    image: entry.ogImage,
    canonical: entry.canonical,
  });
}
