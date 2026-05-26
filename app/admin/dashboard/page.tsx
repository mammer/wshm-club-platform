import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient, { type DashboardData } from "./DashboardClient";

const SEASON = "2025-2026";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const role = (session.user as { role?: string }).role ?? "ADMIN";
  const now = new Date();

  // ── COACH dashboard ──────────────────────────────────────────────────────────
  if (role === "COACH") {
    const [allPlayers, allMatches, recentMatches, coachCount] = await Promise.all([
      prisma.player.findMany({ where: { isActive: true }, select: { id: true, fullName: true, category: true } }),
      prisma.match.findMany({ where: { homeScore: { not: null } } }),
      prisma.match.findMany({ where: { homeScore: { not: null } }, orderBy: { matchDate: "desc" }, take: 8 }),
      prisma.coach.count(),
    ]);

    const wshmMatches = allMatches.filter((m) => m.homeTeam.includes("W.S.H.M") || m.awayTeam.includes("W.S.H.M"));
    const wins = wshmMatches.filter((m) => {
      const isHome = m.homeTeam.includes("W.S.H.M");
      return isHome ? (m.homeScore ?? 0) > (m.awayScore ?? 0) : (m.awayScore ?? 0) > (m.homeScore ?? 0);
    }).length;
    const draws = wshmMatches.filter((m) => m.homeScore === m.awayScore).length;
    const losses = wshmMatches.length - wins - draws;

    const categoryBreakdown = (["SENIORS", "JUNIORS", "CADETS", "MINIMES"] as const).map((cat) => ({
      cat, count: allPlayers.filter((p) => p.category === cat).length,
    }));

    const data: DashboardData = {
      role, SEASON,
      playerCount: allPlayers.length, coachCount,
      wins, draws, losses, wshmMatchCount: wshmMatches.length,
      categoryBreakdown,
      recentMatches: recentMatches.map((m) => ({ id: m.id, homeTeam: m.homeTeam, awayTeam: m.awayTeam, homeScore: m.homeScore, awayScore: m.awayScore, matchDate: m.matchDate.toISOString(), category: m.category })),
      // unused by coach view — zero-fill
      pendingReg: 0, totalCurrentSeason: 0, totalAllTime: 0, paymentRate: 0,
      paidCount: 0, unpaidPlayers: [], byType: {}, recentPayments: [],
      upcomingMeetings: [], pastMeetings: 0, monthlyTotals: [], alerts: [],
      publishedPosts: 0, draftPosts: 0, totalPhotos: 0, recentPosts: [],
    };

    return <DashboardClient data={data} />;
  }

  // ── AUTHOR dashboard ─────────────────────────────────────────────────────────
  if (role === "AUTHOR") {
    const [publishedPosts, draftPosts, totalPhotos, recentPosts] = await Promise.all([
      prisma.blogPost.count({ where: { published: true } }),
      prisma.blogPost.count({ where: { published: false } }),
      prisma.galleryPhoto.count(),
      prisma.blogPost.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, titleFr: true, published: true, createdAt: true } }),
    ]);

    const data: DashboardData = {
      role, SEASON,
      publishedPosts, draftPosts, totalPhotos,
      recentPosts: recentPosts.map((p) => ({ id: p.id, titleFr: p.titleFr, published: p.published, createdAt: p.createdAt.toISOString() })),
      // unused — zero-fill
      playerCount: 0, coachCount: 0, pendingReg: 0, totalCurrentSeason: 0,
      totalAllTime: 0, paymentRate: 0, paidCount: 0, unpaidPlayers: [], byType: {},
      wins: 0, draws: 0, losses: 0, wshmMatchCount: 0,
      recentMatches: [], recentPayments: [], upcomingMeetings: [],
      pastMeetings: 0, categoryBreakdown: [], monthlyTotals: [], alerts: [],
    };

    return <DashboardClient data={data} />;
  }

  // ── ADMIN / SECRETARY dashboard (full) ───────────────────────────────────────
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    playerCount, coachCount, pendingReg,
    allPlayers, allPayments, upcomingMeetings,
    pastMeetings, recentMatches, allMatches, meetingsIn48h,
    oldPendingRegs, playersNeedsMedical,
  ] = await Promise.all([
    prisma.player.count({ where: { isActive: true } }),
    prisma.coach.count(),
    prisma.tournamentRegistration.count({ where: { status: "PENDING" } }),
    prisma.player.findMany({ where: { isActive: true }, select: { id: true, fullName: true, category: true } }),
    prisma.payment.findMany({ orderBy: { paymentDate: "desc" }, include: { player: { select: { fullName: true, category: true } } } }),
    prisma.meeting.findMany({ where: { meetingDate: { gte: now } }, orderBy: { meetingDate: "asc" }, take: 4 }),
    prisma.meeting.count({ where: { meetingDate: { lt: now } } }),
    prisma.match.findMany({ where: { homeScore: { not: null } }, orderBy: { matchDate: "desc" }, take: 6 }),
    prisma.match.findMany({ where: { homeScore: { not: null } } }),
    prisma.meeting.findMany({ where: { meetingDate: { gte: now, lte: in48h } }, select: { title: true, meetingDate: true } }),
    prisma.tournamentRegistration.findMany({ where: { status: "PENDING", createdAt: { lte: sevenDaysAgo } }, select: { clubName: true, createdAt: true } }),
    prisma.player.findMany({ where: { isActive: true, OR: [{ medicalDate: null }, { medicalDate: { lte: oneYearAgo } }] }, select: { fullName: true, medicalDate: true, category: true } }),
  ]);

  const currentSeasonPayments = allPayments.filter((p) => p.season === SEASON);
  const totalCurrentSeason = currentSeasonPayments.reduce((s, p) => s + Number(p.amount), 0);
  const totalAllTime = allPayments.reduce((s, p) => s + Number(p.amount), 0);
  const byType = currentSeasonPayments.reduce<Record<string, number>>((acc, p) => {
    acc[p.paymentType] = (acc[p.paymentType] ?? 0) + Number(p.amount);
    return acc;
  }, {});

  const paidPlayerIds = new Set(currentSeasonPayments.map((p) => p.playerId));
  const unpaidPlayers = allPlayers.filter((p) => !paidPlayerIds.has(p.id));
  const paidCount = playerCount - unpaidPlayers.length;
  const paymentRate = playerCount > 0 ? Math.round((paidCount / playerCount) * 100) : 0;

  const paidInLast60Days = new Set(
    allPayments.filter((p) => p.paymentType === "COTISATION" && new Date(p.paymentDate) >= sixtyDaysAgo).map((p) => p.playerId)
  );
  const unpaidFor60Days = allPlayers.filter((p) => !paidInLast60Days.has(p.id));

  const alerts: DashboardData["alerts"] = [];
  if (meetingsIn48h.length > 0)
    alerts.push({ type: "info", title: `Réunion dans moins de 48h`, detail: meetingsIn48h[0].title, link: "/admin/meetings" });
  if (oldPendingRegs.length > 0)
    alerts.push({ type: "warning", title: `${oldPendingRegs.length} inscription(s) en attente depuis 7+ jours`, detail: `Dernière: ${oldPendingRegs[0].clubName}`, link: "/admin/tournaments" });
  if (playersNeedsMedical.length > 0)
    alerts.push({ type: "danger", title: `${playersNeedsMedical.length} joueur(s) sans visite médicale récente`, detail: playersNeedsMedical.slice(0, 2).map((p) => p.fullName).join(", "), link: "/admin/players" });
  if (unpaidFor60Days.length > 3)
    alerts.push({ type: "warning", title: `${unpaidFor60Days.length} joueurs sans cotisation depuis 60+ jours`, detail: `Taux de recouvrement à améliorer`, link: "/admin/payments" });

  const wshmMatches = allMatches.filter((m) => m.homeTeam.includes("W.S.H.M") || m.awayTeam.includes("W.S.H.M"));
  const wins = wshmMatches.filter((m) => {
    const isHome = m.homeTeam.includes("W.S.H.M");
    return isHome ? (m.homeScore ?? 0) > (m.awayScore ?? 0) : (m.awayScore ?? 0) > (m.homeScore ?? 0);
  }).length;
  const draws = wshmMatches.filter((m) => m.homeScore === m.awayScore).length;
  const losses = wshmMatches.length - wins - draws;

  const monthlyTotals: { label: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    const amount = allPayments.filter((p) => {
      const pd = new Date(p.paymentDate);
      return pd.getFullYear() === date.getFullYear() && pd.getMonth() === date.getMonth();
    }).reduce((s, p) => s + Number(p.amount), 0);
    monthlyTotals.push({ label, amount });
  }

  const categoryBreakdown = (["SENIORS", "JUNIORS", "CADETS", "MINIMES"] as const).map((cat) => ({
    cat, count: allPlayers.filter((p) => p.category === cat).length,
  }));

  const data: DashboardData = {
    role, SEASON,
    playerCount, coachCount, pendingReg,
    totalCurrentSeason, totalAllTime, paymentRate, paidCount,
    unpaidPlayers, byType, wins, draws, losses,
    wshmMatchCount: wshmMatches.length,
    recentMatches: recentMatches.map((m) => ({ id: m.id, homeTeam: m.homeTeam, awayTeam: m.awayTeam, homeScore: m.homeScore, awayScore: m.awayScore, matchDate: m.matchDate.toISOString(), category: m.category })),
    recentPayments: allPayments.slice(0, 8).map((p) => ({ id: p.id, amount: Number(p.amount), paymentType: p.paymentType, season: p.season, paymentDate: p.paymentDate.toISOString(), playerName: p.player.fullName })),
    upcomingMeetings: upcomingMeetings.map((m) => ({ id: m.id, title: m.title, meetingDate: m.meetingDate.toISOString(), location: m.location })),
    pastMeetings, categoryBreakdown, monthlyTotals, alerts,
    publishedPosts: 0, draftPosts: 0, totalPhotos: 0, recentPosts: [],
  };

  return <DashboardClient data={data} />;
}
