"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">📰</p>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Impossible de charger les articles</h2>
      <p className="text-gray-500 mb-6">Une erreur est survenue. Veuillez réessayer.</p>
      <button onClick={reset} className="px-5 py-2.5 bg-[#CC0000] text-white rounded-xl text-sm font-semibold hover:bg-red-700">Réessayer</button>
    </div>
  );
}
