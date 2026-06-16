"use client";

import { useState, useEffect, useCallback } from "react";
import ForbiddenBanner from "@/components/admin/ForbiddenBanner";
import { useAdminT } from "@/lib/adminT";
import ImageUploader from "@/components/admin/ImageUploader";
import { swal } from "@/lib/swal";
import {
  printPlayerEngagement,
  printPlayerLicense,
  printPlayerIdentity,
  printPlayerContract,
} from "@/lib/print";
import { IconPlus as Plus, IconPencil as Pencil, IconTrash as Trash2, IconUser as User, IconSearch as Search, IconX as X, IconPhone as Phone, IconMapPin as MapPin, IconCreditCard as CreditCard, IconCalendar as Calendar, IconShield as Shield, IconAward as Award, IconAlertCircle as AlertCircle, IconCircleCheckFilled as CheckCircle2, IconChevronRight as ChevronRight, IconStethoscope as Stethoscope, IconUsers as Users, IconFileText as FileText, IconPrinter as Printer, IconGitCompare as GitCompare, IconTarget as Target, IconFlag as Flag, IconBolt as Zap } from "@tabler/icons-react";
import { usePagination } from "@/lib/usePagination";
import Pagination from "@/components/ui/Pagination";

type Payment = {
  id: string;
  amount: string | number;
  paymentDate: string;
  paymentType: string;
  season: string;
  notes: string | null;
};

type PlayerStat = {
  id: string;
  season: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number | null;
};

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
  isActive: boolean;
  cin: string | null;
  nationality: string | null;
  address: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentCin: string | null;
  medicalDate: string | null;
  notes: string | null;
  payments?: Payment[];
  stats?: PlayerStat[];
};

const EMPTY: Omit<Player, "id" | "payments"> = {
  fullName: "", photoUrl: null, category: "SENIORS", position: "",
  jerseyNumber: null, licenseNumber: "", birthDate: null, phone: "",
  isActive: true, cin: "", nationality: "Marocaine", address: "",
  parentName: "", parentPhone: "", parentCin: "", medicalDate: null, notes: "",
};

const CATEGORIES = ["MINIMES", "CADETS", "JUNIORS", "SENIORS"];
const CAT_COLORS: Record<string, string> = {
  SENIORS: "bg-blue-100 text-blue-700",
  JUNIORS: "bg-green-100 text-green-700",
  CADETS:  "bg-orange-100 text-orange-700",
  MINIMES: "bg-purple-100 text-purple-700",
};
const TYPE_LABELS: Record<string, string> = {
  COTISATION: "Cotisation", LICENCE: "Licence", EQUIPEMENT: "Équipement", AUTRE: "Autre",
};
const isMinor = (cat: string) => ["MINIMES", "CADETS", "JUNIORS"].includes(cat);

