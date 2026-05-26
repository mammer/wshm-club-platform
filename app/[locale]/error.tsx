"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl mb-4">⚠️</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Une erreur est survenue</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        La page n&apos;a pas pu se charger. Veuillez réessayer ou revenir à l&apos;accueil.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="px-5 py-2.5 bg-[#CC0000] text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
          Réessayer
        </button>
        <Link href="/" className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
          Accueil
        </Link>
      </div>
    </div>
  );
}
