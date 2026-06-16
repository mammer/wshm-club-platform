"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminT } from "@/lib/adminT";
import { swal } from "@/lib/swal";
import { printSponsorReceipt } from "@/lib/print";
import { IconPlus as Plus, IconTrash as Trash2, IconPencil as Pencil, IconBuilding as Building2, IconStar as Star, IconX as X, IconPrinter as Printer } from "@tabler/icons-react";
import { usePagination } from "@/lib/usePagination";
import Pagination from "@/components/ui/Pagination";

type Sponsor = {
  id: string;
  name: string;
  logoUrl: string | null;
  amount: string;
  startDate: string;
  endDate: string | null;
  tier: string;
  notes: string | null;
  isActive: boolean;
};

const TIERS = ["OR", "ARGENT", "BRONZE"];
const TIER_STYLES: Record<string, string> = {
  OR:     "bg-yellow-100 text-yellow-700 border border-yellow-200",
  ARGENT: "bg-gray-100 text-gray-600 border border-gray-200",
  BRONZE: "bg-orange-100 text-orange-700 border border-orange-200",
};
const TIER_STARS: Record<string, number> = { OR: 3, ARGENT: 2, BRONZE: 1 };

const EMPTY = { name: "", logoUrl: null as string | null, amount: "", startDate: new Date().toISOString().split("T")[0], endDate: "", tier: "OR", notes: null as string | null, isActive: true };

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-MA", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminSponsorsPage() {
  const { t, ar } = useAdminT();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/sponsors").then((r) => r.json()).then(setSponsors);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (s: Sponsor) => {
    setEditing(s);
    setForm({ ...s, logoUrl: s.logoUrl, amount: s.amount.toString(), startDate: s.startDate.split("T")[0], endDate: s.endDate ? s.endDate.split("T")[0] : "" });
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/sponsors/${editing.id}` : "/api/sponsors";
    const body = { ...form, amount: parseFloat(form.amount), endDate: form.endDate || null };
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    setModal(false);
    load();
    swal.toast(editing ? "Sponsor modifié" : "Sponsor ajouté", "success");
  };

  const del = async (id: string) => {
    const s = sponsors.find((x) => x.id === id);
    const res = await swal.confirmDelete(s?.name);
    if (!res.isConfirmed) return;
    await fetch(`/api/sponsors/${id}`, { method: "DELETE" });
    load();
    swal.toast("Sponsor supprimé", "success");
  };

  const totalActive = sponsors.filter((s) => s.isActive).reduce((sum, s) => sum + parseFloat(s.amount), 0);

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]";
  const { paged: pagedSponsors, page: spPage, setPage: setSpPage, totalPages: spTotalPages, total: spTotal, pageSize: spPageSize } = usePagination(sponsors, 10);
  const lbl = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <>
      <div dir={ar ? "rtl" : "ltr"} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("sponsors")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Budget sponsoring actif : <strong className="text-green-600">{totalActive.toLocaleString("fr-MA")} MAD</strong></p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Plus size={16} /> {t("addSponsor")}
        </button>
      </div>

      {/* Tier summary */}
      <div dir={ar ? "rtl" : "ltr"} className="grid grid-cols-3 gap-4 mb-6">
        {TIERS.map((tier) => {
          const group = sponsors.filter((s) => s.tier === tier && s.isActive);
          const total = group.reduce((sum, s) => sum + parseFloat(s.amount), 0);
          return (
            <div key={tier} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="flex gap-0.5">
                {Array.from({ length: TIER_STARS[tier] }).map((_, i) => (
                  <Star key={i} size={16} className={tier === "OR" ? "text-yellow-500 fill-yellow-500" : tier === "ARGENT" ? "text-gray-400 fill-gray-400" : "text-orange-500 fill-orange-500"} />
                ))}
              </div>
              <div>
                <p className="text-xs text-gray-400">{tier}</p>
                <p className="font-semibold">{group.length} sponsor{group.length !== 1 ? "s" : ""} — {total.toLocaleString("fr-MA")} MAD</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div dir={ar ? "rtl" : "ltr"} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[t("sponsorName"), "Tier", t("amount"), "Période", t("status"), ""].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedSponsors.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      {s.notes && <p className="text-xs text-gray-400">{s.notes}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`${TIER_STYLES[s.tier]} px-2.5 py-0.5 rounded-full text-xs font-semibold`}>{s.tier}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-green-600">{parseFloat(s.amount).toLocaleString("fr-MA")} MAD</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {fmt(s.startDate)} → {s.endDate ? fmt(s.endDate) : "En cours"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.isActive ? t("active") : t("inactive")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => printSponsorReceipt(s)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded" title={t("print")}><Printer size={14} /></button>
                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded"><Pencil size={14} /></button>
                    <button onClick={() => del(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {sponsors.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">{t("noData")}</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 pb-2">
          <Pagination page={spPage} totalPages={spTotalPages} total={spTotal} pageSize={spPageSize} onChange={setSpPage} />
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div dir={ar ? "rtl" : "ltr"} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editing ? t("edit") : t("addSponsor")}</h2>
              <button onClick={() => setModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className={lbl}>{t("sponsorName")} *</label>
                <input required className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div><label className={lbl}>Tier</label>
                <select className={inp} value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}>
                  {TIERS.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
                </select>
              </div>
              <div><label className={lbl}>{t("amount")} (MAD) *</label>
                <input type="number" className={inp} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div><label className={lbl}>{t("startDate")}</label>
                <input type="date" className={inp} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div><label className={lbl}>{t("endDate")}</label>
                <input type="date" className={inp} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div className="col-span-2"><label className={lbl}>{t("notes")}</label>
                <input className={inp} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value || null })} />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                <label htmlFor="isActive" className="text-sm text-gray-600">Partenariat actif</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors">{t("cancel")}</button>
              <button onClick={save} disabled={saving || !form.name || !form.amount}
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
