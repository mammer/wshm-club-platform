"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminT } from "@/lib/adminT";
import { swal } from "@/lib/swal";
import { Plus, CheckCircle, XCircle, Clock, ToggleLeft, ToggleRight, X, Phone, Mail, Users, MapPin, User, ShieldCheck } from "lucide-react";
import { usePagination } from "@/lib/usePagination";
import Pagination from "@/components/ui/Pagination";

type Registration = {
  id: string;
  clubName: string | null;
  clubAddress: string | null;
  clubCity: string | null;
  presidentName: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  coachName: string | null;
  coachLicense: string | null;
  category: string;
  playerCount: number;
  ageGroupMin: number | null;
  ageGroupMax: number | null;
  hasMedicalCerts: boolean;
  paymentMethod: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
};

type Tournament = {
  id: string;
  nameFr: string;
  nameAr: string;
  tournamentDate: string;
  registrationDeadline: string | null;
  categories: string;
  isOpen: boolean;
  registrations: Registration[];
};

const EMPTY = { nameFr: "", nameAr: "", tournamentDate: "", registrationDeadline: "", categories: "MINIMES,CADETS,JUNIORS,SENIORS", descriptionFr: "", descriptionAr: "", isOpen: false };

const STATUS_CONFIG: Record<string, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  PENDING:   { icon: Clock,        bg: "bg-orange-100", text: "text-orange-700", label: "En attente" },
  CONFIRMED: { icon: CheckCircle,  bg: "bg-green-100",  text: "text-green-700",  label: "Confirmé" },
  REJECTED:  { icon: XCircle,      bg: "bg-red-100",    text: "text-red-600",    label: "Refusé" },
};

