import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MapPin, Lock } from "lucide-react";

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const lp = (path: string) => `/${locale}${path}`;
  const isRtl = locale === "ar";

  return (
    <footer className="bg-[#1a1a1a] text-gray-300 mt-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand */}
        <div className={`flex flex-col gap-3 ${isRtl ? "items-end" : "items-start"}`}>
          <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Image src="/logo.png" alt="W.S.H.M" width={52} height={52} className="rounded-full" />
            <div className={isRtl ? "text-right" : ""}>
              <p className="text-white font-bold text-lg leading-tight">W.S.H.M</p>
              <p className="text-xs text-gray-500">{t("founded")}</p>
            </div>
          </div>
          <p className={`text-sm flex items-center gap-1 ${isRtl ? "flex-row-reverse" : ""}`}>
            <MapPin size={14} className="text-[#CC0000] shrink-0" />
            {t("address")}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {locale === "ar"
              ? "مداغ، إقليم بركان، شمال شرق المغرب"
              : "Madagh, Province de Berkane, Maroc Oriental"}
          </p>
        </div>

        {/* Navigation */}
        <div className={isRtl ? "text-right" : ""}>
          <p className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t("nav_title")}</p>
          <ul className="space-y-2 text-sm">
            {[
              [lp("/"), nav("home")],
              [lp("/players"), nav("players")],
              [lp("/scores"), nav("scores")],
              [lp("/blog"), nav("blog")],
              [lp("/gallery"), nav("gallery")],
              [lp("/tournament"), nav("tournament")],
              [lp("/about"), nav("about")],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-[#CC0000] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal + Admin */}
        <div className={isRtl ? "text-right" : ""}>
          <p className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t("legal_title")}</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={lp("/privacy")} className="hover:text-[#CC0000] transition-colors">
                {t("privacy")}
              </Link>
            </li>
          </ul>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-600 mb-3 uppercase tracking-wider">
              {locale === "ar" ? "للمسؤولين" : "Espace réservé"}
            </p>
            <Link
              href="/admin"
              className={`inline-flex items-center gap-2 text-xs text-gray-500 hover:text-[#CC0000] border border-gray-700 hover:border-[#CC0000] px-4 py-2 rounded-lg transition-colors ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <Lock size={12} />
              {locale === "ar" ? "لوحة الإدارة" : "Administration"}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4">
        <div className={`max-w-7xl mx-auto px-4 flex items-center justify-between text-xs text-gray-600 ${isRtl ? "flex-row-reverse" : ""}`}>
          <span>© {new Date().getFullYear()} W.S.H.M — {t("rights")}</span>
          <span className="text-gray-700">{t("founded")}</span>
        </div>
      </div>
    </footer>
  );
}
