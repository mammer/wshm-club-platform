import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

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

  const t = await getTranslations({ locale, namespace: "blog" });
  const lp = (p: string) => `/${locale}${p}`;

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-2">{t("title")}</h1>
      {total > 0 && (
        <p className="text-sm text-gray-400 mb-8">{from}–{to} / {total}</p>
      )}

      {posts.length === 0 ? (
        <p className="text-gray-400">{t("no_posts")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={lp(`/blog/${post.slug}`)}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              {post.coverImageUrl ? (
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.coverImageUrl}
                    alt={locale === "ar" ? post.titleAr : post.titleFr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-[#CC0000]/10 to-gray-100 flex items-center justify-center">
                  <span className="text-4xl">⚽</span>
                </div>
              )}
              <div className="p-5">
                <h2 className="font-bold text-[#1a1a1a] line-clamp-2 mb-2">
                  {locale === "ar" ? post.titleAr : post.titleFr}
                </h2>
                <p className="text-xs text-gray-400">
                  {t("by")} {post.author}
                  {post.publishedAt && (
                    <> — {new Date(post.publishedAt).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR")}</>
                  )}
                </p>
                <p className="text-[#CC0000] text-sm font-semibold mt-3">{t("read_more")} →</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
            {page < totalPages && (
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
