import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import TournamentForm from "./TournamentForm";
import { Calendar, Clock } from "lucide-react";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tournament" });

  const tournaments = await prisma.tournament.findMany({
    orderBy: { tournamentDate: "asc" },
  });

  if (tournaments.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl mb-4 block">🏆</span>
        <h1 className="text-3xl font-extrabold mb-3">{t("title")}</h1>
        <p className="text-gray-400">{t("no_tournaments")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-8">{t("title")}</h1>
      <div className="space-y-8">
        {tournaments.map((tournament) => (
          <div key={tournament.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#1a1a1a] text-white p-6">
              <h2 className="text-xl font-bold mb-1">
                {locale === "ar" ? tournament.nameAr : tournament.nameFr}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mt-3">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {t("date")}: {new Date(tournament.tournamentDate).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR")}
                </span>
                {tournament.registrationDeadline && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {t("deadline")}: {new Date(tournament.registrationDeadline).toLocaleDateString(locale === "ar" ? "ar-MA" : "fr-FR")}
                  </span>
                )}
              </div>
              {tournament.categories && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tournament.categories.split(",").map((c) => (
                    <span key={c} className="bg-[#CC0000] text-white text-xs px-2 py-0.5 rounded-full">
                      {c.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6">
              {tournament.isOpen ? (
                locale === "ar" && tournament.descriptionAr ? (
                  <p className="text-gray-600 mb-6">{tournament.descriptionAr}</p>
                ) : tournament.descriptionFr ? (
                  <p className="text-gray-600 mb-6">{tournament.descriptionFr}</p>
                ) : null
              ) : null}

              {tournament.isOpen ? (
                <TournamentForm tournamentId={tournament.id} locale={locale} />
              ) : (
                <div className="text-center py-4">
                  <span className="bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-sm font-medium">
                    {t("closed")}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
