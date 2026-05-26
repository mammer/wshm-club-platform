"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, Lock } from "lucide-react";

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isRtl = locale === "ar";
  const otherLocale = locale === "fr" ? "ar" : "fr";

  const localePath = (path: string) => `/${locale}${path}`;
  const switchLocalePath = () => {
    const stripped = pathname.replace(/^\/(fr|ar)/, "");
    return `/${otherLocale}${stripped || ""}`;
  };

  const links = [
    { href: "/", label: t("home") },
    { href: "/players", label: t("players") },
    { href: "/scores", label: t("scores") },
    { href: "/blog", label: t("blog") },
    { href: "/gallery", label: t("gallery") },
    { href: "/tournament", label: t("tournament") },
    { href: "/about", label: t("about") },
  ];

  const isActive = (href: string) =>
    href === "/"
      ? pathname === `/${locale}` || pathname === `/${locale}/`
      : pathname.startsWith(localePath(href));

  return (
    <header className="bg-[#1a1a1a] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-4">

        {/* Logo */}
        <Link href={localePath("/")} className="flex items-center shrink-0">
          <Image src="/logo.png" alt="W.S.H.M Logo" width={46} height={46} className="rounded-full" />
        </Link>

        {/* Desktop nav */}
        <nav className={`hidden lg:flex items-center gap-1 flex-1 ${isRtl ? "flex-row-reverse justify-end" : "justify-start"}`}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={localePath(l.href)}
              className={`px-3 py-2 rounded text-sm transition-colors whitespace-nowrap ${
                isActive(l.href)
                  ? "text-[#CC0000] font-semibold"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right group: locale switcher + admin + mobile toggle */}
        <div className={`flex items-center gap-2 shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}>
          {/* Language toggle */}
          <Link
            href={switchLocalePath()}
            className="text-xs border border-gray-600 px-3 py-1.5 rounded-lg hover:border-[#CC0000] hover:text-[#CC0000] transition-colors font-semibold"
          >
            {otherLocale === "ar" ? "عربي" : "Français"}
          </Link>

          {/* Admin link (desktop) */}
          <Link
            href="/admin"
            className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#CC0000] transition-colors border border-gray-700 hover:border-[#CC0000] px-3 py-1.5 rounded-lg"
          >
            <Lock size={12} />
            Admin
          </Link>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-gray-300 hover:text-white p-1"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className={`lg:hidden bg-[#111] border-t border-gray-800 px-4 py-3 flex flex-col gap-1 ${isRtl ? "items-end" : "items-start"}`}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={localePath(l.href)}
              onClick={() => setOpen(false)}
              className={`block py-2 px-3 rounded text-sm w-full ${isRtl ? "text-right" : "text-left"} ${
                isActive(l.href) ? "text-[#CC0000] font-semibold" : "text-gray-300"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-1.5 py-2 px-3 text-sm text-gray-400 hover:text-[#CC0000] w-full mt-1 border-t border-gray-800 pt-3 ${isRtl ? "flex-row-reverse text-right" : ""}`}
          >
            <Lock size={14} />
            Admin
          </Link>
        </div>
      )}
    </header>
  );
}
