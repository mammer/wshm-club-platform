"use client";

import { useState } from "react";
import {
  User, Phone, Mail, MapPin, Users, Shield,
  ChevronRight, ChevronLeft, CheckCircle, Trophy, Building2,
  Heart, AlertCircle, Lock, FileText,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "MINIMES", fr: "Minimes",  ar: "الصغار",    age: "U13", color: "bg-green-500" },
  { value: "CADETS",  fr: "Cadets",   ar: "الأشبال",   age: "U15", color: "bg-blue-500" },
  { value: "JUNIORS", fr: "Juniors",  ar: "الناشئون",  age: "U18", color: "bg-orange-500" },
  { value: "SENIORS", fr: "Seniors",  ar: "الكبار",    age: "+18", color: "bg-[#CC0000]" },
];

const TEAM_TYPES = [
  {
    value: "club",
    fr: "Club officiel",        ar: "نادٍ رسمي",
    descFr: "Club affilié FRMF",descAr: "نادٍ منتسب للجامعة",
    icon: Building2,
  },
  {
    value: "amateur",
    fr: "Équipe amateur",       ar: "فريق هاوٍ",
    descFr: "Amis, famille, quartier, école…", descAr: "أصدقاء، عائلة، حي، مدرسة…",
    icon: Heart,
  },
];

const PAYMENT_METHODS = [
  { value: "ESPECES",  fr: "Espèces",         ar: "نقداً",        icon: "💵" },
  { value: "VIREMENT", fr: "Virement",         ar: "تحويل بنكي",   icon: "🏦" },
  { value: "CHEQUE",   fr: "Chèque",           ar: "شيك",          icon: "📝" },
];

// ─── Translations ─────────────────────────────────────────────────────────────

