"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { IconX as X, IconUser as User } from "@tabler/icons-react";

type Player = {
  id: string;
  fullName: string;
  photoUrl: string | null;
  category: string;
  position: string | null;
  jerseyNumber: number | null;
  licenseNumber: string | null;
  birthDate: string | null;
  phone: string | null;
};

const CATEGORIES = ["", "MINIMES", "CADETS", "JUNIORS", "SENIORS"] as const;

export default function PlayersPage() {
  const t = useTranslations("players");
  const { locale } = useParams<{ locale: string }>();
  const [filter, setFilter] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = filter ? `/api/players?category=${filter}` : "/api/players";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setPlayers(data))
      .finally(() => setLoading(false));
  }, [filter]);

  const catLabel = (cat: string) => {
    if (cat === "") return locale === "ar" ? "الكل" : "Tous";
    const map: Record<string, { fr: string; ar: string }> = {
      MINIMES: { fr: "Minimes", ar: "الصغار" },
      CADETS: { fr: "Cadets", ar: "الأشبال" },
      JUNIORS: { fr: "Juniors", ar: "الناشئون" },
      SENIORS: { fr: "Séniors", ar: "الكبار" },
    };
    return map[cat]?.[locale as "fr" | "ar"] ?? cat;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-6">{t("title")}</h1>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === cat
                ? "bg-[#CC0000] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {catLabel(cat)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-52 animate-pulse" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <p className="text-gray-400">{t("no_players")}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => setSelected(player)}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
            >
              <div className="bg-gray-100 aspect-square overflow-hidden relative">
                {player.photoUrl ? (
                  <img src={player.photoUrl} alt={player.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <User size={48} />
                  </div>
                )}
                {player.jerseyNumber && (
                  <span className="absolute top-2 left-2 bg-[#CC0000] text-white text-xs font-bold px-2 py-0.5 rounded">
                    #{player.jerseyNumber}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm text-[#1a1a1a] leading-tight">{player.fullName}</p>
                {player.position && (
                  <p className="text-xs text-gray-500 mt-0.5">{player.position}</p>
                )}
                <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {catLabel(player.category)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Player modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gray-100 h-56">
              {selected.photoUrl ? (
                <img src={selected.photoUrl} alt={selected.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <User size={72} />
                </div>
              )}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-1"
              >
                <X size={18} />
              </button>
              {selected.jerseyNumber && (
                <span className="absolute bottom-3 left-3 bg-[#CC0000] text-white font-bold px-3 py-1 rounded-full text-sm">
                  #{selected.jerseyNumber}
                </span>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold mb-3">{selected.fullName}</h3>
              <dl className="space-y-2 text-sm">
                {[
                  [t("position"), selected.position],
                  [t("jersey"), selected.jerseyNumber],
                  [t("license"), selected.licenseNumber],
                  [t("born"), selected.birthDate ? new Date(selected.birthDate).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR") : null],
                ]
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div key={String(label)} className="flex gap-2">
                      <dt className="text-gray-500 shrink-0 w-24">{label}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
