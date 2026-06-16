"use client";

import { useState, useEffect, useCallback } from "react";
import { swal } from "@/lib/swal";
import { printMeeting } from "@/lib/print";
import { useAdminT } from "@/lib/adminT";
import { IconPlus as Plus, IconTrash as Trash2, IconPencil as Pencil, IconX as X, IconCalendarEvent as CalendarDays, IconPrinter as Printer, IconMapPin as MapPin, IconUsers as Users, IconClock as Clock, IconPaperclip as Paperclip, IconFileText as FileText, IconUpload as Upload } from "@tabler/icons-react";
import { usePagination } from "@/lib/usePagination";
import Pagination from "@/components/ui/Pagination";

type Meeting = {
  id: string;
  title: string;
  meetingDate: string;
  location: string | null;
  agenda: string | null;
  decisions: string | null;
  notes: string | null;
  attendeeCount: number | null;
  documentUrl: string | null;
};

const EMPTY: Omit<Meeting, "id"> = {
  title: "",
  meetingDate: new Date().toISOString().slice(0, 16),
  location: "",
  agenda: "",
  decisions: "",
  notes: "",
  attendeeCount: null,
  documentUrl: null,
};

export default function AdminMeetingsPage() {
  const { t, ar } = useAdminT();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [form, setForm] = useState<Omit<Meeting, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadDoc = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload?kind=doc", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, documentUrl: data.url }));
    } finally {
      setUploading(false);
    }
  };

  const load = useCallback(() => {
    fetch("/api/meetings").then((r) => r.json()).then(setMeetings);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (m: Meeting) => {
    setEditing(m);
    setForm({
      title: m.title,
      meetingDate: m.meetingDate.slice(0, 16),
      location: m.location ?? "",
      agenda: m.agenda ?? "",
      decisions: m.decisions ?? "",
      notes: m.notes ?? "",
      attendeeCount: m.attendeeCount,
      documentUrl: m.documentUrl,
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.title) { swal.error("Titre requis", "Veuillez saisir un titre."); return; }
    setSaving(true);
    const body = {
      ...form,
      meetingDate: new Date(form.meetingDate).toISOString(),
      location: form.location || null,
      agenda: form.agenda || null,
      decisions: form.decisions || null,
      notes: form.notes || null,
    };
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/meetings/${editing.id}` : "/api/meetings";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (!res.ok) { swal.error("Erreur", "Échec de l'enregistrement."); return; }
    setModal(false);
    load();
    swal.toast(editing ? "Réunion modifiée" : "Réunion planifiée", "success");
  };

  const del = async (m: Meeting) => {
    const res = await swal.confirmDelete(m.title);
    if (!res.isConfirmed) return;
    await fetch(`/api/meetings/${m.id}`, { method: "DELETE" });
    load();
    swal.toast("Réunion supprimée", "success");
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-4 focus:ring-[#CC0000]/10 transition-all";
  const lbl = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";
  const now = new Date();

  const upcoming = meetings.filter((m) => new Date(m.meetingDate) >= now);
  const past = meetings.filter((m) => new Date(m.meetingDate) < now);
  const { paged: pagedPast, page: pastPage, setPage: setPastPage, totalPages: pastTotalPages, total: pastTotal, pageSize: pastPageSize } = usePagination(past, 10);

  return (
    <div dir={ar ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#CC0000]/10 flex items-center justify-center">
              <CalendarDays size={20} className="text-[#CC0000]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("meetings")}</h1>
              <p className="text-sm text-gray-400">{upcoming.length} à venir · {past.length} passée{past.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-500/20">
            <Plus size={16} /> {t("newMeeting")}
          </button>
        </div>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t("upcoming")}</h2>
            <div className="space-y-3">
              {upcoming.map((m) => <MeetingCard key={m.id} m={m} onEdit={openEdit} onDel={del} printPVLabel={t("printPV")} agendaLabel={t("agenda")} decisionsLabel={t("decisions")} />)}
            </div>
          </div>
        )}

        {/* Past */}
        {past.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t("past")}</h2>
            <div className="space-y-3 opacity-70">
              {pagedPast.map((m) => <MeetingCard key={m.id} m={m} past onEdit={openEdit} onDel={del} printPVLabel={t("printPV")} agendaLabel={t("agenda")} decisionsLabel={t("decisions")} />)}
            </div>
            <Pagination page={pastPage} totalPages={pastTotalPages} total={pastTotal} pageSize={pastPageSize} onChange={setPastPage} className="mt-3" />
          </div>
        )}

        {meetings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <CalendarDays size={40} className="text-gray-200 mx-auto mb-3" />
            <p>Aucune réunion enregistrée.</p>
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold">{editing ? "Modifier la réunion" : "Nouvelle réunion"}</h2>
                <button onClick={() => setModal(false)}><X size={18} className="text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className={lbl}>{t("meetingTitle")} *</label>
                  <input required className={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Réunion mensuelle du bureau" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>{t("date")}</label>
                    <input type="datetime-local" className={inp} value={form.meetingDate}
                      onChange={(e) => setForm({ ...form, meetingDate: e.target.value })} />
                  </div>
                  <div>
                    <label className={lbl}>{t("attendeeCount")}</label>
                    <input type="number" className={inp} value={form.attendeeCount ?? ""}
                      onChange={(e) => setForm({ ...form, attendeeCount: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="12" />
                  </div>
                </div>
                <div>
                  <label className={lbl}>{t("location")}</label>
                  <input className={inp} value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Salle de réunion — Terrain Municipal" />
                </div>
                <div>
                  <label className={lbl}>{t("agenda")} (une ligne par point)</label>
                  <textarea rows={4} className={inp} value={form.agenda ?? ""}
                    onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                    placeholder={"1. Bilan financier\n2. Résultats des matchs\n3. Recrutement saison prochaine"} />
                </div>
                <div>
                  <label className={lbl}>{t("decisions")} (une ligne par décision)</label>
                  <textarea rows={3} className={inp} value={form.decisions ?? ""}
                    onChange={(e) => setForm({ ...form, decisions: e.target.value })}
                    placeholder={"Validation du budget équipements\nReport du tournoi au mois prochain"} />
                </div>
                <div>
                  <label className={lbl}>{t("notes")}</label>
                  <textarea rows={2} className={inp} value={form.notes ?? ""}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>

                {/* Document attachment */}
                <div>
                  <label className={lbl}>{t("document")} (PDF, Word…)</label>
                  {form.documentUrl ? (
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                      <FileText size={16} className="text-blue-600 shrink-0" />
                      <a href={form.documentUrl} target="_blank" rel="noopener noreferrer"
                        className="text-blue-700 text-sm font-medium hover:underline flex-1 truncate">
                        {form.documentUrl.split("/").pop()}
                      </a>
                      <button type="button" onClick={() => setForm({ ...form, documentUrl: null })}
                        className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-xl px-4 py-3 text-sm transition-colors ${uploading ? "border-gray-200 text-gray-400" : "border-gray-300 hover:border-[#CC0000] text-gray-500 hover:text-[#CC0000]"}`}>
                      <Upload size={15} />
                      {uploading ? t("loading") : "Joindre un document"}
                      <input type="file" className="hidden" disabled={uploading}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(f); }} />
                    </label>
                  )}
                </div>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors">{t("cancel")}</button>
                <button onClick={save} disabled={saving || !form.title}
                  className="flex-1 bg-[#CC0000] hover:bg-red-700 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-semibold transition-all">
                  {saving ? t("saving") : t("save")}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

