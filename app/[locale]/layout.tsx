import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/public/CookieBanner";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wshm.ma";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "W.S.H.M — Wefak Sportif Hassanyat Madagh",
      template: "%s — W.S.H.M",
    },
    description: "Association sportive fondée en 1956 à Madagh, Maroc. Football pour toutes les catégories : Minimes, Cadets, Juniors, Seniors.",
    keywords: ["football", "Madagh", "WSHM", "association sportive", "Maroc", "كرة القدم", "مضاغ"],
    openGraph: {
      siteName: "W.S.H.M",
      type: "website",
      locale: "fr_MA",
      images: [{ url: "/logo.png", width: 512, height: 512, alt: "Logo W.S.H.M" }],
    },
    twitter: { card: "summary", site: "@wshm_madagh" },
    robots: { index: true, follow: true },
    alternates: {
      languages: {
        "fr": `${siteUrl}/fr`,
        "ar": `${siteUrl}/ar`,
        "x-default": `${siteUrl}/fr`,
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "ar")) {
    notFound();
  }

  const messages = await getMessages();

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <>
      <NextIntlClientProvider messages={messages}>
        <div dir={dir} lang={locale} className="min-h-screen flex flex-col">
          {/* Skip-to-content — first focusable element, visually hidden until focused */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#CC0000] focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
          >
            {locale === "ar" ? "انتقل إلى المحتوى الرئيسي" : "Aller au contenu principal"}
          </a>
          <Navbar locale={locale} />
          <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
          <Footer locale={locale} />
        </div>
        <CookieBanner />
      </NextIntlClientProvider>
    </>
  );
}
