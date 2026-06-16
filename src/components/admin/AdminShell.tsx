"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { IconLayoutDashboard as LayoutDashboard, IconUsers as Users, IconUserCog as UserCog, IconTrophy as Trophy, IconCalendarEvent as CalendarDays, IconCreditCard as CreditCard, IconFlag as Flag, IconNews as Newspaper, IconPhoto as Images, IconMenu2 as Menu, IconX as X, IconLogout as LogOut, IconCalendar as Calendar, IconBuilding as Building2, IconClipboardList as ClipboardList, IconShield as Shield, IconReceipt as Receipt, IconSettings as Settings, IconUsersGroup as Users2, IconArchive as FolderArchive, IconChevronDown as ChevronDown, IconUserCheck as UserCheck, IconLayoutSidebarLeftCollapse as PanelLeftClose, IconLayoutSidebarLeftExpand as PanelLeftOpen } from "@tabler/icons-react";
import { ALLOWED_NAV } from "@/lib/roles";

type NavItem = { href: string; labelFr: string; labelAr: string; icon: React.ElementType };
type NavGroup = { labelFr: string; labelAr: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    labelFr: "Vue d'ensemble", labelAr: "نظرة عامة",
    items: [
      { href: "/admin/dashboard",   labelFr: "Tableau de bord", labelAr: "لوحة التحكم",  icon: LayoutDashboard },
      { href: "/admin/calendar",    labelFr: "Calendrier",      labelAr: "الروزنامة",      icon: Calendar },
    ],
  },
  {
    labelFr: "Équipe", labelAr: "الفريق",
    items: [
      { href: "/admin/players",    labelFr: "Joueurs",     labelAr: "اللاعبون",    icon: Users },
      { href: "/admin/coaches",    labelFr: "Entraîneurs", labelAr: "المدربون",     icon: UserCog },
      { href: "/admin/attendance", labelFr: "Présences",   labelAr: "الحضور",      icon: ClipboardList },
      { href: "/admin/scores",     labelFr: "Scores",      labelAr: "النتائج",      icon: Trophy },
    ],
  },
  {
    labelFr: "Club", labelAr: "النادي",
    items: [
      { href: "/admin/members",     labelFr: "Adhérents",  labelAr: "الأعضاء",     icon: UserCheck },
      { href: "/admin/meetings",    labelFr: "Réunions",   labelAr: "الاجتماعات",  icon: CalendarDays },
      { href: "/admin/sponsors",    labelFr: "Sponsors",   labelAr: "الرعاة",      icon: Building2 },
      { href: "/admin/tournaments", labelFr: "Tournois",   labelAr: "البطولات",    icon: Flag },
      { href: "/admin/archive",     labelFr: "Archives",   labelAr: "الأرشيف",     icon: FolderArchive },
    ],
  },
  {
    labelFr: "Finances", labelAr: "المالية",
    items: [
      { href: "/admin/payments", labelFr: "Paiements", labelAr: "المدفوعات", icon: CreditCard },
      { href: "/admin/expenses", labelFr: "Dépenses",  labelAr: "المصاريف",  icon: Receipt },
    ],
  },
  {
    labelFr: "Communication", labelAr: "التواصل",
    items: [
      { href: "/admin/blog",    labelFr: "Blog",    labelAr: "المدونة",  icon: Newspaper },
      { href: "/admin/gallery", labelFr: "Galerie", labelAr: "المعرض",   icon: Images },
    ],
  },
  {
    labelFr: "Administration", labelAr: "الإدارة",
    items: [
      { href: "/admin/audit",    labelFr: "Journal d'audit", labelAr: "سجل التدقيق",  icon: Shield },
      { href: "/admin/users",    labelFr: "Utilisateurs",    labelAr: "المستخدمون",   icon: Users2 },
      { href: "/admin/settings", labelFr: "Paramètres",      labelAr: "الإعدادات",    icon: Settings },
    ],
  },
];

const ROLE_LABELS: Record<string, { fr: string; ar: string }> = {
  ADMIN:     { fr: "Administrateur", ar: "مسؤول" },
  SECRETARY: { fr: "Secrétaire",     ar: "كاتب" },
  AUTHOR:    { fr: "Auteur",         ar: "محرر" },
  COACH:     { fr: "Entraîneur",     ar: "مدرب" },
};

