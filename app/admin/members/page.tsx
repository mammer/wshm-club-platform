"use client";

import { useState, useEffect, useCallback } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import { useAdminT } from "@/lib/adminT";
import { swal } from "@/lib/swal";
import {
  Plus, Trash2, Pencil, X, Users2, Phone, Mail, MapPin,
  Crown, Star, Shield, Briefcase, User, Award,
} from "lucide-react";
import { usePagination } from "@/lib/usePagination";
import Pagination from "@/components/ui/Pagination";

type Member = {
  id: string;
  fullName: string;
  role: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  birthDate: string | null;
  joinDate: string;
  photoUrl: string | null;
  cin: string | null;
  notes: string | null;
  isActive: boolean;
};

const ROLES = ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "TREASURER", "MEMBER", "HONORARY"];

const ROLE_META: Record<string, { color: string; icon: React.ElementType }> = {
  PRESIDENT:      { color: "bg-red-100 text-[#CC0000] border-red-200",     icon: Crown },
  VICE_PRESIDENT: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: Star },
  SECRETARY:      { color: "bg-blue-100 text-blue-700 border-blue-200",    icon: Briefcase },
  TREASURER:      { color: "bg-green-100 text-green-700 border-green-200",  icon: Shield },
  MEMBER:         { color: "bg-gray-100 text-gray-600 border-gray-200",    icon: User },
  HONORARY:       { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Award },
};

const BUREAU_ROLES = ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "TREASURER"];

const EMPTY = {
  fullName: "", role: "MEMBER", phone: "", email: "",
  address: "", birthDate: "", cin: "", notes: "", photoUrl: "", isActive: true,
};

