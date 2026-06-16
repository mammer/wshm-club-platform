"use client";

import { useState, useEffect, useCallback } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import { swal } from "@/lib/swal";
import { useAdminT } from "@/lib/adminT";
import { IconPlus as Plus, IconPencil as Pencil, IconTrash as Trash2, IconUser as User, IconX as X, IconPhone as Phone, IconMapPin as MapPin, IconCreditCard as CreditCard, IconCalendar as Calendar, IconAward as Award, IconChevronRight as ChevronRight, IconStethoscope as Stethoscope, IconFileText as FileText, IconStar as Star } from "@tabler/icons-react";
import { usePagination } from "@/lib/usePagination";
import Pagination from "@/components/ui/Pagination";

type Coach = {
  id: string;
  fullName: string;
  photoUrl: string | null;
  role: string;
  category: string;
  license: string | null;
  phone: string | null;
  cin: string | null;
  birthDate: string | null;
  address: string | null;
  nationality: string | null;
  experience: string | null;
  medicalDate: string | null;
  notes: string | null;
};

const EMPTY: Omit<Coach, "id"> = {
  fullName: "", photoUrl: null, role: "", category: "SENIORS",
  license: "", phone: "", cin: "", birthDate: null,
  address: "", nationality: "Marocaine", experience: "", medicalDate: null, notes: "",
};
const CATEGORIES = ["MINIMES", "CADETS", "JUNIORS", "SENIORS"];
const CAT_COLORS: Record<string, string> = {
  SENIORS: "bg-blue-100 text-blue-700",
  JUNIORS: "bg-green-100 text-green-700",
  CADETS:  "bg-orange-100 text-orange-700",
  MINIMES: "bg-purple-100 text-purple-700",
};

