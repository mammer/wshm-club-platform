import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Built per request so new posts show up without a rebuild, and builds do not need a database.
export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wshm.ma";
const locales = ["fr", "ar"] as const;

function url(path: string) {
  return `${siteUrl}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const staticRoutes = ["/", "/about", "/players", "/scores", "/blog", "/gallery", "/tournament", "/privacy"];

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: url(`/${locale}${route}`),
      lastModified: new Date(),
      changeFrequency: route === "/" ? "daily" : "weekly",
      priority: route === "/" ? 1 : 0.7,
    }))
  );

  const blogEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    posts.map((post) => ({
      url: url(`/${locale}/blog/${post.slug}`),
      lastModified: post.publishedAt ?? new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }))
  );

  return [...staticEntries, ...blogEntries];
}