export default function AdminMembersPage() {
  const { t, ar } = useAdminT();
  const [members, setMembers] = useState<Member[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterRole, setFilterRole] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    fetch("/api/members").then((r) => r.json()).then(setMembers);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({
      fullName: m.fullName, role: m.role,
      phone: m.phone ?? "", email: m.email ?? "",
      address: m.address ?? "",
      birthDate: m.birthDate ? m.birthDate.slice(0, 10) : "",
      cin: m.cin ?? "", notes: m.notes ?? "",
      photoUrl: m.photoUrl ?? "", isActive: m.isActive,
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.fullName) { swal.error("Nom requis", "Veuillez saisir le nom complet."); return; }
    setSaving(true);
    const body = {
      ...form,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      birthDate: form.birthDate ? new Date(form.birthDate + "T12:00:00").toISOString() : null,
      cin: form.cin || null,
      notes: form.notes || null,
      photoUrl: form.photoUrl || null,
    };
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/members/${editing.id}` : "/api/members";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (!res.ok) { swal.error("Erreur", "Échec de l'enregistrement."); return; }
    setModal(false);
    load();
    swal.toast(editing ? "Membre modifié" : "Membre ajouté", "success");
  };

  const del = async (m: Member) => {
    const res = await swal.confirmDelete(m.fullName);
    if (!res.isConfirmed) return;
    await fetch(`/api/members/${m.id}`, { method: "DELETE" });
    load();
    swal.toast("Membre supprimé", "success");
  };

  const bureau = members.filter((m) => BUREAU_ROLES.includes(m.role));
  const filtered = members.filter((m) => {
    const matchRole = !filterRole || m.role === filterRole;
    const matchSearch = !search || m.fullName.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });
  const activeCount = members.filter((m) => m.isActive).length;
  const { paged: pagedMembers, page: membPage, setPage: setMembPage, totalPages: membTotalPages, total: membTotal, pageSize: membPageSize } = usePagination(filtered, 12);

  const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-4 focus:ring-[#CC0000]/10 transition-all";
  const lbl = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <>
      {/* Header */}
      <div dir={ar ? "rtl" : "ltr"} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CC0000]/10 flex items-center justify-center">
            <Users2 size={20} className="text-[#CC0000]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("members")}</h1>
            <p className="text-sm text-gray-400">{activeCount} membre{activeCount !== 1 ? "s" : ""} actif{activeCount !== 1 ? "s" : ""} · {members.length} au total</p>
          </div>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-500/20">
          <Plus size={16} /> {t("addMember")}
        </button>
      </div>

      {/* Bureau cards */}
      {bureau.length > 0 && (
        <div dir={ar ? "rtl" : "ltr"} className="mb-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t("bureau")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BUREAU_ROLES.map((role) => {
              const person = bureau.find((m) => m.role === role);
              const meta = ROLE_META[role];
              const Icon = meta.icon;
              return (
                <div key={role} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 text-center">
                  {person?.photoUrl ? (
                    <img src={person.photoUrl} alt={person.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#CC0000]/10 flex items-center justify-center">
                      <Icon size={22} className="text-[#CC0000]" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm leading-tight">{person?.fullName ?? "—"}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
                      {t(role as Parameters<typeof t>[0])}
                    </span>
                  </div>
                  {person && (
                    <button onClick={() => openEdit(person)}
                      className="text-xs text-gray-400 hover:text-blue-500 transition-colors">
                      <Pencil size={12} className="inline mr-1" />{t("edit")}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div dir={ar ? "rtl" : "ltr"} className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#CC0000] transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterRole("")}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${!filterRole ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
            {t("all")}
          </button>
          {ROLES.map((r) => {
            const meta = ROLE_META[r];
            return (
              <button key={r} onClick={() => setFilterRole(filterRole === r ? "" : r)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${filterRole === r ? meta.color + " shadow-sm" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                {t(r as Parameters<typeof t>[0])}
              </button>
            );
          })}
        </div>
      </div>

      {/* Members grid */}
      {filtered.length === 0 ? (
        <div dir={ar ? "rtl" : "ltr"} className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Users2 size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">{t("noData")}</p>
        </div>
      ) : (
        <div dir={ar ? "rtl" : "ltr"} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pagedMembers.map((m) => {
            const meta = ROLE_META[m.role] ?? ROLE_META.MEMBER;
            const Icon = meta.icon;
            return (
              <div key={m.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col ${m.isActive ? "border-gray-100 hover:border-gray-200" : "border-gray-100 opacity-60"}`}>
                <div className="p-4 flex items-start gap-4">
                  {m.photoUrl ? (
                    <img src={m.photoUrl} alt={m.fullName} className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base leading-tight truncate">{m.fullName}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
                      {t(m.role as Parameters<typeof t>[0])}
                    </span>
                    {!m.isActive && (
                      <span className="ml-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200">{t("inactive")}</span>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div className="px-4 pb-3 space-y-1.5 text-xs text-gray-500">
                  {m.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={11} className="text-gray-400 shrink-0" />
                      <span>{m.phone}</span>
                    </div>
                  )}
                  {m.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={11} className="text-gray-400 shrink-0" />
                      <span className="truncate">{m.email}</span>
                    </div>
                  )}
                  {m.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={11} className="text-gray-400 shrink-0" />
                      <span className="truncate">{m.address}</span>
                    </div>
                  )}
                  {m.notes && (
                    <p className="text-[11px] text-gray-400 italic line-clamp-1 mt-1">{m.notes}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 pt-1 mt-auto flex gap-2 border-t border-gray-50">
                  <button onClick={() => openEdit(m)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 text-gray-500 hover:text-blue-600 rounded-xl text-xs font-semibold transition-colors">
                    <Pencil size={12} /> {t("edit")}
                  </button>
                  <button onClick={() => del(m)}
                    className="p-2 border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 rounded-xl transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Pagination page={membPage} totalPages={membTotalPages} total={membTotal} pageSize={membPageSize} onChange={setMembPage} className="mt-4" />

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div dir={ar ? "rtl" : "ltr"} className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold">{editing ? t("edit") : t("addMember")}</h2>
              <button onClick={() => setModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Photo */}
              <ImageUploader value={form.photoUrl} onChange={(url) => setForm({ ...form, photoUrl: url })} label={t("photo")} size="md" />

              <div>
                <label className={lbl}>{t("fullName")} *</label>
                <input className={inp} value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Mohamed El Hassani" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>{t("role")}</label>
                  <select className={inp} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map((r) => <option key={r} value={r}>{t(r as Parameters<typeof t>[0])}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>{t("cin")}</label>
                  <input className={inp} value={form.cin} onChange={(e) => setForm({ ...form, cin: e.target.value })} placeholder="BK123456" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>{t("phone")}</label>
                  <input className={inp} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212 6XX XXX XXX" />
                </div>
                <div>
                  <label className={lbl}>{t("email")}</label>
                  <input type="email" className={inp} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nom@email.com" />
                </div>
              </div>

              <div>
                <label className={lbl}>{t("address")}</label>
                <input className={inp} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Madagh, Berkane" />
              </div>

              <div>
                <label className={lbl}>{t("birthDate")}</label>
                <input type="date" className={inp} value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
              </div>

              <div>
                <label className={lbl}>{t("notes")}</label>
                <textarea rows={2} className={inp} value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Observations, ancienneté, rôle historique..." />
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative inline-flex w-10 h-5.5 rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`inline-block w-4 h-4 mt-0.5 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-5.5" : "translate-x-0.5"}`} />
                </button>
                <span className="text-sm font-medium text-gray-600">{form.isActive ? t("active") : t("inactive")}</span>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors">{t("cancel")}</button>
              <button onClick={save} disabled={saving || !form.fullName}
                className="flex-1 bg-[#CC0000] hover:bg-red-700 disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-semibold transition-all">
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
