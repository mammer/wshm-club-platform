// Shared admin translations — FR/AR
// Usage: const { t, lang, ar } = useAdminT();

"use client";
import { useState, useEffect } from "react";

export type Lang = "fr" | "ar";

export const TRANSLATIONS = {
  // ── Common ────────────────────────────────────────────────────────────────
  save:      { fr: "Enregistrer",       ar: "حفظ" },
  cancel:    { fr: "Annuler",           ar: "إلغاء" },
  delete:    { fr: "Supprimer",         ar: "حذف" },
  edit:      { fr: "Modifier",          ar: "تعديل" },
  add:       { fr: "Ajouter",           ar: "إضافة" },
  search:    { fr: "Rechercher...",     ar: "بحث..." },
  loading:   { fr: "Chargement...",     ar: "جارٍ التحميل..." },
  saving:    { fr: "Enregistrement...", ar: "جارٍ الحفظ..." },
  noData:    { fr: "Aucune donnée.",    ar: "لا توجد بيانات." },
  print:     { fr: "Imprimer",         ar: "طباعة" },
  close:     { fr: "Fermer",           ar: "إغلاق" },
  confirm:   { fr: "Confirmer",        ar: "تأكيد" },
  actions:   { fr: "Actions",          ar: "إجراءات" },
  all:       { fr: "Tous",             ar: "الكل" },
  active:    { fr: "Actif",            ar: "نشط" },
  inactive:  { fr: "Inactif",          ar: "غير نشط" },
  yes:       { fr: "Oui",              ar: "نعم" },
  no:        { fr: "Non",              ar: "لا" },
  optional:  { fr: "(facultatif)",     ar: "(اختياري)" },
  required:  { fr: "Champ requis",     ar: "حقل مطلوب" },
  error:     { fr: "Erreur",           ar: "خطأ" },
  success:   { fr: "Succès",           ar: "نجاح" },
  total:     { fr: "Total",            ar: "المجموع" },
  season:    { fr: "Saison",           ar: "الموسم" },
  date:      { fr: "Date",             ar: "التاريخ" },
  notes:     { fr: "Notes",            ar: "ملاحظات" },
  name:      { fr: "Nom",              ar: "الاسم" },
  phone:     { fr: "Téléphone",        ar: "الهاتف" },
  email:     { fr: "Email",            ar: "البريد الإلكتروني" },
  address:   { fr: "Adresse",          ar: "العنوان" },
  location:  { fr: "Lieu",             ar: "المكان" },
  category:  { fr: "Catégorie",        ar: "الفئة" },
  status:    { fr: "Statut",           ar: "الحالة" },
  amount:    { fr: "Montant",          ar: "المبلغ" },
  type:      { fr: "Type",             ar: "النوع" },
  year:      { fr: "Année",            ar: "السنة" },
  month:     { fr: "Mois",             ar: "الشهر" },
  new:       { fr: "Nouveau",          ar: "جديد" },
  photo:     { fr: "Photo",            ar: "الصورة" },
  download:  { fr: "Télécharger",      ar: "تنزيل" },
  view:      { fr: "Consulter",        ar: "عرض" },
  reset:     { fr: "Réinitialiser",    ar: "إعادة تعيين" },
  filter:    { fr: "Filtrer",          ar: "تصفية" },
  export:    { fr: "Exporter",         ar: "تصدير" },

  // ── Categories ────────────────────────────────────────────────────────────
  SENIORS:   { fr: "Seniors",  ar: "الكبار" },
  JUNIORS:   { fr: "Juniors",  ar: "الناشئون" },
  CADETS:    { fr: "Cadets",   ar: "الأشبال" },
  MINIMES:   { fr: "Minimes",  ar: "الصغار" },

  // ── Players ───────────────────────────────────────────────────────────────
  players:       { fr: "Joueurs",          ar: "اللاعبون" },
  addPlayer:     { fr: "Ajouter un joueur", ar: "إضافة لاعب" },
  editPlayer:    { fr: "Modifier le joueur", ar: "تعديل اللاعب" },
  fullName:      { fr: "Nom complet",       ar: "الاسم الكامل" },
  birthDate:     { fr: "Date de naissance", ar: "تاريخ الميلاد" },
  position:      { fr: "Poste",             ar: "المركز" },
  jerseyNumber:  { fr: "N° Maillot",        ar: "رقم القميص" },
  licenseNumber: { fr: "N° Licence",        ar: "رقم الرخصة" },
  cin:           { fr: "CIN",               ar: "رقم البطاقة" },
  nationality:   { fr: "Nationalité",       ar: "الجنسية" },
  parentName:    { fr: "Nom du tuteur",     ar: "اسم الولي" },
  parentPhone:   { fr: "Tél. tuteur",       ar: "هاتف الولي" },
  playerDocs:    { fr: "Documents à imprimer", ar: "الوثائق" },
  commitment:    { fr: "Fiche d'engagement", ar: "وثيقة الالتزام" },
  licenseForm:   { fr: "Demande de licence FRMF", ar: "طلب الرخصة" },
  identitySheet: { fr: "Fiche d'identité",  ar: "بطاقة التعريف" },
  contract:      { fr: "Contrat joueur",    ar: "عقد اللاعب" },

  // ── Coaches ───────────────────────────────────────────────────────────────
  coaches:    { fr: "Entraîneurs",        ar: "المدربون" },
  addCoach:   { fr: "Ajouter un entraîneur", ar: "إضافة مدرب" },
  role:       { fr: "Rôle",              ar: "الدور" },
  license:    { fr: "Licence",           ar: "الرخصة" },

  // ── Meetings ──────────────────────────────────────────────────────────────
  meetings:      { fr: "Réunions",           ar: "الاجتماعات" },
  newMeeting:    { fr: "Planifier une réunion", ar: "جدولة اجتماع" },
  meetingTitle:  { fr: "Titre / Objet",      ar: "الموضوع" },
  agenda:        { fr: "Ordre du jour",      ar: "جدول الأعمال" },
  decisions:     { fr: "Décisions prises",   ar: "القرارات" },
  attendeeCount: { fr: "Nombre de présents", ar: "عدد الحاضرين" },
  document:      { fr: "Document joint",     ar: "الوثيقة المرفقة" },
  upcoming:      { fr: "À venir",            ar: "القادمة" },
  past:          { fr: "Passées",            ar: "الماضية" },
  printPV:       { fr: "Imprimer le PV",     ar: "طباعة المحضر" },

  // ── Attendance ────────────────────────────────────────────────────────────
  attendance:    { fr: "Présences",          ar: "الحضور" },
  newSession:    { fr: "Nouvelle session",   ar: "جلسة جديدة" },
  sessionType:   { fr: "Type de session",    ar: "نوع الجلسة" },
  ENTRAINEMENT:  { fr: "Entraînement",       ar: "تدريب" },
  MATCH:         { fr: "Match",              ar: "مباراة" },
  TOURNOI:       { fr: "Tournoi",            ar: "بطولة" },
  present:       { fr: "Présent",            ar: "حاضر" },
  absent:        { fr: "Absent",             ar: "غائب" },
  justification: { fr: "Justification",      ar: "المبرر" },
  allPresent:    { fr: "✓ Tous présents",    ar: "✓ الكل حاضر" },
  allAbsent:     { fr: "✗ Tous absents",     ar: "✗ الكل غائب" },

  // ── Payments ──────────────────────────────────────────────────────────────
  payments:      { fr: "Paiements",          ar: "المدفوعات" },
  COTISATION:    { fr: "Cotisation",         ar: "الاشتراك" },
  LICENCE:       { fr: "Licence",            ar: "الرخصة" },
  EQUIPEMENT:    { fr: "Équipement",         ar: "التجهيزات" },
  AUTRE:         { fr: "Autre",              ar: "أخرى" },
  paymentDate:   { fr: "Date de paiement",   ar: "تاريخ الدفع" },
  paid:          { fr: "Payé",               ar: "مدفوع" },
  unpaid:        { fr: "Non payé",           ar: "غير مدفوع" },
  receipt:       { fr: "Reçu",              ar: "وصل" },

  // ── Expenses ──────────────────────────────────────────────────────────────
  expenses:      { fr: "Dépenses",           ar: "المصاريف" },
  addExpense:    { fr: "Ajouter une dépense", ar: "إضافة مصروف" },
  TRANSPORT:     { fr: "Transport",          ar: "النقل" },
  ALIMENTATION:  { fr: "Alimentation",       ar: "التغذية" },
  DEPLACEMENT:   { fr: "Déplacement",        ar: "التنقل" },
  SALAIRES:      { fr: "Salaires coaches",   ar: "رواتب المدربين" },
  ARBITRAGE:     { fr: "Arbitrage",          ar: "التحكيم" },
  ADMINISTRATION:{ fr: "Administration",     ar: "الإدارة" },
  description:   { fr: "Description",        ar: "الوصف" },
  vendor:        { fr: "Fournisseur",        ar: "المورد" },
  paidBy:        { fr: "Payé par",           ar: "دفع بواسطة" },

  // ── Members ───────────────────────────────────────────────────────────────
  members:       { fr: "Adhérents",          ar: "الأعضاء" },
  addMember:     { fr: "Ajouter un membre",  ar: "إضافة عضو" },
  bureau:        { fr: "Bureau exécutif",    ar: "المكتب التنفيذي" },
  PRESIDENT:     { fr: "Président",          ar: "الرئيس" },
  VICE_PRESIDENT:{ fr: "Vice-Président",     ar: "نائب الرئيس" },
  SECRETARY:     { fr: "Secrétaire",         ar: "الكاتب" },
  TREASURER:     { fr: "Trésorier",          ar: "الخازن" },
  MEMBER:        { fr: "Membre",             ar: "عضو" },
  HONORARY:      { fr: "Membre d\'honneur",  ar: "عضو شرفي" },
  joinDate:      { fr: "Date d\'adhésion",   ar: "تاريخ الانضمام" },

  // ── Archive ───────────────────────────────────────────────────────────────
  archive:       { fr: "Archives",           ar: "الأرشيف" },
  addDoc:        { fr: "Archiver un document", ar: "أرشفة وثيقة" },
  REUNION:       { fr: "Procès-Verbaux",     ar: "محاضر الاجتماعات" },
  JURIDIQUE:     { fr: "Juridique",          ar: "قانوني" },
  STATUTS:       { fr: "Statuts",            ar: "النظام الأساسي" },
  CONTRAT:       { fr: "Contrats",           ar: "العقود" },
  CORRESPONDANCE:{ fr: "Correspondances",    ar: "المراسلات" },
  FINANCIER:     { fr: "Financier",          ar: "المالية" },
  uploadedBy:    { fr: "Archivé par",        ar: "أرشف من طرف" },

  // ── Sponsors ──────────────────────────────────────────────────────────────
  sponsors:      { fr: "Sponsors",           ar: "الرعاة" },
  addSponsor:    { fr: "Ajouter un sponsor", ar: "إضافة راعٍ" },
  sponsorName:   { fr: "Nom du sponsor",     ar: "اسم الراعي" },
  startDate:     { fr: "Date de début",      ar: "تاريخ البداية" },
  endDate:       { fr: "Date de fin",        ar: "تاريخ النهاية" },

  // ── Scores / Matches ─────────────────────────────────────────────────────
  scores:        { fr: "Scores",             ar: "النتائج" },
  match:         { fr: "Match",              ar: "مباراة" },
  addMatch:      { fr: "Ajouter un match",   ar: "إضافة مباراة" },
  homeTeam:      { fr: "Équipe domicile",    ar: "الفريق المضيف" },
  awayTeam:      { fr: "Équipe visiteur",    ar: "الفريق الضيف" },
  homeScore:     { fr: "Score domicile",     ar: "نتيجة المضيف" },
  awayScore:     { fr: "Score visiteur",     ar: "نتيجة الضيف" },
  matchday:      { fr: "Journée",            ar: "الجولة" },
  CHAMPIONNAT:   { fr: "Championnat",        ar: "البطولة" },
  COUPE:         { fr: "Coupe",              ar: "الكأس" },
  AMICAL:        { fr: "Amical",             ar: "ودي" },

  // ── Users ─────────────────────────────────────────────────────────────────
  users:         { fr: "Utilisateurs",       ar: "المستخدمون" },
  addUser:       { fr: "Nouvel utilisateur", ar: "مستخدم جديد" },
  ADMIN:         { fr: "Administrateur",     ar: "مسؤول" },
  AUTHOR:        { fr: "Auteur",             ar: "محرر" },
  COACH:         { fr: "Entraîneur",         ar: "مدرب" },
  password:      { fr: "Mot de passe",       ar: "كلمة المرور" },
  confirmPwd:    { fr: "Confirmer le mot de passe", ar: "تأكيد كلمة المرور" },

  // ── Blog ──────────────────────────────────────────────────────────────────
  blog:          { fr: "Blog",               ar: "المدونة" },
  publish:       { fr: "Publier",            ar: "نشر" },
  draft:         { fr: "Brouillon",          ar: "مسودة" },
  published:     { fr: "Publié",             ar: "منشور" },
  titleFr:       { fr: "Titre (FR)",         ar: "العنوان (FR)" },
  titleAr:       { fr: "Titre (AR)",         ar: "العنوان (AR)" },
  slug:          { fr: "Slug (URL)",         ar: "رابط المقال" },
  content:       { fr: "Contenu",            ar: "المحتوى" },
  cover:         { fr: "Image de couverture", ar: "صورة الغلاف" },
  author:        { fr: "Auteur",             ar: "الكاتب" },

  // ── Gallery ───────────────────────────────────────────────────────────────
  gallery:       { fr: "Galerie",            ar: "المعرض" },
  addPhoto:      { fr: "Ajouter des photos", ar: "إضافة صور" },
  eventDate:     { fr: "Date de l\'événement", ar: "تاريخ الحدث" },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard:     { fr: "Tableau de bord",    ar: "لوحة التحكم" },
  activePlayers: { fr: "Joueurs actifs",     ar: "اللاعبون النشطون" },
  thisMonth:     { fr: "Ce mois",            ar: "هذا الشهر" },
  pendingReg:    { fr: "Inscriptions en attente", ar: "التسجيلات المعلقة" },
  totalExpenses: { fr: "Dépenses totales",   ar: "إجمالي المصاريف" },
  recentActivity:{ fr: "Activité récente",   ar: "النشاط الأخير" },

  // ── Settings ──────────────────────────────────────────────────────────────
  settings:      { fr: "Paramètres",         ar: "الإعدادات" },
  clubName:      { fr: "Nom du club",        ar: "اسم النادي" },
  president:     { fr: "Président",          ar: "الرئيس" },
  secretary:     { fr: "Secrétaire",         ar: "الكاتب العام" },
  bankName:      { fr: "Banque",             ar: "البنك" },
  rib:           { fr: "RIB",               ar: "رقم الحساب" },

  // ── Audit ─────────────────────────────────────────────────────────────────
  audit:         { fr: "Journal d\'audit",   ar: "سجل التدقيق" },
  CREATE:        { fr: "Création",           ar: "إنشاء" },
  UPDATE:        { fr: "Modification",       ar: "تعديل" },
  DELETE:        { fr: "Suppression",        ar: "حذف" },
  entity:        { fr: "Entité",             ar: "الكيان" },
  details:       { fr: "Détails",            ar: "التفاصيل" },
  user:          { fr: "Utilisateur",        ar: "المستخدم" },

  // ── Profile ───────────────────────────────────────────────────────────────
  profile:       { fr: "Mon profil",         ar: "ملفي الشخصي" },
  displayName:   { fr: "Nom affiché",        ar: "الاسم المعروض" },
  currentPwd:    { fr: "Mot de passe actuel", ar: "كلمة المرور الحالية" },
  newPwd:        { fr: "Nouveau mot de passe", ar: "كلمة المرور الجديدة" },
  logout:        { fr: "Déconnexion",        ar: "خروج" },

  // ── Tournaments ───────────────────────────────────────────────────────────
  tournaments:   { fr: "Tournois",           ar: "البطولات" },
  newTournament: { fr: "Créer un tournoi",   ar: "إنشاء بطولة" },
  PENDING:       { fr: "En attente",         ar: "في الانتظار" },
  CONFIRMED:     { fr: "Confirmé",           ar: "مؤكد" },
  REJECTED:      { fr: "Rejeté",             ar: "مرفوض" },
  registrations: { fr: "Inscriptions",       ar: "التسجيلات" },
  openReg:       { fr: "Inscriptions ouvertes", ar: "التسجيل مفتوح" },
  closedReg:     { fr: "Inscriptions fermées", ar: "التسجيل مغلق" },
} as const;

export type TKey = keyof typeof TRANSLATIONS;

export function useAdminT() {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = typeof window !== "undefined"
      ? (localStorage.getItem("admin-lang") as Lang | null)
      : null;
    if (stored === "ar" || stored === "fr") setLangState(stored);
  }, []);

  const t = (key: TKey): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[lang] ?? key;
  };

  const ar = lang === "ar";

  const setLang = (l: Lang) => {
    localStorage.setItem("admin-lang", l);
    setLangState(l);
  };

  return { t, lang, ar, setLang };
}
