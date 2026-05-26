"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function CookieBanner() {
  const t = useTranslations("privacy");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-[#1a1a1a] text-white px-4 py-4 shadow-2xl">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-3 text-sm">
        <p className="flex-1 text-gray-300">{t("cookies_banner")}</p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={accept}
            className="bg-[#CC0000] hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition-colors"
          >
            {t("accept")}
          </button>
          <button
            onClick={decline}
            className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-4 py-2 rounded transition-colors"
          >
            {t("decline")}
          </button>
        </div>
      </div>
    </div>
  );
}
