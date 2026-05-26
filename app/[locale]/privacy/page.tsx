import { getTranslations } from "next-intl/server";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-8">{t("title")}</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
            {locale === "ar" ? "جمع البيانات" : "Collecte des données"}
          </h2>
          <p>
            {locale === "ar"
              ? "لا يقوم هذا الموقع بجمع أي بيانات شخصية عن زوّاره بدون موافقتهم المسبقة. نقوم بجمع المعلومات التي تقدمها طواعية عند ملء نماذج التسجيل في البطولات."
              : "Ce site ne collecte aucune donnée personnelle de ses visiteurs sans leur consentement préalable. Nous collectons les informations que vous fournissez volontairement lors du remplissage des formulaires d'inscription aux tournois."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
            {locale === "ar" ? "ملفات تعريف الارتباط" : "Cookies"}
          </h2>
          <p>
            {locale === "ar"
              ? "يستخدم هذا الموقع ملفات تعريف الارتباط الأساسية فقط، اللازمة لضمان عمله بشكل صحيح. لا نستخدم ملفات تعريف الارتباط للتتبع أو الإعلانات."
              : "Ce site utilise uniquement des cookies essentiels, nécessaires à son bon fonctionnement. Nous n'utilisons pas de cookies de suivi ni de publicité."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
            {locale === "ar" ? "حقوقك" : "Vos droits"}
          </h2>
          <p>
            {locale === "ar"
              ? "يحق لك الوصول إلى بياناتك الشخصية وتصحيحها أو حذفها في أي وقت. للتواصل معنا في هذا الشأن، يرجى الاتصال بنا عبر القنوات الرسمية للجمعية."
              : "Vous avez le droit d'accéder à vos données personnelles, de les corriger ou de les supprimer à tout moment. Pour nous contacter à ce sujet, veuillez nous joindre via les canaux officiels de l'association."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
            {locale === "ar" ? "التواصل" : "Contact"}
          </h2>
          <p>
            {locale === "ar"
              ? "الوفاق الرياضي الحسني لمداغ — مداغ، إقليم بركان، المغرب"
              : "Wefak Sportif Hassanyat Madagh — Madagh, Province de Berkane, Maroc"}
          </p>
        </section>
      </div>
    </div>
  );
}
