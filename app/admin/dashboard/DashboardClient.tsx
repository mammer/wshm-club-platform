"use client";

import { useAdminT } from "@/lib/adminT";
import Link from "next/link";
import {
  Users, CreditCard, CalendarDays, Flag, Trophy,
  TrendingUp, AlertCircle, CheckCircle, Clock, ChevronRight, Star,
  Newspaper, Images, FileEdit, Eye,
} from "lucide-react";
import ForbiddenBanner from "@/components/admin/ForbiddenBanner";

export type DashboardData = {
  role: string;
  SEASON: string;
  playerCount: number;
  coachCount: number;
  pendingReg: number;
  totalCurrentSeason: number;
  totalAllTime: number;
  paymentRate: number;
  paidCount: number;
  unpaidPlayers: { id: string; fullName: string; category: string }[];
  byType: Record<string, number>;
  wins: number;
  draws: number;
  losses: number;
  wshmMatchCount: number;
  recentMatches: { id: string; homeTeam: string; awayTeam: string; homeScore: number | null; awayScore: number | null; matchDate: string; category: string }[];
  recentPayments: { id: string; amount: number; paymentType: string; season: string; paymentDate: string; playerName: string }[];
  upcomingMeetings: { id: string; title: string; meetingDate: string; location: string | null }[];
  pastMeetings: number;
  categoryBreakdown: { cat: string; count: number }[];
  monthlyTotals: { label: string; amount: number }[];
  alerts: { type: "danger" | "warning" | "info"; title: string; detail: string; link: string }[];
  // Author-specific
  publishedPosts: number;
  draftPosts: number;
  totalPhotos: number;
  recentPosts: { id: string; titleFr: string; published: boolean; createdAt: string }[];
};

const CAT_COLOR: Record<string, string> = {
  SENIORS: "bg-red-500", JUNIORS: "bg-orange-400", CADETS: "bg-blue-400", MINIMES: "bg-green-400",
};

const fmt = (n: number) => n.toLocaleString("fr-MA") + " MAD";

