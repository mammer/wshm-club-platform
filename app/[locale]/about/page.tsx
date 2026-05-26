import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MapPin, Phone, Mail, Target, Eye, Heart } from "lucide-react";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const isRtl = locale === "ar";

  const categories = [
    {
      icon: "⚽",
      name: t("cat_minimes"),
      desc: t("cat_minimes_desc"),
    },
    {
      icon: "🥇",
      name: t("cat_cadets"),
      desc: t("cat_cadets_desc"),
    },
    {
      icon: "🏆",
      name: t("cat_juniors"),
      desc: t("cat_juniors_desc"),
    },
    {
      icon: "⭐",
      name: t("cat_seniors"),
      desc: t("cat_seniors_desc"),
    },
  ];

  const contactItems = [
    { icon: <MapPin size={20} className="text-[#CC0000]" />, text: t("contact_location") },
    { icon: <Phone size={20} className="text-[#CC0000]" />, text: t("contact_phone") },
    { icon: <Mail size={20} className="text-[#CC0000]" />, text: t("contact_email") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#1a1a1a] text-white py-16">
        <div className={`max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10 ${isRtl ? "md:flex-row-reverse" : ""}`}>
          <div className="shrink-0 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#CC0000]/30 rounded-full blur-2xl" />
              <Image
                src="/logo.png"
                alt="W.S.H.M"
                width={180}
                height={180}
                className="relative rounded-full border-4 border-[#CC0000] shadow-2xl"
              />
            </div>
          </div>
          <div className={isRtl ? "text-right" : ""}>
            <p className="text-[#CC0000] text-xs font-bold uppercase tracking-widest mb-3">
              {locale === "ar" ? "منذ 1956 · مداغ، المغرب" : "Depuis 1956 · Madagh, Maroc"}
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{t("title")}</h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">{t("subtitle")}</p>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <p className={`text-gray-600 text-lg leading-relaxed max-w-4xl ${isRtl ? "text-right ml-auto" : ""}`}>
          {t("description")}
        </p>
      </section>

      {/* Mission / Vision / Values */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          <div className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 ${isRtl ? "text-right" : ""}`}>
            <div className="w-12 h-12 bg-[#CC0000]/10 rounded-xl flex items-center justify-center mb-5">
              <Target size={24} className="text-[#CC0000]" />
            </div>
            <h2 className="text-xl font-bold mb-3 text-[#1a1a1a]">{t("mission_title")}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{t("mission")}</p>
          </div>

          <div className={`bg-[#1a1a1a] rounded-2xl p-8 shadow-sm text-white ${isRtl ? "text-right" : ""}`}>
            <div className="w-12 h-12 bg-[#CC0000]/20 rounded-xl flex items-center justify-center mb-5">
              <Eye size={24} className="text-[#CC0000]" />
            </div>
            <h2 className="text-xl font-bold mb-3">{t("vision_title")}</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{t("vision")}</p>
          </div>

          <div className={`bg-[#CC0000] rounded-2xl p-8 shadow-sm text-white ${isRtl ? "text-right" : ""}`}>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
              <Heart size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold mb-3">{t("values_title")}</h2>
            <div className="flex flex-wrap gap-2 mt-4">
              {t("values")
                .split(",")
                .map((v) => v.trim())
                .map((v) => (
                  <span key={v} className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    {v}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className={`flex gap-8 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div className={`w-1 bg-[#CC0000] shrink-0 rounded-full`} />
          <div className={isRtl ? "text-right" : ""}>
            <h2 className="text-2xl font-extrabold text-[#1a1a1a] mb-4">{t("history_title")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("history")}</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-[#1a1a1a] py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-3xl font-extrabold text-white mb-3 ${isRtl ? "text-right" : ""}`}>
            {t("categories_title")}
          </h2>
          <p className={`text-gray-400 mb-10 ${isRtl ? "text-right" : ""}`}>{t("categories_desc")}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat, i) => (
              <div key={i} className={`bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors ${isRtl ? "text-right" : ""}`}>
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{cat.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organisation */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className={`text-2xl font-extrabold text-[#1a1a1a] mb-4 ${isRtl ? "text-right" : ""}`}>
          {t("org_title")}
        </h2>
        <p className={`text-gray-600 leading-relaxed max-w-3xl ${isRtl ? "text-right" : ""}`}>
          {t("org_desc")}
        </p>
      </section>

      {/* Contact */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-2xl font-extrabold text-[#1a1a1a] mb-8 ${isRtl ? "text-right" : ""}`}>
            {t("contact_title")}
          </h2>
          <div className={`flex flex-col sm:flex-row gap-6 ${isRtl ? "sm:flex-row-reverse" : ""}`}>
            {contactItems.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 bg-white rounded-xl px-6 py-4 shadow-sm border border-gray-100 flex-1 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <div className="shrink-0">{item.icon}</div>
                <span className={`text-sm text-gray-700 ${isRtl ? "text-right" : ""}`}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
