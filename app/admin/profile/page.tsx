"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import ImageUploader from "@/components/admin/ImageUploader";
import { useAdminT } from "@/lib/adminT";
import { swal } from "@/lib/swal";
import { IconUser as User, IconLock as Lock, IconDeviceFloppy as Save } from "@tabler/icons-react";

export default function AdminProfilePage() {
  const { t, ar } = useAdminT();
  const { data: session, update } = useSession();
  const user = session?.user as { name?: string; email?: string; image?: string; role?: string } | undefined;

  const [name, setName] = useState(user?.name ?? "");
  const [photo, setPhoto] = useState(user?.image ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Administrateur", SECRETARY: "Secrétaire", AUTHOR: "Auteur", COACH: "Entraîneur",
  };

  const saveProfile = async () => {
    if (!name.trim()) { swal.error("Nom requis", "Veuillez saisir votre nom."); return; }
    setSavingProfile(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, photoUrl: photo || null }),
    });
    setSavingProfile(false);
    if (!res.ok) { swal.error("Erreur", "Impossible de mettre à jour le profil."); return; }
    await update({ name, image: photo });
    swal.toast("Profil mis à jour", "success");
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword) { swal.error("Champs requis", "Remplissez tous les champs."); return; }
    if (newPassword !== confirmPassword) { swal.error("Erreur", "Les mots de passe ne correspondent pas."); return; }
    if (newPassword.length < 6) { swal.error("Trop court", "Le mot de passe doit contenir au moins 6 caractères."); return; }
    setSavingPassword(true);
    const res = await fetch("/api/profile/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSavingPassword(false);
    if (res.status === 400) { swal.error("Mot de passe incorrect", "Le mot de passe actuel est incorrect."); return; }
    if (!res.ok) { swal.error("Erreur", "Impossible de modifier le mot de passe."); return; }
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    swal.toast("Mot de passe modifié avec succès", "success");
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-4 focus:ring-[#CC0000]/10 transition-all";
  const lbl = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div dir={ar ? "rtl" : "ltr"} className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#CC0000]/10 flex items-center justify-center">
            <User size={20} className="text-[#CC0000]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("profile")}</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <User size={15} className="text-[#CC0000]" /> Informations générales
          </h2>

          <ImageUploader value={photo} onChange={setPhoto} label={t("photo")} size="lg" />

          <div>
            <label className={lbl}>{t("displayName")}</label>
            <input className={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
          </div>

          <div>
            <label className={lbl}>{t("role")}</label>
            <input className={inp} value={ROLE_LABELS[user?.role ?? ""] ?? user?.role ?? "—"} disabled
              style={{ backgroundColor: "#f8f8f8", color: "#888" }} />
          </div>

          <button onClick={saveProfile} disabled={savingProfile}
            className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
            <Save size={14} /> {savingProfile ? t("saving") : t("save")}
          </button>
        </div>

        {/* Password card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Lock size={15} className="text-[#CC0000]" /> Modifier le mot de passe
          </h2>

          <div>
            <label className={lbl}>{t("currentPwd")}</label>
            <input type="password" className={inp} value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label className={lbl}>{t("newPwd")}</label>
            <input type="password" className={inp} value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label className={lbl}>{t("confirmPwd")}</label>
            <input type="password" className={inp} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <button onClick={savePassword} disabled={savingPassword}
            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-gray-800 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
            <Lock size={14} /> {savingPassword ? t("saving") : t("password")}
          </button>
        </div>
      </div>
  );
}