export default function AdminTournamentsPage() {
  const { t, ar } = useAdminT();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState<Tournament | null>(null);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/tournaments").then((r) => r.json()).then((data) => {
      setTournaments(data);
      // refresh selected if open
      setSelected((prev) => prev ? (data.find((t: Tournament) => t.id === prev.id) ?? null) : null);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/tournaments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (!res.ok) {
      swal.toast("Erreur lors de la création du tournoi", "error");
      return;
    }
    setModal(false);
    load();
    swal.toast("Tournoi créé", "success");
  };

  const toggleOpen = async (tn: Tournament) => {
    await fetch(`/api/tournaments/${tn.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isOpen: !tn.isOpen }) });
    load();
  };

  const updateStatus = async (regId: string, status: string) => {
    await fetch("/api/tournaments/register", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: regId, status }),
    });
    load();
    swal.toast(status === "CONFIRMED" ? "Inscription confirmée" : "Inscription refusée", status === "CONFIRMED" ? "success" : "info");
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000]";
  const lbl = "block text-xs font-medium text-gray-600 mb-1";
  const { paged: pagedTournaments, page: tnPage, setPage: setTnPage, totalPages: tnTotalPages, total: tnTotal, pageSize: tnPageSize } = usePagination(tournaments, 10);

  return (
    <>
      <div dir={ar ? "rtl" : "ltr"} className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("tournaments")}</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Plus size={16} /> {t("newTournament")}
        </button>
      </div>

      <div dir={ar ? "rtl" : "ltr"} className="grid gap-4">
        {pagedTournaments.map((tn) => {
          const pending = tn.registrations.filter((r) => r.status === "PENDING").length;
          const confirmed = tn.registrations.filter((r) => r.status === "CONFIRMED").length;
          return (
            <div key={tn.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-lg">{tn.nameFr}</h2>
                  <p className="text-sm text-gray-500">{tn.nameAr}</p>
                  <p className="text-sm text-gray-400 mt-1">{new Date(tn.tournamentDate).toLocaleDateString("fr-FR")}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tn.categories.split(",").map((c) => (
                      <span key={c} className="text-xs bg-[#CC0000]/10 text-[#CC0000] px-2 py-0.5 rounded-full">{c.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button onClick={() => toggleOpen(tn)} className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full transition-colors ${tn.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {tn.isOpen ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {tn.isOpen ? t("openReg") : t("closedReg")}
                  </button>
                  <button onClick={() => setSelected(tn)} className="flex items-center gap-2 text-sm text-[#CC0000] hover:underline">
                    <span>{tn.registrations.length} {t("registrations")}</span>
                    {pending > 0 && <span className="bg-orange-100 text-orange-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{pending} en attente</span>}
                    {confirmed > 0 && <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{confirmed} confirmés</span>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {tournaments.length === 0 && <p className="text-gray-400 text-sm">{t("noData")}</p>}
      </div>
      <Pagination page={tnPage} totalPages={tnTotalPages} total={tnTotal} pageSize={tnPageSize} onChange={setTnPage} className="mt-4" />

      {/* Registrations list panel */}
      {selected && !selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div dir={ar ? "rtl" : "ltr"} className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">{selected.nameFr}</h2>
                <p className="text-sm text-gray-400">{selected.registrations.length} inscription{selected.registrations.length !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              {selected.registrations.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">{t("noData")}</p>
              ) : (
                selected.registrations.map((r) => {
                  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={r.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{r.clubName || r.contactName}</p>
                            {r.clubName && r.clubName !== r.contactName && (
                              <span className="text-xs text-gray-400">({r.contactName})</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Phone size={11} /> {r.contactPhone}</span>
                            {r.contactEmail && <span className="flex items-center gap-1"><Mail size={11} /> {r.contactEmail}</span>}
                            <span className="flex items-center gap-1"><Users size={11} /> {r.playerCount} joueurs — {r.category}</span>
                            {r.clubCity && <span className="flex items-center gap-1"><MapPin size={11} /> {r.clubCity}</span>}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                              <StatusIcon size={11} /> {cfg.label}
                            </span>
                            {r.hasMedicalCerts && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                <ShieldCheck size={11} /> Certificats médicaux
                              </span>
                            )}
                            <span className="text-xs text-gray-300">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button onClick={() => setSelectedReg(r)} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            Détails
                          </button>
                          {r.status !== "CONFIRMED" && (
                            <button onClick={() => updateStatus(r.id, "CONFIRMED")}
                              className="text-xs px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg transition-colors font-semibold">
                              Confirmer
                            </button>
                          )}
                          {r.status !== "REJECTED" && (
                            <button onClick={() => updateStatus(r.id, "REJECTED")}
                              className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors font-semibold">
                              Refuser
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setSelected(null)} className="w-full border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">{t("close")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Full registration detail */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedReg(null)}>
          <div dir={ar ? "rtl" : "ltr"} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-bold text-lg">Fiche d&apos;inscription</h2>
              <button onClick={() => setSelectedReg(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              {/* Status */}
              <div>
                {(() => {
                  const cfg = STATUS_CONFIG[selectedReg.status] ?? STATUS_CONFIG.PENDING;
                  const StatusIcon = cfg.icon;
                  return (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${cfg.bg} ${cfg.text} font-semibold`}>
                      <StatusIcon size={13} /> {cfg.label}
                    </div>
                  );
                })()}
              </div>

              {/* Club info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Club / Équipe</p>
                <Row label="Nom" value={selectedReg.clubName || "—"} />
                <Row label="Ville" value={selectedReg.clubCity || "—"} />
                <Row label="Adresse" value={selectedReg.clubAddress || "—"} />
                <Row label="Président" value={selectedReg.presidentName || "—"} />
              </div>

              {/* Contact */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact</p>
                <Row label="Nom" value={selectedReg.contactName} />
                <Row label="Téléphone" value={selectedReg.contactPhone} />
                <Row label="Email" value={selectedReg.contactEmail || "—"} />
              </div>

              {/* Participation */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Participation</p>
                <Row label="Catégorie" value={selectedReg.category} />
                <Row label="Nombre de joueurs" value={String(selectedReg.playerCount)} />
                {selectedReg.ageGroupMin && <Row label="Âge min" value={String(selectedReg.ageGroupMin)} />}
                {selectedReg.ageGroupMax && <Row label="Âge max" value={String(selectedReg.ageGroupMax)} />}
                <Row label="Entraîneur" value={selectedReg.coachName || "—"} />
                <Row label="Licence entraîneur" value={selectedReg.coachLicense || "—"} />
                <Row label="Certificats médicaux" value={selectedReg.hasMedicalCerts ? "Oui ✓" : "Non"} />
                <Row label="Mode de paiement" value={selectedReg.paymentMethod || "—"} />
              </div>

              {selectedReg.notes && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-yellow-700 mb-1">Notes</p>
                  <p className="text-gray-700">{selectedReg.notes}</p>
                </div>
              )}

              <p className="text-xs text-gray-400 text-right">Inscrit le {new Date(selectedReg.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2">
              {selectedReg.status !== "CONFIRMED" && (
                <button onClick={() => { updateStatus(selectedReg.id, "CONFIRMED"); setSelectedReg(null); }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors">
                  Confirmer
                </button>
              )}
              {selectedReg.status !== "REJECTED" && (
                <button onClick={() => { updateStatus(selectedReg.id, "REJECTED"); setSelectedReg(null); }}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg py-2.5 text-sm font-semibold transition-colors">
                  Refuser
                </button>
              )}
              <button onClick={() => setSelectedReg(null)} className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm hover:bg-gray-50">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New tournament modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div dir={ar ? "rtl" : "ltr"} className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-5">{t("newTournament")}</h2>
            <div className="space-y-3">
              <div><label className={lbl}>Nom (FR) *</label><input required className={inp} value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })} /></div>
              <div><label className={lbl}>الاسم (AR)</label><input className={`${inp} text-right`} dir="rtl" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>{t("date")}</label><input type="date" className={inp} value={form.tournamentDate} onChange={(e) => setForm({ ...form, tournamentDate: e.target.value })} /></div>
                <div><label className={lbl}>Date limite inscription</label><input type="date" className={inp} value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} /></div>
              </div>
              <div><label className={lbl}>Catégories (séparées par virgule)</label><input className={inp} value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} /></div>
              <div><label className={lbl}>Description (FR)</label><textarea rows={2} className={inp} value={form.descriptionFr} onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })} /></div>
              <div><label className={lbl}>الوصف (AR)</label><textarea rows={2} className={`${inp} text-right`} dir="rtl" value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isOpen} onChange={(e) => setForm({ ...form, isOpen: e.target.checked })} className="rounded" />
                {t("openReg")}
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">{t("cancel")}</button>
              <button onClick={save} disabled={saving || !form.nameFr || !form.tournamentDate} className="flex-1 bg-[#CC0000] hover:bg-red-700 disabled:opacity-60 text-white rounded-lg py-2 text-sm font-semibold">
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
