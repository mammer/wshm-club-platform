"use client";

import { useState, useEffect } from "react";
import { useAdminT } from "@/lib/adminT";
import { swal } from "@/lib/swal";
import { IconSettings as Settings, IconDeviceFloppy as Save, IconTrophy as Trophy } from "@tabler/icons-react";

type SettingsData = Record<string, string>;

const FIELDS = [
  { section: "Informations du club", items: [
    { key: "club_name_fr", label: "Nom du club (Français)", placeholder: "Wefak Sportive Hassanyat Madagh" },
    { key: "club_name_ar", label: "Nom du club (Arabe)", placeholder: "الوفاق الرياضي الحسني لمداغ", rtl: true },
    { key: "club_abbr",    label: "Abréviation",          placeholder: "W.S.H.M" },
    { key: "founded_year", label: "Année de fondation",   placeholder: "1956" },
    { key: "season",       label: "Saison en cours",      placeholder: "2025-2026" },
    { key: "website",      label: "Site web",             placeholder: "wshm.ma" },
  ]},
  { section: "Direction", items: [
    { key: "president",  label: "Président",          placeholder: "Nom du président" },
    { key: "secretary",  label: "Secrétaire Général", placeholder: "Nom du secrétaire" },
  ]},
  { section: "Contact", items: [
    { key: "address", label: "Adresse",   placeholder: "Terrain Municipal, Madagh, Province de Berkane" },
    { key: "phone",   label: "Téléphone", placeholder: "+212 661 290 000" },
    { key: "email",   label: "Email",     placeholder: "contact@wshm.ma" },
  ]},
  { section: "Informations bancaires (pour les reçus)", items: [
    { key: "bank_name", label: "Banque",  placeholder: "Banque Populaire Berkane" },
    { key: "rib",       label: "RIB",     placeholder: "101 015 21234567890 14" },
  ]},
];

export default function AdminSettingsPage() {
  const { t, ar } = useAdminT();
  const [settings, setSettings] = useState<SettingsData>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  const set = (key: string, value: string) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSaving(false);
    setDirty(false);
    swal.toast("Paramètres enregistrés avec succès", "success");
  };

  const inp = "w-full bg-white border-2 border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-4 focus:ring-[#CC0000]/10 transition-all";
  const lbl = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div dir={ar ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CC0000]/10 flex items-center justify-center">
            <Settings size={20} className="text-[#CC0000]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("settings")}</h1>
            <p className="text-sm text-gray-400">Ces informations apparaissent sur tous les documents imprimés.</p>
          </div>
        </div>
        <button onClick={save} disabled={saving || !dirty}
          className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-500/20">
          <Save size={15} /> {saving ? t("saving") : t("save")}
          {dirty && <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse ml-1" />}
        </button>
      </div>

      <div className="space-y-6">
        {FIELDS.map((section) => (
          <div key={section.section} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Trophy size={15} className="text-[#CC0000]" />
              <h2 className="font-bold text-sm text-gray-700">{section.section}</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {section.items.map((field) => (
                <div key={field.key} className={field.key === "address" ? "md:col-span-2" : ""}>
                  <label className={lbl}>{field.label}</label>
                  <input
                    className={inp + ((field as { rtl?: boolean }).rtl ? " text-right" : "")}
                    dir={(field as { rtl?: boolean }).rtl ? "rtl" : undefined}
                    value={settings[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => set(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
