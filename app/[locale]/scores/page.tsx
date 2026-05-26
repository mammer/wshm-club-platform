import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Category } from "@/lib/types";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "النتائج والترتيب" : "Scores & Classement",
    description: locale === "ar"
      ? "نتائج مباريات وترتيب فئات فريق وفاق الحسنية مضاغ"
      : "Résultats des matchs et classement par catégorie de la W.S.H.M Madagh",
  };
}

type StandingEntry = {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

function computeStandings(matches: { homeTeam: string; awayTeam: string; homeScore: number | null; awayScore: number | null }[]): StandingEntry[] {
  const table: Record<string, StandingEntry> = {};
  const ensure = (name: string) => {
    if (!table[name]) table[name] = { team: name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
  };

  for (const m of matches) {
    if (m.homeScore === null || m.awayScore === null) continue;
    ensure(m.homeTeam);
    ensure(m.awayTeam);

    const h = table[m.homeTeam];
    const a = table[m.awayTeam];
    h.played++; a.played++;
    h.gf += m.homeScore; h.ga += m.awayScore;
    a.gf += m.awayScore; a.ga += m.homeScore;

    if (m.homeScore > m.awayScore) { h.won++; h.points += 3; a.lost++; }
    else if (m.homeScore < m.awayScore) { a.won++; a.points += 3; h.lost++; }
    else { h.drawn++; a.drawn++; h.points++; a.points++; }
  }

  return Object.values(table)
    .map((e) => ({ ...e, gd: e.gf - e.ga }))
    .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
}

const CATEGORIES: Category[] = ["MINIMES", "CADETS", "JUNIORS", "SENIORS"];

export default async function ScoresPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cat?: string; tab?: string }>;
}) {
  const { locale } = await params;
  const { cat = "SENIORS", tab = "results" } = await searchParams;
  const t = await getTranslations({ locale, namespace: "scores" });

  const category = CATEGORIES.includes(cat as Category) ? (cat as Category) : "SENIORS";

  const matches = await prisma.match.findMany({
    where: { category },
    orderBy: { matchDate: "desc" },
  });

  const championnatMatches = matches.filter((m) => m.competition === "CHAMPIONNAT");
  const standings = computeStandings(championnatMatches);

  const catLabel = (c: string) => {
    const map: Record<string, { fr: string; ar: string }> = {
      MINIMES: { fr: "Minimes", ar: "الصغار" },
      CADETS: { fr: "Cadets", ar: "الأشبال" },
      JUNIORS: { fr: "Juniors", ar: "الناشئون" },
      SENIORS: { fr: "Séniors", ar: "الكبار" },
    };
    return map[c]?.[locale as "fr" | "ar"] ?? c;
  };

  const compLabel = (c: string) => {
    if (c === "CHAMPIONNAT") return t("championnat");
    if (c === "COUPE") return t("coupe");
    return t("amical");
  };

  const lp = (path: string) => `/${locale}${path}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-6">{t("title")}</h1>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <a
            key={c}
            href={`${lp("/scores")}?cat=${c}&tab=${tab}`}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              category === c ? "bg-[#CC0000] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {catLabel(c)}
          </a>
        ))}
      </div>

      {/* Tab: results / standings */}
      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {(["results", "standings"] as const).map((tabKey) => (
          <a
            key={tabKey}
            href={`${lp("/scores")}?cat=${category}&tab=${tabKey}`}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === tabKey
                ? "border-[#CC0000] text-[#CC0000]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t(tabKey as "results" | "standings")}
          </a>
        ))}
      </div>

      {tab === "results" && (
        <>
          {matches.length === 0 ? (
            <p className="text-gray-400">{t("no_matches")}</p>
          ) : (
            <div className="space-y-3">
              {matches.map((m) => (
                <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{compLabel(m.competition)}</span>
                    <span>
                      {m.matchday ? `J${m.matchday} — ` : ""}
                      {new Date(m.matchDate).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR")}
                    </span>
                    {m.location && <span className="text-gray-300 hidden sm:inline">{m.location}</span>}
                  </div>
                  <div className="flex items-center justify-between font-semibold text-sm">
                    <span className="flex-1 text-center">{m.homeTeam}</span>
                    <span className="bg-[#1a1a1a] text-white px-4 py-1.5 rounded font-bold text-base mx-3 whitespace-nowrap">
                      {m.homeScore ?? "–"} – {m.awayScore ?? "–"}
                    </span>
                    <span className="flex-1 text-center">{m.awayTeam}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "standings" && (
        <>
          {standings.length === 0 ? (
            <p className="text-gray-400">{t("no_matches")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#1a1a1a] text-white">
                    {[t("rank"), t("team"), t("played"), t("won"), t("draw"), t("lost"), t("gf"), t("ga"), t("gd"), t("points")].map((h) => (
                      <th key={h} className="px-3 py-2 text-center font-semibold first:text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, i) => (
                    <tr
                      key={row.team}
                      className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-3 py-2 text-center font-bold text-gray-500">{i + 1}</td>
                      <td className="px-3 py-2 font-semibold">{row.team}</td>
                      {[row.played, row.won, row.drawn, row.lost, row.gf, row.ga, row.gd].map((v, j) => (
                        <td key={j} className="px-3 py-2 text-center text-gray-600">{v}</td>
                      ))}
                      <td className="px-3 py-2 text-center font-bold text-[#CC0000]">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