const T = {
  fr: {
    motivoTitle: "Vous êtes tous les bienvenus.",
    motivo: "Le football, c'est bien plus qu'un sport — c'est une histoire partagée, une passion qui traverse les frontières et les générations. Depuis 1956, W.S.H.M Madagh rassemble autour d'un ballon des joueurs de tous horizons sur la terre de Madagh. Aujourd'hui, nous vous ouvrons les portes de notre tournoi : que vous soyez un club affilié, une équipe de quartier, un groupe d'amis, une famille venue de loin ou un compatriote de la diaspora — vous avez votre place ici. Pas besoin de titre ni de licence. Il suffit d'avoir l'envie de jouer, de partager et de vibrer ensemble. Inscrivez-vous, venez vivre ce moment unique, et repartons avec des souvenirs plein les cœurs.",
    welcome: "Rejoignez l'aventure !",
    welcomeSub: "Inscription ouverte à tous — clubs, familles, amis, voisins, diaspora. Peu importe d'où vous venez, vous êtes les bienvenus !",
    step1: "Votre équipe",
    step2: "Contact",
    step3: "Finaliser",
    teamType: "Type de participation",
    teamName: "Nom de l'équipe ou du groupe",
    teamNamePh: "Ex : Les Lions de Berkane, Équipe Famille Alaoui, Amis du quartier…",
    teamNameHint: "Pas encore de nom ? Laissez vide, on s'en occupera ensemble.",
    city: "Ville d'origine",
    cityPh: "Berkane, Nador, Paris, Montréal…",
    president: "Nom du président ou responsable",
    coachName: "Nom de l'entraîneur",
    coachLicense: "N° de licence entraîneur (si disponible)",
    contact: "Responsable de l'équipe",
    contactName: "Nom complet *",
    contactPhone: "Téléphone *",
    contactEmail: "Email",
    category: "Catégorie de jeu *",
    playerCount: "Nombre de joueurs *",
    ageMin: "Âge minimum",
    ageMax: "Âge maximum",
    medCerts: "Tous nos joueurs disposent de certificats médicaux d'aptitude au sport.",
    paymentSection: "Mode de paiement des frais d'inscription",
    paymentNote: "Le règlement s'effectuera sur place le jour du tournoi.",
    notes: "Message ou demandes particulières",
    notesPh: "Informations utiles pour l'organisation, besoins spéciaux, questions…",
    gdprTitle: "Consentement et protection des données",
    gdpr: "J'accepte que W.S.H.M Madagh conserve les informations de cette inscription à des fins d'organisation du tournoi. Ces données ne seront pas communiquées à des tiers et seront supprimées après la saison sportive.",
    gdprRequired: "Vous devez accepter la politique de confidentialité pour continuer.",
    certify: "Je certifie l'exactitude des informations fournies et m'engage à respecter le règlement du tournoi.",
    certifyRequired: "Veuillez certifier vos informations.",
    submit: "Envoyer mon inscription",
    submitting: "Envoi en cours…",
    next: "Continuer",
    back: "Retour",
    required: "Merci de remplir les champs obligatoires *",
    successTitle: "Inscription reçue ! 🎉",
    successMsg: "Votre dossier est entre de bonnes mains. Notre équipe vous contactera très vite pour confirmer votre participation. À très bientôt sur le terrain !",
    successTeam: "Équipe inscrite",
    successAnon: "Participant inscrit",
    errorMsg: "Une erreur est survenue. Réessayez ou contactez-nous directement.",
    selectCat: "Choisissez votre catégorie",
    optional: "(facultatif)",
  },
  ar: {
    motivoTitle: "الجميع مرحب بهم.",
    motivo: "كرة القدم أكثر من مجرد رياضة — إنها تاريخ مشترك وشغف يتخطى الحدود والأجيال. منذ عام 1956، يجمع وفاق حسينية مداغ لاعبين من كل الآفاق على أرض مداغ. اليوم نفتح أبواب بطولتنا للجميع: سواء كنتم ناديًا رسميًا، فريق حي، مجموعة أصدقاء، عائلة قادمة من بعيد، أو مغتربين في أي مكان من العالم — مكانكم محفوظ هنا. لا تحتاجون إلى لقب أو رخصة. يكفي أن يكون في قلوبكم شوق للعب والمشاركة والاحتفال معًا. سجّلوا الآن، تعالوا لتعيشوا هذه اللحظة الاستثنائية، ولنعد جميعًا محملين بذكريات لا تُنسى.",
    welcome: "انضم إلى المغامرة!",
    welcomeSub: "التسجيل مفتوح للجميع — أندية، عائلات، أصدقاء، جيران، مغتربون. مهما كان مصدركم، أهلاً وسهلاً بكم!",
    step1: "فريقكم",
    step2: "التواصل",
    step3: "الإنهاء",
    teamType: "نوع المشاركة",
    teamName: "اسم الفريق أو المجموعة",
    teamNamePh: "مثال: أسود بركان، فريق عائلة العلوي، أصدقاء الحي…",
    teamNameHint: "ليس لديكم اسم بعد؟ اتركوه فارغًا، سنتفق على ذلك معًا.",
    city: "مدينة الانطلاق",
    cityPh: "بركان، الناظور، باريس، مونتريال…",
    president: "اسم الرئيس أو المسؤول",
    coachName: "اسم المدرب",
    coachLicense: "رقم رخصة المدرب (إن توفرت)",
    contact: "مسؤول الفريق",
    contactName: "الاسم الكامل *",
    contactPhone: "رقم الهاتف *",
    contactEmail: "البريد الإلكتروني",
    category: "فئة اللعب *",
    playerCount: "عدد اللاعبين *",
    ageMin: "الحد الأدنى للسن",
    ageMax: "الحد الأقصى للسن",
    medCerts: "جميع لاعبينا يملكون شهادات طبية تُجيز لهم ممارسة الرياضة.",
    paymentSection: "طريقة دفع رسوم التسجيل",
    paymentNote: "يتم الدفع في مكان البطولة يوم الانطلاق.",
    notes: "رسالة أو طلبات خاصة",
    notesPh: "معلومات مفيدة للتنظيم، احتياجات خاصة، أسئلة…",
    gdprTitle: "الموافقة وحماية البيانات",
    gdpr: "أوافق على أن W.S.H.M مداغ تحتفظ بمعلومات هذا التسجيل لأغراض تنظيم البطولة. لن تتم مشاركة هذه البيانات مع أطراف ثالثة وسيتم حذفها بعد الموسم الرياضي.",
    gdprRequired: "يجب قبول سياسة الخصوصية للمتابعة.",
    certify: "أُقر بصحة المعلومات المقدمة وأتعهد باحترام لائحة البطولة.",
    certifyRequired: "يرجى تأكيد المعلومات.",
    submit: "إرسال التسجيل",
    submitting: "جارٍ الإرسال…",
    next: "متابعة",
    back: "رجوع",
    required: "يرجى تعبئة الحقول الإلزامية *",
    successTitle: "تم استلام تسجيلكم! 🎉",
    successMsg: "ملفكم في أيدٍ أمينة. سيتواصل معكم فريقنا قريباً لتأكيد مشاركتكم. نراكم قريباً في الملعب!",
    successTeam: "الفريق المسجل",
    successAnon: "المشارك المسجل",
    errorMsg: "حدث خطأ. يرجى المحاولة مجدداً أو التواصل معنا مباشرة.",
    selectCat: "اختر فئتك",
    optional: "(اختياري)",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TournamentForm({ tournamentId, locale }: { tournamentId: string; locale: string }) {
  const lang = (locale === "ar" ? "ar" : "fr") as "fr" | "ar";
  const L = T[lang];
  const rtl = lang === "ar";

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;

  const [form, setForm] = useState({
    teamType: "",
    clubName: "", clubCity: "", presidentName: "",
    coachName: "", coachLicense: "",
    contactName: "", contactPhone: "", contactEmail: "",
    category: "", playerCount: "", ageGroupMin: "", ageGroupMax: "",
    hasMedicalCerts: false, paymentMethod: "", notes: "",
    gdprConsent: false, certifyConsent: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const f = (key: keyof typeof form, val: string | boolean) => {
    setForm((s) => ({ ...s, [key]: val }));
    setTouched((s) => ({ ...s, [key]: true }));
    setFieldErrors((s) => ({ ...s, [key]: "" }));
  };

  // Completion % for progress bar (only required fields count)
  const filled = [
    form.contactName, form.contactPhone,
    form.category, form.playerCount,
    form.gdprConsent ? "yes" : "", form.certifyConsent ? "yes" : "",
  ].filter(Boolean).length;
  const progress = Math.round((filled / 6) * 100);

  // Step validation — clubName and teamType are fully optional
  const validateStep = (s: number) => {
    const errors: Record<string, string> = {};
    if (s === 2) {
      if (!form.contactName.trim()) errors.contactName = L.required;
      if (!form.contactPhone.trim()) errors.contactPhone = L.required;
    }
    if (s === 3) {
      if (!form.category) errors.category = L.required;
      if (!form.playerCount) errors.playerCount = L.required;
      if (!form.gdprConsent) errors.gdprConsent = L.gdprRequired;
      if (!form.certifyConsent) errors.certifyConsent = L.certifyRequired;
    }
    return errors;
  };

  const goNext = () => {
    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => { setStep((s) => Math.max(s - 1, 1)); setFieldErrors({}); };

  const handleSubmit = async () => {
    const errors = validateStep(3);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/tournaments/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          clubName: form.clubName,
          clubCity: form.clubCity || null,
          presidentName: form.presidentName || null,
          contactName: form.contactName,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail || null,
          coachName: form.coachName || null,
          coachLicense: form.coachLicense || null,
          category: form.category,
          playerCount: parseInt(form.playerCount),
          ageGroupMin: form.ageGroupMin ? parseInt(form.ageGroupMin) : null,
          ageGroupMax: form.ageGroupMax ? parseInt(form.ageGroupMax) : null,
          hasMedicalCerts: form.hasMedicalCerts,
          paymentMethod: form.paymentMethod || null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  // ── Success screen ──
  if (status === "success") {
    return (
      <div className="text-center py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-200">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h3 className="text-2xl font-extrabold text-[#1a1a1a] mb-3">{L.successTitle}</h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto mb-6">{L.successMsg}</p>
        <div className="bg-[#1a1a1a] rounded-2xl p-4 max-w-xs mx-auto">
          <p className="text-gray-400 text-xs mb-1">{form.clubName ? L.successTeam : L.successAnon}</p>
          <p className="text-white font-bold">{form.clubName || form.contactName}</p>
          <p className="text-[#CC0000] text-sm font-semibold mt-1">
            {CATEGORIES.find((c) => c.value === form.category)?.[rtl ? "ar" : "fr"]} · {form.playerCount} {rtl ? "لاعب" : "joueurs"}
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
          <Phone size={11} /> {form.contactPhone}
        </p>
      </div>
    );
  }

  // ── Shared input styles ──
  const inp = (field: string) =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all bg-white ${
      fieldErrors[field]
        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
        : touched[field] && form[field as keyof typeof form]
        ? "border-green-300 focus:border-green-400 focus:ring-4 focus:ring-green-50"
        : "border-gray-200 focus:border-[#CC0000] focus:ring-4 focus:ring-[#CC0000]/10"
    }`;
  const lbl = "block text-sm font-semibold text-gray-700 mb-1.5";
  const err = (field: string) => fieldErrors[field]
    ? <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{fieldErrors[field]}</p>
    : null;

  const FieldIcon = ({ icon: Icon, valid, error }: { icon: React.ElementType; valid: boolean; error: boolean }) => (
    <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all ${error ? "text-red-400" : valid ? "text-green-400" : "text-gray-300"}`}>
      {error ? <AlertCircle size={16} /> : valid ? <CheckCircle size={16} /> : <Icon size={16} />}
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div dir={rtl ? "rtl" : "ltr"}>

      {/* ── Motivational speech ── */}
      <div className="mb-8">
        {/* Decorative header line */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#CC0000]/30" />
          <Trophy size={18} className="text-[#CC0000]" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#CC0000]/30" />
        </div>

        <h2 className="text-xl font-extrabold text-[#1a1a1a] mb-3 leading-snug">
          {L.motivoTitle}
        </h2>

        <p className="text-gray-600 text-sm leading-[1.85] font-normal">
          {L.motivo}
        </p>

        {/* Divider before form */}
        <div className="mt-6 h-px bg-gradient-to-r from-[#CC0000]/20 via-gray-200 to-[#CC0000]/20" />
      </div>

      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-gray-800 rounded-2xl p-6 mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy size={20} className="text-[#CC0000]" />
          <span className="text-white font-extrabold text-lg">{L.welcome}</span>
          <Trophy size={20} className="text-[#CC0000]" />
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{L.welcomeSub}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        {/* Steps indicator */}
        <div className="flex items-center justify-between mb-3">
          {[L.step1, L.step2, L.step3].map((label, i) => {
            const s = i + 1;
            const done = step > s;
            const active = step === s;
            return (
              <div key={s} className="flex-1 flex flex-col items-center relative">
                {/* Connector line */}
                {s < TOTAL_STEPS && (
                  <div className={`absolute top-4 w-full h-0.5 ${rtl ? "right-1/2" : "left-1/2"} transition-all ${done ? "bg-[#CC0000]" : "bg-gray-200"}`} />
                )}
                {/* Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all ${
                  done ? "bg-[#CC0000] text-white shadow-md shadow-red-200"
                       : active ? "bg-[#CC0000] text-white shadow-lg shadow-red-300 scale-110"
                       : "bg-gray-100 text-gray-400"
                }`}>
                  {done ? <CheckCircle size={14} /> : s}
                </div>
                <p className={`text-[10px] font-semibold mt-1.5 transition-colors ${active ? "text-[#CC0000]" : done ? "text-gray-600" : "text-gray-400"}`}>
                  {label}
                </p>
              </div>
            );
          })}
        </div>
        {/* Progress fill */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#CC0000] to-red-400 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }} />
        </div>
        <p className="text-right text-[10px] text-gray-400 mt-1">{progress}% {rtl ? "مكتمل" : "complété"}</p>
      </div>

      {/* ── STEP 1: Team ── */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

          {/* Team type selector — optional */}
          <div>
            <label className={lbl}>
              {L.teamType} <span className="text-gray-400 font-normal text-xs">{L.optional}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TEAM_TYPES.map((tt) => {
                const selected = form.teamType === tt.value;
                return (
                  <button key={tt.value} type="button" onClick={() => f("teamType", tt.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                      selected ? "border-[#CC0000] bg-red-50 shadow-md shadow-red-100" : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? "bg-[#CC0000] text-white" : "bg-gray-100 text-gray-400"}`}>
                      <tt.icon size={20} />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${selected ? "text-[#CC0000]" : "text-gray-700"}`}>
                        {rtl ? tt.ar : tt.fr}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{rtl ? tt.descAr : tt.descFr}</p>
                    </div>
                    {selected && <CheckCircle size={16} className="text-[#CC0000]" />}
                  </button>
                );
              })}
            </div>
            {err("teamType")}
          </div>

          {/* Team name — optional */}
          <div>
            <label className={lbl}>
              {L.teamName} <span className="text-gray-400 font-normal text-xs">{L.optional}</span>
            </label>
            <div className="relative">
              <input className={inp("clubName")} value={form.clubName}
                onChange={(e) => f("clubName", e.target.value)}
                placeholder={L.teamNamePh} />
              <FieldIcon icon={Users} valid={!!form.clubName} error={!!fieldErrors.clubName} />
            </div>
            <p className="text-xs text-gray-400 mt-1 italic">{L.teamNameHint}</p>
          </div>

          {/* City */}
          <div>
            <label className={lbl}>{L.city} <span className="text-gray-400 font-normal text-xs">{L.optional}</span></label>
            <div className="relative">
              <input className={inp("clubCity")} value={form.clubCity}
                onChange={(e) => f("clubCity", e.target.value)}
                placeholder={L.cityPh} />
              <FieldIcon icon={MapPin} valid={!!form.clubCity} error={!!fieldErrors.clubCity} />
            </div>
          </div>

          {/* President (only for clubs) */}
          {form.teamType === "club" && (
            <div>
              <label className={lbl}>{L.president} <span className="text-gray-400 font-normal text-xs">{L.optional}</span></label>
              <div className="relative">
                <input className={inp("presidentName")} value={form.presidentName}
                  onChange={(e) => f("presidentName", e.target.value)} />
                <FieldIcon icon={User} valid={!!form.presidentName} error={false} />
              </div>
            </div>
          )}

          {/* Coach */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>{L.coachName} <span className="text-gray-400 font-normal text-xs">{L.optional}</span></label>
              <input className={inp("coachName")} value={form.coachName}
                onChange={(e) => f("coachName", e.target.value)} />
            </div>
            {form.teamType === "club" && (
              <div>
                <label className={lbl}>{L.coachLicense} <span className="text-gray-400 font-normal text-xs">{L.optional}</span></label>
                <input className={inp("coachLicense")} value={form.coachLicense}
                  onChange={(e) => f("coachLicense", e.target.value)} placeholder="FRMF-XXXX" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: Contact ── */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <Users size={16} className="text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700">{rtl ? "من سيكون جهة اتصالنا يوم البطولة؟" : "Qui sera notre interlocuteur le jour du tournoi ?"}</p>
          </div>

          <div>
            <label className={lbl}>{L.contactName}</label>
            <div className="relative">
              <input className={inp("contactName")} value={form.contactName}
                onChange={(e) => f("contactName", e.target.value)}
                placeholder={rtl ? "الاسم الكامل" : "Prénom & Nom"} />
              <FieldIcon icon={User} valid={!!form.contactName} error={!!fieldErrors.contactName} />
            </div>
            {err("contactName")}
          </div>

          <div>
            <label className={lbl}>{L.contactPhone}</label>
            <div className="relative">
              <input type="tel" className={inp("contactPhone")} value={form.contactPhone}
                onChange={(e) => f("contactPhone", e.target.value)}
                placeholder="+212 6XX XXX XXX" />
              <FieldIcon icon={Phone} valid={form.contactPhone.length >= 8} error={!!fieldErrors.contactPhone} />
            </div>
            {err("contactPhone")}
            <p className="text-xs text-gray-400 mt-1">{rtl ? "سنتواصل معكم على هذا الرقم لتأكيد مشاركتكم" : "Nous vous contacterons sur ce numéro pour confirmer votre participation"}</p>
          </div>

          <div>
            <label className={lbl}>{L.contactEmail} <span className="text-gray-400 font-normal text-xs">{L.optional}</span></label>
            <div className="relative">
              <input type="email" className={inp("contactEmail")} value={form.contactEmail}
                onChange={(e) => f("contactEmail", e.target.value)}
                placeholder="exemple@email.com" />
              <FieldIcon icon={Mail} valid={form.contactEmail.includes("@")} error={!!fieldErrors.contactEmail} />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Category + Finalize ── */}
      {step === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">

          {/* Category picker */}
          <div>
            <label className={lbl}>{L.category}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((c) => {
                const sel = form.category === c.value;
                return (
                  <button key={c.value} type="button" onClick={() => f("category", c.value)}
                    className={`flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-all font-semibold ${
                      sel ? `${c.color} border-transparent text-white shadow-lg` : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                    }`}>
                    <span className="text-lg font-extrabold">{c.age}</span>
                    <span className="text-xs">{rtl ? c.ar : c.fr}</span>
                    {sel && <CheckCircle size={14} className="opacity-80" />}
                  </button>
                );
              })}
            </div>
            {err("category")}
          </div>

          {/* Player count + ages */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className={lbl}>{L.playerCount}</label>
              <input type="number" min="5" max="30" className={inp("playerCount")} value={form.playerCount}
                onChange={(e) => f("playerCount", e.target.value)} placeholder="11" />
              {err("playerCount")}
            </div>
            <div>
              <label className={lbl}>{L.ageMin} <span className="text-gray-400 text-xs">{L.optional}</span></label>
              <input type="number" min="8" max="50" className={inp("ageGroupMin")} value={form.ageGroupMin}
                onChange={(e) => f("ageGroupMin", e.target.value)} placeholder="—" />
            </div>
            <div>
              <label className={lbl}>{L.ageMax} <span className="text-gray-400 text-xs">{L.optional}</span></label>
              <input type="number" min="8" max="50" className={inp("ageGroupMax")} value={form.ageGroupMax}
                onChange={(e) => f("ageGroupMax", e.target.value)} placeholder="—" />
            </div>
          </div>

          {/* Medical certs */}
          <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all ${form.hasMedicalCerts ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all ${form.hasMedicalCerts ? "bg-green-500" : "border-2 border-gray-300"}`}>
              {form.hasMedicalCerts && <CheckCircle size={14} className="text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={form.hasMedicalCerts} onChange={(e) => f("hasMedicalCerts", e.target.checked)} />
            <span className="text-sm text-gray-700 leading-relaxed">{L.medCerts}</span>
          </label>

          {/* Payment */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">{L.paymentSection}</p>
            <p className="text-xs text-gray-400 mb-3">{L.paymentNote}</p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button key={pm.value} type="button"
                  onClick={() => f("paymentMethod", form.paymentMethod === pm.value ? "" : pm.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.paymentMethod === pm.value ? "border-[#CC0000] bg-red-50 text-[#CC0000]" : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>
                  <span className="text-xl">{pm.icon}</span>
                  {rtl ? pm.ar : pm.fr}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={lbl}>{L.notes} <span className="text-gray-400 font-normal text-xs">{L.optional}</span></label>
            <textarea rows={3} className={inp("notes")} value={form.notes}
              onChange={(e) => f("notes", e.target.value)} placeholder={L.notesPh} />
          </div>

          {/* ── GDPR Consent ── */}
          <div className={`rounded-2xl border-2 transition-all ${form.gdprConsent ? "border-green-300 bg-green-50" : fieldErrors.gdprConsent ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-start gap-3 p-4">
              <Lock size={18} className={`shrink-0 mt-0.5 ${form.gdprConsent ? "text-green-500" : "text-gray-400"}`} />
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{L.gdprTitle}</p>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">{L.gdpr}</p>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${form.gdprConsent ? "bg-green-500 border-green-500" : "border-gray-300 bg-white"}`}
                    onClick={() => f("gdprConsent", !form.gdprConsent)}>
                    {form.gdprConsent && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={form.gdprConsent} onChange={(e) => f("gdprConsent", e.target.checked)} />
                  <span className="text-sm font-semibold text-gray-700">
                    {rtl ? "أوافق على سياسة حماية البيانات" : "J'accepte la politique de protection des données"}
                  </span>
                </label>
                {fieldErrors.gdprConsent && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{fieldErrors.gdprConsent}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Certification ── */}
          <div className={`rounded-2xl border-2 transition-all ${form.certifyConsent ? "border-[#CC0000]/30 bg-red-50" : fieldErrors.certifyConsent ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-start gap-3 p-4">
              <FileText size={18} className={`shrink-0 mt-0.5 ${form.certifyConsent ? "text-[#CC0000]" : "text-gray-400"}`} />
              <div className="flex-1">
                <p className="text-xs text-gray-600 leading-relaxed mb-3 italic">{L.certify}</p>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${form.certifyConsent ? "bg-[#CC0000] border-[#CC0000]" : "border-gray-300 bg-white"}`}
                    onClick={() => f("certifyConsent", !form.certifyConsent)}>
                    {form.certifyConsent && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={form.certifyConsent} onChange={(e) => f("certifyConsent", e.target.checked)} />
                  <span className="text-sm font-semibold text-gray-700">
                    {rtl ? "أُقر وأوافق" : "Je certifie et j'accepte"}
                  </span>
                </label>
                {fieldErrors.certifyConsent && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{fieldErrors.certifyConsent}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Shield size={12} className="text-green-400 shrink-0" />
            {rtl ? "معلوماتكم آمنة ولن تُشارك مع أي طرف ثالث" : "Vos données sont sécurisées et ne seront jamais partagées"}
          </div>

          {/* Error */}
          {status === "error" && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {L.errorMsg}
            </div>
          )}
        </div>
      )}

      {/* ── Navigation buttons ── */}
      <div className={`flex gap-3 mt-8 ${step === 1 ? "justify-end" : "justify-between"}`}>
        {step > 1 && (
          <button type="button" onClick={goBack}
            className="flex items-center gap-2 px-5 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
            {rtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {L.back}
          </button>
        )}
        {step < TOTAL_STEPS ? (
          <button type="button" onClick={goNext}
            className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/20">
            {L.next}
            {rtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={status === "loading"}
            className="flex-1 flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-red-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all text-base shadow-xl shadow-red-500/30 relative overflow-hidden">
            {status === "loading" ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {L.submitting}
              </>
            ) : (
              <>
                <Trophy size={18} />
                {L.submit}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
