"use client";

import { useSearchParams } from "next/navigation";
import { ShieldOff } from "lucide-react";
import { Suspense } from "react";

function Banner() {
  const searchParams = useSearchParams();
  if (searchParams.get("forbidden") !== "1") return null;
  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-5">
      <ShieldOff size={16} className="shrink-0" />
      <span>Accès refusé — vous n&apos;avez pas les droits nécessaires pour accéder à cette section.</span>
    </div>
  );
}

export default function ForbiddenBanner() {
  return <Suspense><Banner /></Suspense>;
}
