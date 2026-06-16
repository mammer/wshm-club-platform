import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { IconChevronLeft as ChevronLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import DOMPurify from "isomorphic-dompurify";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } });
  if (!post) return {};
  const title = locale === "ar" ? post.titleAr : post.titleFr;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wshm.ma";
  return {
    title: `${title} — W.S.H.M`,
    description: (locale === "ar" ? post.contentAr : post.contentFr).replace(/<[^>]+>/g, "").slice(0, 155),
    openGraph: {
      title,
      images: post.coverImageUrl ? [{ url: `${siteUrl}${post.coverImageUrl}` }] : [],
      type: "article",
      locale: locale === "ar" ? "ar_MA" : "fr_MA",
    },
    twitter: { card: "summary_large_image", title },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const lp = (p: string) => `/${locale}${p}`;

  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
  });

  if (!post) notFound();

  const title = locale === "ar" ? post.titleAr : post.titleFr;
  const rawContent = locale === "ar" ? post.contentAr : post.contentFr;
  const content = DOMPurify.sanitize(rawContent, {
    ALLOWED_TAGS: ["p","br","strong","em","u","s","h1","h2","h3","h4","ul","ol","li","blockquote","a","img","figure","figcaption","table","thead","tbody","tr","th","td"],
    ALLOWED_ATTR: ["href","src","alt","class","target","rel","width","height"],
    FORCE_BODY: true,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href={lp("/blog")}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#CC0000] mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> {t("title")}
      </Link>

      {post.coverImageUrl && (
        <div className="rounded-2xl overflow-hidden mb-8 relative h-72">
          <Image src={post.coverImageUrl} alt={title} fill className="object-cover" priority sizes="(max-width:768px) 100vw, 768px" />
        </div>
      )}

      <h1 className="text-3xl font-extrabold mb-3 leading-tight">{title}</h1>
      <p className="text-sm text-gray-400 mb-8">
        {t("by")} <span className="font-semibold text-gray-600">{post.author}</span>
        {post.publishedAt && (
          <> — {new Date(post.publishedAt).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR")}</>
        )}
      </p>

      <div
        className="prose-wshm prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
