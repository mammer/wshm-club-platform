import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import {
  IconMapPin as MapPin,
  IconPhone as Phone,
  IconMail as Mail,
  IconTarget as Target,
  IconEye as Eye,
  IconHeart as Heart,
  IconCalendarEvent as CalendarYears,
  IconUsers as Users,
  IconCategory as Category,
  IconTrophy as Trophy,
  IconCrown as Crown,
  IconStar as Star,
} from "@tabler/icons-react";
import { initials } from "@/lib/blogUtils";

// ─── Bureau members (official, current term) ─────────────────────────────────
const BUREAU = [
  { name: "Mostafa Talbi",    roleKey: "role_president",      featured: true },
  { name: "Mammer Bennasri",  roleKey: "role_vice1" },
  { name: "Hassan Badaoui",   roleKey: "role_vice2" },
  { name: "Houmad Abassi",    roleKey: "role_treasurer" },
  { name: "Amr Zraib",        roleKey: "role_vice_treasurer" },
  { name: "Yaboub Yacoubi",   roleKey: "role_secretary" },
  { name: "Mohammed Oufkir",  roleKey: "role_vice_secretary" },
] as const;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const isRtl = locale === "ar";

  const [settingsRows, activePlayers, categoryCounts] = await Promise.all([
    prisma.clubSettings.findMany(),
    prisma.player.count({ where: { isActive: true } }),
    prisma.player.groupBy({ by: ["category"], where: { isActive: true }, _count: true }),
  ]);
  const settings = Object.fromEntries(settingsRows.map((s) => [s.key, s.value]));
  const countByCategory = Object.fromEntries(categoryCounts.map((c) => [c.category, c._count]));

  const foundedYear = parseInt(settings.founded_year) || 1956;
  const yearsActive = new Date().getFullYear() - foundedYear;

  const categories = [
    { key: "MINIMES", icon: "⚽", name: t("cat_minimes"), desc: t("cat_minimes_desc") },
    { key: "CADETS",  icon: "🥇", name: t("cat_cadets"),  desc: t("cat_cadets_desc") },
    { key: "JUNIORS", icon: "🏆", name: t("cat_juniors"), desc: t("cat_juniors_desc") },
    { key: "SENIORS", icon: "⭐", name: t("cat_seniors"), desc: t("cat_seniors_desc") },
  ];

  const stats = [
    { icon: CalendarYears, value: yearsActive,              label: t("stat_years") },
    { icon: Users,         value: activePlayers,            label: t("stat_players") },
    { icon: Category,      value: categories.length,        label: t("stat_categories") },
    { icon: Trophy,        value: settings.season ?? "2025-2026", label: t("stat_season") },
  ];

  const contactItems = [
    { icon: <MapPin size={20} className="text-[#CC0000]" />, text: settings.address || t("contact_location") },
    { icon: <Phone  size={20} className="text-[#CC0000]" />, text: settings.phone   || t("contact_phone") },
    { icon: <Mail   size={20} className="text-[#CC0000]" />, text: settings.email   || t("contact_email") },
  ];

  const navLinks = [
    { href: "#histoire", label: t("nav_history") },
    { href: "#mission",  label: t("nav_mission") },
    { href: "#bureau",   label: t("nav_bureau") },
    { href: "#categories", label: t("nav_categories") },
    { href: "#contact",  label: t("nav_contact") },
  ];

  const [president, ...restMembers] = BUREAU;

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative bg-[#1a1a1a] text-white py-16 overflow-hidden">
        {/* subtle diagonal gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/10 via-transparent to-transparent pointer-events-none" />

        <div className={`relative max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10 ${isRtl ? "md:flex-row-reverse" : ""}`}>
          {/* Logo */}
          <div className="shrink-0 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#CC0000]/40 rounded-full blur-3xl scale-110" />
              <Image
                src="/logo.png"
                alt="W.S.H.M"
                width={180}
                height={180}
                className="relative rounded-full border-4 border-[#CC0000] shadow-2xl"
              />
            </div>
          </div>

          {/* Text */}
          <div className={`flex-1 ${isRtl ? "text-right" : ""}`}>
            <p className="text-[#CC0000] text-xs font-bold uppercase tracking-widest mb-3">
              {locale === "ar"
                ? `منذ ${foundedYear} · مداغ، إقليم بركان، المغرب`
                : `Depuis ${foundedYear} · Madagh, Province de Berkane, Maroc`}
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{t("title")}</h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">{t("subtitle")}</p>
          </div>
        </div>

        {/* Quick nav */}
        <div className={`relative max-w-7xl mx-auto px-4 mt-10 flex gap-2 flex-wrap ${isRtl ? "justify-end" : ""}`}>
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full px-4 py-2 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 rtl:divide-x-reverse">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex flex-col items-center justify-center gap-1.5 py-7 px-2 text-center">
                <Icon size={20} className="text-[#CC0000] mb-1" />
                <p className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a]">{s.value}</p>
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Rich description ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className={`max-w-4xl ${isRtl ? "mr-0 ml-auto text-right" : ""}`}>
          <p className="text-gray-700 text-lg leading-relaxed mb-5">{t("description")}</p>
          <p className="text-gray-500 text-base leading-relaxed">{t("description2")}</p>
        </div>
      </section>

      {/* ── History ───────────────────────────────────────────────────── */}
      <section id="histoire" className="bg-gray-50 py-14 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`flex gap-8 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div className="w-1 bg-[#CC0000] shrink-0 rounded-full" />
            <div className={`flex-1 ${isRtl ? "text-right" : ""}`}>
              <h2 className="text-2xl font-extrabold text-[#1a1a1a] mb-5">{t("history_title")}</h2>
              <p className="text-gray-600 leading-relaxed text-base">{t("history")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission / Vision / Values ─────────────────────────────────── */}
      <section id="mission" className="py-14 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          {/* Mission */}
          <div className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 ${isRtl ? "text-right" : ""}`}>
            <div className="w-12 h-12 bg-[#CC0000]/10 rounded-xl flex items-center justify-center mb-5">
              <Target size={24} className="text-[#CC0000]" />
            </div>
            <h2 className="text-xl font-bold mb-3 text-[#1a1a1a]">{t("mission_title")}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{t("mission")}</p>
          </div>

          {/* Vision */}
          <div className={`bg-[#1a1a1a] rounded-2xl p-8 shadow-sm text-white ${isRtl ? "text-right" : ""}`}>
            <div className="w-12 h-12 bg-[#CC0000]/20 rounded-xl flex items-center justify-center mb-5">
              <Eye size={24} className="text-[#CC0000]" />
            </div>
            <h2 className="text-xl font-bold mb-3">{t("vision_title")}</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{t("vision")}</p>
          </div>

          {/* Values */}
          <div className={`bg-[#CC0000] rounded-2xl p-8 shadow-sm text-white ${isRtl ? "text-right" : ""}`}>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
              <Heart size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold mb-3">{t("values_title")}</h2>
            <div className="flex flex-wrap gap-2 mt-4">
              {t("values")
                .split(",")
                .map((v) => v.trim())
                .map((v) => (
                  <span key={v} className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    {v}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bureau Directeur ──────────────────────────────────────────── */}
      <section id="bureau" className="bg-[#1a1a1a] py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section header */}
          <div className={`mb-10 ${isRtl ? "text-right" : ""}`}>
            <p className="text-[#CC0000] text-xs font-bold uppercase tracking-widest mb-2">
              {locale === "ar" ? "الحوكمة" : "Gouvernance"}
            </p>
            <h2 className="text-3xl font-extrabold text-white mb-3">{t("bureau_title")}</h2>
            <p className="text-gray-400 max-w-2xl">{t("bureau_subtitle")}</p>
          </div>

          {/* President — featured card */}
          <div className={`mb-6 flex ${isRtl ? "justify-end" : ""}`}>
            <div className={`relative flex items-center gap-6 bg-gradient-to-r from-[#CC0000] to-[#a00000] rounded-2xl px-8 py-7 shadow-xl w-full md:w-auto md:min-w-[400px] ${isRtl ? "flex-row-reverse" : ""}`}>
              {/* Decorative star */}
              <Star size={80} className="absolute opacity-5 text-white top-2 right-4 rtl:right-auto rtl:left-4" />
              <span className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center text-xl font-extrabold shrink-0 ring-2 ring-white/30">
                {initials(president.name)}
              </span>
              <div className={isRtl ? "text-right" : ""}>
                <p className="font-extrabold text-white text-xl leading-tight">{president.name}</p>
                <p className="flex items-center gap-1.5 text-white/80 text-sm font-semibold mt-1">
                  <Crown size={14} className="text-yellow-300 shrink-0" />
                  {t(president.roleKey)}
                </p>
              </div>
            </div>
          </div>

          {/* Other 6 members — 3-column grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restMembers.map((member) => (
              <div
                key={member.name}
                className={`flex items-center gap-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-2xl px-6 py-5 transition-colors ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <span className="w-12 h-12 rounded-full bg-[#CC0000]/20 text-[#CC0000] flex items-center justify-center text-sm font-bold shrink-0">
                  {initials(member.name)}
                </span>
                <div className={isRtl ? "text-right" : ""}>
                  <p className="font-bold text-white leading-tight">{member.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t(member.roleKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────── */}
      <section id="categories" className="py-14 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-3xl font-extrabold text-[#1a1a1a] mb-3 ${isRtl ? "text-right" : ""}`}>
            {t("categories_title")}
          </h2>
          <p className={`text-gray-500 mb-10 ${isRtl ? "text-right" : ""}`}>{t("categories_desc")}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat, i) => (
              <div
                key={i}
                className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#CC0000]/20 transition-all ${isRtl ? "text-right" : ""}`}
              >
                <div className={`flex items-start ${isRtl ? "justify-end flex-row-reverse" : "justify-between"} mb-4`}>
                  <span className="text-4xl">{cat.icon}</span>
                  {countByCategory[cat.key] != null && (
                    <span className="bg-[#CC0000]/10 text-[#CC0000] text-xs font-bold px-2.5 py-1 rounded-full">
                      {countByCategory[cat.key]} {t("players_count")}
                    </span>
                  )}
                </div>
                <h3 className="text-[#1a1a1a] font-bold text-lg mb-2">{cat.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────────────── */}
      <section id="contact" className="bg-gray-50 py-14 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-2xl font-extrabold text-[#1a1a1a] mb-8 ${isRtl ? "text-right" : ""}`}>
            {t("contact_title")}
          </h2>
          <div className={`flex flex-col sm:flex-row gap-5 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
            {contactItems.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 bg-white rounded-xl px-6 py-5 shadow-sm border border-gray-100 flex-1 hover:border-[#CC0000]/20 transition-colors ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <div className="shrink-0">{item.icon}</div>
                <span className={`text-sm text-gray-700 ${isRtl ? "text-right" : ""}`}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
