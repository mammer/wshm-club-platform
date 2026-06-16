"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminT } from "@/lib/adminT";
import { swal } from "@/lib/swal";
import { printExpenseReport } from "@/lib/print";
import { IconPlus as Plus, IconTrash as Trash2, IconPencil as Pencil, IconX as X, IconReceipt as Receipt, IconSearch as Search, IconPrinter as Printer } from "@tabler/icons-react";
import { usePagination } from "@/lib/usePagination";
import Pagination from "@/components/ui/Pagination";

type Expense = {
  id: string;
  category: string;
  description: string;
  amount: string;
  expenseDate: string;
  season: string;
  vendor: string | null;
  paidBy: string | null;
  notes: string | null;
};

const CATEGORIES = ["TRANSPORT", "ALIMENTATION", "DEPLACEMENT", "SALAIRES", "EQUIPEMENT", "ARBITRAGE", "ADMINISTRATION", "AUTRE"];
const CAT_COLORS: Record<string, string> = {
  TRANSPORT:      "bg-blue-100 text-blue-700",
  ALIMENTATION:   "bg-green-100 text-green-700",
  DEPLACEMENT:    "bg-purple-100 text-purple-700",
  SALAIRES:       "bg-red-100 text-[#CC0000]",
  EQUIPEMENT:     "bg-orange-100 text-orange-700",
  ARBITRAGE:      "bg-yellow-100 text-yellow-700",
  ADMINISTRATION: "bg-gray-100 text-gray-600",
  AUTRE:          "bg-slate-100 text-slate-600",
};

const CURRENT_SEASON = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
const EMPTY = {
  category: "TRANSPORT", description: "", amount: "",
  expenseDate: new Date().toISOString().split("T")[0],
  season: CURRENT_SEASON, vendor: "", paidBy: "", notes: "",
};

