import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { IconChevronRight as ChevronRight, IconMapPin as MapPin, IconCalendar as Calendar, IconStar as Star } from "@tabler/icons-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const tsec = await getTranslations({ locale, namespace: "sections" });
  const isRtl = locale === "ar";
  const lp = (path: string) => `/${locale}${path}`;

  const [playerCount, recentMatches, latestPosts, latestPhotos, openTournament, featuredPlayer, nextMatch] =
    await Promise.all([
      prisma.player.count({ where: { isActive: true } }),
      prisma.match.findMany({
        where: { homeScore: { not: null } },
        orderBy: { matchDate: "desc" },
        take: 6,
      }),
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: { id: true, slug: true, titleFr: true, titleAr: true, coverImageUrl: true, publishedAt: true, author: true },
      }),
      prisma.galleryPhoto.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.tournament.findFirst({ where: { isOpen: true }, orderBy: { tournamentDate: "asc" } }),
      prisma.player.findFirst({
        where: { isActive: true, category: "SENIORS", photoUrl: { not: null } },
        orderBy: { jerseyNumber: "asc" },
      }),
      prisma.match.findFirst({
        where: { homeScore: null },
        orderBy: { matchDate: "asc" },
      }),
    ]);

  const yearsActive = new Date().getFullYear() - 1956;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "name": "W.S.H.M — Wefak Sportif Hassanyat Madagh",
    "alternateName": "الوفاق الرياضي الحسني مداغ",
    "url": "https://wshm.ma",
    "logo": "https://wshm.ma/logo.png",
    "foundingDate": "1956",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Madagh",
      "addressRegion": "Berkane",
      "addressCountry": "MA",
    },
    "sport": "Football",
  };

  const categoryLabel = (cat: string) => {
    const map: Record<string, { fr: string; ar: string }> = {
      MINIMES: { fr: "Minimes", ar: "الصغار" },
      CADETS: { fr: "Cadets", ar: "الأشبال" },
      JUNIORS: { fr: "Juniors", ar: "الناشئون" },
      SENIORS: { fr: "Séniors", ar: "الكبار" },
    };
    return map[cat]?.[locale as "fr" | "ar"] ?? cat;
  };

  const competitionLabel = (comp: string) => {
    const map: Record<string, { fr: string; ar: string }> = {
      CHAMPIONNAT: { fr: "Championnat", ar: "البطولة" },
      COUPE: { fr: "Coupe", ar: "الكأس" },
      AMICAL: { fr: "Amical", ar: "ودي" },
    };
    return map[comp]?.[locale as "fr" | "ar"] ?? comp;
  };

  return (
    <div className="overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] bg-[#0d0d0d] text-white flex items-center">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Red gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/30 via-transparent to-[#C8A84B]/10 pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className={`flex flex-col gap-6 ${isRtl ? "lg:order-2 text-right" : ""}`}>
            <div className="inline-flex items-center gap-2 bg-[#CC0000]/20 border border-[#CC0000]/30 text-[#CC0000] text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full w-fit">
              <Star size={12} />
              {locale === "ar" ? "تأسس عام 1956 · مداغ، المغرب" : "Fondé en 1956 · Madagh, Maroc"}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
              {locale === "ar" ? (
                <>
                  <span className="text-white">الوفاق الرياضي</span>
                  <br />
                  <span className="text-[#CC0000]">الحسني مداغ</span>
                </>
              ) : (
                <>
                  <span className="text-white">Wefak Sportif</span>
                  <br />
                  <span className="text-[#CC0000]">Hassanyat Madagh</span>
                </>
              )}
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
              {locale === "ar"
                ? "نادي عريق في شرق المغرب، نبني الأبطال منذ 1956. كرة القدم قيمنا، مداغ هويتنا."
                : "Un club historique de l'Oriental marocain. Nous forgeons des champions depuis 1956. Le football est notre passion, Madagh notre fierté."}
            </p>

            <div className={`flex gap-4 flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}>
              <Link
                href={lp("/players")}
                className="bg-[#CC0000] hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-red-900/30"
              >
                {locale === "ar" ? "تعرف على لاعبينا" : "Nos Joueurs"}
              </Link>
              <Link
                href={lp("/scores")}
                className="border-2 border-white/20 hover:border-[#CC0000] text-white hover:text-[#CC0000] font-bold px-8 py-4 rounded-xl transition-all"
              >
                {locale === "ar" ? "النتائج والترتيب" : "Scores & Classement"}
              </Link>
            </div>

            {/* Location badge */}
            <div className={`flex items-center gap-2 text-gray-500 text-sm ${isRtl ? "flex-row-reverse" : ""}`}>
              <MapPin size={14} />
              <span>{locale === "ar" ? "مداغ، إقليم بركان، المغرب" : "Madagh, Province de Berkane, Maroc"}</span>
            </div>
          </div>

          {/* Right: Logo + glow */}
          <div className={`flex justify-center items-center ${isRtl ? "lg:order-1" : ""}`}>
            <div className="relative">
              {/* Outer glow rings */}
              <div className="absolute inset-0 rounded-full bg-[#CC0000]/20 blur-3xl scale-150" />
              <div className="absolute inset-0 rounded-full bg-[#C8A84B]/10 blur-2xl scale-125" />
              {/* Rotating ring */}
              <div
                className="absolute inset-[-20px] rounded-full border-2 border-dashed border-[#CC0000]/30"
                style={{ animation: "spin 20s linear infinite" }}
              />
              <div
                className="absolute inset-[-40px] rounded-full border border-[#C8A84B]/20"
                style={{ animation: "spin 30s linear infinite reverse" }}
              />
              <Image
                src="/logo.png"
                alt="W.S.H.M"
                width={280}
                height={280}
                className="relative rounded-full border-4 border-[#CC0000] shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────── */}
      <section className="bg-[#CC0000] text-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-red-700">
          {[
            { value: playerCount.toString(), label: locale === "ar" ? "لاعب نشيط" : "Joueurs Actifs" },
            { value: `${yearsActive}`, label: locale === "ar" ? "سنة من التاريخ" : "Ans d'Histoire" },
            { value: "4", label: locale === "ar" ? "فئات" : "Catégories" },
            { value: "1956", label: locale === "ar" ? "سنة التأسيس" : "Année de fondation" },
          ].map((stat, i) => (
            <div key={i} className={`flex flex-col items-center py-2 px-4 ${i >= 2 ? "hidden md:flex" : ""}`}>
              <span className="text-4xl font-extrabold tabular-nums">{stat.value}</span>
              <span className="text-xs opacity-75 text-center mt-1 uppercase tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEXT MATCH COUNTDOWN ────────────────────────────────── */}
      {nextMatch && (
        <section className="bg-[#1a1a1a] text-white">
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <p className="text-[#CC0000] text-xs font-bold uppercase tracking-widest mb-4">
              {locale === "ar" ? "المباراة القادمة" : "Prochain Match"}
            </p>
            <div className={`flex items-center justify-center gap-4 md:gap-8 mb-6 ${isRtl ? "flex-row-reverse" : ""}`}>
              <div className="flex-1 text-right md:text-right">
                <p className="text-xl md:text-3xl font-extrabold leading-tight">{nextMatch.homeTeam}</p>
                <p className="text-[#CC0000] text-xs uppercase tracking-widest mt-1">
                  {locale === "ar" ? "الفريق المضيف" : "Domicile"}
                </p>
              </div>
              <div className="bg-[#CC0000] text-white text-2xl md:text-4xl font-extrabold px-6 py-3 rounded-xl shrink-0">
                VS
              </div>
              <div className="flex-1 text-left md:text-left">
                <p className="text-xl md:text-3xl font-extrabold leading-tight">{nextMatch.awayTeam}</p>
                <p className="text-[#CC0000] text-xs uppercase tracking-widest mt-1">
                  {locale === "ar" ? "الضيف" : "Visiteur"}
                </p>
              </div>
            </div>
            <div className={`flex items-center justify-center gap-3 text-gray-400 text-sm ${isRtl ? "flex-row-reverse" : ""}`}>
              <Calendar size={14} />
              <span>
                {new Date(nextMatch.matchDate).toLocaleDateString(
                  locale === "ar" ? "ar-MA" : "fr-FR",
                  { weekday: "long", year: "numeric", month: "long", day: "numeric" }
                )}
              </span>
              {nextMatch.location && (
                <>
                  <span>·</span>
                  <MapPin size={14} />
                  <span>{nextMatch.location}</span>
                </>
              )}
            </div>
            <div className="mt-4 inline-block bg-[#C8A84B]/10 border border-[#C8A84B]/30 text-[#C8A84B] text-xs px-4 py-1.5 rounded-full">
              {categoryLabel(nextMatch.category)} · {competitionLabel(nextMatch.competition ?? "CHAMPIONNAT")}
            </div>
          </div>
        </section>
      )}

      {/* ── TOURNAMENT CTA ──────────────────────────────────────── */}
      {openTournament && (
        <section className="relative bg-gradient-to-r from-[#C8A84B] to-[#e6c96e] text-[#1a1a1a] overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 text-[12rem] font-extrabold leading-none select-none pr-8 flex items-center">
            🏆
          </div>
          <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className={isRtl ? "text-right" : ""}>
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
                {locale === "ar" ? "التسجيل مفتوح" : "Inscriptions Ouvertes"}
              </p>
              <p className="font-extrabold text-2xl">
                {locale === "ar" ? openTournament.nameAr : openTournament.nameFr}
              </p>
              {openTournament.registrationDeadline && (
                <p className="text-sm mt-1 opacity-70">
                  {locale === "ar" ? "آخر أجل:" : "Date limite :"}{" "}
                  {new Date(openTournament.registrationDeadline).toLocaleDateString(
                    locale === "ar" ? "ar-MA" : "fr-FR"
                  )}
                </p>
              )}
            </div>
            <Link
              href={lp("/tournament")}
              className="shrink-0 bg-[#1a1a1a] text-white hover:bg-[#CC0000] font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              {locale === "ar" ? "سجّل نادِيَك الآن" : "Inscrire mon équipe"}
            </Link>
          </div>
        </section>
      )}

      {/* ── LATEST SCORES ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className={`flex items-center justify-between mb-8 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div>
            <p className="text-[#CC0000] text-xs font-bold uppercase tracking-widest mb-1">
              {locale === "ar" ? "آخر المباريات" : "Résultats récents"}
            </p>
            <h2 className="text-3xl font-extrabold text-[#1a1a1a]">
              {tsec("latest_scores")}
            </h2>
          </div>
          <Link
            href={lp("/scores")}
            className={`text-[#CC0000] hover:text-red-700 text-sm font-semibold flex items-center gap-1 transition-colors ${isRtl ? "flex-row-reverse" : ""}`}
          >
            {locale === "ar" ? "عرض الكل" : "Voir tout"}
            <ChevronRight size={16} />
          </Link>
        </div>

        {recentMatches.length === 0 ? (
          <p className="text-gray-400 text-sm">
            {locale === "ar" ? "لا توجد نتائج بعد." : "Aucun résultat disponible."}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentMatches.map((m) => {
              const homeWin = (m.homeScore ?? 0) > (m.awayScore ?? 0);
              const awayWin = (m.awayScore ?? 0) > (m.homeScore ?? 0);
              const wshm = m.homeTeam.includes("WSHM") || m.homeTeam.includes("W.S.H.M") || m.homeTeam.includes("Madagh");
              const wshmWin = wshm ? homeWin : awayWin;

              return (
                <div
                  key={m.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`flex items-center justify-between mb-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      {categoryLabel(m.category)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(m.matchDate).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <span className={`flex-1 text-sm font-bold truncate ${isRtl ? "text-right" : "text-left"} ${homeWin ? "text-[#CC0000]" : "text-[#1a1a1a]"}`}>
                      {m.homeTeam}
                    </span>
                    <div className="bg-[#1a1a1a] text-white px-4 py-2 rounded-xl font-extrabold text-lg tabular-nums shrink-0">
                      {m.homeScore} – {m.awayScore}
                    </div>
                    <span className={`flex-1 text-sm font-bold truncate ${isRtl ? "text-left" : "text-right"} ${awayWin ? "text-[#CC0000]" : "text-[#1a1a1a]"}`}>
                      {m.awayTeam}
                    </span>
                  </div>
                  <div className={`mt-3 flex items-center justify-between ${isRtl ? "flex-row-reverse" : ""}`}>
                    <span className="text-[10px] text-gray-400">{competitionLabel(m.competition ?? "CHAMPIONNAT")}</span>
                    {wshmWin && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        {locale === "ar" ? "فوز ✓" : "Victoire ✓"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── FEATURED PLAYER ─────────────────────────────────────── */}
      {featuredPlayer && (
        <section className="bg-[#1a1a1a] text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#CC0000]/10 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center relative">
            <div className={`order-2 ${isRtl ? "md:order-2 text-right" : "md:order-2"}`}>
              <p className="text-[#CC0000] text-xs font-bold uppercase tracking-widest mb-4">
                {locale === "ar" ? "لاعب مميز" : "Joueur à la Une"}
              </p>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
                {featuredPlayer.fullName}
              </h2>
              {featuredPlayer.position && (
                <p className="text-[#C8A84B] text-xl font-semibold mb-6">{featuredPlayer.position}</p>
              )}
              <div className={`flex gap-6 mb-8 ${isRtl ? "flex-row-reverse" : ""}`}>
                {featuredPlayer.jerseyNumber && (
                  <div>
                    <p className="text-4xl font-extrabold text-white">#{featuredPlayer.jerseyNumber}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">
                      {locale === "ar" ? "رقم القميص" : "Numéro"}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-4xl font-extrabold text-white">{categoryLabel(featuredPlayer.category)}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">
                    {locale === "ar" ? "الفئة" : "Catégorie"}
                  </p>
                </div>
              </div>
              <Link
                href={lp("/players")}
                className={`inline-flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {locale === "ar" ? "جميع اللاعبين" : "Voir tous les joueurs"}
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className={`order-1 flex justify-center ${isRtl ? "md:order-1" : "md:order-1"}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-[#CC0000]/20 rounded-full blur-3xl scale-110" />
                <img
                  src={featuredPlayer.photoUrl!}
                  alt={featuredPlayer.fullName}
                  className="relative w-72 h-72 object-cover rounded-full border-4 border-[#CC0000] shadow-2xl"
                />
                {featuredPlayer.jerseyNumber && (
                  <div className="absolute -bottom-2 -right-2 bg-[#CC0000] text-white font-extrabold text-xl w-14 h-14 rounded-full flex items-center justify-center border-4 border-[#1a1a1a] shadow-lg">
                    {featuredPlayer.jerseyNumber}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ACHIEVEMENTS / CLUB DNA ─────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-12 ${isRtl ? "rtl" : ""}`}>
            <p className="text-[#CC0000] text-xs font-bold uppercase tracking-widest mb-2">
              {locale === "ar" ? "روح النادي" : "L'ADN du Club"}
            </p>
            <h2 className="text-3xl font-extrabold text-[#1a1a1a]">
              {locale === "ar" ? "لماذا الوفاق؟" : "Pourquoi W.S.H.M ?"}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🏆",
                titleFr: "Histoire & Palmarès",
                titleAr: "التاريخ والمجد",
                descFr: `Plus de ${yearsActive} ans de passion pour le football dans la région de l'Oriental. Un club qui a vu grandir des générations de joueurs.`,
                descAr: `أكثر من ${yearsActive} عاماً من الشغف بكرة القدم في المنطقة الشرقية. نادٍ أنجب أجيالاً من اللاعبين.`,
              },
              {
                icon: "⚽",
                titleFr: "Formation des Jeunes",
                titleAr: "تكوين الأجيال",
                descFr: "Du Minime au Junior, nous investissons dans chaque jeune talent de Madagh et ses environs pour en faire les champions de demain.",
                descAr: "من الصغار إلى الناشئين، نستثمر في كل موهبة شابة من مداغ وضواحيها لنصنع أبطال الغد.",
              },
              {
                icon: "🤝",
                titleFr: "Communauté & Valeurs",
                titleAr: "المجتمع والقيم",
                descFr: "Le football comme vecteur de cohésion sociale. Respect, solidarité et dépassement de soi — les valeurs que nous transmettons sur et hors du terrain.",
                descAr: "كرة القدم كأداة للتماسك الاجتماعي. الاحترام والتضامن والتحدي — قيم نغرسها داخل الملعب وخارجه.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
              >
                <div className="text-5xl mb-5">{item.icon}</div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-3 group-hover:text-[#CC0000] transition-colors">
                  {locale === "ar" ? item.titleAr : item.titleFr}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {locale === "ar" ? item.descAr : item.descFr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST BLOG ─────────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className={`flex items-center justify-between mb-8 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div>
              <p className="text-[#CC0000] text-xs font-bold uppercase tracking-widest mb-1">
                {locale === "ar" ? "الأخبار" : "Actualités"}
              </p>
              <h2 className="text-3xl font-extrabold text-[#1a1a1a]">
                {tsec("latest_news")}
              </h2>
            </div>
            <Link
              href={lp("/blog")}
              className={`text-[#CC0000] hover:text-red-700 text-sm font-semibold flex items-center gap-1 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              {locale === "ar" ? "عرض الكل" : "Voir tout"}
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post, i) => (
              <Link
                key={post.id}
                href={lp(`/blog/${post.slug}`)}
                className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                {post.coverImageUrl && (
                  <div className="h-52 overflow-hidden">
                    <img
                      src={post.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5">
                  <p className="font-extrabold text-[#1a1a1a] line-clamp-2 group-hover:text-[#CC0000] transition-colors">
                    {locale === "ar" ? post.titleAr : post.titleFr}
                  </p>
                  <div className={`flex items-center gap-2 mt-3 text-xs text-gray-400 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString(
                            locale === "ar" ? "ar-MA" : "fr-FR",
                            { day: "numeric", month: "short", year: "numeric" }
                          )
                        : ""}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── GALLERY PREVIEW ─────────────────────────────────────── */}
      {latestPhotos.length > 0 && (
        <section className="bg-[#1a1a1a] py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className={`flex items-center justify-between mb-8 ${isRtl ? "flex-row-reverse" : ""}`}>
              <div>
                <p className="text-[#CC0000] text-xs font-bold uppercase tracking-widest mb-1">
                  {locale === "ar" ? "لحظاتنا" : "Nos Moments"}
                </p>
                <h2 className="text-3xl font-extrabold text-white">
                  {tsec("gallery_preview")}
                </h2>
              </div>
              <Link
                href={lp("/gallery")}
                className={`text-[#C8A84B] hover:text-yellow-400 text-sm font-semibold flex items-center gap-1 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {locale === "ar" ? "عرض الكل" : "Voir tout"}
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              {latestPhotos.map((photo, i) => (
                <Link
                  key={photo.id}
                  href={lp("/gallery")}
                  className={`overflow-hidden rounded-xl group ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
                >
                  <div className={`w-full overflow-hidden ${i === 0 ? "h-80 md:h-full" : "h-40"}`}>
                    <img
                      src={photo.imageUrl}
                      alt={locale === "ar" ? photo.titleAr ?? "" : photo.titleFr ?? ""}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── JOIN CTA ────────────────────────────────────────────── */}
      <section className="relative bg-[#CC0000] text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='10' stroke='white' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className={`max-w-4xl mx-auto px-4 py-16 text-center ${isRtl ? "rtl" : ""}`}>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-4">
            {locale === "ar" ? "انضم إلى العائلة" : "Rejoins la famille"}
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            {locale === "ar" ? "أنت أيضاً جزء من الوفاق" : "Vous aussi, vous êtes W.S.H.M"}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            {locale === "ar"
              ? "سواء كنت لاعباً أو مشجعاً أو شريكاً، نادينا مفتوح للجميع. معاً نبني المستقبل."
              : "Que vous soyez joueur, supporter ou partenaire — notre club vous accueille. Ensemble, construisons l'avenir."}
          </p>
          <div className={`flex gap-4 justify-center flex-wrap ${isRtl ? "flex-row-reverse" : ""}`}>
            <Link
              href={lp("/about")}
              className="bg-white text-[#CC0000] hover:bg-gray-100 font-bold px-8 py-4 rounded-xl transition-all hover:scale-105"
            >
              {locale === "ar" ? "اعرف أكثر" : "En savoir plus"}
            </Link>
            <Link
              href={lp("/tournament")}
              className="border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 rounded-xl transition-all"
            >
              {locale === "ar" ? "سجل في التورنوا" : "Participer au tournoi"}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
