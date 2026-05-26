export type ClubInfo = {
  nameFr: string;
  nameAr: string;
  abbr: string;
  president: string;
  secretary: string;
  address: string;
  phone: string;
  email: string;
  bankName: string;
  rib: string;
  season: string;
};

export const DEFAULT_CLUB: ClubInfo = {
  nameFr: "Wefak Sportive Hassanyat Madagh",
  nameAr: "الوفاق الرياضي الحسني لمداغ",
  abbr: "W.S.H.M",
  president: "Karim Bensouda",
  secretary: "Mohamed Bennasri",
  address: "Terrain Municipal, Madagh, Province de Berkane, Maroc",
  phone: "+212 661 290 000",
  email: "contact@wshm.ma",
  bankName: "Banque Populaire Berkane",
  rib: "101 015 21234567890 14",
  season: "2025-2026",
};

function printStyles(rtl = false) {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${rtl ? "'Cairo', 'Segoe UI', Arial, sans-serif" : "'Segoe UI', Arial, sans-serif"}; font-size: 13px; color: #1a1a1a; background: white; padding: 20px 30px; direction: ${rtl ? "rtl" : "ltr"}; }
    .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 14px; border-bottom: 3px solid #CC0000; margin-bottom: 24px; }
    .header-logo { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; }
    .header-logo img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; }
    .header-logo-text { font-size: 22px; font-weight: 900; color: #CC0000; letter-spacing: 1px; }
    .header-info { flex: 1; padding: 0 20px; text-align: center; }
    .header-name { font-size: 18px; font-weight: 800; color: #1a1a1a; }
    .header-sub { font-size: 11px; color: #CC0000; font-weight: 700; letter-spacing: 2px; margin-top: 3px; text-transform: uppercase; }
    .doc-title { text-align: center; margin: 0 0 22px; }
    .doc-title h1 { font-size: 20px; font-weight: 800; color: #CC0000; text-transform: uppercase; letter-spacing: 1px; }
    .doc-title p { font-size: 12px; color: #888; margin-top: 4px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 18px; }
    .meta-item { background: #f8f8f8; border-radius: 8px; padding: 8px 12px; border-${rtl ? "right" : "left"}: 3px solid #CC0000; }
    .meta-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
    .meta-value { font-size: 13px; font-weight: 600; color: #1a1a1a; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th { background: #1a1a1a; color: white; padding: 8px 10px; text-align: ${rtl ? "right" : "left"}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 7px 10px; border-bottom: 1px solid #eee; font-size: 12px; }
    tr:nth-child(even) td { background: #fafafa; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; }
    .badge-red { background: #fee2e2; color: #CC0000; }
    .badge-green { background: #dcfce7; color: #16a34a; }
    .section-title { font-size: 12px; font-weight: 800; color: #CC0000; text-transform: uppercase; letter-spacing: 1px; margin: 18px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #eee; }
    .total-row td { font-weight: 800; background: #1a1a1a !important; color: white; }
    .signature-area { display: flex; justify-content: space-between; margin-top: 48px; }
    .signature-box { text-align: center; width: 200px; }
    .signature-line { border-top: 1px solid #1a1a1a; margin-top: 50px; padding-top: 6px; font-size: 11px; color: #666; }
    .footer { margin-top: 32px; padding-top: 10px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 10px; color: #aaa; }
    .receipt-box { border: 2px solid #CC0000; border-radius: 12px; padding: 20px 24px; margin: 14px 0; }
    .amount-big { font-size: 32px; font-weight: 900; color: #CC0000; text-align: center; margin: 16px 0; }
    .gold { color: #C8A84B; }
    @media print { body { padding: 10px 15px; } @page { margin: 12mm; } }
  `;
}

function getHeader(club: ClubInfo, docTitle: string, docSubtitle?: string, rtl = false) {
  const name = rtl ? club.nameAr : club.nameFr.toUpperCase();
  return `
    <div class="header">
      <div class="header-logo">
        <span class="header-logo-text">${club.abbr}</span>
      </div>
      <div class="header-info">
        <div class="header-name">${name}</div>
        <div class="header-sub">${club.abbr} &middot; ${rtl ? "تأسست سنة 1956" : "Fondée en 1956"}</div>
      </div>
    </div>
    <div class="doc-title">
      <h1>${docTitle}</h1>
      ${docSubtitle ? `<p>${docSubtitle}</p>` : ""}
    </div>
  `;
}

function getFooter(club: ClubInfo, rtl = false) {
  const d = new Date().toLocaleDateString(rtl ? "ar-MA" : "fr-MA", { day: "2-digit", month: "long", year: "numeric" });
  return `
    <div class="footer">
      <span>${club.address}</span>
      <span>${club.phone} &middot; ${club.email}</span>
      <span>${rtl ? "طبع بتاريخ" : "Imprimé le"} ${d}</span>
    </div>
  `;
}

function openPrint(html: string, title: string, rtl = false) {
  const w = window.open("", "_blank");
  if (!w) { alert("Autorisez les popups pour imprimer."); return; }
  w.document.write(`<!DOCTYPE html><html lang="${rtl ? "ar" : "fr"}" dir="${rtl ? "rtl" : "ltr"}"><head><meta charset="UTF-8"><title>${title}</title>${rtl ? '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">' : ""}<style>${printStyles(rtl)}</style></head><body>${html}</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

// ─── MEETING ─────────────────────────────────────────────────────────────────
export function printMeeting(
  m: { title: string; meetingDate: string; location?: string | null; agenda?: string | null; decisions?: string | null; notes?: string | null; attendeeCount?: number | null },
  club = DEFAULT_CLUB,
  lang: "fr" | "ar" = "fr"
) {
  const rtl = lang === "ar";
  const date = new Date(m.meetingDate).toLocaleDateString(rtl ? "ar-MA" : "fr-MA", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const time = new Date(m.meetingDate).toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" });

  const L = {
    title: rtl ? "محضر الاجتماع" : "Procès-Verbal de Réunion",
    object: rtl ? "الموضوع" : "Objet",
    datetime: rtl ? "التاريخ والوقت" : "Date & Heure",
    location: rtl ? "المكان" : "Lieu",
    attendees: rtl ? "عدد الحاضرين" : "Nombre de présents",
    agenda: rtl ? "جدول الأعمال" : "Ordre du jour",
    decisions: rtl ? "القرارات المتخذة" : "Décisions prises",
    notes: rtl ? "ملاحظات" : "Notes & Observations",
    president: rtl ? "الرئيس" : "Le Président",
    secretary: rtl ? "الكاتب العام" : "Le Secrétaire Général",
    participants: rtl ? "مشاركون" : "participants",
    na: "—",
  };

  const agendaRows = (m.agenda ?? "").split("\n").filter(Boolean)
    .map((line, i) => `<tr><td style="width:30px;font-weight:700;color:#CC0000">${i + 1}</td><td>${line}</td></tr>`).join("");

  const decisionsRows = (m.decisions ?? "").split("\n").filter(Boolean)
    .map((line, i) => `<tr><td style="width:30px;font-weight:700;color:#16a34a">${i + 1}</td><td>${line}</td></tr>`).join("");

  const html = `
    ${getHeader(club, L.title, undefined, rtl)}
    <div class="meta-grid">
      <div class="meta-item"><div class="meta-label">${L.object}</div><div class="meta-value">${m.title}</div></div>
      <div class="meta-item"><div class="meta-label">${L.datetime}</div><div class="meta-value">${date} ${rtl ? "الساعة" : "à"} ${time}</div></div>
      <div class="meta-item"><div class="meta-label">${L.location}</div><div class="meta-value">${m.location ?? L.na}</div></div>
      <div class="meta-item"><div class="meta-label">${L.attendees}</div><div class="meta-value">${m.attendeeCount ?? L.na} ${L.participants}</div></div>
    </div>
    ${agendaRows ? `<div class="section-title">${L.agenda}</div><table>${agendaRows}</table>` : ""}
    ${decisionsRows ? `<div class="section-title">${L.decisions}</div><table>${decisionsRows}</table>` : ""}
    ${m.notes ? `<div class="section-title">${L.notes}</div><p style="padding:10px;background:#f8f8f8;border-radius:8px;line-height:1.7">${m.notes}</p>` : ""}
    <div class="signature-area">
      <div class="signature-box"><div class="signature-line">${L.president}<br/>${club.president}</div></div>
      <div class="signature-box"><div class="signature-line">${L.secretary}<br/>${club.secretary}</div></div>
    </div>
    ${getFooter(club, rtl)}
  `;
  openPrint(html, `PV — ${m.title}`, rtl);
}

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export function printAttendance(
  session: { sessionDate: string; sessionType: string; category: string; notes?: string | null },
  records: { playerName: string; jerseyNumber?: number | null; present: boolean; justification?: string | null }[],
  club = DEFAULT_CLUB,
  lang: "fr" | "ar" = "fr"
) {
  const rtl = lang === "ar";
  const date = new Date(session.sessionDate).toLocaleDateString(rtl ? "ar-MA" : "fr-MA", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const sorted = [...records].sort((a, b) => (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99));
  const presentCount = records.filter((r) => r.present).length;

  const L = {
    title: rtl ? "ورقة الحضور" : "Feuille de Présence",
    date: rtl ? "التاريخ" : "Date",
    type: rtl ? "نوع الجلسة" : "Type de session",
    category: rtl ? "الفئة" : "Catégorie",
    ratio: rtl ? "الحاضرون / المجموع" : "Présents / Total",
    num: rtl ? "ر" : "#",
    jersey: rtl ? "القميص" : "Maillot",
    name: rtl ? "اسم اللاعب" : "Nom du joueur",
    present: rtl ? "حاضر ✓" : "Présent ✓",
    absent: rtl ? "غائب ✗" : "Absent ✗",
    justif: rtl ? "المبرر" : "Justification",
    coach: rtl ? "المدرب" : "L'Entraîneur",
    admin: rtl ? "المسؤول الإداري" : "Responsable administratif",
  };

  const rows = sorted.map((r, i) => `
    <tr>
      <td style="text-align:center">${i + 1}</td>
      <td style="text-align:center;font-weight:700">${r.jerseyNumber ?? "—"}</td>
      <td>${r.playerName}</td>
      <td style="text-align:center;color:#16a34a;font-weight:700">${r.present ? "✓" : ""}</td>
      <td style="text-align:center;color:#CC0000;font-weight:700">${!r.present ? "✗" : ""}</td>
      <td>${r.justification ?? ""}</td>
    </tr>
  `).join("");

  const html = `
    ${getHeader(club, L.title, undefined, rtl)}
    <div class="meta-grid">
      <div class="meta-item"><div class="meta-label">${L.date}</div><div class="meta-value">${date}</div></div>
      <div class="meta-item"><div class="meta-label">${L.type}</div><div class="meta-value">${session.sessionType}</div></div>
      <div class="meta-item"><div class="meta-label">${L.category}</div><div class="meta-value">${session.category}</div></div>
      <div class="meta-item"><div class="meta-label">${L.ratio}</div><div class="meta-value">${presentCount} / ${records.length}</div></div>
    </div>
    <table>
      <thead><tr><th>${L.num}</th><th>${L.jersey}</th><th>${L.name}</th><th>${L.present}</th><th>${L.absent}</th><th>${L.justif}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${session.notes ? `<p style="font-size:11px;color:#888;margin-top:8px"><em>${session.notes}</em></p>` : ""}
    <div class="signature-area">
      <div class="signature-box"><div class="signature-line">${L.coach}</div></div>
      <div class="signature-box"><div class="signature-line">${L.admin}</div></div>
    </div>
    ${getFooter(club, rtl)}
  `;
  openPrint(html, `${L.title} — ${session.category} — ${date}`, rtl);
}

// ─── PAYMENT RECEIPT ─────────────────────────────────────────────────────────
export function printPaymentReceipt(
  p: { id: string; amount: string | number; paymentDate: string; paymentType: string; season: string; notes?: string | null },
  player: { fullName: string; category: string; licenseNumber?: string | null },
  club = DEFAULT_CLUB,
  lang: "fr" | "ar" = "fr"
) {
  const rtl = lang === "ar";
  const date = new Date(p.paymentDate).toLocaleDateString(rtl ? "ar-MA" : "fr-MA", { day: "2-digit", month: "long", year: "numeric" });
  const receiptNum = `WSHM-${new Date(p.paymentDate).getFullYear()}-${p.id.slice(-6).toUpperCase()}`;
  const typeFr: Record<string, string> = { COTISATION: "Cotisation annuelle", LICENCE: "Licence fédérale FRMF", EQUIPEMENT: "Équipements sportifs", AUTRE: "Divers" };
  const typeAr: Record<string, string> = { COTISATION: "الاشتراك السنوي", LICENCE: "الرخصة الفيدرالية", EQUIPEMENT: "المعدات الرياضية", AUTRE: "متنوع" };
  const typeLabels = rtl ? typeAr : typeFr;

  const L = {
    title: rtl ? "وصل الأداء" : "Reçu de Paiement",
    subtitle: `N° ${receiptNum}`,
    beneficiary: rtl ? "المستفيد" : "Bénéficiaire",
    category: rtl ? "الفئة" : "Catégorie",
    license: rtl ? "رقم الرخصة" : "N° Licence",
    date: rtl ? "التاريخ" : "Date",
    season: rtl ? "الموسم" : "Saison",
    object: rtl ? "موضوع الدفع" : "Objet du paiement",
    certify: rtl
      ? `يُشهد الموقع أسفله <strong>${club.president}</strong>، رئيس <strong>${club.nameAr} (${club.abbr})</strong>، بأنه استلم من <strong>${player.fullName}</strong> مبلغ <strong>${Number(p.amount).toLocaleString("ar-MA")} درهم</strong> بعنوان <em>${typeLabels[p.paymentType] ?? p.paymentType}</em> للموسم الرياضي <strong>${p.season}</strong>.`
      : `Le soussigné <strong>${club.president}</strong>, Président du <strong>${club.nameFr} (${club.abbr})</strong>, certifie avoir reçu de <strong>${player.fullName}</strong> la somme de <strong>${Number(p.amount).toLocaleString("fr-MA")} Dirhams</strong> au titre de <em>${typeLabels[p.paymentType] ?? p.paymentType}</em> pour la saison sportive <strong>${p.season}</strong>.`,
    member: rtl ? "العضو" : "Le membre",
    president: rtl ? "الرئيس" : "Le Président",
  };

  const html = `
    ${getHeader(club, L.title, L.subtitle, rtl)}
    <div class="receipt-box">
      <div class="meta-grid">
        <div class="meta-item"><div class="meta-label">${L.beneficiary}</div><div class="meta-value">${player.fullName}</div></div>
        <div class="meta-item"><div class="meta-label">${L.category}</div><div class="meta-value">${player.category}</div></div>
        <div class="meta-item"><div class="meta-label">${L.license}</div><div class="meta-value">${player.licenseNumber ?? "—"}</div></div>
        <div class="meta-item"><div class="meta-label">${L.date}</div><div class="meta-value">${date}</div></div>
        <div class="meta-item"><div class="meta-label">${L.season}</div><div class="meta-value">${p.season}</div></div>
        <div class="meta-item"><div class="meta-label">${L.object}</div><div class="meta-value">${typeLabels[p.paymentType] ?? p.paymentType}</div></div>
      </div>
      <div class="amount-big">${Number(p.amount).toLocaleString("fr-MA")} MAD</div>
      ${p.notes ? `<p style="text-align:center;font-size:12px;color:#888;margin-top:-8px">${p.notes}</p>` : ""}
    </div>
    <p style="margin:16px 0;font-size:12px;color:#666;line-height:1.9">${L.certify}</p>
    <div class="signature-area">
      <div class="signature-box"><div class="signature-line">${L.member}<br/>${player.fullName}</div></div>
      <div class="signature-box"><div class="signature-line">${L.president}<br/>${club.president}</div></div>
    </div>
    ${getFooter(club, rtl)}
  `;
  openPrint(html, `${rtl ? "وصل" : "Reçu"} — ${player.fullName}`, rtl);
}

// ─── SPONSOR RECEIPT ─────────────────────────────────────────────────────────
export function printSponsorReceipt(
  s: { name: string; amount: string | number; tier?: string; startDate: string; endDate?: string | null; notes?: string | null },
  club = DEFAULT_CLUB,
  lang: "fr" | "ar" = "fr"
) {
  const rtl = lang === "ar";
  const date = new Date(s.startDate).toLocaleDateString(rtl ? "ar-MA" : "fr-MA", { day: "2-digit", month: "long", year: "numeric" });
  const endDate = s.endDate ? new Date(s.endDate).toLocaleDateString(rtl ? "ar-MA" : "fr-MA", { day: "2-digit", month: "long", year: "numeric" }) : (rtl ? "مفتوحة" : "Durée indéterminée");
  const receiptNum = `WSHM-SPO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

  const motivText = rtl
    ? `يتقدم <strong>${club.nameAr}</strong> بجزيل الشكر والامتنان لـ<strong>${s.name}</strong> على ثقته ودعمه القيّم لتطوير كرة القدم بمداغ. بفضل شركاء كم، نستطيع تكوين الشباب وتمثيل منطقتنا بفخر، واستمرار 70 سنة من الشغف بالرياضة الملكية. <span class="gold">اسمكم مرتبط بتاريخنا.</span>`
    : `Le <strong>${club.nameFr}</strong> tient à exprimer sa profonde gratitude à <strong>${s.name}</strong> pour sa confiance et son précieux soutien au développement du football à Madagh. Grâce à des partenaires comme vous, nous formons la jeunesse et représentons notre région avec fierté. <span class="gold">Votre nom est associé à notre histoire.</span>`;

  const L = {
    title: rtl ? "شهادة الشراكة" : "Attestation de Partenariat",
    partner: rtl ? "الشريك" : "Partenaire",
    start: rtl ? "تاريخ البداية" : "Date de début",
    end: rtl ? "تاريخ النهاية" : "Date de fin",
    season: rtl ? "الموسم" : "Saison",
    bank: rtl ? "تحويل بنكي" : "Coordonnées bancaires pour virement",
    signPartner: rtl ? "الشريك" : "Le Partenaire",
    signPresident: rtl ? "الرئيس" : "Le Président",
  };

  const html = `
    ${getHeader(club, L.title, `N° ${receiptNum}`, rtl)}
    <div class="receipt-box">
      <div class="meta-grid">
        <div class="meta-item"><div class="meta-label">${L.partner}</div><div class="meta-value">${s.name}</div></div>
        <div class="meta-item"><div class="meta-label">${L.season}</div><div class="meta-value">${club.season}</div></div>
        <div class="meta-item"><div class="meta-label">${L.start}</div><div class="meta-value">${date}</div></div>
        <div class="meta-item"><div class="meta-label">${L.end}</div><div class="meta-value">${endDate}</div></div>
      </div>
      <div class="amount-big">${Number(s.amount).toLocaleString("fr-MA")} MAD</div>
    </div>
    <div style="margin:18px 0;padding:16px;background:#1a1a1a;border-radius:10px;color:#f0f0f0;font-size:13px;line-height:1.9">${motivText}</div>
    ${s.notes ? `<p style="font-size:12px;color:#666;margin:10px 0"><em>${s.notes}</em></p>` : ""}
    <div style="font-size:11px;color:#888;margin:14px 0;padding:10px;background:#f8f8f8;border-radius:8px">
      <strong>${L.bank} :</strong> ${club.bankName} · RIB : ${club.rib}
    </div>
    <div class="signature-area">
      <div class="signature-box"><div class="signature-line">${L.signPartner}<br/>${s.name}</div></div>
      <div class="signature-box"><div class="signature-line">${L.signPresident}<br/>${club.president}</div></div>
    </div>
    ${getFooter(club, rtl)}
  `;
  openPrint(html, `${rtl ? "شهادة" : "Attestation"} — ${s.name}`, rtl);
}

// ─── PLAYER DOCUMENT HELPERS ─────────────────────────────────────────────────

type PlayerDoc = {
  fullName: string;
  category: string;
  birthDate?: string | null;
  position?: string | null;
  licenseNumber?: string | null;
  cin?: string | null;
  phone?: string | null;
  address?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
  jerseyNumber?: number | null;
};

function fmtDate(d: string | null | undefined, rtl: boolean) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(rtl ? "ar-MA" : "fr-MA", { day: "2-digit", month: "2-digit", year: "numeric" });
}

type GridLabels = {
  fullName: string; category: string; birthDate: string; position: string;
  jersey: string; license: string; phone: string; cin: string;
  address: string; parentName: string; parentPhone: string;
  [key: string]: unknown;
};

function playerInfoGrid(player: PlayerDoc, rtl: boolean, L: GridLabels) {
  const minor = ["MINIMES", "CADETS", "JUNIORS"].includes(player.category);
  return `
    <div class="meta-grid">
      <div class="meta-item"><div class="meta-label">${L.fullName}</div><div class="meta-value">${player.fullName}</div></div>
      <div class="meta-item"><div class="meta-label">${L.category}</div><div class="meta-value">${player.category}</div></div>
      <div class="meta-item"><div class="meta-label">${L.birthDate}</div><div class="meta-value">${fmtDate(player.birthDate, rtl)}</div></div>
      <div class="meta-item"><div class="meta-label">${L.position}</div><div class="meta-value">${player.position ?? "—"}</div></div>
      <div class="meta-item"><div class="meta-label">${L.jersey}</div><div class="meta-value">${player.jerseyNumber ?? "—"}</div></div>
      <div class="meta-item"><div class="meta-label">${L.license}</div><div class="meta-value">${player.licenseNumber ?? "—"}</div></div>
      <div class="meta-item"><div class="meta-label">${L.phone}</div><div class="meta-value">${player.phone ?? "—"}</div></div>
      ${!minor ? `<div class="meta-item"><div class="meta-label">${L.cin}</div><div class="meta-value">${player.cin ?? "—"}</div></div>` : ""}
      ${player.address ? `<div class="meta-item" style="grid-column:1/-1"><div class="meta-label">${L.address}</div><div class="meta-value">${player.address}</div></div>` : ""}
      ${minor && player.parentName ? `<div class="meta-item"><div class="meta-label">${L.parentName}</div><div class="meta-value">${player.parentName}</div></div>` : ""}
      ${minor && player.parentPhone ? `<div class="meta-item"><div class="meta-label">${L.parentPhone}</div><div class="meta-value">${player.parentPhone}</div></div>` : ""}
    </div>
  `;
}

function signaturesBlock(sigA: string, sigB: string, sigC?: string) {
  const today = new Date().toLocaleDateString("fr-MA", { day: "2-digit", month: "long", year: "numeric" });
  const boxes = [sigA, sigB, ...(sigC ? [sigC] : [])].map((label) => `
    <div class="signature-box" style="width:${sigC ? "160px" : "200px"}">
      <div style="font-size:11px;color:#888;margin-bottom:4px">${label}</div>
      <div class="signature-line" style="font-size:11px;color:#666">Signature</div>
    </div>
  `).join("");
  return `
    <p style="font-size:11px;color:#888;margin:24px 0 8px">Fait le : ${today}</p>
    <div class="signature-area">${boxes}</div>
  `;
}

// ─── 1. FICHE D'ENGAGEMENT ────────────────────────────────────────────────────
export function printPlayerEngagement(player: PlayerDoc, club = DEFAULT_CLUB, lang: "fr" | "ar" = "fr") {
  const rtl = lang === "ar";

  const L = rtl ? {
    title: "وثيقة الالتزام",
    subtitle: "التزام اللاعب",
    fullName: "الاسم الكامل",
    category: "الفئة",
    birthDate: "تاريخ الميلاد",
    position: "المركز",
    jersey: "رقم القميص",
    license: "رقم الرخصة",
    phone: "الهاتف",
    cin: "رقم الهوية",
    address: "العنوان",
    parentName: "اسم الولي",
    parentPhone: "هاتف الولي",
    commitTitle: "نص الالتزام",
    commitText: `أنا الموقع أسفله <strong>${player.fullName}</strong>، المنخرط في فئة <strong>${player.category}</strong> بـ<strong>${club.nameAr} (${club.abbr})</strong>، أتعهد بما يلي:`,
    clauses: [
      "احترام النظام الداخلي للنادي وجميع قواراته.",
      "الحضور المنتظم في التدريبات والمباريات الرسمية.",
      "الالتزام بروح الفريق وقيم اللعب النظيف.",
      "الامتثال لتعليمات الإداريين والمدربين.",
      "أداء الاشتراك السنوي في الآجال المحددة.",
      "الإبلاغ عن أي إصابة أو غياب مبرر في أقرب وقت ممكن.",
    ],
    player: "اللاعب",
    parent: "الولي / المُمثل القانوني",
    president: "رئيس النادي",
  } : {
    title: "Fiche d'Engagement",
    subtitle: "Engagement du joueur",
    fullName: "Nom complet",
    category: "Catégorie",
    birthDate: "Date de naissance",
    position: "Poste",
    jersey: "N° Maillot",
    license: "N° Licence",
    phone: "Téléphone",
    cin: "CIN",
    address: "Adresse",
    parentName: "Nom du tuteur",
    parentPhone: "Tél. tuteur",
    commitTitle: "Texte d'engagement",
    commitText: `Je soussigné(e) <strong>${player.fullName}</strong>, inscrit(e) en catégorie <strong>${player.category}</strong> au sein du <strong>${club.nameFr} (${club.abbr})</strong>, m'engage solennellement à :`,
    clauses: [
      "Respecter le règlement intérieur du club et toutes ses dispositions.",
      "Assister régulièrement aux entraînements et aux matchs officiels.",
      "Faire preuve d'esprit d'équipe et de fair-play en toutes circonstances.",
      "Me conformer aux instructions des encadrants et du staff technique.",
      "M'acquitter de la cotisation annuelle dans les délais impartis.",
      "Signaler toute blessure ou absence justifiée dans les meilleurs délais.",
    ],
    player: "Le Joueur / La Joueuse",
    parent: "Le Parent / Tuteur légal",
    president: "Le Président du Club",
  };

  const minor = ["MINIMES", "CADETS", "JUNIORS"].includes(player.category);
  const clauseList = L.clauses.map((c, i) => `<li style="margin-bottom:6px"><span style="color:#CC0000;font-weight:700">${i + 1}.</span> ${c}</li>`).join("");

  const html = `
    ${getHeader(club, L.title, L.subtitle, rtl)}
    ${playerInfoGrid(player, rtl, L)}
    <div class="section-title">${L.commitTitle}</div>
    <div style="background:#f8f8f8;border-radius:8px;padding:16px 20px;margin-bottom:8px">
      <p style="margin-bottom:12px;font-size:13px;line-height:1.7">${L.commitText}</p>
      <ol style="padding-${rtl ? "right" : "left"}:18px;font-size:13px;line-height:1.9;list-style:none">
        ${clauseList}
      </ol>
    </div>
    ${minor
      ? signaturesBlock(L.player, L.parent, L.president)
      : signaturesBlock(L.player, L.president)
    }
    ${getFooter(club, rtl)}
  `;
  openPrint(html, `${rtl ? "وثيقة الالتزام" : "Engagement"} — ${player.fullName}`, rtl);
}

// ─── 2. DEMANDE DE LICENCE FRMF ───────────────────────────────────────────────
export function printPlayerLicense(player: PlayerDoc, season: string, club = DEFAULT_CLUB, lang: "fr" | "ar" = "fr") {
  const rtl = lang === "ar";

  const L = rtl ? {
    title: "طلب رخصة",
    subtitle: `الموسم الرياضي ${season}`,
    fullName: "الاسم الكامل",
    category: "الفئة",
    birthDate: "تاريخ الميلاد",
    position: "المركز",
    jersey: "رقم القميص",
    license: "رقم الرخصة الحالية",
    phone: "الهاتف",
    cin: "رقم الهوية",
    address: "العنوان",
    parentName: "اسم الولي",
    parentPhone: "هاتف الولي",
    licTypeTitle: "نوع الرخصة",
    types: ["هاوٍ (Amateur)", "محترف (Professionnel)"],
    club: "اسم النادي",
    season: "الموسم",
    federation: "الجامعة الملكية المغربية لكرة القدم (FRMF)",
    declarationTitle: "إقرار",
    declarationText: "أصرح بأن المعلومات المدرجة في هذا الطلب صحيحة، وأنني على علم بالنظام الأساسي والأنظمة الداخلية للجامعة.",
    player: "اللاعب",
    president: "رئيس النادي",
    stamp: "خاتم النادي",
  } : {
    title: "Demande de Licence FRMF",
    subtitle: `Saison sportive ${season}`,
    fullName: "Nom complet",
    category: "Catégorie",
    birthDate: "Date de naissance",
    position: "Poste",
    jersey: "N° Maillot",
    license: "N° Licence actuelle",
    phone: "Téléphone",
    cin: "CIN",
    address: "Adresse",
    parentName: "Nom du tuteur",
    parentPhone: "Tél. tuteur",
    licTypeTitle: "Type de licence",
    types: ["Amateur", "Professionnel"],
    club: "Nom du club",
    season: "Saison",
    federation: "Fédération Royale Marocaine de Football (FRMF)",
    declarationTitle: "Déclaration",
    declarationText: "Je certifie l'exactitude des informations portées sur cette demande et déclare avoir pris connaissance des statuts et règlements de la Fédération.",
    player: "Le Joueur / La Joueuse",
    president: "Le Président du Club",
    stamp: "Cachet du club",
  };

  const checkboxes = L.types.map((t) => `
    <span style="margin-${rtl ? "left" : "right"}:20px;font-size:13px">
      <span style="display:inline-block;width:14px;height:14px;border:2px solid #1a1a1a;border-radius:3px;vertical-align:middle;margin-${rtl ? "left" : "right"}:5px"></span>
      ${t}
    </span>
  `).join("");

  const html = `
    ${getHeader(club, L.title, L.subtitle, rtl)}
    <div style="text-align:center;font-size:11px;color:#888;margin-bottom:16px;font-style:italic">${L.federation}</div>
    ${playerInfoGrid(player, rtl, L)}
    <div class="section-title">${L.licTypeTitle}</div>
    <div style="background:#f8f8f8;border-radius:8px;padding:12px 16px;margin-bottom:14px">${checkboxes}</div>
    <div class="meta-grid" style="margin-bottom:18px">
      <div class="meta-item"><div class="meta-label">${L.club}</div><div class="meta-value">${rtl ? club.nameAr : club.nameFr}</div></div>
      <div class="meta-item"><div class="meta-label">${L.season}</div><div class="meta-value">${season}</div></div>
    </div>
    <div class="section-title">${L.declarationTitle}</div>
    <div style="background:#f8f8f8;border-radius:8px;padding:12px 16px;margin-bottom:14px;font-size:12px;line-height:1.7;color:#444">
      ${L.declarationText}
    </div>
    <div style="margin-top:36px;display:flex;justify-content:space-between;align-items:flex-end">
      <div style="text-align:center;width:180px">
        <div style="font-size:11px;color:#888;margin-bottom:4px">${L.player}</div>
        <div style="border-top:1px solid #1a1a1a;margin-top:50px;padding-top:6px;font-size:11px;color:#666">Signature</div>
      </div>
      <div style="text-align:center;width:160px">
        <div style="font-size:11px;color:#888;margin-bottom:4px">${L.stamp}</div>
        <div style="border:1px dashed #bbb;height:70px;border-radius:8px;margin-bottom:6px"></div>
      </div>
      <div style="text-align:center;width:180px">
        <div style="font-size:11px;color:#888;margin-bottom:4px">${L.president}</div>
        <div style="border-top:1px solid #1a1a1a;margin-top:50px;padding-top:6px;font-size:11px;color:#666">Signature</div>
      </div>
    </div>
    ${getFooter(club, rtl)}
  `;
  openPrint(html, `${rtl ? "طلب رخصة" : "Licence FRMF"} — ${player.fullName}`, rtl);
}

// ─── 3. FICHE D'IDENTITÉ JOUEUR ───────────────────────────────────────────────
export function printPlayerIdentity(player: PlayerDoc, club = DEFAULT_CLUB, lang: "fr" | "ar" = "fr") {
  const rtl = lang === "ar";
  const minor = ["MINIMES", "CADETS", "JUNIORS"].includes(player.category);

  const L = rtl ? {
    title: "بطاقة تعريف اللاعب",
    subtitle: "وثيقة رسمية للنادي",
    fullName: "الاسم الكامل",
    category: "الفئة",
    birthDate: "تاريخ الميلاد",
    position: "المركز",
    jersey: "رقم القميص",
    license: "رقم الرخصة",
    phone: "الهاتف",
    cin: "رقم الهوية",
    address: "العنوان",
    parentName: "اسم الولي",
    parentPhone: "هاتف الولي",
    photo: "الصورة",
    sportInfo: "المعلومات الرياضية",
    contactInfo: "معلومات الاتصال",
    guardianInfo: "معلومات الولي",
    player: "اللاعب",
    president: "رئيس النادي",
  } : {
    title: "Fiche d'Identité Joueur",
    subtitle: "Document officiel du club",
    fullName: "Nom complet",
    category: "Catégorie",
    birthDate: "Date de naissance",
    position: "Poste",
    jersey: "N° Maillot",
    license: "N° Licence FRMF",
    phone: "Téléphone",
    cin: "CIN",
    address: "Adresse",
    parentName: "Nom du tuteur",
    parentPhone: "Tél. tuteur",
    photo: "Photo",
    sportInfo: "Informations sportives",
    contactInfo: "Coordonnées",
    guardianInfo: "Tuteur légal",
    player: "Le Joueur / La Joueuse",
    president: "Le Président du Club",
  };

  const row = (label: string, value?: string | null) => value
    ? `<tr><td style="color:#888;font-size:11px;padding:5px 8px;width:40%">${label}</td><td style="font-size:13px;font-weight:600;padding:5px 8px">${value}</td></tr>`
    : "";

  const html = `
    ${getHeader(club, L.title, L.subtitle, rtl)}
    <div style="display:flex;gap:24px;margin-bottom:20px;align-items:flex-start">
      <!-- Photo placeholder -->
      <div style="flex-shrink:0;text-align:center">
        <div style="width:110px;height:130px;border:2px solid #CC0000;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#f8f8f8;flex-direction:column;gap:6px">
          <div style="font-size:28px;color:#ddd">&#128100;</div>
          <div style="font-size:10px;color:#bbb">${L.photo}</div>
        </div>
        <div style="margin-top:8px;font-size:10px;color:#888;text-align:center">
          ${rtl ? "ختم النادي" : "Cachet du club"}
        </div>
        <div style="border:1px dashed #ccc;border-radius:6px;height:40px;margin-top:4px"></div>
      </div>
      <!-- Details -->
      <div style="flex:1">
        <div style="background:#1a1a1a;color:white;padding:8px 12px;border-radius:6px;margin-bottom:8px">
          <div style="font-size:15px;font-weight:800">${player.fullName}</div>
          <div style="font-size:11px;color:#aaa;margin-top:2px">${player.category} ${player.position ? `· ${player.position}` : ""} ${player.jerseyNumber ? `· #${player.jerseyNumber}` : ""}</div>
        </div>
        <table style="width:100%;border-collapse:collapse">
          ${row(L.birthDate, fmtDate(player.birthDate, rtl))}
          ${!minor ? row(L.cin, player.cin) : ""}
          ${row(L.license, player.licenseNumber)}
          ${row(L.phone, player.phone)}
          ${row(L.address, player.address)}
        </table>
      </div>
    </div>
    ${minor && (player.parentName || player.parentPhone) ? `
      <div class="section-title">${L.guardianInfo}</div>
      <div class="meta-grid">
        ${player.parentName ? `<div class="meta-item"><div class="meta-label">${L.parentName}</div><div class="meta-value">${player.parentName}</div></div>` : ""}
        ${player.parentPhone ? `<div class="meta-item"><div class="meta-label">${L.parentPhone}</div><div class="meta-value">${player.parentPhone}</div></div>` : ""}
      </div>
    ` : ""}
    ${signaturesBlock(L.player, L.president)}
    ${getFooter(club, rtl)}
  `;
  openPrint(html, `${rtl ? "بطاقة تعريف" : "Identité"} — ${player.fullName}`, rtl);
}

// ─── 4. CONTRAT DE JOUEUR ─────────────────────────────────────────────────────
export function printPlayerContract(player: PlayerDoc, season: string, club = DEFAULT_CLUB, lang: "fr" | "ar" = "fr") {
  const rtl = lang === "ar";

  const L = rtl ? {
    title: "عقد لاعب",
    subtitle: `الموسم الرياضي ${season}`,
    fullName: "الاسم الكامل",
    category: "الفئة",
    birthDate: "تاريخ الميلاد",
    position: "المركز",
    jersey: "رقم القميص",
    license: "رقم الرخصة",
    phone: "الهاتف",
    cin: "رقم الهوية",
    address: "العنوان",
    parentName: "اسم الولي",
    parentPhone: "هاتف الولي",
    preamble: `يُبرم هذا العقد بين <strong>${club.nameAr} (${club.abbr})</strong> ممثَّلاً برئيسه السيد <strong>${club.president}</strong>، من جهة، واللاعب <strong>${player.fullName}</strong> المنخرط في فئة <strong>${player.category}</strong>، من جهة أخرى.`,
    clausesTitle: "بنود العقد",
    clauses: [
      { title: "التزامات اللاعب", body: "يلتزم اللاعب بالمشاركة في التدريبات والمباريات الرسمية، والامتثال التام لتعليمات الطاقم التقني والإداري، والحفاظ على صورة النادي داخل وخارج الملاعب." },
      { title: "مدة العقد", body: `يسري هذا العقد طيلة الموسم الرياضي <strong>${season}</strong>، ويمكن تجديده باتفاق الطرفين قبل نهاية الموسم بثلاثة أشهر على الأقل.` },
      { title: "المكافأة", body: "لا تترتب على هذا العقد أي مكافأة مالية. يبقى اللاعب في وضع هاوٍ وفق تعريف الجامعة الملكية المغربية لكرة القدم (FRMF)." },
      { title: "الانضباط", body: "يخضع اللاعب للنظام التأديبي الداخلي للنادي. يُمكن توقيف اللاعب مؤقتاً أو فسخ عقده في حال ارتكابه مخالفة جسيمة." },
      { title: "فسخ العقد", body: "يحق لأي من الطرفين فسخ هذا العقد بإشعار كتابي مسبق مدته خمسة عشر (15) يوماً، مع الالتزام بتسوية جميع الديون المستحقة." },
      { title: "التوقيعات", body: "وقَّع الطرفان على هذا العقد دلالةً على موافقتهما التامة على جميع بنوده." },
    ],
    player: "اللاعب",
    president: "رئيس النادي",
    witness: "الشاهد",
  } : {
    title: "Contrat de Joueur",
    subtitle: `Saison sportive ${season}`,
    fullName: "Nom complet",
    category: "Catégorie",
    birthDate: "Date de naissance",
    position: "Poste",
    jersey: "N° Maillot",
    license: "N° Licence",
    phone: "Téléphone",
    cin: "CIN",
    address: "Adresse",
    parentName: "Nom du tuteur",
    parentPhone: "Tél. tuteur",
    preamble: `Le présent contrat est conclu entre le <strong>${club.nameFr} (${club.abbr})</strong>, représenté par son Président M. <strong>${club.president}</strong>, d'une part, et le joueur <strong>${player.fullName}</strong>, inscrit en catégorie <strong>${player.category}</strong>, d'autre part.`,
    clausesTitle: "Clauses du contrat",
    clauses: [
      { title: "Art. 1 — Obligations du joueur", body: "Le joueur s'engage à participer aux entraînements et matchs officiels, à se conformer aux instructions du staff technique et administratif, et à préserver l'image du club en tout lieu et en toute circonstance." },
      { title: "Art. 2 — Durée", body: `Le présent contrat est valable pour la saison sportive <strong>${season}</strong>. Il est renouvelable par accord mutuel des parties au moins trois mois avant la fin de la saison.` },
      { title: "Art. 3 — Rémunération", body: "Le présent contrat ne prévoit aucune rémunération financière. Le joueur conserve le statut d'amateur au sens des règlements de la Fédération Royale Marocaine de Football (FRMF)." },
      { title: "Art. 4 — Discipline", body: "Le joueur est soumis au règlement disciplinaire interne du club. Une suspension temporaire ou une résiliation peut être prononcée en cas de manquement grave aux obligations contractuelles." },
      { title: "Art. 5 — Résiliation", body: "Chaque partie peut résilier le présent contrat par notification écrite avec un préavis de quinze (15) jours, sous réserve de l'apurement de toutes dettes éventuelles." },
      { title: "Art. 6 — Signatures", body: "Les parties soussignées déclarent avoir pris connaissance et accepté sans réserve l'ensemble des clauses du présent contrat." },
    ],
    player: "Le Joueur / La Joueuse",
    president: "Le Président du Club",
    witness: "Témoin",
  };

  const clauseHtml = L.clauses.map((c) => `
    <div style="margin-bottom:14px">
      <div style="font-size:12px;font-weight:800;color:#1a1a1a;margin-bottom:4px">${c.title}</div>
      <div style="font-size:12px;color:#444;line-height:1.8;background:#f8f8f8;border-radius:6px;padding:8px 12px;border-${rtl ? "right" : "left"}:3px solid #CC0000">${c.body}</div>
    </div>
  `).join("");

  const minor = ["MINIMES", "CADETS", "JUNIORS"].includes(player.category);
  const html = `
    ${getHeader(club, L.title, L.subtitle, rtl)}
    ${playerInfoGrid(player, rtl, L)}
    <div style="font-size:13px;line-height:1.8;color:#444;margin-bottom:18px;padding:12px 16px;background:#f0f0f0;border-radius:8px">
      ${L.preamble}
    </div>
    <div class="section-title">${L.clausesTitle}</div>
    ${clauseHtml}
    ${minor
      ? signaturesBlock(L.player, L.president, L.witness)
      : signaturesBlock(L.player, L.president)
    }
    ${getFooter(club, rtl)}
  `;
  openPrint(html, `${rtl ? "عقد لاعب" : "Contrat"} — ${player.fullName}`, rtl);
}

// ─── EXPENSE REPORT ───────────────────────────────────────────────────────────
export function printExpenseReport(
  expenses: { category: string; description: string; amount: string | number; expenseDate: string; vendor?: string | null; paidBy?: string | null }[],
  season: string,
  club = DEFAULT_CLUB,
  lang: "fr" | "ar" = "fr"
) {
  const rtl = lang === "ar";
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const catFr: Record<string, string> = { TRANSPORT: "Transport", ALIMENTATION: "Alimentation", DEPLACEMENT: "Déplacement", SALAIRES: "Salaires coaches", EQUIPEMENT: "Équipements", ARBITRAGE: "Arbitrage", ADMINISTRATION: "Administration", AUTRE: "Divers" };
  const catAr: Record<string, string> = { TRANSPORT: "النقل", ALIMENTATION: "التغذية", DEPLACEMENT: "التنقل", SALAIRES: "رواتب المدربين", EQUIPEMENT: "المعدات", ARBITRAGE: "التحكيم", ADMINISTRATION: "الإدارة", AUTRE: "متنوع" };
  const catLabel = rtl ? catAr : catFr;

  const L = {
    title: rtl ? "تقرير المصاريف" : "Rapport des Dépenses",
    subtitle: `${rtl ? "الموسم" : "Saison"} ${season}`,
    num: rtl ? "ر" : "#",
    date: rtl ? "التاريخ" : "Date",
    category: rtl ? "الفئة" : "Catégorie",
    desc: rtl ? "الوصف" : "Description",
    vendor: rtl ? "المورد" : "Fournisseur",
    amount: rtl ? "المبلغ" : "Montant",
    total: rtl ? "المجموع" : "TOTAL DÉPENSES",
    treasurer: rtl ? "الخازن" : "Le Trésorier",
    president: rtl ? "الرئيس" : "Le Président",
  };

  const rows = [...expenses]
    .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())
    .map((e, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${new Date(e.expenseDate).toLocaleDateString(rtl ? "ar-MA" : "fr-MA")}</td>
        <td><span class="badge badge-red">${catLabel[e.category] ?? e.category}</span></td>
        <td>${e.description}</td>
        <td>${e.vendor ?? "—"}</td>
        <td style="text-align:right;font-weight:700">${Number(e.amount).toLocaleString("fr-MA")} MAD</td>
      </tr>
    `).join("");

  const html = `
    ${getHeader(club, L.title, L.subtitle, rtl)}
    <table>
      <thead><tr><th>${L.num}</th><th>${L.date}</th><th>${L.category}</th><th>${L.desc}</th><th>${L.vendor}</th><th>${L.amount}</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr class="total-row"><td colspan="5">${L.total}</td><td style="text-align:right">${total.toLocaleString("fr-MA")} MAD</td></tr></tfoot>
    </table>
    <div class="signature-area">
      <div class="signature-box"><div class="signature-line">${L.treasurer}</div></div>
      <div class="signature-box"><div class="signature-line">${L.president}<br/>${club.president}</div></div>
    </div>
    ${getFooter(club, rtl)}
  `;
  openPrint(html, `${rtl ? "تقرير المصاريف" : "Rapport dépenses"} ${season}`, rtl);
}
