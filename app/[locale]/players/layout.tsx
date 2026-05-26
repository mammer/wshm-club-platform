import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "اللاعبون" : "Joueurs",
    description: locale === "ar"
      ? "تعرف على لاعبي فريق وفاق الحسنية مضاغ في جميع الفئات"
      : "Découvrez les joueurs du W.S.H.M Madagh dans toutes les catégories",
  };
}

export default function PlayersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