function MeetingCard({
  m, past = false,
  onEdit, onDel,
  printPVLabel, agendaLabel, decisionsLabel,
}: {
  m: Meeting;
  past?: boolean;
  onEdit: (m: Meeting) => void;
  onDel: (m: Meeting) => void;
  printPVLabel: string;
  agendaLabel: string;
  decisionsLabel: string;
}) {
  const date = new Date(m.meetingDate);
  const agendaItems = (m.agenda ?? "").split("\n").filter(Boolean);
  const decisionItems = (m.decisions ?? "").split("\n").filter(Boolean);

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${past ? "border-gray-100" : "border-[#CC0000]/20 hover:border-[#CC0000]/40"}`}>
      <div className="flex items-start gap-4">
        {/* Date block */}
        <div className={`shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl font-bold ${past ? "bg-gray-100 text-gray-400" : "bg-[#CC0000]/10 text-[#CC0000]"}`}>
          <span className="text-xl leading-none">{date.getDate()}</span>
          <span className="text-xs">{date.toLocaleDateString("fr-FR", { month: "short" })}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-base">{m.title}</p>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => printMeeting(m)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title={printPVLabel}>
                <Printer size={14} />
              </button>
              <button onClick={() => onEdit(m)}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                <Pencil size={14} />
              </button>
              <button onClick={() => onDel(m)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              {" "}· {date.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </span>
            {m.location && <span className="flex items-center gap-1"><MapPin size={11} />{m.location}</span>}
            {m.attendeeCount && <span className="flex items-center gap-1"><Users size={11} />{m.attendeeCount} participants</span>}
          </div>

          {agendaItems.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{agendaLabel}</p>
              <ul className="space-y-1">
                {agendaItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#CC0000] font-bold text-xs mt-0.5">{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {decisionItems.length > 0 && (
            <div className="mt-3 bg-green-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1.5">✓ {decisionsLabel}</p>
              <ul className="space-y-1">
                {decisionItems.map((item, i) => (
                  <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                    <span className="text-green-500 font-bold text-xs mt-0.5">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {m.notes && (
            <p className="text-xs text-gray-400 italic mt-2">{m.notes}</p>
          )}

          {m.documentUrl && (
            <div className="mt-3">
              <a href={m.documentUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors font-medium">
                <Paperclip size={12} />
                Document joint — {m.documentUrl.split("/").pop()}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
