"use client";

import { useEffect } from "react";
import { IconAlertTriangle as AlertTriangle } from "@tabler/icons-react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
        <AlertTriangle size={28} className="text-[#CC0000]" />
      </div>
      <h1 className="text-xl font-bold text-gray-800 mb-2">Une erreur est survenue</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        La page n&apos;a pas pu se charger. Vérifiez la connexion à la base de données.
        {error.digest && <span className="block font-mono text-xs text-gray-300 mt-2">{error.digest}</span>}
      </p>
      <button onClick={reset} className="px-5 py-2.5 bg-[#CC0000] text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
        Réessayer
      </button>
    </div>
  );
}
