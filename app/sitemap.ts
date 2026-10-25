import type { MetadataRoute } from "next";
import { settings } from "@/data/settings";
import { getAllPageSeo, getPosts, getProjects } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts, pageSeo] = await Promise.all([getProjects(), getPosts(), getAllPageSeo()]);
  return [
    ...pageSeo.map((page) => ({
      url: absoluteUrl(settings.siteUrl, page.path),
      changeFrequency: "monthly" as const,
      priority: page.path === "/" ? 1 : 0.7,
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(settings.siteUrl, `/projects/${project.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(settings.siteUrl, `/blog/${post.slug}`),
      lastModified: post.publishedAt,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
