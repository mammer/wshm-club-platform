import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { IconChevronLeft, IconCalendar, IconClock } from "@tabler/icons-react";
import type { Metadata } from "next";
import DOMPurify from "isomorphic-dompurify";
import { excerpt, readingTime, initials } from "@/lib/blogUtils";
import ShareButton from "@/components/public/ShareButton";

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
  const dateLocale = locale === "ar" ? "ar-MA" : "fr-FR";

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

  const related = await prisma.blogPost.findMany({
    where: { published: true, slug: { not: slug } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { id: true, slug: true, titleFr: true, titleAr: true, coverImageUrl: true, publishedAt: true, contentFr: true, contentAr: true },
  });

  return (
    <article className="pb-16">
      {/* Hero */}
      <div className="relative h-[40vh] sm:h-[52vh] min-h-[280px] max-h-[520px] bg-gray-900">
        {post.coverImageUrl ? (
          <Image src={post.coverImageUrl} alt={title} fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/30 to-gray-800 flex items-center justify-center">
            <span className="text-7xl opacity-40">⚽</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

        <div className="absolute top-0 left-0 right-0 px-4 sm:px-8 pt-6">
          <Link
            href={lp("/blog")}
            className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white bg-black/30 hover:bg-black/45 backdrop-blur-sm rounded-full px-3.5 py-1.5 transition-colors"
          >
            <IconChevronLeft size={15} className="rtl:rotate-180" /> {t("title")}
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-7 sm:pb-10 max-w-4xl">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-sm">
            {title}
          </h1>
        </div>
      </div>

      {/* Meta bar */}
      <div className="max-w-3xl mx-auto px-4 -mt-px">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-5 border-b border-gray-100 mb-8">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-[#CC0000]/10 text-[#CC0000] flex items-center justify-center text-xs font-bold shrink-0">
              {initials(post.author)}
            </span>
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">{post.author}</p>
              <p className="text-xs text-gray-400">{t("by")} W.S.H.M</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <IconCalendar size={14} className="text-gray-400" />
            {post.publishedAt && new Date(post.publishedAt).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <IconClock size={14} className="text-gray-400" />
            {readingTime(rawContent)} {t("min_read")}
          </span>
          <span className="ml-auto rtl:ml-0 rtl:mr-auto">
            <ShareButton label={t("copy_link")} copiedLabel={t("link_copied")} />
          </span>
        </div>

        <div
          className="prose-wshm prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 mt-16 pt-10 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-6">{t("related")}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((p) => {
              const rTitle = locale === "ar" ? p.titleAr : p.titleFr;
              const rBody = locale === "ar" ? p.contentAr : p.contentFr;
              return (
                <Link
                  key={p.id}
                  href={lp(`/blog/${p.slug}`)}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="relative h-36 bg-gray-100 overflow-hidden">
                    {p.coverImageUrl ? (
                      <Image src={p.coverImageUrl} alt={rTitle} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/10 to-gray-100 flex items-center justify-center">
                        <span className="text-3xl">⚽</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-[#1a1a1a] line-clamp-2 mb-1.5 group-hover:text-[#CC0000] transition-colors">
                      {rTitle}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{excerpt(rBody, 80)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
