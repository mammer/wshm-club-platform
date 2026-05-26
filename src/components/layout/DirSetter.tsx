"use client";

import { useEffect } from "react";

export default function DirSetter({ locale }: { locale: string }) {
  useEffect(() => {
    const isRtl = locale === "ar";
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.body.className = document.body.className
      .replace(/\bfont-(cairo|inter)\b/g, "")
      .trim();
  }, [locale]);

  return null;
}