function fmt(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-MA", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function age(birthDate: string | null) {
  if (!birthDate) return null;
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function AdminCoachesPage() {
  const { t, ar } = useAdminT();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [drawer, setDrawer] = useState<Coach | null>(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Coach | null>(null);
  const [form, setForm] = useState<Omit<Coach, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/coaches").then((r) => r.json()).then(setCoaches);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDrawer = (c: Coach) => setDrawer(c);
  const openNew = () => { setEditing(null); setForm({ ...EMPTY }); setModal(true); };
  const openEdit = (c: Coach) => {
    setEditing(c);
    const { id: _id, ...fields } = c as Coach & { id?: string };
    setForm(fields as typeof EMPTY);
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/coaches/${editing.id}` : "/api/coaches";
    const { id: _id, ...clean } = form as Record<string, unknown>;
    const body = { ...clean, license: (clean.license as string) || null, phone: (clean.phone as string) || null, cin: (clean.cin as string) || null, address: (clean.address as string) || null, experience: (clean.experience as string) || null, notes: (clean.notes as string) || null };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (!res.ok) { swal.error("Erreur", "Échec de l'enregistrement."); return; }
    setModal(false);
    load();
    swal.toast(editing ? "Entraîneur modifié" : "Entraîneur créé", "success");
  };

  const del = async (id: string) => {
    const res = await swal.confirmDelete("cet entraîneur");
    if (!res.isConfirmed) return;
    await fetch(`/api/coaches/${id}`, { method: "DELETE" });
    setDrawer(null);
    load();
    swal.toast("Entraîneur supprimé", "success");
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]";
  const lbl = "block text-xs font-medium text-gray-600 mb-1";
  const { paged: pagedCoaches, page: coachPage, setPage: setCoachPage, totalPages: coachTotalPages, total: coachTotal, pageSize: coachPageSize } = usePagination(coaches, 10);

  return (
    <div dir={ar ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t("coaches")}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{coaches.length} entraîneurs enregistrés</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Plus size={16} /> {t("addCoach")}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["", t("coaches"), t("role"), t("category"), t("license"), t("phone"), t("actions")].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedCoaches.map((c) => (
                <tr key={c.id}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => openDrawer(c)}>
                  <td className="pl-4 py-3">
                    {c.photoUrl ? (
                      <img src={c.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                        <User size={16} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{c.fullName}</div>
                    {c.experience && <div className="text-xs text-gray-400 truncate max-w-[200px]">{c.experience}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.role}</td>
                  <td className="px-4 py-3">
                    <span className={`${CAT_COLORS[c.category]} px-2 py-0.5 rounded-full text-xs font-medium`}>{c.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.license ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.phone ?? "—"}</td>
                  <td className="pr-4 py-3 text-gray-300"><ChevronRight size={16} /></td>
                </tr>
              ))}
              {coaches.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Aucun entraîneur enregistré.</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-4 pb-2">
            <Pagination page={coachPage} totalPages={coachTotalPages} total={coachTotal} pageSize={coachPageSize} onChange={setCoachPage} />
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
                  <span className={`${CAT_COLORS[drawer.category]} text-xs font-medium px-2 py-0.5 rounded-full`}>{drawer.category}</span>
                  <h2 className="text-xl font-bold mt-1">{drawer.fullName}</h2>
                  <p className="text-white/60 text-sm">{drawer.role}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(drawer); setDrawer(null); }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title={t("edit")}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => del(drawer.id)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-red-500/40 transition-colors" title={t("delete")}>
                    <Trash2 size={15} />
                  </button>
                  <button onClick={() => setDrawer(null)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title={t("close")}>
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Identity */}
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CreditCard size={13} /> Identité
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <Row label={t("fullName")} value={drawer.fullName} />
                    {drawer.birthDate && (
                      <Row label="Date de naissance"
                        value={`${fmt(drawer.birthDate)} (${age(drawer.birthDate)} ans)`} />
                    )}
                    <Row label="Nationalité" value={drawer.nationality} />
                    <Row label="CIN" value={drawer.cin} mono />
                  </div>
                </section>

                {/* Contact */}
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Phone size={13} /> Contact
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <Row label={t("phone")} value={drawer.phone} icon={<Phone size={13} className="text-gray-400" />} />
                    <Row label="Adresse" value={drawer.address} icon={<MapPin size={13} className="text-gray-400" />} />
                  </div>
                </section>

                {/* Professional */}
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Award size={13} /> Profil professionnel
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <Row label={t("role")} value={drawer.role} />
                    <Row label={t("category")} value={drawer.category} />
                    <Row label={t("license")} value={drawer.license} />
                    {drawer.experience && (
                      <div className="pt-1">
                        <span className="text-xs text-gray-400">Expérience</span>
                        <div className="mt-1 flex items-start gap-2 text-sm text-gray-800">
                          <Star size={13} className="text-amber-400 mt-0.5 shrink-0" />
                          {drawer.experience}
                        </div>
                      </div>
                    )}
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
                      <p className="text-sm text-red-500">Aucune visite médicale enregistrée.</p>
                    )}
                  </div>
                </section>

                {/* Notes */}
                {drawer.notes && (
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText size={13} /> {t("notes")}
                    </h3>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{drawer.notes}</p>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── EDIT / CREATE MODAL ───────────────────────────────── */}
        {modal && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-5">{editing ? "Modifier l'entraîneur" : "Nouvel entraîneur"}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={lbl}>{t("photo")}</label>
                  <ImageUploader value={form.photoUrl ?? ""} onChange={(url) => setForm({ ...form, photoUrl: url })} />
                </div>
                <div className="col-span-2"><label className={lbl}>{t("fullName")} *</label>
                  <input required className={inp} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </div>
                <div className="col-span-2"><label className={lbl}>{t("role")}</label>
                  <input className={inp} placeholder="ex: Entraîneur Principal Seniors" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                </div>
                <div><label className={lbl}>{t("category")}</label>
                  <select className={inp} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>{t("license")}</label>
                  <input className={inp} placeholder="ex: UEFA B, Diplôme Fédéral" value={form.license ?? ""} onChange={(e) => setForm({ ...form, license: e.target.value })} />
                </div>
                <div><label className={lbl}>{t("phone")}</label>
                  <input type="tel" className={inp} value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div><label className={lbl}>CIN</label>
                  <input className={inp} placeholder="ex: BE112233" value={form.cin ?? ""} onChange={(e) => setForm({ ...form, cin: e.target.value })} />
                </div>
                <div><label className={lbl}>Date de naissance</label>
                  <input type="date" className={inp} value={form.birthDate ? form.birthDate.split("T")[0] : ""} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
                </div>
                <div><label className={lbl}>Nationalité</label>
                  <input className={inp} value={form.nationality ?? ""} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
                </div>
                <div className="col-span-2"><label className={lbl}>Adresse</label>
                  <input className={inp} value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="col-span-2"><label className={lbl}>Expérience</label>
                  <input className={inp} placeholder="ex: 12 ans d'expérience — Spécialiste formation jeunes" value={form.experience ?? ""} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                </div>
                <div><label className={lbl}>Date visite médicale</label>
                  <input type="date" className={inp} value={form.medicalDate ? form.medicalDate.split("T")[0] : ""} onChange={(e) => setForm({ ...form, medicalDate: e.target.value })} />
                </div>
                <div className="col-span-2"><label className={lbl}>{t("notes")}</label>
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
    </div>
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