function useAdminLang(): ["fr" | "ar", (l: "fr" | "ar") => void] {
  const [lang, setLangState] = useState<"fr" | "ar">("fr");
  useEffect(() => {
    const stored = localStorage.getItem("admin-lang") as "fr" | "ar" | null;
    if (stored) setLangState(stored);
  }, []);
  const setLang = (l: "fr" | "ar") => {
    localStorage.setItem("admin-lang", l);
    setLangState(l);
  };
  return [lang, setLang];
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [lang, setLang] = useAdminLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  // Which groups are open — default all open
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_GROUPS.map((g) => [g.labelFr, true]))
  );

  const ar = lang === "ar";
  const userName = session?.user?.name ?? "";
  const userRole = (session?.user as { role?: string })?.role ?? "";
  const initials = userName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const currentPageLabel = NAV_GROUPS.flatMap((g) => g.items)
    .find((i) => i.href === pathname);

  const SidebarContent = ({ mini = false }: { mini?: boolean }) => (
    <div className="flex flex-col h-full" dir={ar ? "rtl" : "ltr"}>
      {/* Brand */}
      <div className={`flex items-center gap-3 border-b border-white/8 ${mini ? "px-3 py-4 justify-center" : "px-4 py-4"}`}>
        <div className="relative shrink-0">
          <Image src="/logo.png" alt="W.S.H.M" width={32} height={32} className="rounded-full" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-[#1a1a1a]" />
        </div>
        {!mini && (
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold leading-tight">W.S.H.M</p>
            <p className="text-gray-500 text-[10px]">{ar ? "الإدارة" : "Administration"}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-none space-y-0.5">
        {NAV_GROUPS.map((group) => {
          const allowedHrefs = ALLOWED_NAV[userRole];
          const visibleItems = allowedHrefs?.length
            ? group.items.filter((i) => allowedHrefs.includes(i.href))
            : group.items;
          if (visibleItems.length === 0) return null;

          const groupLabel = ar ? group.labelAr : group.labelFr;
          const isOpen = openGroups[group.labelFr] ?? true;
          const hasActive = visibleItems.some((i) => i.href === pathname);

          return (
            <div key={group.labelFr}>
              {!mini && (
                <button
                  onClick={() => toggleGroup(group.labelFr)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 mb-0.5 rounded-lg transition-colors ${hasActive ? "text-gray-300" : "text-gray-600 hover:text-gray-400"}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">{groupLabel}</span>
                  <ChevronDown
                    size={11}
                    className={`transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
                  />
                </button>
              )}

              {(mini || isOpen) && (
                <div className={`${mini ? "" : "mb-2"} space-y-0.5`}>
                  {visibleItems.map(({ href, labelFr, labelAr, icon: Icon }) => {
                    const active = pathname === href;
                    const label = ar ? labelAr : labelFr;
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setSidebarOpen(false)}
                        title={mini ? label : undefined}
                        className={`flex items-center gap-2.5 rounded-lg transition-all text-sm ${
                          mini ? "justify-center px-2 py-2.5" : "px-3 py-2"
                        } ${
                          active
                            ? "bg-[#CC0000] text-white font-semibold shadow-sm"
                            : "text-gray-400 hover:bg-white/6 hover:text-white"
                        }`}
                      >
                        <Icon size={15} className={active ? "text-white" : "text-gray-500 shrink-0"} />
                        {!mini && <span className="truncate">{label}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 border-t border-white/8 pt-2 space-y-0.5">
        {/* Lang toggle */}
        {!mini && (
          <div className="flex items-center gap-1 mx-3 mb-2 bg-white/5 rounded-lg p-0.5">
            <button onClick={() => setLang("fr")}
              className={`flex-1 py-1 rounded-md text-xs font-bold transition-all ${lang === "fr" ? "bg-[#CC0000] text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}>
              FR
            </button>
            <button onClick={() => setLang("ar")}
              className={`flex-1 py-1 rounded-md text-xs font-bold transition-all ${lang === "ar" ? "bg-[#CC0000] text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}>
              AR
            </button>
          </div>
        )}

        {/* User */}
        {userName && (
          <Link href="/admin/profile" onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/6 transition-all ${mini ? "justify-center" : ""}`}>
            <div className="w-7 h-7 rounded-full bg-[#CC0000] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            {!mini && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate leading-tight">{userName}</p>
                <p className="text-gray-500 text-[10px]">
                  {ar ? ROLE_LABELS[userRole]?.ar : ROLE_LABELS[userRole]?.fr}
                </p>
              </div>
            )}
          </Link>
        )}

        <button onClick={handleSignOut}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/6 w-full transition-all ${mini ? "justify-center" : ""}`}
          title={ar ? "خروج" : "Déconnexion"}>
          <LogOut size={14} />
          {!mini && <span>{ar ? "خروج" : "Déconnexion"}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50" dir={ar ? "rtl" : "ltr"}>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-[#111] fixed inset-y-0 z-30 border-r border-white/5 transition-all duration-300 ${
        ar ? "right-0 border-l border-r-0" : "left-0"
      } ${collapsed ? "w-14" : "w-56"}`}>
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute top-4 ${ar ? "-left-3.5" : "-right-3.5"} z-10 w-7 h-7 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all shadow-lg`}
        >
          {collapsed
            ? <PanelLeftOpen size={13} />
            : <PanelLeftClose size={13} />
          }
        </button>
        <SidebarContent mini={collapsed} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <aside className={`relative flex flex-col w-64 bg-[#111] h-full border-white/5 ${ar ? "border-l ml-auto" : "border-r"}`}
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSidebarOpen(false)}
              className={`absolute top-3 ${ar ? "left-3" : "right-3"} text-gray-500 hover:text-white p-1`}>
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Content area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        ar
          ? (collapsed ? "lg:mr-14" : "lg:mr-56")
          : (collapsed ? "lg:ml-14" : "lg:ml-56")
      }`}>
        {/* Desktop top bar */}
        <header className="hidden lg:flex bg-white border-b border-gray-100 px-6 py-3 items-center justify-between sticky top-0 z-20">
          <p className="text-sm font-semibold text-gray-700">
            {ar ? currentPageLabel?.labelAr : currentPageLabel?.labelFr}
          </p>
          {userName && (
            <Link href="/admin/profile" className="flex items-center gap-2.5 group">
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-800 group-hover:text-[#CC0000] transition-colors">{userName}</p>
                <p className="text-[10px] text-gray-400">
                  {ar ? ROLE_LABELS[userRole]?.ar : ROLE_LABELS[userRole]?.fr}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#CC0000] flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            </Link>
          )}
        </header>

        {/* Mobile top bar */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 p-1">
            <Menu size={22} />
          </button>
          <Image src="/logo.png" alt="W.S.H.M" width={28} height={28} className="rounded-full" />
          <span className="font-bold text-sm text-gray-800">W.S.H.M</span>
          {userName && (
            <div className="ml-auto w-8 h-8 rounded-full bg-[#CC0000] flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          )}
        </header>

        <main className="flex-1 p-5 lg:p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