export default function DashboardClient({ data }: { data: DashboardData }) {
  const { t, ar } = useAdminT();

  const catLabel: Record<string, string> = {
    SENIORS: t("SENIORS"), JUNIORS: t("JUNIORS"), CADETS: t("CADETS"), MINIMES: t("MINIMES"),
  };
  const typeLabel: Record<string, string> = {
    COTISATION: t("COTISATION"), LICENCE: t("LICENCE"), EQUIPEMENT: t("EQUIPEMENT"), AUTRE: t("AUTRE"),
  };

  const maxMonthly = Math.max(...data.monthlyTotals.map((m) => m.amount), 1);

  if (data.role === "COACH") return <CoachDashboard data={data} ar={ar} catLabel={catLabel} />;
  if (data.role === "AUTHOR") return <AuthorDashboard data={data} ar={ar} />;

  return (
    <div className="space-y-6" dir={ar ? "rtl" : "ltr"}>
      <ForbiddenBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">{t("dashboard")}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {t("season")} {data.SEASON} · {new Date().toLocaleDateString(ar ? "ar-MA" : "fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-semibold shrink-0">● En ligne</span>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert, i) => (
            <Link key={i} href={alert.link}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm transition-all hover:shadow-sm ${
                alert.type === "danger" ? "bg-red-50 border-red-200 text-red-800" :
                alert.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" :
                "bg-blue-50 border-blue-200 text-blue-800"
              }`}>
              <AlertCircle size={17} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{alert.title}</span>
                <span className="text-xs opacity-75 ml-2">{alert.detail}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* KPIs — single col on mobile, 2 cols default, 4 on large screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("activePlayers"), value: data.playerCount, sub: `${data.coachCount} ${t("coaches")}`, icon: Users, color: "from-blue-500 to-blue-600", link: "/admin/players" },
          { label: ar ? "المحصل (الموسم)" : "Encaissé (saison)", value: fmt(data.totalCurrentSeason), sub: `${ar ? "الإجمالي" : "Total"}: ${fmt(data.totalAllTime)}`, icon: CreditCard, color: "from-green-500 to-green-600", link: "/admin/payments" },
          { label: ar ? "نسبة التحصيل" : "Taux de recouvrement", value: `${data.paymentRate}%`, sub: `${data.paidCount}/${data.playerCount} ${t("players")}`, icon: TrendingUp, color: "from-[#CC0000] to-red-700", link: "/admin/payments" },
          { label: t("pendingReg"), value: data.pendingReg, sub: ar ? "في انتظار الموافقة" : "en attente d'approbation", icon: Flag, color: "from-orange-400 to-orange-500", link: "/admin/tournaments" },
        ].map((s) => (
          <Link key={s.label} href={s.link} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
            <div className={`bg-gradient-to-br ${s.color} text-white w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-sm`}>
              <s.icon size={19} />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] leading-tight">{s.value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-1 leading-snug">{s.label}</p>
            <p className="text-xs text-gray-400 mt-1 leading-snug">{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* Stats row — stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Win/Draw/Loss */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={17} className="text-[#CC0000]" />
            <h2 className="font-bold text-sm">{ar ? "الحصيلة الرياضية (كل الفئات)" : "Bilan sportif (toutes catégories)"}</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-50 rounded-xl py-4">
              <p className="text-2xl font-extrabold text-green-600">{data.wins}</p>
              <p className="text-xs text-green-600 font-semibold mt-1">{ar ? "انتصارات" : "Victoires"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl py-4">
              <p className="text-2xl font-extrabold text-gray-600">{data.draws}</p>
              <p className="text-xs text-gray-600 font-semibold mt-1">{ar ? "تعادلات" : "Nuls"}</p>
            </div>
            <div className="bg-red-50 rounded-xl py-4">
              <p className="text-2xl font-extrabold text-red-500">{data.losses}</p>
              <p className="text-xs text-red-500 font-semibold mt-1">{ar ? "هزائم" : "Défaites"}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">{data.wshmMatchCount} {ar ? "مباريات هذا الموسم" : "matchs joués cette saison"}</p>
        </div>

        {/* Players by category */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Users size={17} className="text-[#CC0000]" />
            <h2 className="font-bold text-sm">{ar ? "اللاعبون حسب الفئة" : "Joueurs par catégorie"}</h2>
          </div>
          <div className="space-y-3">
            {data.categoryBreakdown.map(({ cat, count }) => {
              const pct = data.playerCount > 0 ? Math.round((count / data.playerCount) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700">{catLabel[cat] ?? cat}</span>
                    <span className="text-gray-500">{count} {ar ? "لاعب" : "joueurs"}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${CAT_COLOR[cat]} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment compliance */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={17} className="text-[#CC0000]" />
            <h2 className="font-bold text-sm">{ar ? `التحصيل ${data.SEASON}` : `Recouvrement ${data.SEASON}`}</h2>
          </div>
          <div className="relative flex items-center justify-center mb-4">
            <svg viewBox="0 0 80 80" className="w-24 h-24 -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="#CC0000" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 32 * data.paymentRate / 100} ${2 * Math.PI * 32 * (1 - data.paymentRate / 100)}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute text-center">
              <p className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">{data.paymentRate}%</p>
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle size={13} />{data.paidCount} {ar ? "مدفوع" : "payés"}</span>
            <span className="flex items-center gap-1 text-red-500 font-medium"><AlertCircle size={13} />{data.unpaidPlayers.length} {ar ? "متأخر" : "en retard"}</span>
          </div>
        </div>
      </div>

      {/* Monthly chart — scrollable on mobile */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={17} className="text-[#CC0000]" />
            <h2 className="font-bold text-sm">{ar ? "التحصيل الشهري (6 أشهر الأخيرة)" : "Encaissements mensuels (6 derniers mois)"}</h2>
          </div>
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full shrink-0">MAD</span>
        </div>
        <div className="overflow-x-auto">
          <div className="flex items-end gap-3 h-36" style={{ minWidth: "320px" }}>
            {data.monthlyTotals.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1" style={{ minWidth: "40px" }}>
                <p className="text-[10px] text-gray-500 font-medium">{m.amount > 0 ? Math.round(m.amount / 100) / 10 + "k" : "—"}</p>
                <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden" style={{ height: "80px" }}>
                  <div className="w-full bg-[#CC0000] rounded-t-lg transition-all"
                    style={{ height: `${Math.round((m.amount / maxMonthly) * 100)}%`, marginTop: "auto" }} />
                </div>
                <p className="text-[10px] text-gray-500">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid — stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* By type */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Star size={17} className="text-[#CC0000]" />
            <h2 className="font-bold text-sm">{ar ? "التوزيع حسب النوع" : "Répartition par type"}</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(data.byType).sort((a, b) => b[1] - a[1]).map(([type, amount]) => {
              const pct = data.totalCurrentSeason > 0 ? Math.round((amount / data.totalCurrentSeason) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{typeLabel[type] ?? type}</span>
                    <span className="text-gray-600 font-semibold">{fmt(amount)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full bg-[#CC0000] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-gray-100 flex justify-between text-xs font-bold">
              <span>{ar ? "مجموع الموسم" : "Total saison"}</span>
              <span className="text-[#CC0000]">{fmt(data.totalCurrentSeason)}</span>
            </div>
          </div>
        </div>

        {/* Unpaid */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={17} className="text-orange-500" />
              <h2 className="font-bold text-sm">{ar ? "اشتراكات متأخرة" : "Cotisations en retard"}</h2>
            </div>
            <Link href="/admin/payments" className="text-xs text-[#CC0000] flex items-center gap-0.5">{ar ? "كل" : "Tout voir"} <ChevronRight size={13} /></Link>
          </div>
          {data.unpaidPlayers.length === 0 ? (
            <p className="text-green-600 text-sm flex items-center gap-2"><CheckCircle size={16} />{ar ? "جميع اللاعبين في الموعد!" : "Tous les joueurs sont à jour !"}</p>
          ) : (
            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
              {data.unpaidPlayers.slice(0, 10).map((p) => (
                <li key={p.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                  <span className="font-medium text-gray-700">{p.fullName}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CAT_COLOR[p.category]} text-white`}>{catLabel[p.category]}</span>
                </li>
              ))}
              {data.unpaidPlayers.length > 10 && (
                <li className="text-xs text-gray-400 text-center pt-1">+{data.unpaidPlayers.length - 10} {ar ? "آخرون" : "autres"}</li>
              )}
            </ul>
          )}
        </div>

        {/* Meetings */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={17} className="text-[#CC0000]" />
              <h2 className="font-bold text-sm">{ar ? "الاجتماعات القادمة" : "Réunions à venir"}</h2>
            </div>
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">{data.pastMeetings} {ar ? "منتهية" : "passées"}</span>
          </div>
          {data.upcomingMeetings.length === 0 ? (
            <p className="text-gray-400 text-sm">{ar ? "لا توجد اجتماعات مجدولة." : "Aucune réunion planifiée."}</p>
          ) : (
            <ul className="space-y-3">
              {data.upcomingMeetings.map((m) => (
                <li key={m.id} className="flex gap-3">
                  <div className="shrink-0 w-12 text-center bg-[#CC0000] text-white rounded-lg py-1.5">
                    <p className="text-sm font-extrabold leading-none">{new Date(m.meetingDate).getDate()}</p>
                    <p className="text-[10px] opacity-80">{new Date(m.meetingDate).toLocaleDateString(ar ? "ar-MA" : "fr-FR", { month: "short" })}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-700 leading-tight">{m.title}</p>
                    {m.location && <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1"><Clock size={10} />{m.location}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent payments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CreditCard size={17} className="text-[#CC0000]" />
            <h2 className="font-bold text-sm">{ar ? "آخر المدفوعات المسجلة" : "Derniers paiements enregistrés"}</h2>
          </div>
          <Link href="/admin/payments" className="text-xs text-[#CC0000] flex items-center gap-0.5 shrink-0">{ar ? "عرض الكل" : "Voir tout"} <ChevronRight size={13} /></Link>
        </div>

        {/* Card list — mobile only */}
        <div className="sm:hidden divide-y divide-gray-50">
          {data.recentPayments.map((p) => (
            <div key={p.id} className="px-4 py-3 space-y-1.5">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-sm text-gray-800">{p.playerName}</span>
                <span className="font-bold text-sm text-green-600">{Number(p.amount).toLocaleString("fr-MA")} MAD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  {typeLabel[p.paymentType] ?? p.paymentType}
                </span>
                <span className="text-xs text-gray-500">{new Date(p.paymentDate).toLocaleDateString(ar ? "ar-MA" : "fr-FR")}</span>
              </div>
              <p className="text-xs text-gray-400">{ar ? "الموسم" : "Saison"} {p.season}</p>
            </div>
          ))}
        </div>

        {/* Table — sm and up */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">{ar ? "اللاعب" : "Joueur"}</th>
                <th className="px-5 py-3 text-left font-semibold">{t("type")}</th>
                <th className="px-5 py-3 text-left font-semibold">{t("season")}</th>
                <th className="px-5 py-3 text-left font-semibold">{t("date")}</th>
                <th className="px-5 py-3 text-right font-semibold">{t("amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.recentPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{p.playerName}</td>
                  <td className="px-5 py-3">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      {typeLabel[p.paymentType] ?? p.paymentType}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{p.season}</td>
                  <td className="px-5 py-3 text-gray-500">{new Date(p.paymentDate).toLocaleDateString(ar ? "ar-MA" : "fr-FR")}</td>
                  <td className="px-5 py-3 text-right font-bold text-green-600">{Number(p.amount).toLocaleString("fr-MA")} MAD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent matches */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Trophy size={17} className="text-[#CC0000]" />
            <h2 className="font-bold text-sm">{ar ? "آخر النتائج" : "Derniers résultats"}</h2>
          </div>
          <Link href="/admin/scores" className="text-xs text-[#CC0000] flex items-center gap-0.5 shrink-0">{ar ? "عرض الكل" : "Voir tout"} <ChevronRight size={13} /></Link>
        </div>
        <div className="divide-y divide-gray-50">
          {data.recentMatches.map((m) => {
            const wshmHome = m.homeTeam.includes("W.S.H.M");
            const wshmScore = wshmHome ? m.homeScore : m.awayScore;
            const oppScore = wshmHome ? m.awayScore : m.homeScore;
            const result = (wshmScore ?? 0) > (oppScore ?? 0) ? "V" : (wshmScore ?? 0) === (oppScore ?? 0) ? "N" : "D";
            const resultColor = result === "V" ? "bg-green-500" : result === "N" ? "bg-gray-400" : "bg-red-500";
            return (
              <div key={m.id} className="flex items-center justify-between px-4 sm:px-5 py-3 text-xs hover:bg-gray-50 gap-2">
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`${resultColor} text-white font-bold w-5 h-5 rounded flex items-center justify-center text-[10px]`}>{result}</span>
                  <span className="text-gray-500 hidden sm:inline">{catLabel[m.category] ?? m.category}</span>
                </div>
                <span className="font-medium text-gray-700 truncate min-w-0">
                  {m.homeTeam} <span className="font-extrabold text-[#1a1a1a]">{m.homeScore}–{m.awayScore}</span> {m.awayTeam}
                </span>
                <span className="text-gray-500 shrink-0">{new Date(m.matchDate).toLocaleDateString(ar ? "ar-MA" : "fr-FR", { day: "2-digit", month: "short" })}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Coach mini-dashboard ──────────────────────────────────────────────────────

function CoachDashboard({ data, ar, catLabel }: { data: DashboardData; ar: boolean; catLabel: Record<string, string> }) {
  const CAT_COLOR: Record<string, string> = {
    SENIORS: "bg-red-500", JUNIORS: "bg-orange-400", CADETS: "bg-blue-400", MINIMES: "bg-green-400",
  };

  return (
    <div className="space-y-6" dir={ar ? "rtl" : "ltr"}>
      <ForbiddenBanner />
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">Tableau de bord</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Saison {data.SEASON} · {new Date().toLocaleDateString(ar ? "ar-MA" : "fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Joueurs actifs", value: data.playerCount, icon: Users, color: "from-blue-500 to-blue-600", link: "/admin/players" },
          { label: "Entraîneurs", value: data.coachCount, icon: Users, color: "from-orange-400 to-orange-500", link: "/admin/coaches" },
          { label: "Victoires", value: data.wins, icon: Trophy, color: "from-green-500 to-green-600", link: "/admin/scores" },
          { label: "Matchs joués", value: data.wshmMatchCount, icon: Trophy, color: "from-[#CC0000] to-red-700", link: "/admin/scores" },
        ].map((s) => (
          <Link key={s.label} href={s.link} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`bg-gradient-to-br ${s.color} text-white w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              <s.icon size={19} />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">{s.value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Stats / breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Win/Draw/Loss */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={17} className="text-[#CC0000]" />
            <h2 className="font-bold text-sm">Bilan sportif — toutes catégories</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-50 rounded-xl py-4">
              <p className="text-3xl font-extrabold text-green-600">{data.wins}</p>
              <p className="text-xs text-green-600 font-semibold mt-1">Victoires</p>
            </div>
            <div className="bg-gray-50 rounded-xl py-4">
              <p className="text-3xl font-extrabold text-gray-600">{data.draws}</p>
              <p className="text-xs text-gray-600 font-semibold mt-1">Nuls</p>
            </div>
            <div className="bg-red-50 rounded-xl py-4">
              <p className="text-3xl font-extrabold text-red-500">{data.losses}</p>
              <p className="text-xs text-red-500 font-semibold mt-1">Défaites</p>
            </div>
          </div>
        </div>

        {/* Players by category */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Users size={17} className="text-[#CC0000]" />
            <h2 className="font-bold text-sm">Effectif par catégorie</h2>
          </div>
          <div className="space-y-3">
            {data.categoryBreakdown.map(({ cat, count }) => {
              const pct = data.playerCount > 0 ? Math.round((count / data.playerCount) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700">{catLabel[cat] ?? cat}</span>
                    <span className="text-gray-500">{count} joueurs</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${CAT_COLOR[cat]} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent results */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Trophy size={17} className="text-[#CC0000]" />
            <h2 className="font-bold text-sm">Derniers résultats</h2>
          </div>
          <Link href="/admin/scores" className="text-xs text-[#CC0000] flex items-center gap-0.5">Voir tout <ChevronRight size={13} /></Link>
        </div>
        <div className="divide-y divide-gray-50">
          {data.recentMatches.length === 0 && (
            <p className="text-gray-400 text-sm px-5 py-6 text-center">Aucun résultat enregistré.</p>
          )}
          {data.recentMatches.map((m) => {
            const wshmHome = m.homeTeam.includes("W.S.H.M");
            const wshmScore = wshmHome ? m.homeScore : m.awayScore;
            const oppScore = wshmHome ? m.awayScore : m.homeScore;
            const result = (wshmScore ?? 0) > (oppScore ?? 0) ? "V" : (wshmScore ?? 0) === (oppScore ?? 0) ? "N" : "D";
            const rc = result === "V" ? "bg-green-500" : result === "N" ? "bg-gray-400" : "bg-red-500";
            return (
              <div key={m.id} className="flex items-center justify-between px-4 sm:px-5 py-3 text-xs hover:bg-gray-50 gap-2">
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`${rc} text-white font-bold w-5 h-5 rounded flex items-center justify-center text-[10px]`}>{result}</span>
                  <span className="text-gray-500 hidden sm:inline">{catLabel[m.category] ?? m.category}</span>
                </div>
                <span className="font-medium text-gray-700 truncate min-w-0">{m.homeTeam} <span className="font-extrabold">{m.homeScore}–{m.awayScore}</span> {m.awayTeam}</span>
                <span className="text-gray-500 shrink-0">{new Date(m.matchDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/admin/players", label: "Joueurs", icon: Users, color: "bg-blue-50 text-blue-700 border-blue-100" },
          { href: "/admin/coaches", label: "Entraîneurs", icon: Users, color: "bg-orange-50 text-orange-700 border-orange-100" },
          { href: "/admin/scores", label: "Scores", icon: Trophy, color: "bg-green-50 text-green-700 border-green-100" },
          { href: "/admin/attendance", label: "Présences", icon: CheckCircle, color: "bg-purple-50 text-purple-700 border-purple-100" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className={`flex items-center gap-3 p-4 rounded-xl border ${l.color} hover:shadow-sm transition-all`}>
            <l.icon size={18} />
            <span className="font-semibold text-sm">{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Author mini-dashboard ─────────────────────────────────────────────────────

function AuthorDashboard({ data, ar }: { data: DashboardData; ar: boolean }) {
  return (
    <div className="space-y-6" dir={ar ? "rtl" : "ltr"}>
      <ForbiddenBanner />
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">Tableau de bord</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString(ar ? "ar-MA" : "fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Articles publiés", value: data.publishedPosts, icon: Eye, color: "from-green-500 to-green-600", link: "/admin/blog" },
          { label: "Brouillons", value: data.draftPosts, icon: FileEdit, color: "from-orange-400 to-orange-500", link: "/admin/blog" },
          { label: "Photos en galerie", value: data.totalPhotos, icon: Images, color: "from-[#CC0000] to-red-700", link: "/admin/gallery" },
        ].map((s) => (
          <Link key={s.label} href={s.link} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`bg-gradient-to-br ${s.color} text-white w-11 h-11 rounded-xl flex items-center justify-center mb-4`}>
              <s.icon size={20} />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">{s.value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent posts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Newspaper size={17} className="text-[#CC0000]" />
            <h2 className="font-bold text-sm">Articles récents</h2>
          </div>
          <Link href="/admin/blog" className="text-xs text-[#CC0000] flex items-center gap-0.5">Gérer le blog <ChevronRight size={13} /></Link>
        </div>
        <div className="divide-y divide-gray-50">
          {data.recentPosts.length === 0 && (
            <p className="text-gray-400 text-sm px-5 py-6 text-center">Aucun article rédigé pour l&apos;instant.</p>
          )}
          {data.recentPosts.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-gray-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${p.published ? "bg-green-500" : "bg-orange-400"}`} />
                <span className="text-sm font-medium text-gray-700 truncate">{p.titleFr}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.published ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                  {p.published ? "Publié" : "Brouillon"}
                </span>
                <span className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/blog" className="flex items-center gap-3 p-4 sm:p-5 rounded-xl border bg-blue-50 text-blue-700 border-blue-100 hover:shadow-sm transition-all">
          <Newspaper size={20} />
          <div>
            <p className="font-bold text-sm">Écrire un article</p>
            <p className="text-xs opacity-70">Blog bilingue FR / AR</p>
          </div>
        </Link>
        <Link href="/admin/gallery" className="flex items-center gap-3 p-4 sm:p-5 rounded-xl border bg-purple-50 text-purple-700 border-purple-100 hover:shadow-sm transition-all">
          <Images size={20} />
          <div>
            <p className="font-bold text-sm">Gérer la galerie</p>
            <p className="text-xs opacity-70">{data.totalPhotos} photo{data.totalPhotos !== 1 ? "s" : ""} en ligne</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
