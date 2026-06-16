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
} from "@tabler/icons-react";
import { initials } from "@/lib/blogUtils";

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
    { key: "CADETS", icon: "🥇", name: t("cat_cadets"), desc: t("cat_cadets_desc") },
    { key: "JUNIORS", icon: "🏆", name: t("cat_juniors"), desc: t("cat_juniors_desc") },
    { key: "SENIORS", icon: "⭐", name: t("cat_seniors"), desc: t("cat_seniors_desc") },
  ];

  const stats = [
    { icon: CalendarYears, value: yearsActive, label: t("stat_years") },
    { icon: Users, value: activePlayers, label: t("stat_players") },
    { icon: Category, value: categories.length, label: t("stat_categories") },
    { icon: Trophy, value: settings.season ?? "2025-2026", label: t("stat_season") },
  ];

  const leadership = [
    { name: settings.president, role: t("role_president") },
    { name: settings.secretary, role: t("role_secretary") },
  ].filter((p) => p.name);

  const contactItems = [
    { icon: <MapPin size={20} className="text-[#CC0000]" />, text: settings.address || t("contact_location") },
    { icon: <Phone size={20} className="text-[#CC0000]" />, text: settings.phone || t("contact_phone") },
    { icon: <Mail size={20} className="text-[#CC0000]" />, text: settings.email || t("contact_email") },
  ];

  const navLinks = [
    { href: "#histoire", label: t("nav_history") },
    { href: "#mission", label: t("nav_mission") },
    { href: "#categories", label: t("nav_categories") },
    { href: "#organisation", label: t("nav_org") },
    { href: "#contact", label: t("nav_contact") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#1a1a1a] text-white py-16">
        <div className={`max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10 ${isRtl ? "md:flex-row-reverse" : ""}`}>
          <div className="shrink-0 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#CC0000]/30 rounded-full blur-2xl" />
              <Image
                src="/logo.png"
                alt="W.S.H.M"
                width={180}
                height={180}
                className="relative rounded-full border-4 border-[#CC0000] shadow-2xl"
              />
            </div>
          </div>
          <div className={isRtl ? "text-right" : ""}>
            <p className="text-[#CC0000] text-xs font-bold uppercase tracking-widest mb-3">
              {locale === "ar" ? `منذ ${foundedYear} · مداغ، المغرب` : `Depuis ${foundedYear} · Madagh, Maroc`}
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{t("title")}</h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">{t("subtitle")}</p>
          </div>
        </div>

        {/* Quick nav */}
        <div className="max-w-7xl mx-auto px-4 mt-10 flex gap-2 flex-wrap">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      </section>

      {/* Stats strip */}
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

      {/* Description */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <p className={`text-gray-600 text-lg leading-relaxed max-w-4xl ${isRtl ? "text-right ml-auto" : ""}`}>
          {t("description")}
        </p>
      </section>

      {/* Mission / Vision / Values */}
      <section id="mission" className="bg-gray-50 py-14 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          <div className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 ${isRtl ? "text-right" : ""}`}>
            <div className="w-12 h-12 bg-[#CC0000]/10 rounded-xl flex items-center justify-center mb-5">
              <Target size={24} className="text-[#CC0000]" />
            </div>
            <h2 className="text-xl font-bold mb-3 text-[#1a1a1a]">{t("mission_title")}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{t("mission")}</p>
          </div>

          <div className={`bg-[#1a1a1a] rounded-2xl p-8 shadow-sm text-white ${isRtl ? "text-right" : ""}`}>
            <div className="w-12 h-12 bg-[#CC0000]/20 rounded-xl flex items-center justify-center mb-5">
              <Eye size={24} className="text-[#CC0000]" />
            </div>
            <h2 className="text-xl font-bold mb-3">{t("vision_title")}</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{t("vision")}</p>
          </div>

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

      {/* History */}
      <section id="histoire" className="max-w-7xl mx-auto px-4 py-14 scroll-mt-20">
        <div className={`flex gap-8 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div className={`w-1 bg-[#CC0000] shrink-0 rounded-full`} />
          <div className={isRtl ? "text-right" : ""}>
            <h2 className="text-2xl font-extrabold text-[#1a1a1a] mb-4">{t("history_title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("history")}</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="bg-[#1a1a1a] py-14 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-3xl font-extrabold text-white mb-3 ${isRtl ? "text-right" : ""}`}>
            {t("categories_title")}
          </h2>
          <p className={`text-gray-400 mb-10 ${isRtl ? "text-right" : ""}`}>{t("categories_desc")}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat, i) => (
              <div key={i} className={`bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors ${isRtl ? "text-right" : ""}`}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{cat.icon}</span>
                  {countByCategory[cat.key] != null && (
                    <span className="bg-[#CC0000]/20 text-[#CC0000] text-xs font-bold px-2.5 py-1 rounded-full">
                      {countByCategory[cat.key]} {t("players_count")}
                    </span>
                  )}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{cat.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organisation */}
      <section id="organisation" className="max-w-7xl mx-auto px-4 py-14 scroll-mt-20">
        <h2 className={`text-2xl font-extrabold text-[#1a1a1a] mb-4 ${isRtl ? "text-right" : ""}`}>
          {t("org_title")}
        </h2>
        <p className={`text-gray-600 leading-relaxed max-w-3xl mb-10 ${isRtl ? "text-right" : ""}`}>
          {t("org_desc")}
        </p>

        {leadership.length > 0 && (
          <div className={isRtl ? "text-right" : ""}>
            <h3 className="text-lg font-bold text-gray-700 mb-1">{t("leadership_title")}</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-2xl">{t("leadership_desc")}</p>
            <div className={`flex flex-col sm:flex-row gap-5 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
              {leadership.map((p, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm flex-1 ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  <span className="w-14 h-14 rounded-full bg-[#CC0000]/10 text-[#CC0000] flex items-center justify-center text-base font-bold shrink-0">
                    {initials(p.name!)}
                  </span>
                  <div>
                    <p className="font-bold text-[#1a1a1a]">{p.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Crown size={12} className="text-[#CC0000]" /> {p.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Contact */}
      <section id="contact" className="bg-gray-50 py-14 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-2xl font-extrabold text-[#1a1a1a] mb-8 ${isRtl ? "text-right" : ""}`}>
            {t("contact_title")}
          </h2>
          <div className={`flex flex-col sm:flex-row gap-6 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
            {contactItems.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 bg-white rounded-xl px-6 py-4 shadow-sm border border-gray-100 flex-1 ${isRtl ? "flex-row-reverse" : ""}`}
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
