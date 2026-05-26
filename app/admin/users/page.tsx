"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminT } from "@/lib/adminT";
import { swal } from "@/lib/swal";
import { Plus, Trash2, Pencil, X, Users2, Mail, Shield, Key } from "lucide-react";
import { usePagination } from "@/lib/usePagination";
import Pagination from "@/components/ui/Pagination";

type AdminUser = { id: string; email: string; name: string; role: string; photoUrl?: string | null };

const ROLES = ["ADMIN", "SECRETARY", "AUTHOR", "COACH"];
const ROLE_META: Record<string, { color: string; bg: string; border: string }> = {
  ADMIN:     { color: "text-[#CC0000]", bg: "bg-red-50",    border: "border-red-200" },
  SECRETARY: { color: "text-blue-700",  bg: "bg-blue-50",   border: "border-blue-200" },
  AUTHOR:    { color: "text-green-700", bg: "bg-green-50",  border: "border-green-200" },
  COACH:     { color: "text-orange-700",bg: "bg-orange-50", border: "border-orange-200" },
};

const EMPTY = { email: "", name: "", role: "SECRETARY", password: "", confirmPassword: "" };

export default function AdminUsersPage() {
  const { t, ar } = useAdminT();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setForm({ email: u.email, name: u.name, role: u.role, password: "", confirmPassword: "" });
    setModal(true);
  };

  const save = async () => {
    if (form.password && form.password !== form.confirmPassword) {
      await swal.error("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }
    setSaving(true);
    const body: Record<string, string> = { email: form.email, name: form.name, role: form.role };
    if (form.password) body.password = form.password;
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/users/${editing.id}` : "/api/users";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) {
      setModal(false);
      load();
      swal.toast(editing ? "Utilisateur modifié" : "Utilisateur créé", "success");
    } else {
      swal.error("Erreur", "Une erreur est survenue. L'email est peut-être déjà utilisé.");
    }
  };

  const del = async (u: AdminUser) => {
    const res = await swal.confirmDelete(u.name);
    if (!res.isConfirmed) return;
    await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    load();
    swal.toast("Utilisateur supprimé", "success");
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-4 focus:ring-[#CC0000]/10 transition-all";
  const lbl = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";
  const { paged: pagedUsers, page: usersPage, setPage: setUsersPage, totalPages: usersTotalPages, total: usersTotal, pageSize: usersPageSize } = usePagination(users, 12);

  return (
    <div dir={ar ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CC0000]/10 flex items-center justify-center">
            <Users2 size={20} className="text-[#CC0000]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("users")}</h1>
            <p className="text-sm text-gray-400">{users.length} compte{users.length !== 1 ? "s" : ""} administrateur</p>
          </div>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-500/20">
          <Plus size={16} /> {t("addUser")}
        </button>
      </div>

      {/* Role summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {ROLES.map((role) => {
          const count = users.filter((u) => u.role === role).length;
          const meta = ROLE_META[role];
          return (
            <div key={role} className={`${meta.bg} border ${meta.border} rounded-xl p-3 flex items-center gap-3`}>
              <Shield size={16} className={meta.color} />
              <div>
                <p className={`text-xs font-bold ${meta.color}`}>{t(role as Parameters<typeof t>[0])}</p>
                <p className="text-lg font-black text-gray-800">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* User cards */}
      {users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Users2 size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">{t("noData")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pagedUsers.map((u) => {
            const meta = ROLE_META[u.role] ?? ROLE_META.ADMIN;
            const initials = u.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
            return (
              <div key={u.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="p-5 flex items-start gap-4">
                  {u.photoUrl ? (
                    <img src={u.photoUrl} alt={u.name} className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0" />
                  ) : (
                    <div className={`w-14 h-14 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0`}>
                      <span className={`text-lg font-black ${meta.color}`}>{initials}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base leading-tight truncate">{u.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Mail size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-400 font-mono truncate">{u.email}</span>
                    </div>
                    <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                      {t(u.role as Parameters<typeof t>[0])}
                    </span>
                  </div>
                </div>
                <div className="px-5 pb-4 mt-auto flex gap-2 border-t border-gray-50 pt-3">
                  <button onClick={() => openEdit(u)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 text-gray-500 hover:text-blue-600 rounded-xl text-xs font-semibold transition-colors">
                    <Pencil size={12} /> {t("edit")}
                  </button>
                  <button onClick={() => openEdit(u)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl text-xs font-semibold transition-colors"
                    title={t("password")}>
                    <Key size={12} />
                  </button>
                  <button onClick={() => del(u)}
                    className="p-2 border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 rounded-xl transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Pagination page={usersPage} totalPages={usersTotalPages} total={usersTotal} pageSize={usersPageSize} onChange={setUsersPage} className="mt-4" />

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div dir={ar ? "rtl" : "ltr"} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{editing ? t("edit") : t("addUser")}</h2>
              <button onClick={() => setModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={lbl}>{t("fullName")} *</label>
                <input className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mohamed Bennasri" />
              </div>
              <div>
                <label className={lbl}>{t("email")} *</label>
                <input type="email" className={inp} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@wshm.ma" />
              </div>
              <div>
                <label className={lbl}>{t("role")}</label>
                <select className={inp} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r} value={r}>{t(r as Parameters<typeof t>[0])}</option>)}
                </select>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-3">
                  {editing ? "Laissez vide pour conserver le mot de passe actuel." : "Définissez un mot de passe pour ce compte."}
                </p>
                <div className="space-y-3">
                  <div>
                    <label className={lbl}>{t("password")} {!editing && "*"}</label>
                    <input type="password" className={inp} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                  </div>
                  <div>
                    <label className={lbl}>{t("confirmPwd")}</label>
                    <input type="password" className={inp} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="••••••••" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors">{t("cancel")}</button>
              <button onClick={save} disabled={saving || !form.email || !form.name || (!editing && !form.password)}
                className="flex-1 bg-[#CC0000] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-all">
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
