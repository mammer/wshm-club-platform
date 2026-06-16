"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminT } from "@/lib/adminT";
import { swal } from "@/lib/swal";
import { IconUpload as Upload, IconTrash as Trash2, IconX as X, IconSearch as Search, IconDownload as Download, IconEye as Eye, IconFileText as FileText, IconPhoto as FileImage, IconFile as File, IconFolderOpen as FolderOpen, IconPlus as Plus, IconPencil as Pencil, IconChevronDown as ChevronDown, IconChevronRight as ChevronRight, IconLayoutList as LayoutList, IconGrid3x3 as Grid3x3, IconCalendarEvent as CalendarDays, IconUser as User, IconSortAscending as SortAsc, IconSortDescending as SortDesc } from "@tabler/icons-react";
import { usePagination } from "@/lib/usePagination";
import Pagination from "@/components/ui/Pagination";

type ArchiveFile = {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  description: string | null;
  year: number | null;
  uploadedBy: string | null;
  createdAt: string;
};

const CATEGORIES = [
  { key: "REUNION",        icon: "📋", color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",  badge: "bg-blue-100 text-blue-700" },
  { key: "JURIDIQUE",      icon: "⚖️",  color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200",badge: "bg-purple-100 text-purple-700" },
  { key: "STATUTS",        icon: "📜",  color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200",badge: "bg-indigo-100 text-indigo-700" },
  { key: "CONTRAT",        icon: "🤝",  color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200",badge: "bg-orange-100 text-orange-700" },
  { key: "CORRESPONDANCE", icon: "✉️",  color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200", badge: "bg-green-100 text-green-700" },
  { key: "FINANCIER",      icon: "💰",  color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200",badge: "bg-yellow-100 text-yellow-700" },
  { key: "AUTRE",          icon: "📁",  color: "text-gray-600",   bg: "bg-gray-50",   border: "border-gray-200",  badge: "bg-gray-100 text-gray-600" },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

function fileTypeFromUrl(url: string): string {
  const ext = url.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["xls", "xlsx"].includes(ext)) return "excel";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  return "other";
}

function FileIcon({ type, size = 16 }: { type: string; size?: number }) {
  if (type === "pdf")   return <FileText size={size} className="text-red-400" />;
  if (type === "word")  return <FileText size={size} className="text-blue-400" />;
  if (type === "excel") return <FileText size={size} className="text-green-400" />;
  if (type === "image") return <FileImage size={size} className="text-purple-400" />;
  return <File size={size} className="text-gray-400" />;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

const EMPTY = {
  title: "", category: "REUNION", description: "",
  year: new Date().getFullYear(), uploadedBy: "",
  fileUrl: "", fileType: "",
};

type SortKey = "createdAt" | "title" | "year";
type SortDir = "asc" | "desc";

export default function AdminArchivePage() {
  const { t, ar } = useAdminT();
  const [files, setFiles] = useState<ArchiveFile[]>([]);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editing, setEditing] = useState<ArchiveFile | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grouped">("grouped");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);

  const load = useCallback(() => {
    fetch("/api/archive").then((r) => r.json()).then(setFiles);
  }, []);
  useEffect(() => { load(); }, [load]);

  const years = [...new Set(files.map((f) => f.year).filter(Boolean))].sort().reverse() as number[];

  const sorted = [...files].sort((a, b) => {
    let av: string | number = sortKey === "createdAt" ? a.createdAt : sortKey === "title" ? a.title : (a.year ?? 0);
    let bv: string | number = sortKey === "createdAt" ? b.createdAt : sortKey === "title" ? b.title : (b.year ?? 0);
    if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const filtered = sorted.filter((f) => {
    const matchSearch = f.title.toLowerCase().includes(search.toLowerCase()) ||
      (f.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (f.uploadedBy ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || f.category === filterCat;
    const matchYear = !filterYear || String(f.year) === filterYear;
    return matchSearch && matchCat && matchYear;
  });

  const { paged: pagedFiltered, page: archivePage, setPage: setArchivePage, totalPages: archiveTotalPages, total: archiveTotal, pageSize: archivePageSize } = usePagination(filtered, 15);

  // Category stats
  const catCounts = Object.fromEntries(CATEGORIES.map((c) => [c.key, files.filter((f) => f.category === c.key).length]));

  // Grouped by category
  const grouped = CATEGORIES.map((c) => ({
    ...c,
    docs: filtered.filter((f) => f.category === c.key),
  })).filter((g) => g.docs.length > 0);

  const toggleCat = (key: string) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const cycleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortBtn = ({ label, k }: { label: string; k: SortKey }) => (
    <button onClick={() => cycleSort(k)} className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${sortKey === k ? "text-[#CC0000]" : "text-gray-400 hover:text-gray-600"}`}>
      {label}
      {sortKey === k ? (sortDir === "asc" ? <SortAsc size={11} /> : <SortDesc size={11} />) : null}
    </button>
  );

  const uploadFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload?kind=doc", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, fileUrl: data.url, fileType: fileTypeFromUrl(data.url), title: f.title || file.name.replace(/\.[^.]+$/, "") }));
      } else {
        swal.error("Erreur", data.error ?? "Échec du téléchargement.");
      }
    } finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.fileUrl) { swal.error("Fichier requis", "Veuillez d'abord télécharger un fichier."); return; }
    setSaving(true);
    const body = { ...form, year: form.year || null, description: form.description || null, uploadedBy: form.uploadedBy || null };
    const res = await fetch("/api/archive", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) { setModal(false); setForm(EMPTY); load(); swal.toast("Document archivé avec succès", "success"); }
    else swal.error("Erreur", "Échec de l'archivage.");
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const body = { title: form.title, category: form.category, description: form.description || null, year: form.year || null, uploadedBy: form.uploadedBy || null };
    await fetch(`/api/archive/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSaving(false); setEditModal(false); load();
    swal.toast("Document modifié", "success");
  };

  const del = async (f: ArchiveFile) => {
    const res = await swal.confirmDelete(f.title);
    if (!res.isConfirmed) return;
    await fetch(`/api/archive/${f.id}`, { method: "DELETE" });
    load(); swal.toast("Document supprimé", "success");
  };

  const openEdit = (f: ArchiveFile) => {
    setEditing(f);
    setForm({ ...EMPTY, title: f.title, category: f.category, description: f.description ?? "", year: f.year ?? new Date().getFullYear(), uploadedBy: f.uploadedBy ?? "", fileUrl: f.fileUrl, fileType: f.fileType });
    setEditModal(true);
  };

  const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] focus:ring-4 focus:ring-[#CC0000]/10 transition-all";
  const lbl = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  // Row component for table view
  const DocRow = ({ f }: { f: ArchiveFile }) => {
    const cat = CAT_MAP[f.category];
    const ftype = fileTypeFromUrl(f.fileUrl);
    return (
      <tr className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
              <FileIcon type={ftype} size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate max-w-xs leading-tight">{f.title}</p>
              {f.description && <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{f.description}</p>}
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${cat?.badge}`}>
            {cat?.icon} {t(f.category as Parameters<typeof t>[0])}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 font-medium">{f.year ?? "—"}</td>
        <td className="px-4 py-3 text-xs text-gray-400">
          {new Date(f.createdAt).toLocaleDateString(ar ? "ar-MA" : "fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
        </td>
        <td className="px-4 py-3 text-xs text-gray-400">{f.uploadedBy ?? "—"}</td>
        <td className="px-4 py-3 text-xs text-gray-400">{formatSize(f.fileSize)}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <a href={f.fileUrl} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title={t("view")}>
              <Eye size={14} />
            </a>
            <a href={f.fileUrl} download
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title={t("download")}>
              <Download size={14} />
            </a>
            <button onClick={() => openEdit(f)}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title={t("edit")}>
              <Pencil size={14} />
            </button>
            <button onClick={() => del(f)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title={t("delete")}>
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
    <div dir={ar ? "rtl" : "ltr"} className="flex flex-col gap-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a] flex items-center gap-2">
              <FolderOpen size={24} className="text-[#CC0000]" />
              {t("archive")}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {files.length} {ar ? "وثيقة مؤرشفة" : "documents archivés"} · {CATEGORIES.filter(c => catCounts[c.key] > 0).length} {ar ? "تصنيفات" : "catégories"}
            </p>
          </div>
          <button onClick={() => { setForm(EMPTY); setModal(true); }}
            className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/20">
            <Plus size={16} /> {t("addDoc")}
          </button>
        </div>

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => setFilterCat(filterCat === c.key ? "" : c.key)}
              className={`flex flex-col items-center py-3 px-2 rounded-xl border transition-all text-center ${
                filterCat === c.key
                  ? `${c.bg} ${c.border} border-2 shadow-sm`
                  : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
              }`}>
              <span className="text-lg mb-0.5">{c.icon}</span>
              <p className={`text-lg font-extrabold leading-none ${filterCat === c.key ? c.color : "text-[#1a1a1a]"}`}>
                {catCounts[c.key]}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium leading-tight">
                {t(c.key as Parameters<typeof t>[0])}
              </p>
            </button>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-56">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder={ar ? "بحث في الأرشيف..." : "Rechercher un document..."}
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:border-[#CC0000] transition-all" />
          </div>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] bg-white">
            <option value="">{ar ? "كل السنوات" : "Toutes les années"}</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {(filterCat || filterYear || search) && (
            <button onClick={() => { setFilterCat(""); setFilterYear(""); setSearch(""); }}
              className="px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1.5">
              <X size={13} /> {t("reset")}
            </button>
          )}
          <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-1 ml-auto">
            <button onClick={() => setViewMode("grouped")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grouped" ? "bg-[#CC0000] text-white" : "text-gray-400 hover:text-gray-600"}`}
              title={ar ? "عرض مجمّع" : "Vue groupée"}>
              <LayoutList size={15} />
            </button>
            <button onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "table" ? "bg-[#CC0000] text-white" : "text-gray-400 hover:text-gray-600"}`}
              title={ar ? "عرض جدول" : "Vue tableau"}>
              <Grid3x3 size={15} />
            </button>
          </div>
        </div>

        {/* ── Result count ── */}
        {(search || filterCat || filterYear) && (
          <p className="text-sm text-gray-500">
            {filtered.length} {ar ? "نتيجة" : "résultat"}{filtered.length !== 1 && !ar ? "s" : ""}{filterCat ? ` · ${t(filterCat as Parameters<typeof t>[0])}` : ""}
          </p>
        )}

        {/* ── No results ── */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <FolderOpen size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{ar ? "لا توجد وثائق" : "Aucun document trouvé"}</p>
            <p className="text-gray-400 text-sm mt-1">{ar ? "جرّب تعديل معايير البحث" : "Modifiez vos filtres ou archivez de nouveaux documents"}</p>
          </div>
        )}

        {/* ── GROUPED VIEW ── */}
        {viewMode === "grouped" && filtered.length > 0 && (
          <div className="space-y-3">
            {grouped.map((g) => {
              const collapsed = collapsedCats.has(g.key);
              const byYear = [...new Set(g.docs.map((d) => d.year ?? 0))].sort().reverse();
              return (
                <div key={g.key} className={`bg-white rounded-2xl border ${collapsed ? "border-gray-100" : "border-gray-100"} shadow-sm overflow-hidden`}>
                  {/* Category header */}
                  <button
                    onClick={() => toggleCat(g.key)}
                    className={`w-full flex items-center justify-between px-5 py-4 ${g.bg} border-b ${g.border} transition-colors hover:brightness-95`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{g.icon}</span>
                      <div className="text-left">
                        <p className={`font-bold text-sm ${g.color}`}>{t(g.key as Parameters<typeof t>[0])}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{g.docs.length} {ar ? "وثيقة" : "document"}{g.docs.length > 1 && !ar ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`${g.badge} text-xs font-bold px-2.5 py-1 rounded-full`}>{g.docs.length}</span>
                      {collapsed ? <ChevronRight size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>

                  {/* Docs grouped by year */}
                  {!collapsed && (
                    <div>
                      {byYear.map((year) => {
                        const yearDocs = g.docs.filter((d) => (d.year ?? 0) === year);
                        return (
                          <div key={year}>
                            {/* Year sub-header */}
                            <div className="flex items-center gap-2 px-5 py-2 bg-gray-50/60 border-b border-gray-100">
                              <CalendarDays size={12} className="text-gray-400" />
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{year === 0 ? (ar ? "غير محدد" : "Année non précisée") : year}</span>
                              <span className="text-xs text-gray-300">· {yearDocs.length} {ar ? "وثيقة" : "doc"}{yearDocs.length > 1 && !ar ? "s" : ""}</span>
                            </div>
                            {/* Docs in this year */}
                            {yearDocs.map((f) => {
                              const ftype = fileTypeFromUrl(f.fileUrl);
                              return (
                                <div key={f.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/60 transition-colors group">
                                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                                    <FileIcon type={ftype} size={14} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{f.title}</p>
                                    {f.description && (
                                      <p className="text-xs text-gray-400 truncate mt-0.5">{f.description}</p>
                                    )}
                                    {f.uploadedBy && (
                                      <p className="text-[11px] text-gray-300 mt-0.5 flex items-center gap-1">
                                        <User size={10} /> {f.uploadedBy}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[11px] text-gray-300 font-medium mr-2 hidden sm:block">
                                      {ftype.toUpperCase()} {f.fileSize ? `· ${formatSize(f.fileSize)}` : ""}
                                    </span>
                                    <a href={f.fileUrl} target="_blank" rel="noopener noreferrer"
                                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-300 hover:text-gray-700 transition-all border border-transparent hover:border-gray-200" title={t("view")}>
                                      <Eye size={14} />
                                    </a>
                                    <a href={f.fileUrl} download
                                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-300 hover:text-gray-700 transition-all border border-transparent hover:border-gray-200" title={t("download")}>
                                      <Download size={14} />
                                    </a>
                                    <button onClick={() => openEdit(f)}
                                      className="p-2 rounded-lg hover:bg-blue-50 text-gray-300 hover:text-blue-600 transition-all border border-transparent hover:border-blue-200" title={t("edit")}>
                                      <Pencil size={14} />
                                    </button>
                                    <button onClick={() => del(f)}
                                      className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all border border-transparent hover:border-red-200" title={t("delete")}>
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── TABLE VIEW ── */}
        {viewMode === "table" && filtered.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <SortBtn label={ar ? "الوثيقة" : "Document"} k="title" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t("category")}</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortBtn label={ar ? "السنة" : "Année"} k="year" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortBtn label={t("date")} k="createdAt" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t("uploadedBy")}</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{ar ? "الحجم" : "Taille"}</span>
                  </th>
                  <th className="px-4 py-3 w-32" />
                </tr>
              </thead>
              <tbody>
                {pagedFiltered.map((f) => <DocRow key={f.id} f={f} />)}
              </tbody>
            </table>
            <div className="px-4 pb-2">
              <Pagination page={archivePage} totalPages={archiveTotalPages} total={archiveTotal} pageSize={archivePageSize} onChange={setArchivePage} />
            </div>
          </div>
        )}

      </div>

      {/* ── Upload modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()} dir={ar ? "rtl" : "ltr"}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold">{t("addDoc")}</h2>
              <button onClick={() => setModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {!form.fileUrl ? (
                <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) uploadFile(f); }}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${dragOver ? "border-[#CC0000] bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <Upload size={32} className={`mx-auto mb-3 ${dragOver ? "text-[#CC0000]" : "text-gray-300"}`} />
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {uploading ? (ar ? "جارٍ التحميل..." : "Téléchargement en cours...") : (ar ? "اسحب ملفًا هنا" : "Glissez un fichier ici")}
                  </p>
                  <p className="text-xs text-gray-400 mb-4">PDF, Word, Excel, images — max 20 Mo</p>
                  <label className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors">
                    <Upload size={14} /> {ar ? "تصفح الملفات" : "Parcourir"}
                    <input type="file" className="hidden" disabled={uploading}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
                  </label>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
                  <FileIcon type={form.fileType} size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800 truncate">{form.fileUrl.split("/").pop()}</p>
                    <p className="text-xs text-green-600">{ar ? "الملف جاهز للأرشفة" : "Fichier prêt à être archivé"}</p>
                  </div>
                  <button onClick={() => setForm({ ...form, fileUrl: "", fileType: "" })} className="text-green-400 hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div>
                <label className={lbl}>{t("name")} *</label>
                <input className={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={ar ? "مثال: محضر الاجتماع — مارس 2026" : "PV Réunion Bureau — Mars 2026"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>{t("category")}</label>
                  <select className={inp} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.icon} {t(c.key as Parameters<typeof t>[0])}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>{t("year")}</label>
                  <input type="number" className={inp} value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className={lbl}>{t("description")}</label>
                <textarea rows={2} className={inp} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={ar ? "ملخص أو ملاحظات حول هذه الوثيقة..." : "Résumé ou notes sur ce document..."} />
              </div>
              <div>
                <label className={lbl}>{t("uploadedBy")}</label>
                <input className={inp} value={form.uploadedBy} onChange={(e) => setForm({ ...form, uploadedBy: e.target.value })}
                  placeholder={ar ? "اسم المسؤول" : "Nom du responsable"} />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors">{t("cancel")}</button>
              <button onClick={save} disabled={saving || !form.title || !form.fileUrl}
                className="flex-1 bg-[#CC0000] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold transition-all">
                {saving ? t("saving") : t("addDoc")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editModal && editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()} dir={ar ? "rtl" : "ltr"}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{ar ? "تعديل الوثيقة" : "Modifier le document"}</h2>
              <button onClick={() => setEditModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={lbl}>{t("name")} *</label>
                <input className={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>{t("category")}</label>
                  <select className={inp} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.icon} {t(c.key as Parameters<typeof t>[0])}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>{t("year")}</label>
                  <input type="number" className={inp} value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className={lbl}>{t("description")}</label>
                <textarea rows={2} className={inp} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className={lbl}>{t("uploadedBy")}</label>
                <input className={inp} value={form.uploadedBy} onChange={(e) => setForm({ ...form, uploadedBy: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm hover:bg-gray-50">{t("cancel")}</button>
              <button onClick={saveEdit} disabled={saving || !form.title}
                className="flex-1 bg-[#CC0000] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-bold">
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
