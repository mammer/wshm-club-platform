"use client";

import { useState, useEffect, useCallback } from "react";
import { swal } from "@/lib/swal";
import {
  ChevronLeft, ChevronRight, X, Plus, Pencil, Trash2,
  MapPin, Users, Trophy, Flag, ClipboardList,
  CalendarDays, Clock,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type EventType = "match" | "meeting" | "attendance" | "tournament";

type CalEvent = {
  id: string;
  date: string;
  title: string;
  type: EventType;
  subtitle?: string;
  color: string;
  detail?: Record<string, string | number | null | undefined>;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAYS_AR = ["الإث", "الثل", "الأر", "الخم", "الجم", "السب", "الأح"];
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","ماي","يونيو","يوليوز","غشت","شتنبر","أكتوبر","نونبر","دجنبر"];

const CATEGORIES = ["SENIORS", "JUNIORS", "CADETS", "MINIMES"];
const SESSION_TYPES = ["ENTRAINEMENT", "MATCH", "TOURNOI"];
const COMPETITIONS = ["CHAMPIONNAT", "COUPE", "AMICAL"];

const TYPE_META: Record<EventType, { label: string; labelAr: string; color: string; icon: React.FC<{size:number}> }> = {
  match:      { label: "Match",           labelAr: "مباراة",      color: "bg-blue-500",    icon: ({ size }) => <Trophy size={size} /> },
  meeting:    { label: "Réunion",         labelAr: "اجتماع",      color: "bg-[#CC0000]",   icon: ({ size }) => <Users size={size} /> },
  attendance: { label: "Fiche de présence", labelAr: "حضور",      color: "bg-green-500",   icon: ({ size }) => <ClipboardList size={size} /> },
  tournament: { label: "Tournoi",         labelAr: "بطولة",       color: "bg-yellow-500",  icon: ({ size }) => <Flag size={size} /> },
};

const LEGEND = [
  { type: "meeting",    fr: "Réunions",   ar: "الاجتماعات" },
  { type: "match",      fr: "Matchs",     ar: "المباريات" },
  { type: "attendance", fr: "Présences",  ar: "الحضور" },
  { type: "tournament", fr: "Tournois",   ar: "البطولات" },
] as const;

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDayMonday(y: number, m: number) { return (new Date(y, m, 1).getDay() + 6) % 7; }
function localISO(y: number, m: number, d: number, t = "08:00") {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}T${t}`;
}

// ─── Empty forms ─────────────────────────────────────────────────────────────

const emptyMatch = (date = "") => ({
  homeTeam: "W.S.H.M Madagh", awayTeam: "", matchDate: date,
  homeScore: "", awayScore: "", location: "", competition: "CHAMPIONNAT",
  category: "SENIORS", matchday: "",
});
const emptyMeeting = (date = "") => ({
  title: "", meetingDate: date, location: "", agenda: "",
  decisions: "", attendeeCount: "", notes: "",
});
const emptyAttendance = (date = "") => ({
  sessionDate: date.slice(0, 10), category: "SENIORS",
  sessionType: "ENTRAINEMENT", notes: "",
});
const emptyTournament = (date = "") => ({
  nameFr: "", nameAr: "", tournamentDate: date,
  registrationDeadline: "", categories: "SENIORS", isOpen: true,
  descriptionFr: "",
});

// ─── Component ───────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [lang, setLang]   = useState<"fr" | "ar">("fr");

  // Modal state
  const [modal, setModal]       = useState<EventType | null>(null); // which type to add/edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMatch,      setFormMatch]      = useState(emptyMatch());
  const [formMeeting,    setFormMeeting]    = useState(emptyMeeting());
  const [formAttendance, setFormAttendance] = useState(emptyAttendance());
  const [formTournament, setFormTournament] = useState(emptyTournament());
  const [saving, setSaving] = useState(false);
  const [typePickerDay, setTypePickerDay] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin-lang") as "fr" | "ar" | null;
    if (stored) setLang(stored);
  }, []);

  const ar = lang === "ar";
  const DAYS   = ar ? DAYS_AR : DAYS_FR;
  const MONTHS = ar ? MONTHS_AR : MONTHS_FR;

  const load = useCallback(() => {
    const start = new Date(year, month, 1).toISOString();
    const end   = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    fetch(`/api/calendar?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setEvents(data); });
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1);
    setSelectedDay(null);
  };
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelectedDay(now.getDate()); };

  const byDay: Record<number, CalEvent[]> = {};
  for (const ev of events) {
    const d = new Date(ev.date).getDate();
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(ev);
  }

  const days = daysInMonth(year, month);
  const firstDay = firstDayMonday(year, month);
  const selectedEvents = selectedDay ? (byDay[selectedDay] ?? []) : [];

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(ar ? "ar-MA" : "fr-MA", { hour: "2-digit", minute: "2-digit" });

  // ── Open add modal ──
  const openAdd = (type: EventType, day: number) => {
    const dateStr = localISO(year, month, day);
    setEditingId(null);
    setTypePickerDay(null);
    if (type === "match")      setFormMatch(emptyMatch(dateStr));
    if (type === "meeting")    setFormMeeting(emptyMeeting(dateStr));
    if (type === "attendance") setFormAttendance(emptyAttendance(dateStr));
    if (type === "tournament") setFormTournament(emptyTournament(dateStr));
    setModal(type);
  };

  // ── Open edit modal ──
  const openEdit = async (ev: CalEvent) => {
    setEditingId(ev.id);
    setSaving(false);
    if (ev.type === "match") {
      const res = await fetch(`/api/matches/${ev.id}`).catch(() => null);
      const data = res?.ok ? await res.json() : {};
      setFormMatch({
        homeTeam: data.homeTeam ?? "", awayTeam: data.awayTeam ?? "",
        matchDate: data.matchDate ? new Date(data.matchDate).toISOString().slice(0, 16) : "",
        homeScore: data.homeScore ?? "", awayScore: data.awayScore ?? "",
        location: data.location ?? "", competition: data.competition ?? "CHAMPIONNAT",
        category: data.category ?? "SENIORS", matchday: data.matchday ?? "",
      });
    }
    if (ev.type === "meeting") {
      const res = await fetch(`/api/meetings/${ev.id}`).catch(() => null);
      const data = res?.ok ? await res.json() : {};
      setFormMeeting({
        title: data.title ?? "", meetingDate: data.meetingDate ? new Date(data.meetingDate).toISOString().slice(0, 16) : "",
        location: data.location ?? "", agenda: data.agenda ?? "",
        decisions: data.decisions ?? "", attendeeCount: data.attendeeCount ?? "", notes: data.notes ?? "",
      });
    }
    if (ev.type === "attendance") {
      const res = await fetch(`/api/attendance/${ev.id}`).catch(() => null);
      const data = res?.ok ? await res.json() : {};
      setFormAttendance({
        sessionDate: data.sessionDate ? new Date(data.sessionDate).toISOString().slice(0, 10) : "",
        category: data.category ?? "SENIORS", sessionType: data.sessionType ?? "ENTRAINEMENT", notes: data.notes ?? "",
      });
    }
    if (ev.type === "tournament") {
      const res = await fetch(`/api/tournaments/${ev.id}`).catch(() => null);
      const data = res?.ok ? await res.json() : {};
      setFormTournament({
        nameFr: data.nameFr ?? "", nameAr: data.nameAr ?? "",
        tournamentDate: data.tournamentDate ? new Date(data.tournamentDate).toISOString().slice(0, 16) : "",
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString().slice(0, 16) : "",
        categories: data.categories ?? "SENIORS", isOpen: data.isOpen ?? true,
        descriptionFr: data.descriptionFr ?? "",
      });
    }
    setModal(ev.type);
  };

  // ── Delete event ──
  const deleteEvent = async (ev: CalEvent) => {
    const res = await swal.confirmDelete(ev.title);
    if (!res.isConfirmed) return;
    const url = ev.type === "match" ? `/api/matches/${ev.id}`
      : ev.type === "meeting" ? `/api/meetings/${ev.id}`
      : ev.type === "attendance" ? `/api/attendance/${ev.id}`
      : `/api/tournaments/${ev.id}`;
    await fetch(url, { method: "DELETE" });
    load();
    swal.toast(ar ? "تم الحذف" : "Événement supprimé", "success");
  };

  // ── Save ──
  const save = async () => {
    setSaving(true);
    try {
      let url: string;
      let body: Record<string, unknown>;

      if (modal === "match") {
        url = editingId ? `/api/matches/${editingId}` : "/api/matches";
        body = {
          ...formMatch,
          matchDate: new Date(formMatch.matchDate).toISOString(),
          homeScore: formMatch.homeScore !== "" ? Number(formMatch.homeScore) : null,
          awayScore: formMatch.awayScore !== "" ? Number(formMatch.awayScore) : null,
          matchday: formMatch.matchday !== "" ? Number(formMatch.matchday) : null,
          location: formMatch.location || null,
        };
      } else if (modal === "meeting") {
        url = editingId ? `/api/meetings/${editingId}` : "/api/meetings";
        body = {
          ...formMeeting,
          meetingDate: new Date(formMeeting.meetingDate).toISOString(),
          attendeeCount: formMeeting.attendeeCount !== "" ? Number(formMeeting.attendeeCount) : null,
          location: formMeeting.location || null,
          agenda: formMeeting.agenda || null,
          decisions: formMeeting.decisions || null,
          notes: formMeeting.notes || null,
        };
      } else if (modal === "attendance") {
        url = editingId ? `/api/attendance/${editingId}` : "/api/attendance";
        body = {
          ...formAttendance,
          sessionDate: new Date(formAttendance.sessionDate + "T12:00:00").toISOString(),
          notes: formAttendance.notes || null,
        };
      } else {
        url = editingId ? `/api/tournaments/${editingId}` : "/api/tournaments";
        body = {
          ...formTournament,
          tournamentDate: new Date(formTournament.tournamentDate).toISOString(),
          registrationDeadline: formTournament.registrationDeadline ? new Date(formTournament.registrationDeadline).toISOString() : null,
          descriptionFr: formTournament.descriptionFr || null,
          descriptionAr: null,
        };
      }

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModal(null);
        load();
        swal.toast(editingId ? (ar ? "تم التعديل" : "Modifié avec succès") : (ar ? "تم الإضافة" : "Ajouté avec succès"), "success");
      } else {
        const err = await res.json().catch(() => ({}));
        swal.error("Erreur", err.error ?? "Une erreur est survenue");
      }
    } finally {
      setSaving(false);
    }
  };

  // ── UI helpers ──
  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-4 focus:ring-[#CC0000]/10 transition-all bg-white";
  const lbl = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1";

  const TypeIcon = ({ type, size = 13 }: { type: string; size?: number }) => {
    const M = TYPE_META[type as EventType];
    if (!M) return null;
    return <M.icon size={size} />;
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">{ar ? "الروزنامة" : "Calendrier"}</h1>
          <p className="text-sm text-gray-400">
            {events.length} {ar ? "حدث" : "événement"}{!ar && events.length !== 1 ? "s" : ""} — {MONTHS[month]} {year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="px-3 py-2 font-semibold text-sm min-w-[150px] text-center">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <ChevronRight size={18} />
          </button>
          <button onClick={goToday} className="ml-1 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            {ar ? "اليوم" : "Aujourd'hui"}
          </button>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
        {LEGEND.map((l) => (
          <div key={l.type} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${TYPE_META[l.type].color} inline-block`} />
            {ar ? l.ar : l.fr}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Calendar grid ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
              {DAYS.map((d) => (
                <div key={d} className="py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e-${i}`} className="min-h-[90px] border-b border-r border-gray-50 bg-gray-50/40" />
              ))}
              {Array.from({ length: days }).map((_, i) => {
                const day = i + 1;
                const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                const isSelected = day === selectedDay;
                const dayEvents = byDay[day] ?? [];
                return (
                  <div key={day}
                    onClick={() => { setSelectedDay(isSelected ? null : day); setTypePickerDay(null); }}
                    className={`min-h-[90px] border-b border-r border-gray-50 p-1.5 cursor-pointer transition-colors relative group ${
                      isSelected ? "bg-red-50 border-red-100" : isToday ? "bg-amber-50/40" : "hover:bg-gray-50"
                    }`}>
                    <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? "bg-[#CC0000] text-white" : isSelected ? "bg-[#CC0000]/10 text-[#CC0000]" : "text-gray-600"
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev, idx) => (
                        <div key={idx} className={`${ev.color} text-white rounded px-1 py-0.5 text-[9px] leading-tight truncate flex items-center gap-0.5`}>
                          <TypeIcon type={ev.type} size={9} />
                          <span className="truncate">{ev.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[9px] text-gray-400 font-medium px-1">+{dayEvents.length - 3}</div>
                      )}
                    </div>
                    {/* Quick-add button (appears on hover) */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedDay(day); setTypePickerDay(typePickerDay === day ? null : day); }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#CC0000] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="lg:col-span-1 space-y-3">

          {/* Type picker (appears when + clicked on a day) */}
          {typePickerDay && (
            <div className="bg-white rounded-2xl border border-[#CC0000]/30 shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-700">
                  {ar ? "إضافة حدث" : "Ajouter un événement"}
                  <span className="ml-2 text-xs text-gray-400 font-normal">
                    {String(typePickerDay).padStart(2,"0")} {MONTHS[month]}
                  </span>
                </p>
                <button onClick={() => setTypePickerDay(null)}><X size={14} className="text-gray-400" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(TYPE_META) as [EventType, typeof TYPE_META[EventType]][]).map(([type, meta]) => (
                  <button key={type} onClick={() => openAdd(type, typePickerDay)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 border-transparent ${meta.color} text-white hover:opacity-90 transition-all text-xs font-semibold`}>
                    <meta.icon size={18} />
                    {ar ? meta.labelAr : meta.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected day panel */}
          {selectedDay ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-[#1a1a1a] text-white px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">
                    {new Date(year, month, selectedDay).toLocaleDateString(ar ? "ar-MA" : "fr-MA", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">
                    {selectedEvents.length} {ar ? "حدث" : "événement"}{!ar && selectedEvents.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTypePickerDay(typePickerDay === selectedDay ? null : selectedDay)}
                    className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                    <Plus size={12} /> {ar ? "إضافة" : "Ajouter"}
                  </button>
                  <button onClick={() => { setSelectedDay(null); setTypePickerDay(null); }} className="text-white/40 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {selectedEvents.length === 0 ? (
                <div className="p-8 text-center">
                  <CalendarDays size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">{ar ? "لا أحداث هذا اليوم" : "Aucun événement ce jour"}</p>
                  <button onClick={() => setTypePickerDay(selectedDay)}
                    className="mt-3 flex items-center gap-1.5 text-xs text-[#CC0000] font-semibold mx-auto hover:underline">
                    <Plus size={12} /> {ar ? "إضافة حدث" : "Ajouter un événement"}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
                  {selectedEvents.map((ev) => {
                    const meta = TYPE_META[ev.type];
                    return (
                      <div key={ev.id} className="p-4 group">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl ${meta.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                            <meta.icon size={15} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <p className="font-semibold text-sm leading-tight">{ev.title}</p>
                              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(ev)}
                                  className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title={ar ? "تعديل" : "Modifier"}>
                                  <Pencil size={13} />
                                </button>
                                <button onClick={() => deleteEvent(ev)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title={ar ? "حذف" : "Supprimer"}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${meta.color}`}>
                                {ar ? meta.labelAr : meta.label}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                <Clock size={9} /> {fmtTime(ev.date)}
                              </span>
                            </div>
                            {ev.subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{ev.subtitle}</p>}

                            {/* Detail fields */}
                            {ev.detail && (
                              <div className="mt-2 space-y-1">
                                {ev.detail.location && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <MapPin size={10} className="text-gray-400 shrink-0" />
                                    {ev.detail.location}
                                  </div>
                                )}
                                {ev.detail.category && ev.type !== "meeting" && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Users size={10} className="text-gray-400 shrink-0" />
                                    {ev.detail.category}
                                  </div>
                                )}
                                {ev.detail.attendeeCount && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Users size={10} className="text-gray-400 shrink-0" />
                                    {ev.detail.attendeeCount} {ar ? "حاضر" : "participants"}
                                  </div>
                                )}
                                {(ev.detail.homeScore != null && ev.detail.awayScore != null) && (
                                  <div className="inline-flex items-center gap-1 text-xs font-bold text-[#CC0000] bg-red-50 px-2 py-0.5 rounded-full">
                                    {ev.detail.homeScore} — {ev.detail.awayScore}
                                  </div>
                                )}
                                {ev.detail.competition && (
                                  <div className="text-xs text-gray-400">{ev.detail.competition as string}</div>
                                )}
                                {ev.detail.agenda && (
                                  <div className="mt-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg p-2 leading-relaxed">
                                    {(ev.detail.agenda as string).split("\n").filter(Boolean).slice(0, 3).map((line, i) => (
                                      <div key={i} className="flex gap-1"><span className="text-[#CC0000] font-bold">{i+1}.</span>{line}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Month list when no day selected */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {ar ? "أحداث الشهر" : "Événements du mois"}
                </p>
              </div>
              {events.length === 0 ? (
                <div className="px-4 pb-8 text-center">
                  <CalendarDays size={28} className="text-gray-200 mx-auto mb-2 mt-4" />
                  <p className="text-gray-400 text-sm">{ar ? "لا أحداث هذا الشهر" : "Aucun événement ce mois"}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-[560px] overflow-y-auto">
                  {[...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((ev) => {
                    const meta = TYPE_META[ev.type];
                    return (
                      <div key={ev.id} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group">
                        <button onClick={() => setSelectedDay(new Date(ev.date).getDate())} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                          <div className={`w-9 h-9 rounded-xl ${meta.color} flex items-center justify-center text-white shrink-0`}>
                            <span className="text-xs font-bold">{new Date(ev.date).getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate leading-tight">{ev.title}</p>
                            <p className="text-xs text-gray-400 truncate">{ar ? meta.labelAr : meta.label} · {fmtTime(ev.date)}</p>
                          </div>
                        </button>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteEvent(ev)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!selectedDay && events.length > 0 && (
        <p className="text-center text-xs text-gray-300 mt-4">
          {ar ? "انقر على يوم أو حدث لعرض تفاصيله وتعديله" : "Cliquez sur un jour pour voir ses détails · Survolez un événement pour modifier/supprimer"}
        </p>
      )}

      {/* ══════════════════════ MODALS ══════════════════════ */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-8" onClick={(e) => e.stopPropagation()} dir={ar ? "rtl" : "ltr"}>
            {/* Modal header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 ${TYPE_META[modal].color} rounded-t-2xl`}>
              <div className="flex items-center gap-2 text-white">
                {(() => { const M = TYPE_META[modal]; return <M.icon size={18} />; })()}
                <h2 className="font-bold text-base">
                  {editingId ? (ar ? "تعديل" : "Modifier") : (ar ? "إضافة" : "Ajouter")} {ar ? TYPE_META[modal].labelAr : TYPE_META[modal].label}
                </h2>
              </div>
              <button onClick={() => setModal(null)} className="text-white/60 hover:text-white transition-colors"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">

              {/* ── MATCH form ── */}
              {modal === "match" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>{ar ? "الفريق المضيف" : "Équipe domicile"} *</label>
                      <input className={inp} value={formMatch.homeTeam} onChange={(e) => setFormMatch({ ...formMatch, homeTeam: e.target.value })} />
                    </div>
                    <div>
                      <label className={lbl}>{ar ? "الفريق الضيف" : "Équipe visiteur"} *</label>
                      <input className={inp} value={formMatch.awayTeam} onChange={(e) => setFormMatch({ ...formMatch, awayTeam: e.target.value })} placeholder="Club adversaire" />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>{ar ? "التاريخ والوقت" : "Date & heure"} *</label>
                    <input type="datetime-local" className={inp} value={formMatch.matchDate} onChange={(e) => setFormMatch({ ...formMatch, matchDate: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={lbl}>{ar ? "الفئة" : "Catégorie"}</label>
                      <select className={inp} value={formMatch.category} onChange={(e) => setFormMatch({ ...formMatch, category: e.target.value })}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>{ar ? "نتيجة المضيف" : "Score dom."}</label>
                      <input type="number" min="0" className={inp} value={formMatch.homeScore} onChange={(e) => setFormMatch({ ...formMatch, homeScore: e.target.value })} placeholder="—" />
                    </div>
                    <div>
                      <label className={lbl}>{ar ? "نتيجة الضيف" : "Score vis."}</label>
                      <input type="number" min="0" className={inp} value={formMatch.awayScore} onChange={(e) => setFormMatch({ ...formMatch, awayScore: e.target.value })} placeholder="—" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>{ar ? "النوع" : "Compétition"}</label>
                      <select className={inp} value={formMatch.competition} onChange={(e) => setFormMatch({ ...formMatch, competition: e.target.value })}>
                        {COMPETITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>{ar ? "الجولة" : "Journée"}</label>
                      <input type="number" min="1" className={inp} value={formMatch.matchday} onChange={(e) => setFormMatch({ ...formMatch, matchday: e.target.value })} placeholder="—" />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>{ar ? "الملعب" : "Lieu"}</label>
                    <input className={inp} value={formMatch.location} onChange={(e) => setFormMatch({ ...formMatch, location: e.target.value })} placeholder="Stade de Madagh" />
                  </div>
                </>
              )}

              {/* ── MEETING form ── */}
              {modal === "meeting" && (
                <>
                  <div>
                    <label className={lbl}>{ar ? "الموضوع" : "Titre / Objet"} *</label>
                    <input className={inp} value={formMeeting.title} onChange={(e) => setFormMeeting({ ...formMeeting, title: e.target.value })} placeholder="Réunion bureau ordinaire" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>{ar ? "التاريخ والوقت" : "Date & heure"} *</label>
                      <input type="datetime-local" className={inp} value={formMeeting.meetingDate} onChange={(e) => setFormMeeting({ ...formMeeting, meetingDate: e.target.value })} />
                    </div>
                    <div>
                      <label className={lbl}>{ar ? "المكان" : "Lieu"}</label>
                      <input className={inp} value={formMeeting.location} onChange={(e) => setFormMeeting({ ...formMeeting, location: e.target.value })} placeholder="Siège du club" />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>{ar ? "عدد الحاضرين" : "Nombre de présents"}</label>
                    <input type="number" min="0" className={inp} value={formMeeting.attendeeCount} onChange={(e) => setFormMeeting({ ...formMeeting, attendeeCount: e.target.value })} />
                  </div>
                  <div>
                    <label className={lbl}>{ar ? "جدول الأعمال" : "Ordre du jour"}</label>
                    <textarea rows={3} className={inp} value={formMeeting.agenda} onChange={(e) => setFormMeeting({ ...formMeeting, agenda: e.target.value })} placeholder="1. Point 1&#10;2. Point 2" />
                  </div>
                  <div>
                    <label className={lbl}>{ar ? "القرارات" : "Décisions prises"}</label>
                    <textarea rows={2} className={inp} value={formMeeting.decisions} onChange={(e) => setFormMeeting({ ...formMeeting, decisions: e.target.value })} />
                  </div>
                  <div>
                    <label className={lbl}>{ar ? "ملاحظات" : "Notes"}</label>
                    <textarea rows={2} className={inp} value={formMeeting.notes} onChange={(e) => setFormMeeting({ ...formMeeting, notes: e.target.value })} />
                  </div>
                </>
              )}

              {/* ── ATTENDANCE form ── */}
              {modal === "attendance" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>{ar ? "الفئة" : "Catégorie"} *</label>
                      <select className={inp} value={formAttendance.category} onChange={(e) => setFormAttendance({ ...formAttendance, category: e.target.value })}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>{ar ? "نوع الجلسة" : "Type de session"} *</label>
                      <select className={inp} value={formAttendance.sessionType} onChange={(e) => setFormAttendance({ ...formAttendance, sessionType: e.target.value })}>
                        {SESSION_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>{ar ? "التاريخ" : "Date"} *</label>
                    <input type="date" className={inp} value={formAttendance.sessionDate} onChange={(e) => setFormAttendance({ ...formAttendance, sessionDate: e.target.value })} />
                  </div>
                  <div>
                    <label className={lbl}>{ar ? "ملاحظات" : "Notes"}</label>
                    <textarea rows={2} className={inp} value={formAttendance.notes} onChange={(e) => setFormAttendance({ ...formAttendance, notes: e.target.value })} />
                  </div>
                  <p className="text-xs text-gray-400 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    {ar ? "يمكنك تسجيل الحضور الفردي من صفحة الحضور." : "Pour saisir les présences individuelles, utilisez la page Présences."}
                  </p>
                </>
              )}

              {/* ── TOURNAMENT form ── */}
              {modal === "tournament" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Nom (FR) *</label>
                      <input className={inp} value={formTournament.nameFr} onChange={(e) => setFormTournament({ ...formTournament, nameFr: e.target.value })} placeholder="Tournoi de Madagh" />
                    </div>
                    <div>
                      <label className={lbl}>الاسم (AR)</label>
                      <input className={`${inp} text-right`} dir="rtl" value={formTournament.nameAr} onChange={(e) => setFormTournament({ ...formTournament, nameAr: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>{ar ? "تاريخ البطولة" : "Date du tournoi"} *</label>
                      <input type="datetime-local" className={inp} value={formTournament.tournamentDate} onChange={(e) => setFormTournament({ ...formTournament, tournamentDate: e.target.value })} />
                    </div>
                    <div>
                      <label className={lbl}>{ar ? "آخر أجل التسجيل" : "Clôture inscriptions"}</label>
                      <input type="datetime-local" className={inp} value={formTournament.registrationDeadline} onChange={(e) => setFormTournament({ ...formTournament, registrationDeadline: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>{ar ? "الفئات" : "Catégories"}</label>
                      <input className={inp} value={formTournament.categories} onChange={(e) => setFormTournament({ ...formTournament, categories: e.target.value })} placeholder="SENIORS,JUNIORS" />
                    </div>
                    <div>
                      <label className={lbl}>{ar ? "التسجيل" : "Inscriptions"}</label>
                      <select className={inp} value={String(formTournament.isOpen)} onChange={(e) => setFormTournament({ ...formTournament, isOpen: e.target.value === "true" })}>
                        <option value="true">{ar ? "مفتوحة" : "Ouvertes"}</option>
                        <option value="false">{ar ? "مغلقة" : "Fermées"}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>{ar ? "الوصف" : "Description"}</label>
                    <textarea rows={2} className={inp} value={formTournament.descriptionFr} onChange={(e) => setFormTournament({ ...formTournament, descriptionFr: e.target.value })} />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors">
                {ar ? "إلغاء" : "Annuler"}
              </button>
              <button onClick={save} disabled={saving}
                className={`flex-1 ${TYPE_META[modal].color} hover:opacity-90 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all`}>
                {saving ? (ar ? "جارٍ الحفظ..." : "Enregistrement...") : (editingId ? (ar ? "حفظ التعديلات" : "Modifier") : (ar ? "إضافة" : "Ajouter"))}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