export default function AdminExpensesPage() {
  const { t, ar } = useAdminT();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterSeason, setFilterSeason] = useState("");

  const load = useCallback(() => {
    fetch("/api/expenses").then((r) => r.json()).then(setExpenses);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = expenses.filter((e) => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) || (e.vendor ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || e.category === filterCat;
    const matchSeason = !filterSeason || e.season === filterSeason;
    return matchSearch && matchCat && matchSeason;
  });

  const seasons = [...new Set(expenses.map((e) => e.season))].sort().reverse();
  const total = filtered.reduce((s, e) => s + parseFloat(e.amount), 0);
  const { paged: pagedExpenses, page: expPage, setPage: setExpPage, totalPages: expTotalPages, total: expTotal, pageSize: expPageSize } = usePagination(filtered, 10);
  const grandTotal = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  const catTotals = CATEGORIES
    .map((cat) => ({
      cat,
      total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + parseFloat(e.amount), 0),
      count: expenses.filter((e) => e.category === cat).length,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.total - a.total);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (e: Expense) => {
    setEditing(e);
    setForm({
      category: e.category, description: e.description, amount: e.amount.toString(),
      expenseDate: e.expenseDate.split("T")[0], season: e.season,
      vendor: e.vendor ?? "", paidBy: e.paidBy ?? "", notes: e.notes ?? "",
    });
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/expenses/${editing.id}` : "/api/expenses";
    const body = {
      ...form,
      amount: parseFloat(form.amount),
      vendor: form.vendor || null,
      paidBy: form.paidBy || null,
      notes: form.notes || null,
    };
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    setModal(false);
    load();
    swal.toast(editing ? "Dépense modifiée" : "Dépense enregistrée", "success");
  };

  const del = async (e: Expense) => {
    const res = await swal.confirmDelete(e.description);
    if (!res.isConfirmed) return;
    await fetch(`/api/expenses/${e.id}`, { method: "DELETE" });
    load();
    swal.toast("Dépense supprimée", "success");
  };

  const handlePrint = () => {
    printExpenseReport(filtered, filterSeason || CURRENT_SEASON);
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-4 focus:ring-[#CC0000]/10 transition-all";
  const lbl = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <>
      <div dir={ar ? "rtl" : "ltr"} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CC0000]/10 flex items-center justify-center">
            <Receipt size={20} className="text-[#CC0000]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("expenses")}</h1>
            <p className="text-sm text-gray-400">
              Budget total : <strong className="text-[#CC0000]">{grandTotal.toLocaleString("fr-MA")} MAD</strong>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint}
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Printer size={16} /> {t("print")}
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-500/20">
            <Plus size={16} /> {t("addExpense")}
          </button>
        </div>
      </div>

      {/* Category breakdown */}
      {catTotals.length > 0 && (
        <div dir={ar ? "rtl" : "ltr"} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {catTotals.slice(0, 8).map(({ cat, total: catTotal, count }) => (
            <div key={cat} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <span className={`${CAT_COLORS[cat]} text-xs font-bold px-2 py-0.5 rounded-full`}>{t(cat as Parameters<typeof t>[0])}</span>
              <p className="font-bold text-lg mt-2">
                {catTotal.toLocaleString("fr-MA")} <span className="text-sm font-normal text-gray-400">MAD</span>
              </p>
              <p className="text-xs text-gray-400">{count} opération{count !== 1 ? "s" : ""}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div dir={ar ? "rtl" : "ltr"} className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:border-[#CC0000]" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#CC0000]">
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{t(c as Parameters<typeof t>[0])}</option>)}
        </select>
        <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#CC0000]">
          <option value="">Toutes les saisons</option>
          {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="bg-red-50 border border-red-200 text-[#CC0000] px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap">
          {filtered.length} {t("expenses")} — {total.toLocaleString("fr-MA")} MAD
        </div>
      </div>

      {/* Table */}
      <div dir={ar ? "rtl" : "ltr"} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[t("date"), t("category"), t("description"), t("vendor"), t("paidBy"), t("amount"), t("season"), ""].map((h, i) => (
                <th key={i} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedExpenses.map((e) => (
              <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(e.expenseDate).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <span className={`${CAT_COLORS[e.category]} text-xs font-semibold px-2 py-0.5 rounded-full`}>
                    {t((e.category) as Parameters<typeof t>[0])}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium max-w-xs">{e.description}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{e.vendor ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{e.paidBy ?? "—"}</td>
                <td className="px-4 py-3 font-bold text-[#CC0000] whitespace-nowrap">
                  {parseFloat(e.amount).toLocaleString("fr-MA")} MAD
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{e.season}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openEdit(e)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => del(e)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length > 0 && (
              <tr className="bg-[#1a1a1a] text-white">
                <td colSpan={5} className="px-4 py-3 font-bold text-sm">{t("total")}</td>
                <td className="px-4 py-3 font-bold whitespace-nowrap">{total.toLocaleString("fr-MA")} MAD</td>
                <td colSpan={2} />
              </tr>
            )}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">{t("noData")}</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 pb-2">
          <Pagination page={expPage} totalPages={expTotalPages} total={expTotal} pageSize={expPageSize} onChange={setExpPage} />
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div dir={ar ? "rtl" : "ltr"} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{editing ? t("edit") : t("addExpense")}</h2>
              <button onClick={() => setModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>{t("category")}</label>
                  <select className={inp} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{t(c as Parameters<typeof t>[0])}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>{t("amount")} (MAD) *</label>
                  <input type="number" step="0.01" className={inp} value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className={lbl}>{t("description")} *</label>
                <input className={inp} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Transport équipe — Match Berkane" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>{t("date")}</label>
                  <input type="date" className={inp} value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
                </div>
                <div>
                  <label className={lbl}>{t("season")}</label>
                  <input className={inp} value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>{t("vendor")}</label>
                  <input className={inp} value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    placeholder="Transport Tarik SARL" />
                </div>
                <div>
                  <label className={lbl}>{t("paidBy")}</label>
                  <input className={inp} value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
                    placeholder="Karim Bensouda" />
                </div>
              </div>
              <div>
                <label className={lbl}>{t("notes")}</label>
                <input className={inp} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors">{t("cancel")}</button>
              <button onClick={save} disabled={saving || !form.description || !form.amount}
                className="flex-1 bg-[#CC0000] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-all">
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
