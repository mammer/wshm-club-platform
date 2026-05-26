"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminT } from "@/lib/adminT";
import { swal } from "@/lib/swal";
import { printPaymentReceipt } from "@/lib/print";
import { Plus, Trash2, Search, Download, Printer } from "lucide-react";
import { usePagination } from "@/lib/usePagination";
import Pagination from "@/components/ui/Pagination";

type Payment = {
  id: string;
  playerId: string;
  amount: string;
  paymentDate: string;
  paymentType: string;
  season: string;
  notes: string | null;
  recordedBy: string | null;
  player: { fullName: string; category: string };
};

type Player = { id: string; fullName: string; category: string };

const CURRENT_SEASON = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
const TYPES = ["COTISATION", "LICENCE", "EQUIPEMENT", "AUTRE"];

export default function AdminPaymentsPage() {
  const { t, ar } = useAdminT();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [filterSeason, setFilterSeason] = useState("");
  const [filterType, setFilterType] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    playerId: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentType: "COTISATION",
    season: CURRENT_SEASON,
    notes: "",
    recordedBy: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/payments").then((r) => r.json()).then(setPayments);
    fetch("/api/players").then((r) => r.json()).then(setPlayers);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setModal(false);
    load();
    swal.toast("Paiement enregistré", "success");
  };

  const del = async (id: string) => {
    const p = payments.find((x) => x.id === id);
    const res = await swal.confirmDelete(p?.player.fullName ? `paiement de ${p.player.fullName}` : undefined);
    if (!res.isConfirmed) return;
    await fetch(`/api/payments/${id}`, { method: "DELETE" });
    load();
    swal.toast("Paiement supprimé", "success");
  };

  const filtered = payments.filter((p) => {
    const matchSearch = p.player.fullName.toLowerCase().includes(search.toLowerCase());
    const matchSeason = !filterSeason || p.season === filterSeason;
    const matchType = !filterType || p.paymentType === filterType;
    return matchSearch && matchSeason && matchType;
  });

  const total = filtered.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const { paged: pagedPayments, page, setPage, totalPages, total: totalCount, pageSize } = usePagination(filtered, 10);
  const seasons = [...new Set(payments.map((p) => p.season))].sort().reverse();

  const exportCSV = () => {
    const rows = [
      ["Joueur", "Catégorie", "Type", "Montant (MAD)", "Date", "Saison", "Notes", "Enregistré par"],
      ...filtered.map((p) => [
        p.player.fullName,
        p.player.category,
        p.paymentType,
        parseFloat(p.amount).toFixed(2),
        new Date(p.paymentDate).toLocaleDateString("fr-MA"),
        p.season,
        p.notes ?? "",
        p.recordedBy ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paiements_wshm_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000]";
  const lbl = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <>
      <div dir={ar ? "rtl" : "ltr"} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("payments")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{payments.length} {t("payments")} au total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Download size={16} /> {t("export")} CSV
          </button>
          <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Plus size={16} /> {t("save")}
          </button>
        </div>
      </div>

      <div dir={ar ? "rtl" : "ltr"} className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none" />
        </div>
        <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000]">
          <option value="">Toutes les saisons</option>
          {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000]">
          <option value="">Tous les types</option>
          {TYPES.map((tp) => <option key={tp} value={tp}>{t(tp as Parameters<typeof t>[0])}</option>)}
        </select>
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
          {filtered.length} {t("payments")} — {total.toFixed(2)} MAD
        </div>
      </div>

      <div dir={ar ? "rtl" : "ltr"} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Joueur", t("category"), t("type"), t("amount"), t("paymentDate"), t("season"), "", ""].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedPayments.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.player.fullName}</td>
                <td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{p.player.category}</span></td>
                <td className="px-4 py-3 text-gray-500 text-xs">{t(p.paymentType as Parameters<typeof t>[0])}</td>
                <td className="px-4 py-3 font-bold text-green-600">{parseFloat(p.amount).toFixed(2)} MAD</td>
                <td className="px-4 py-3 text-gray-500">{new Date(p.paymentDate).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{p.season}</td>
                <td className="px-4 py-3">
                  <button onClick={() => printPaymentReceipt(p, { fullName: p.player.fullName, category: p.player.category, licenseNumber: null })}
                    className="text-gray-300 hover:text-gray-600 p-1 rounded" title={t("receipt")}>
                    <Printer size={14} />
                  </button>
                </td>
                <td className="px-4 py-3"><button onClick={() => del(p.id)} className="text-gray-300 hover:text-red-500 p-1 rounded"><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">{t("noData")}</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 pb-3">
          <Pagination page={page} totalPages={totalPages} total={totalCount} pageSize={pageSize} onChange={setPage} />
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div dir={ar ? "rtl" : "ltr"} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-5">{t("payments")}</h2>
            <div className="space-y-3">
              <div>
                <label className={lbl}>Joueur *</label>
                <select required className={inp} value={form.playerId} onChange={(e) => setForm({ ...form, playerId: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {players.map((p) => <option key={p.id} value={p.id}>{p.fullName} ({p.category})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>{t("amount")} (MAD) *</label><input required type="number" step="0.01" className={inp} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div><label className={lbl}>{t("paymentDate")}</label><input type="date" className={inp} value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>{t("type")}</label>
                  <select className={inp} value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value })}>
                    {TYPES.map((tp) => <option key={tp} value={tp}>{t(tp as Parameters<typeof t>[0])}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>{t("season")}</label><input className={inp} value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} /></div>
              </div>
              <div><label className={lbl}>{t("notes")}</label><input className={inp} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div><label className={lbl}>Enregistré par</label><input className={inp} value={form.recordedBy} onChange={(e) => setForm({ ...form, recordedBy: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">{t("cancel")}</button>
              <button onClick={save} disabled={saving || !form.playerId || !form.amount} className="flex-1 bg-[#CC0000] hover:bg-red-700 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-semibold">
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