function fmt(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-MA", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtAmount(amount: string | number) {
  return Number(amount).toLocaleString("fr-MA") + " MAD";
}
function age(birthDate: string | null) {
  if (!birthDate) return null;
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function AdminPlayersPage() {
  const { t, ar } = useAdminT();
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterPaid, setFilterPaid] = useState("");
  const [drawer, setDrawer] = useState<Player | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<Player | null>(null);
  const [compareB, setCompareB] = useState<Player | null>(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState<Omit<Player, "id" | "payments">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [printLang, setPrintLang] = useState<"fr" | "ar">("fr");

  const CURRENT_SEASON = "2025-2026";

  const load = useCallback(() => {
    fetch("/api/players").then((r) => r.json()).then(setPlayers);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDrawer = async (p: Player) => {
    setDrawer(p);
    setDrawerLoading(true);
    const res = await fetch(`/api/players/${p.id}`);
    const full = await res.json();
    setDrawer(full);
    setDrawerLoading(false);
  };

  const openNew = () => { setEditing(null); setForm({ ...EMPTY }); setModal(true); };
  const openEdit = (p: Player) => {
    setEditing(p);
    // Spread only plain scalar fields — exclude Prisma relations and id
    const { stats: _s, payments: _p, ...fields } = p as Player & { id?: string };
    setForm(fields as typeof EMPTY);
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/players/${editing.id}` : "/api/players";
    // Strip any relation arrays and id that might have crept in; coerce optional fields
    const { id: _id, stats: _s, payments: _p, attendanceRecords: _ar, ...clean } = form as Record<string, unknown>;
    const body = {
      ...clean,
      jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : null,
      licenseNumber: form.licenseNumber || null,
      phone: form.phone || null,
      cin: form.cin || null,
      address: form.address || null,
      parentName: form.parentName || null,
      parentPhone: form.parentPhone || null,
      parentCin: form.parentCin || null,
      notes: form.notes || null,
      position: form.position || null,
    };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (!res.ok) { swal.error("Erreur", "Échec de l'enregistrement. Vérifiez que le numéro de licence est unique."); return; }
    setModal(false);
    load();
    swal.toast(editing ? "Joueur modifié avec succès" : "Joueur créé avec succès", "success");
    if (editing) { const r = await fetch(`/api/players/${editing.id}`); setDrawer(await r.json()); }
  };

  const del = async (id: string) => {
    const res = await swal.confirmDelete("ce joueur et tous ses paiements");
    if (!res.isConfirmed) return;
    await fetch(`/api/players/${id}`, { method: "DELETE" });
    setDrawer(null);
    load();
    swal.toast("Joueur supprimé", "success");
  };

  const paidCurrent = (p: Player) =>
    (p.payments ?? []).some(pay => pay.season === CURRENT_SEASON && pay.paymentType === "COTISATION");

  const filtered = players.filter((p) => {
    const matchSearch = p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (p.licenseNumber ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? p.category === filterCat : true;
    const matchPaid = filterPaid === "paid" ? paidCurrent(p) :
      filterPaid === "unpaid" ? !paidCurrent(p) : true;
    return matchSearch && matchCat && matchPaid;
  });
  const { paged: pagedPlayers, page: playersPage, setPage: setPlayersPage, totalPages: playersTotalPages, total: playersTotal, pageSize: playersPageSize } = usePagination(filtered, 15);

  const printPlayer = (p: Player) => {
    const minor = isMinor(p.category);
    const html = `<!DOCTYPE html><html><head><title>Fiche ${p.fullName}</title><style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #1a1a1a; }
      h1 { color: #CC0000; margin: 0 0 4px; font-size: 22px; }
      .sub { color: #666; font-size: 13px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      td { padding: 6px 8px; border-bottom: 1px solid #eee; }
      td:first-child { color: #888; width: 40%; }
      .section { font-size: 11px; font-weight: bold; color: #CC0000; text-transform: uppercase; letter-spacing: 1px; padding: 12px 8px 4px; }
      @media print { @page { margin: 15mm; } }
    </style></head><body>
      <h1>${p.fullName}</h1>
      <div class="sub">${p.category} — ${p.position ?? "Poste non défini"} — #${p.jerseyNumber ?? "?"}</div>
      <table>
        <tr class="section"><td colspan="2">Identité</td></tr>
        <tr><td>Licence FRMF</td><td>${p.licenseNumber ?? "—"}</td></tr>
        ${!minor ? `<tr><td>CIN</td><td>${p.cin ?? "—"}</td></tr>` : ""}
        <tr><td>Nationalité</td><td>${p.nationality ?? "—"}</td></tr>
        <tr class="section"><td colspan="2">Contact</td></tr>
        <tr><td>Téléphone</td><td>${p.phone ?? "—"}</td></tr>
        <tr><td>Adresse</td><td>${p.address ?? "—"}</td></tr>
        ${minor ? `<tr class="section"><td colspan="2">Tuteur légal</td></tr>
        <tr><td>Nom</td><td>${p.parentName ?? "—"}</td></tr>
        <tr><td>Téléphone</td><td>${p.parentPhone ?? "—"}</td></tr>
        <tr><td>CIN tuteur</td><td>${p.parentCin ?? "—"}</td></tr>` : ""}
        <tr class="section"><td colspan="2">Médical</td></tr>
        <tr><td>Dernière visite</td><td>${p.medicalDate ? new Date(p.medicalDate).toLocaleDateString("fr-MA") : "—"}</td></tr>
        ${p.notes ? `<tr class="section"><td colspan="2">Notes</td></tr><tr><td colspan="2">${p.notes}</td></tr>` : ""}
      </table>
      <p style="margin-top:24px;font-size:11px;color:#aaa">W.S.H.M — Imprimé le ${new Date().toLocaleDateString("fr-MA")}</p>
    </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]";
  const lbl = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <>
      <ForbiddenBanner />
      {/* Header */}
      <div dir={ar ? "rtl" : "ltr"} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("players")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{players.length} joueurs enregistrés</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCompareMode(true)}
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <GitCompare size={16} /> Comparer
          </button>
          <button onClick={openNew} className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Plus size={16} /> {t("addPlayer")}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-[#CC0000]" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000]">
          <option value="">Toutes catégories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterPaid} onChange={(e) => setFilterPaid(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000]">
          <option value="">Tous statuts</option>
          <option value="paid">Cotisation réglée</option>
          <option value="unpaid">Cotisation impayée</option>
        </select>
        <div className="text-xs text-gray-400 self-center">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["", t("players"), t("category"), t("position"), "N°", t("licenseNumber"), "Cotisation", ""].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedPlayers.map((p) => {
              const paid = paidCurrent(p);
              return (
                <tr key={p.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => openDrawer(p)}>
                  <td className="pl-4 py-3">
                    {p.photoUrl ? (
                      <img src={p.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                        <User size={15} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{p.fullName}</div>
                    {p.phone && <div className="text-xs text-gray-400">{p.phone}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${CAT_COLORS[p.category]} px-2 py-0.5 rounded-full text-xs font-medium`}>{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.position ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono">{p.jerseyNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{p.licenseNumber ?? "—"}</td>
                  <td className="px-4 py-3">
                    {paid ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle2 size={13} /> Réglée
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                        <AlertCircle size={13} /> Impayée
                      </span>
                    )}
                  </td>
                  <td className="pr-4 py-3 text-gray-300">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Aucun joueur trouvé.</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 pb-2">
          <Pagination page={playersPage} totalPages={playersTotalPages} total={playersTotal} pageSize={playersPageSize} onChange={setPlayersPage} />
        </div>
      </div>

      {/* ── DETAIL DRAWER ─────────────────────────────────────── */}
      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(null)} />
          <div className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Drawer header */}
            <div className="bg-[#1a1a1a] text-white px-6 py-5 flex items-center gap-4">
              {drawer.photoUrl ? (
                <img src={drawer.photoUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={28} className="text-white/50" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {drawer.jerseyNumber && (
                    <span className="bg-[#CC0000] text-white text-xs font-bold px-2 py-0.5 rounded">#{drawer.jerseyNumber}</span>
                  )}
                  <span className={`${CAT_COLORS[drawer.category]} text-xs font-medium px-2 py-0.5 rounded-full`}>{drawer.category}</span>
                </div>
                <h2 className="text-xl font-bold mt-1">{drawer.fullName}</h2>
                <p className="text-white/60 text-sm">{drawer.position ?? "Poste non défini"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => printPlayer(drawer)} title="Imprimer la fiche"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Printer size={15} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); openEdit(drawer); setDrawer(null); }}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => del(drawer.id)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-red-500/40 transition-colors">
                  <Trash2 size={15} />
                </button>
                <button onClick={() => setDrawer(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drawerLoading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">{t("loading")}</div>
              ) : (
                <>
                  {/* Identity */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CreditCard size={13} /> Identité
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <Row label={t("fullName")} value={drawer.fullName} />
                      {drawer.birthDate && (
                        <Row label={t("birthDate")}
                          value={`${fmt(drawer.birthDate)} (${age(drawer.birthDate)} ans)`} />
                      )}
                      <Row label={t("nationality")} value={drawer.nationality} />
                      {!isMinor(drawer.category) && (
                        <Row label={t("cin")} value={drawer.cin} mono />
                      )}
                    </div>
                  </section>

                  {/* Contact */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Phone size={13} /> Contact
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <Row label={t("phone")} value={drawer.phone} icon={<Phone size={13} className="text-gray-400" />} />
                      <Row label={t("address")} value={drawer.address} icon={<MapPin size={13} className="text-gray-400" />} />
                    </div>
                  </section>

                  {/* Guardian — minors only */}
                  {isMinor(drawer.category) && (
                    <section>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Users size={13} /> Tuteur légal
                      </h3>
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                        <Row label="Nom du parent / tuteur" value={drawer.parentName} />
                        <Row label="Téléphone tuteur" value={drawer.parentPhone} />
                        <Row label="CIN tuteur" value={drawer.parentCin} mono />
                      </div>
                    </section>
                  )}

                  {/* Sport */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Award size={13} /> Informations sportives
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <Row label={t("category")} value={drawer.category} />
                      <Row label={t("position")} value={drawer.position} />
                      <Row label={t("jerseyNumber")} value={drawer.jerseyNumber?.toString()} />
                      <Row label={t("licenseNumber")} value={drawer.licenseNumber} mono />
                    </div>
                  </section>

                  {/* Medical */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Stethoscope size={13} /> Médical
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      {drawer.medicalDate ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Dernière visite médicale</span>
                          <span className="text-sm font-medium flex items-center gap-1.5">
                            <Calendar size={13} className="text-gray-400" />
                            {fmt(drawer.medicalDate)}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-red-500 flex items-center gap-2">
                          <AlertCircle size={14} /> Aucune visite médicale enregistrée
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Notes */}
                  {drawer.notes && (
                    <section>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileText size={13} /> Notes
                      </h3>
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{drawer.notes}</p>
                      </div>
                    </section>
                  )}

                  {/* Individual stats */}
                  {drawer.stats && drawer.stats.length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Target size={13} /> Statistiques individuelles
                      </h3>
                      <div className="space-y-3">
                        {drawer.stats.map((s) => (
                          <div key={s.id} className="bg-gray-50 rounded-xl px-4 py-3">
                            <div className="text-xs font-semibold text-gray-500 mb-2">Saison {s.season}</div>
                            <div className="grid grid-cols-4 gap-2">
                              <StatBadge value={s.goals} label="Buts" icon={<Target size={13} className="text-green-500" />} />
                              <StatBadge value={s.assists} label="Passes D." icon={<Zap size={13} className="text-blue-500" />} />
                              <StatBadge value={s.yellowCards} label="Jaunes" icon={<Flag size={13} className="text-yellow-500" />} />
                              <StatBadge value={s.redCards} label="Rouges" icon={<Flag size={13} className="text-red-500" />} />
                            </div>
                            {s.minutesPlayed && (
                              <div className="text-xs text-gray-400 mt-2">{s.minutesPlayed} minutes jouées</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Documents — print section */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Printer size={13} /> {t("playerDocs")}
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      {/* FR / AR toggle */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">Langue :</span>
                        <button
                          onClick={() => setPrintLang("fr")}
                          className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${
                            printLang === "fr"
                              ? "bg-[#CC0000] text-white border-[#CC0000]"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          FR
                        </button>
                        <button
                          onClick={() => setPrintLang("ar")}
                          className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${
                            printLang === "ar"
                              ? "bg-[#CC0000] text-white border-[#CC0000]"
                              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          AR
                        </button>
                      </div>
                      {/* Print buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => printPlayerEngagement(drawer, undefined, printLang)}
                          className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
                        >
                          <Printer size={12} className="text-[#CC0000]" />
                          {t("commitment")}
                        </button>
                        <button
                          onClick={() => printPlayerLicense(drawer, CURRENT_SEASON, undefined, printLang)}
                          className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
                        >
                          <Printer size={12} className="text-[#CC0000]" />
                          {t("licenseForm")}
                        </button>
                        <button
                          onClick={() => printPlayerIdentity(drawer, undefined, printLang)}
                          className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
                        >
                          <Printer size={12} className="text-[#CC0000]" />
                          {t("identitySheet")}
                        </button>
                        <button
                          onClick={() => printPlayerContract(drawer, CURRENT_SEASON, undefined, printLang)}
                          className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
                        >
                          <Printer size={12} className="text-[#CC0000]" />
                          {t("contract")}
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Payments */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Shield size={13} /> Historique des paiements
                    </h3>
                    {drawer.payments && drawer.payments.length > 0 ? (
                      <div className="space-y-2">
                        {[...drawer.payments]
                          .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                          .map((pay) => (
                            <div key={pay.id}
                              className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition-colors">
                              <div>
                                <div className="text-sm font-medium">
                                  {TYPE_LABELS[pay.paymentType] ?? pay.paymentType}
                                  <span className="ml-2 text-xs text-gray-400">{pay.season}</span>
                                </div>
                                {pay.notes && <div className="text-xs text-gray-400 mt-0.5">{pay.notes}</div>}
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-green-700">{fmtAmount(pay.amount)}</div>
                                <div className="text-xs text-gray-400">{fmt(pay.paymentDate)}</div>
                              </div>
                            </div>
                          ))}
                        <div className="flex justify-between items-center pt-2 px-1">
                          <span className="text-xs text-gray-400">Total versé</span>
                          <span className="text-sm font-bold text-gray-800">
                            {fmtAmount(drawer.payments.reduce((s, p) => s + Number(p.amount), 0))}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-400 text-center">
                        Aucun paiement enregistré.
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── COMPARE MODAL ──────────────────────────────────────── */}
      {compareMode && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setCompareMode(false)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold flex items-center gap-2"><GitCompare size={18} className="text-[#CC0000]" /> Comparaison de joueurs</h2>
              <button onClick={() => setCompareMode(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[{ val: compareA, set: setCompareA }, { val: compareB, set: setCompareB }].map(({ val, set }, idx) => (
                  <div key={idx}>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Joueur {idx + 1}</label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000]"
                      value={val?.id ?? ""}
                      onChange={(e) => {
                        const p = players.find((pl) => pl.id === e.target.value) ?? null;
                        set(p);
                      }}>
                      <option value="">Sélectionner...</option>
                      {players.map((p) => <option key={p.id} value={p.id}>{p.fullName} ({p.category})</option>)}
                    </select>
                  </div>
                ))}
              </div>

              {compareA && compareB && (
                <div className="space-y-3">
                  {[
                    { label: t("category"), a: compareA.category, b: compareB.category },
                    { label: t("position"), a: compareA.position ?? "—", b: compareB.position ?? "—" },
                    { label: t("jerseyNumber"), a: compareA.jerseyNumber?.toString() ?? "—", b: compareB.jerseyNumber?.toString() ?? "—" },
                    { label: t("licenseNumber"), a: compareA.licenseNumber ?? "—", b: compareB.licenseNumber ?? "—" },
                    { label: t("phone"), a: compareA.phone ?? "—", b: compareB.phone ?? "—" },
                    { label: t("address"), a: compareA.address ?? "—", b: compareB.address ?? "—" },
                    { label: t("cin"), a: compareA.cin ?? "—", b: compareB.cin ?? "—" },
                  ].map(({ label, a, b }) => (
                    <div key={label} className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-center bg-gray-50 rounded-lg p-2 text-sm text-gray-800">{a}</div>
                      <div className="text-center text-xs text-gray-400 font-medium">{label}</div>
                      <div className="text-center bg-gray-50 rounded-lg p-2 text-sm text-gray-800">{b}</div>
                    </div>
                  ))}

                  {/* Payments comparison */}
                  <div className="grid grid-cols-3 gap-4 items-center pt-2">
                    <div className="text-center bg-gray-50 rounded-lg p-2 text-sm font-semibold text-green-600">
                      {(compareA.payments ?? []).reduce((s, p) => s + Number(p.amount), 0).toLocaleString("fr-MA")} MAD
                    </div>
                    <div className="text-center text-xs text-gray-400 font-medium">Total versé</div>
                    <div className="text-center bg-gray-50 rounded-lg p-2 text-sm font-semibold text-green-600">
                      {(compareB.payments ?? []).reduce((s, p) => s + Number(p.amount), 0).toLocaleString("fr-MA")} MAD
                    </div>
                  </div>
                  {/* Stats comparison */}
                  {(compareA.stats?.length || compareB.stats?.length) ? (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Statistiques (saison en cours)</p>
                      {[
                        { label: "Buts", key: "goals" },
                        { label: "Passes déc.", key: "assists" },
                        { label: "Cartons jaunes", key: "yellowCards" },
                        { label: "Cartons rouges", key: "redCards" },
                      ].map(({ label, key }) => {
                        const aVal = (compareA.stats ?? [])[0]?.[key as keyof PlayerStat] as number ?? 0;
                        const bVal = (compareB.stats ?? [])[0]?.[key as keyof PlayerStat] as number ?? 0;
                        return (
                          <div key={key} className="grid grid-cols-3 gap-4 items-center mb-2">
                            <div className={`text-center rounded-lg p-2 text-sm font-semibold ${aVal > bVal ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}`}>{aVal}</div>
                            <div className="text-center text-xs text-gray-400 font-medium">{label}</div>
                            <div className={`text-center rounded-lg p-2 text-sm font-semibold ${bVal > aVal ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}`}>{bVal}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* Player name header */}
                  <div className="grid grid-cols-3 gap-4 -mt-2 mb-2 order-first">
                    <div className="text-center font-bold text-sm truncate text-[#CC0000]">{compareA.fullName}</div>
                    <div />
                    <div className="text-center font-bold text-sm truncate text-[#CC0000]">{compareB.fullName}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT / CREATE MODAL ───────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-5">{editing ? t("editPlayer") : t("addPlayer")}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>{t("photo")}</label>
                <ImageUploader value={form.photoUrl ?? ""} onChange={(url) => setForm({ ...form, photoUrl: url })} />
              </div>
              <div className="col-span-2"><label className={lbl}>{t("fullName")} *</label>
                <input required className={inp} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div><label className={lbl}>{t("category")}</label>
                <select className={inp} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className={lbl}>{t("position")}</label>
                <input className={inp} value={form.position ?? ""} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </div>
              <div><label className={lbl}>{t("jerseyNumber")}</label>
                <input type="number" className={inp} value={form.jerseyNumber ?? ""} onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value ? parseInt(e.target.value) : null })} />
              </div>
              <div><label className={lbl}>{t("licenseNumber")}</label>
                <input className={inp} value={form.licenseNumber ?? ""} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
              </div>
              <div><label className={lbl}>{t("birthDate")}</label>
                <input type="date" className={inp} value={form.birthDate ? form.birthDate.split("T")[0] : ""} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
              </div>
              <div><label className={lbl}>{t("phone")}</label>
                <input type="tel" className={inp} value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="col-span-2"><label className={lbl}>{t("address")}</label>
                <input className={inp} value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div><label className={lbl}>{t("cin")} (18+)</label>
                <input className={inp} placeholder="ex: BE456123" value={form.cin ?? ""} onChange={(e) => setForm({ ...form, cin: e.target.value })} />
              </div>
              <div><label className={lbl}>Nationalité</label>
                <input className={inp} value={form.nationality ?? ""} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
              </div>

              {/* Guardian fields — shown for minors */}
              {isMinor(form.category) && (
                <>
                  <div className="col-span-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">Tuteur légal (mineur)</p>
                  </div>
                  <div className="col-span-2"><label className={lbl}>Nom du parent / tuteur *</label>
                    <input className={inp} value={form.parentName ?? ""} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
                  </div>
                  <div><label className={lbl}>Téléphone tuteur</label>
                    <input className={inp} value={form.parentPhone ?? ""} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
                  </div>
                  <div><label className={lbl}>CIN tuteur</label>
                    <input className={inp} placeholder="ex: BE741963" value={form.parentCin ?? ""} onChange={(e) => setForm({ ...form, parentCin: e.target.value })} />
                  </div>
                </>
              )}

              <div><label className={lbl}>Date visite médicale</label>
                <input type="date" className={inp} value={form.medicalDate ? form.medicalDate.split("T")[0] : ""} onChange={(e) => setForm({ ...form, medicalDate: e.target.value })} />
              </div>
              <div className="col-span-2"><label className={lbl}>Notes internes</label>
                <textarea rows={2} className={inp} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors">{t("cancel")}</button>
              <button onClick={save} disabled={saving || !form.fullName}
                className="flex-1 bg-[#CC0000] hover:bg-red-700 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-semibold transition-colors">
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value, mono, icon }: { label: string; value?: string | null; mono?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-400 shrink-0 pt-0.5 flex items-center gap-1">{icon}{label}</span>
      <span className={`text-sm font-medium text-right ${mono ? "font-mono" : ""} ${!value ? "text-gray-300" : "text-gray-800"}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function StatBadge({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-lg font-bold text-gray-800">{value}</div>
      <div className="text-[10px] text-gray-400">{label}</div>
    </div>
  );
}
