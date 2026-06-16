import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { IconNews, IconCalendar, IconClock, IconArrowRight } from "@tabler/icons-react";
import { excerpt, readingTime, initials } from "@/lib/blogUtils";

const PAGE_SIZE = 9;

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const isFeaturedPage = page === 1;

  const t = await getTranslations({ locale, namespace: "blog" });
  const lp = (p: string) => `/${locale}${p}`;
  const dateLocale = locale === "ar" ? "ar-MA" : "fr-FR";

  // On page 1, the most recent post is shown as a hero — fetch one extra so
  // the grid still has a full page of secondary posts.
  const take = isFeaturedPage ? PAGE_SIZE + 1 : PAGE_SIZE;
  const skip = isFeaturedPage ? 0 : (page - 1) * PAGE_SIZE + 1;

  const [allPosts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        slug: true,
        titleFr: true,
        titleAr: true,
        coverImageUrl: true,
        publishedAt: true,
        author: true,
        contentFr: true,
        contentAr: true,
      },
    }),
    prisma.blogPost.count({ where: { published: true } }),
  ]);

  const featured = isFeaturedPage ? allPosts[0] : null;
  const posts = isFeaturedPage ? allPosts.slice(1) : allPosts;

  // Page 1 shows 1 hero + PAGE_SIZE grid posts; subsequent pages show PAGE_SIZE grid posts each.
  const remainingAfterHero = Math.max(0, total - 1);
  const pageCount = total === 0 ? 1 : 1 + Math.ceil(remainingAfterHero / PAGE_SIZE);
  const from = isFeaturedPage ? 1 : (page - 1) * PAGE_SIZE + 2;
  const to = isFeaturedPage ? Math.min(1 + PAGE_SIZE, total) : Math.min(page * PAGE_SIZE + 1, total);

  const title = (p: { titleFr: string; titleAr: string }) => (locale === "ar" ? p.titleAr : p.titleFr);
  const body = (p: { contentFr: string; contentAr: string }) => (locale === "ar" ? p.contentAr : p.contentFr);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-2xl bg-[#CC0000]/10 flex items-center justify-center shrink-0">
          <IconNews size={22} className="text-[#CC0000]" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] leading-tight">{t("title")}</h1>
        </div>
      </div>
      <p className="text-gray-500 max-w-2xl mb-10">{t("subtitle")}</p>

      {total === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <IconNews size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">{t("no_posts")}</p>
        </div>
      ) : (
        <>
          {/* Featured post — only on page 1 */}
          {featured && (
            <Link
              href={lp(`/blog/${featured.slug}`)}
              className="group block bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow mb-12"
            >
              <div className="grid sm:grid-cols-2">
                <div className="relative h-64 sm:h-full min-h-[280px] bg-gray-100">
                  {featured.coverImageUrl ? (
                    <Image
                      src={featured.coverImageUrl}
                      alt={title(featured)}
                      fill
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/10 to-gray-100 flex items-center justify-center">
                      <span className="text-6xl">⚽</span>
                    </div>
                  )}
                  <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-[#CC0000] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                    {t("featured")}
                  </span>
                </div>
                <div className="p-6 sm:p-9 flex flex-col justify-center">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] leading-tight mb-3 group-hover:text-[#CC0000] transition-colors">
                    {title(featured)}
                  </h2>
                  <p className="text-gray-500 leading-relaxed mb-5 line-clamp-3">
                    {excerpt(body(featured), 220)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-6 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-[#CC0000]/10 text-[#CC0000] flex items-center justify-center text-[10px] font-bold">
                        {initials(featured.author)}
                      </span>
                      <span className="font-semibold text-gray-600">{featured.author}</span>
                    </span>
                    {featured.publishedAt && (
                      <span className="flex items-center gap-1">
                        <IconCalendar size={13} />
                        {new Date(featured.publishedAt).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <IconClock size={13} />
                      {readingTime(body(featured))} {t("min_read")}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[#CC0000] font-bold text-sm">
                    {t("read_more")}
                    <IconArrowRight size={15} className="rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {posts.length > 0 && (
            <>
              {featured && <h3 className="text-lg font-bold text-gray-700 mb-5">{t("more_articles")}</h3>}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={lp(`/blog/${post.slug}`)}
                    className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
                      {post.coverImageUrl ? (
                        <Image
                          src={post.coverImageUrl}
                          alt={title(post)}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/10 to-gray-100 flex items-center justify-center">
                          <span className="text-4xl">⚽</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h2 className="font-bold text-[#1a1a1a] leading-snug line-clamp-2 mb-2 group-hover:text-[#CC0000] transition-colors">
                        {title(post)}
                      </h2>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                        {excerpt(body(post), 110)}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#CC0000]/10 text-[#CC0000] flex items-center justify-center text-[9px] font-bold">
                            {initials(post.author)}
                          </span>
                          {post.publishedAt && new Date(post.publishedAt).toLocaleDateString(dateLocale, { day: "numeric", month: "short" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconClock size={12} />
                          {readingTime(body(post))} {t("min_read")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-100">
          <span className="text-sm text-gray-400">{from}–{to} / {total}</span>
          <div className="flex gap-1">
            {page > 1 && (
              <Link
                href={`${lp("/blog")}?page=${page - 1}`}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 text-gray-600 transition-colors"
              >
                ←
              </Link>
            )}
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`${lp("/blog")}?page=${p}`}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  p === page ? "bg-[#CC0000] text-white" : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                {p}
              </Link>
            ))}
            {page < pageCount && (
              <Link
                href={`${lp("/blog")}?page=${page + 1}`}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 text-gray-600 transition-colors"
              >
                →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
