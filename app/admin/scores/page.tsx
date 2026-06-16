"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminT } from "@/lib/adminT";
import { IconPlus as Plus, IconTrash as Trash2 } from "@tabler/icons-react";
import { usePagination } from "@/lib/usePagination";
import Pagination from "@/components/ui/Pagination";

type Match = {
  id: string;
  category: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  location: string | null;
  matchday: number | null;
  competition: string;
};

const EMPTY: Omit<Match, "id"> = {
  category: "SENIORS",
  homeTeam: "W.S.H.M",
  awayTeam: "",
  homeScore: null,
  awayScore: null,
  matchDate: new Date().toISOString().split("T")[0],
  location: "",
  matchday: null,
  competition: "CHAMPIONNAT",
};

const CATEGORIES = ["MINIMES", "CADETS", "JUNIORS", "SENIORS"];

export default function AdminScoresPage() {
  const { t, ar } = useAdminT();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filterCat, setFilterCat] = useState("SENIORS");
  const [form, setForm] = useState<Omit<Match, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/matches?category=${filterCat}`).then((r) => r.json()).then(setMatches);
  }, [filterCat]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, homeScore: form.homeScore !== null ? Number(form.homeScore) : null, awayScore: form.awayScore !== null ? Number(form.awayScore) : null, matchday: form.matchday ? Number(form.matchday) : null }),
    });
    setSaving(false);
    setShow(false);
    setForm(EMPTY);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Supprimer ce match ?")) return;
    await fetch(`/api/matches/${id}`, { method: "DELETE" });
    load();
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000]";
  const lbl = "block text-xs font-medium text-gray-600 mb-1";
  const { paged: pagedMatches, page: matchPage, setPage: setMatchPage, totalPages: matchTotalPages, total: matchTotal, pageSize: matchPageSize } = usePagination(matches, 10);

  return (
    <>
      <div dir={ar ? "rtl" : "ltr"} className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("scores")}</h1>
        <button onClick={() => setShow(true)} className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Plus size={16} /> {t("addMatch")}
        </button>
      </div>

      {/* Category filter */}
      <div dir={ar ? "rtl" : "ltr"} className="flex gap-2 mb-5">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setFilterCat(c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterCat === c ? "bg-[#CC0000] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t(c as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>

      <div dir={ar ? "rtl" : "ltr"} className="space-y-3">
        {pagedMatches.map((m) => (
          <div key={m.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span>{m.homeTeam}</span>
                <span className="bg-[#1a1a1a] text-white px-3 py-1 rounded font-bold">{m.homeScore ?? "–"} – {m.awayScore ?? "–"}</span>
                <span>{m.awayTeam}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {t(m.competition as Parameters<typeof t>[0])} {m.matchday ? `· J${m.matchday}` : ""} · {new Date(m.matchDate).toLocaleDateString("fr-FR")}
                {m.location ? ` · ${m.location}` : ""}
              </p>
            </div>
            <button onClick={() => del(m.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
          </div>
        ))}
        {matches.length === 0 && <p className="text-gray-400 text-sm">{t("noData")}</p>}
      </div>
      <Pagination page={matchPage} totalPages={matchTotalPages} total={matchTotal} pageSize={matchPageSize} onChange={setMatchPage} className="mt-4" />

      {show && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShow(false)}>
          <div dir={ar ? "rtl" : "ltr"} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-5">{t("addMatch")}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>{t("category")}</label>
                <select className={inp} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{t(c as Parameters<typeof t>[0])}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>{t("category")} (compétition)</label>
                <select className={inp} value={form.competition} onChange={(e) => setForm({ ...form, competition: e.target.value })}>
                  <option value="CHAMPIONNAT">{t("CHAMPIONNAT")}</option>
                  <option value="COUPE">{t("COUPE")}</option>
                  <option value="AMICAL">{t("AMICAL")}</option>
                </select>
              </div>
              <div>
                <label className={lbl}>{t("homeTeam")}</label>
                <input className={inp} value={form.homeTeam} onChange={(e) => setForm({ ...form, homeTeam: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>{t("awayTeam")}</label>
                <input className={inp} value={form.awayTeam} onChange={(e) => setForm({ ...form, awayTeam: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>{t("homeScore")}</label>
                <input type="number" min="0" className={inp} value={form.homeScore ?? ""} onChange={(e) => setForm({ ...form, homeScore: e.target.value === "" ? null : parseInt(e.target.value) })} />
              </div>
              <div>
                <label className={lbl}>{t("awayScore")}</label>
                <input type="number" min="0" className={inp} value={form.awayScore ?? ""} onChange={(e) => setForm({ ...form, awayScore: e.target.value === "" ? null : parseInt(e.target.value) })} />
              </div>
              <div>
                <label className={lbl}>{t("date")}</label>
                <input type="date" className={inp} value={form.matchDate} onChange={(e) => setForm({ ...form, matchDate: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>{t("matchday")}</label>
                <input type="number" min="1" className={inp} value={form.matchday ?? ""} onChange={(e) => setForm({ ...form, matchday: e.target.value ? parseInt(e.target.value) : null })} />
              </div>
              <div className="col-span-2">
                <label className={lbl}>{t("location")}</label>
                <input className={inp} value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShow(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">{t("cancel")}</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-[#CC0000] hover:bg-red-700 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-semibold">
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
