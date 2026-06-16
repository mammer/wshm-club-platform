"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAdminT } from "@/lib/adminT";
import { swal } from "@/lib/swal";
import { printAttendance } from "@/lib/print";
import { IconPlus as Plus, IconTrash as Trash2, IconCircleCheckFilled as CheckCircle2, IconCircleX as XCircle, IconUsers as Users, IconChevronRight as ChevronRight, IconX as X, IconPrinter as Printer, IconClipboardList as ClipboardList, IconSearch as Search } from "@tabler/icons-react";

type PlayerRecord = {
  id: string;
  present: boolean;
  justification: string | null;
  player: { id: string; fullName: string; jerseyNumber: number | null };
};
type Session = {
  id: string;
  sessionDate: string;
  sessionType: string;
  category: string;
  notes: string | null;
  records: PlayerRecord[];
};
type Player = { id: string; fullName: string; jerseyNumber: number | null };

const CATS = ["SENIORS", "JUNIORS", "CADETS", "MINIMES"];
const CAT_COLORS: Record<string, string> = {
  SENIORS: "bg-blue-100 text-blue-700 border-blue-200",
  JUNIORS: "bg-green-100 text-green-700 border-green-200",
  CADETS:  "bg-orange-100 text-orange-700 border-orange-200",
  MINIMES: "bg-purple-100 text-purple-700 border-purple-200",
};
const SESSION_TYPES = ["ENTRAINEMENT", "MATCH", "TOURNOI"];
const SESSION_TYPE_LABELS: Record<string, string> = {
  ENTRAINEMENT: "Entraînement", MATCH: "Match", TOURNOI: "Tournoi",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

export default function AdminAttendancePage() {
  const { t, ar } = useAdminT();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filterCat, setFilterCat] = useState("SENIORS");
  const [selected, setSelected] = useState<Session | null>(null);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");
  const [form, setForm] = useState({
    sessionDate: new Date().toISOString().split("T")[0],
    sessionType: "ENTRAINEMENT",
    category: "SENIORS",
    notes: "",
  });
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});

  // Use a ref so loadSessions always has current filterCat
  const filterCatRef = useRef(filterCat);
  filterCatRef.current = filterCat;

  const loadSessions = useCallback((cat?: string) => {
    const useCat = cat ?? filterCatRef.current;
    fetch(`/api/attendance?category=${useCat}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSessions(data); });
  }, []);

  const loadPlayers = useCallback((cat: string) => {
    fetch(`/api/players?category=${cat}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPlayers(data); });
  }, []);

  useEffect(() => { loadSessions(filterCat); }, [filterCat, loadSessions]);

  const openNew = () => {
    const cat = filterCat;
    setForm({
      sessionDate: new Date().toISOString().split("T")[0],
      sessionType: "ENTRAINEMENT",
      category: cat,
      notes: "",
    });
    setAttendance({});
    setJustifications({});
    setPlayerSearch("");
    loadPlayers(cat);
    setModal(true);
  };

  // When category changes inside modal, reload players
  const changeFormCategory = (cat: string) => {
    setForm((f) => ({ ...f, category: cat }));
    setAttendance({});
    setJustifications({});
    loadPlayers(cat);
  };

  const save = async () => {
    if (!form.sessionDate) { swal.error("Date requise", "Veuillez sélectionner une date."); return; }
    setSaving(true);
    const records = players.map((p) => ({
      playerId: p.id,
      present: attendance[p.id] ?? false,
      justification: justifications[p.id] || null,
    }));
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sessionDate: new Date(form.sessionDate + "T12:00:00").toISOString(),
          records,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        swal.error("Erreur", err.error ?? "Échec de l'enregistrement.");
        setSaving(false);
        return;
      }
      setSaving(false);
      setModal(false);
      // Switch filter to match new session's category, then reload
      setFilterCat(form.category);
      loadSessions(form.category);
      swal.toast("Session enregistrée avec succès", "success");
    } catch {
      swal.error("Erreur réseau", "Impossible de contacter le serveur.");
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    const res = await swal.confirmDelete("cette session de présences");
    if (!res.isConfirmed) return;
    await fetch(`/api/attendance/${id}`, { method: "DELETE" });
    setSelected(null);
    loadSessions();
    swal.toast("Session supprimée", "success");
  };

  const toggleAll = (present: boolean) => {
    const next: Record<string, boolean> = {};
    players.forEach((p) => { next[p.id] = present; });
    setAttendance(next);
  };

  const handlePrint = (s: Session) => {
    const records = s.records.map((r) => ({
      playerName: r.player.fullName,
      jerseyNumber: r.player.jerseyNumber,
      present: r.present,
      justification: r.justification,
    }));
    printAttendance(
      { sessionDate: s.sessionDate, sessionType: SESSION_TYPE_LABELS[s.sessionType] ?? s.sessionType, category: s.category, notes: s.notes },
      records,
    );
  };

  const visiblePlayers = players.filter((p) =>
    p.fullName.toLowerCase().includes(playerSearch.toLowerCase())
  );
  const presentCount = Object.values(attendance).filter(Boolean).length;

  const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-4 focus:ring-[#CC0000]/10 transition-all";
  const lbl = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div dir={ar ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CC0000]/10 flex items-center justify-center">
            <ClipboardList size={20} className="text-[#CC0000]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("attendance")}</h1>
            <p className="text-sm text-gray-400">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""} — {filterCat}
            </p>
          </div>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-500/20">
          <Plus size={16} /> {t("newSession")}
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {CATS.map((c) => (
          <button key={c} onClick={() => { setFilterCat(c); setSelected(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterCat === c ? "bg-white text-[#1a1a1a] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Sessions list */}
        <div className="lg:col-span-2 space-y-2">
          {sessions.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <ClipboardList size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Aucune session pour {filterCat}</p>
            </div>
          )}
          {sessions.map((s) => {
            const presentC = s.records.filter((r) => r.present).length;
            const total = s.records.length;
            const pct = total > 0 ? Math.round((presentC / total) * 100) : 0;
            const isSelected = selected?.id === s.id;
            return (
              <div key={s.id} onClick={() => setSelected(isSelected ? null : s)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${isSelected ? "border-[#CC0000] shadow-sm ring-1 ring-[#CC0000]/20" : "border-gray-100 hover:border-gray-200"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`border text-xs font-semibold px-2 py-0.5 rounded-full ${CAT_COLORS[s.category]}`}>
                        {s.category}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{t(s.sessionType as Parameters<typeof t>[0])}</span>
                    </div>
                    <p className="font-semibold text-sm capitalize truncate">{fmt(s.sessionDate)}</p>
                  </div>
                  <ChevronRight size={15} className={`text-gray-300 mt-1 shrink-0 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                </div>
                {total > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{presentC}/{total} présents</span>
                      <span className={`font-bold ${pct >= 75 ? "text-green-600" : pct >= 50 ? "text-orange-500" : "text-red-500"}`}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-orange-400" : "bg-red-500"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Session detail */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 h-64 flex items-center justify-center">
              <div className="text-center">
                <Users size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Sélectionnez une session pour voir le détail</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Detail header */}
              <div className="bg-[#1a1a1a] text-white px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold capitalize">{fmt(selected.sessionDate)}</p>
                  <p className="text-white/60 text-sm">
                    {t(selected.sessionType as Parameters<typeof t>[0])} — {selected.category}
                    {" · "}{selected.records.filter((r) => r.present).length}/{selected.records.length} présents
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handlePrint(selected)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="Imprimer la feuille de présence">
                    <Printer size={15} />
                  </button>
                  <button onClick={() => del(selected.id)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-red-500/40 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Records */}
              <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
                {[...selected.records]
                  .sort((a, b) => (a.player.jerseyNumber ?? 99) - (b.player.jerseyNumber ?? 99))
                  .map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {rec.player.jerseyNumber !== null && (
                          <span className="text-xs font-mono text-gray-400 w-6 shrink-0">#{rec.player.jerseyNumber}</span>
                        )}
                        <span className="text-sm font-medium">{rec.player.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {rec.justification && (
                          <span className="text-xs text-gray-400 italic hidden sm:block">{rec.justification}</span>
                        )}
                        {rec.present ? (
                          <span className="flex items-center gap-1.5 text-green-600 text-xs font-semibold bg-green-50 px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={13} /> {t("present")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-500 text-xs font-semibold bg-red-50 px-2.5 py-1 rounded-full">
                            <XCircle size={13} /> {t("absent")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                {selected.records.length === 0 && (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">Aucun enregistrement pour cette session.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New session modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold">{t("newSession")}</h2>
              <button onClick={() => setModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
              {/* Session info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={lbl}>Date *</label>
                  <input type="date" className={inp} value={form.sessionDate}
                    onChange={(e) => setForm({ ...form, sessionDate: e.target.value })} />
                </div>
                <div>
                  <label className={lbl}>{t("sessionType")}</label>
                  <select className={inp} value={form.sessionType}
                    onChange={(e) => setForm({ ...form, sessionType: e.target.value })}>
                    {SESSION_TYPES.map((st) => (
                      <option key={st} value={st}>{t(st as Parameters<typeof t>[0])}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lbl}>{t("category")}</label>
                  <select className={inp} value={form.category} onChange={(e) => changeFormCategory(e.target.value)}>
                    {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Attendance list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={lbl} style={{ marginBottom: 0 }}>
                    {t("attendance")} — {presentCount}/{players.length} marqués présents
                  </label>
                  <div className="flex gap-3">
                    <button onClick={() => toggleAll(true)}
                      className="text-xs text-green-600 font-semibold hover:underline">{t("allPresent")}</button>
                    <span className="text-gray-300 text-xs">|</span>
                    <button onClick={() => toggleAll(false)}
                      className="text-xs text-red-500 font-semibold hover:underline">{t("allAbsent")}</button>
                  </div>
                </div>

                {/* Player search */}
                {players.length > 5 && (
                  <div className="relative mb-3">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input placeholder={t("search")}
                      className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-[#CC0000]"
                      value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)} />
                  </div>
                )}

                {players.length === 0 ? (
                  <div className="border border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
                    <Users size={24} className="mx-auto mb-2 text-gray-200" />
                    Aucun joueur actif dans la catégorie {form.category}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-64 overflow-y-auto">
                    {visiblePlayers.map((p) => (
                      <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          {p.jerseyNumber !== null && (
                            <span className="text-xs font-mono text-gray-400 w-6 shrink-0">#{p.jerseyNumber}</span>
                          )}
                          <span className="text-sm font-medium">{p.fullName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {!attendance[p.id] && (
                            <input type="text" placeholder={t("justification")}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 w-28 focus:outline-none focus:border-[#CC0000] hidden sm:block"
                              value={justifications[p.id] ?? ""}
                              onChange={(e) => setJustifications({ ...justifications, [p.id]: e.target.value })} />
                          )}
                          <button onClick={() => setAttendance({ ...attendance, [p.id]: !attendance[p.id] })}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${attendance[p.id] ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                            {attendance[p.id] ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {attendance[p.id] ? t("present") : t("absent")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className={lbl}>{t("notes")}</label>
                <input className={inp} placeholder="Observations sur cette session..."
                  value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors">{t("cancel")}</button>
              <button onClick={save} disabled={saving}
                className="flex-1 bg-[#CC0000] hover:bg-red-700 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-semibold transition-all">
                {saving ? t("saving") : `${t("save")} (${presentCount} ${t("present")}s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
