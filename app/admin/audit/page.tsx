"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminT } from "@/lib/adminT";
import { Shield, Search, Plus, Pencil, Trash2 } from "lucide-react";

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  userName: string | null;
  createdAt: string;
};

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-600",
};
const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREATE: <Plus size={11} />,
  UPDATE: <Pencil size={11} />,
  DELETE: <Trash2 size={11} />,
};

export default function AdminAuditPage() {
  const { t, ar } = useAdminT();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");

  const load = useCallback(() => {
    fetch("/api/audit").then((r) => r.json()).then(setLogs);
  }, []);

  useEffect(() => { load(); }, [load]);

  const entities = [...new Set(logs.map((l) => l.entity))].sort();

  const filtered = logs.filter((l) => {
    const matchSearch = !search || (l.details ?? "").toLowerCase().includes(search.toLowerCase()) || (l.userName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchAction = !filterAction || l.action === filterAction;
    const matchEntity = !filterEntity || l.entity === filterEntity;
    return matchSearch && matchAction && matchEntity;
  });

  function fmt(d: string) {
    return new Date(d).toLocaleString("fr-MA", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div dir={ar ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-6">
        <Shield size={22} className="text-[#CC0000]" />
        <div>
          <h1 className="text-2xl font-bold">{t("audit")}</h1>
          <p className="text-sm text-gray-500">{logs.length} opérations enregistrées</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-[#CC0000]" />
        </div>
        <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000]">
          <option value="">Toutes les actions</option>
          <option value="CREATE">{t("CREATE")}</option>
          <option value="UPDATE">{t("UPDATE")}</option>
          <option value="DELETE">{t("DELETE")}</option>
        </select>
        <select value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000]">
          <option value="">Tous les modules</option>
          {entities.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <button onClick={load} className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">↻ Actualiser</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[t("date"), t("actions"), t("entity"), t("details"), t("user")].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{fmt(log.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`${ACTION_STYLES[log.action]} flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit`}>
                    {ACTION_ICONS[log.action]}{t(log.action as Parameters<typeof t>[0])}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{log.entity}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{log.details ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{log.userName ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">{t("noData")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
