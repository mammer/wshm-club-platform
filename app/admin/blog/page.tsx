"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import ForbiddenBanner from "@/components/admin/ForbiddenBanner";
import dynamic from "next/dynamic";
const BlogEditor = dynamic(() => import("./BlogEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 rounded-lg min-h-[320px] flex items-center justify-center text-gray-400 text-sm bg-gray-50">
      Chargement de l&apos;éditeur…
    </div>
  ),
});
import ImageUploader from "@/components/admin/ImageUploader";
import { IconPlus as Plus, IconPencil as Pencil, IconTrash as Trash2, IconEye as Eye, IconEyeOff as EyeOff, IconNews as Newspaper, IconArrowLeft as ArrowLeft, IconSearch as Search, IconExternalLink as ExternalLink } from "@tabler/icons-react";
import { useAdminT } from "@/lib/adminT";
import { usePagination } from "@/lib/usePagination";
import Pagination from "@/components/ui/Pagination";
import { swal } from "@/lib/swal";

type Post = {
  id: string;
  slug: string;
  titleFr: string;
  titleAr: string;
  contentFr: string;
  contentAr: string;
  coverImageUrl: string | null;
  author: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
};

type FormData = Omit<Post, "id" | "createdAt" | "publishedAt">;

const EMPTY: FormData = {
  slug: "",
  titleFr: "",
  titleAr: "",
  contentFr: "",
  contentAr: "",
  coverImageUrl: null,
  author: "",
  published: false,
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function wordCount(html: string) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return { words, minutes: Math.max(1, Math.ceil(words / 200)) };
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "il y a 1 jour";
  if (days < 30) return `il y a ${days} jours`;
  const months = Math.floor(days / 30);
  if (months === 1) return "il y a 1 mois";
  if (months < 12) return `il y a ${months} mois`;
  const years = Math.floor(months / 12);
  return years === 1 ? "il y a 1 an" : `il y a ${years} ans`;
}

type FilterTab = "all" | "published" | "draft";

export default function AdminBlogPage() {
  const { t, ar } = useAdminT();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [newMode, setNewMode] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [langTab, setLangTab] = useState<"fr" | "ar">("fr");
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  // Mobile: show editor panel
  const [mobileShowEditor, setMobileShowEditor] = useState(false);

  const load = useCallback(() => {
    fetch("/api/blog?admin=1")
      .then((r) => r.json())
      .then(setPosts);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setNewMode(true);
    setLangTab("fr");
    setMobileShowEditor(true);
  };

  const openEdit = (p: Post) => {
    setEditing(p);
    setForm({ ...p });
    setNewMode(false);
    setLangTab("fr");
    setMobileShowEditor(true);
  };

  const closeEditor = () => {
    setEditing(null);
    setNewMode(false);
    setMobileShowEditor(false);
  };

  const save = async (publishedOverride?: boolean) => {
    setSaving(true);
    const payload =
      publishedOverride !== undefined
        ? { ...form, published: publishedOverride }
        : form;
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/blog/${editing.id}` : "/api/blog";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    load();
    if (!editing) {
      // After creating, stay in editor but switch to edit mode for the new post
      closeEditor();
    } else {
      // Refresh editing state
      const updated = { ...editing, ...payload };
      setEditing(updated as Post);
      setForm(payload);
    }
    swal.toast(
      publishedOverride
        ? "Article publié !"
        : publishedOverride === false
        ? "Article dépublié."
        : "Brouillon enregistré.",
      "success"
    );
  };

  const del = async (p: Post) => {
    const result = await swal.confirmDelete(p.titleFr || p.titleAr);
    if (!result.isConfirmed) return;
    await fetch(`/api/blog/${p.id}`, { method: "DELETE" });
    if (editing?.id === p.id) closeEditor();
    load();
  };

  const togglePublish = async (p: Post) => {
    await fetch(`/api/blog/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !p.published }),
    });
    if (editing?.id === p.id) {
      setEditing({ ...p, published: !p.published });
      setForm((f) => ({ ...f, published: !p.published }));
    }
    load();
  };

  const inp =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000] transition-colors";
  const lbl = "block text-xs font-medium text-gray-600 mb-1";

  // Filtering
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch =
        !search ||
        p.titleFr.toLowerCase().includes(search.toLowerCase()) ||
        p.titleAr.includes(search);
      const matchTab =
        filterTab === "all" ||
        (filterTab === "published" && p.published) ||
        (filterTab === "draft" && !p.published);
      return matchSearch && matchTab;
    });
  }, [posts, search, filterTab]);

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((p) => p.published).length,
      draft: posts.filter((p) => !p.published).length,
    }),
    [posts]
  );

  const { paged, page, setPage, totalPages, total, pageSize } = usePagination(
    filteredPosts,
    10
  );

  const isEditorOpen = editing !== null || newMode;

  const activeContent = langTab === "fr" ? form.contentFr : form.contentAr;
  const wc = wordCount(activeContent);
  const contentMissing = activeContent.replace(/<[^>]+>/g, "").trim() === "";

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "published", label: t("published") },
    { key: "draft", label: t("draft") },
  ];

  return (
    <>
      <ForbiddenBanner />

      <div
        className="flex flex-col md:flex-row h-[calc(100vh-5rem)] gap-0 overflow-hidden"
        dir={ar ? "rtl" : "ltr"}
      >
        {/* ── LEFT PANEL: article list ──────────────────────────────────── */}
        <div
          className={`
            w-full md:w-80 md:shrink-0 flex flex-col border-r border-gray-100
            bg-white overflow-hidden
            ${mobileShowEditor ? "hidden md:flex" : "flex"}
          `}
        >
          {/* Panel header */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold">{t("blog")}</h1>
              <button
                onClick={openNew}
                className="flex items-center gap-1.5 bg-[#CC0000] hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus size={14} />
                Nouvel article
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder={t("search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#CC0000] transition-colors"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 mt-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterTab(tab.key)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterTab === tab.key
                      ? "bg-[#CC0000] text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-[10px] font-bold px-1 rounded ${
                      filterTab === tab.key
                        ? "bg-white/20"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {counts[tab.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Article list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {paged.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-10">
                {t("noData")}
              </p>
            )}
            {paged.map((p) => {
              const isActive = editing?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => openEdit(p)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group ${
                    isActive
                      ? "bg-red-50 border-l-2 border-[#CC0000]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-9 rounded-md overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                    {p.coverImageUrl ? (
                      <img
                        src={p.coverImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Newspaper size={16} className="text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate leading-tight">
                      {p.titleFr || p.titleAr || (
                        <span className="italic text-gray-400">Sans titre</span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {p.author} · {relativeDate(p.createdAt)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Status badge */}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          p.published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {p.published ? t("published") : t("draft")}
                      </span>
                      {/* Language completeness flags */}
                      <span
                        className={`text-[11px] ${
                          p.titleFr ? "opacity-100" : "opacity-30"
                        }`}
                        title={p.titleFr ? "FR présent" : "FR manquant"}
                      >
                        🇫🇷
                      </span>
                      <span
                        className={`text-[11px] ${
                          p.titleAr ? "opacity-100" : "opacity-30"
                        }`}
                        title={p.titleAr ? "AR présent" : "AR manquant"}
                      >
                        🇲🇦
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex flex-col gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => togglePublish(p)}
                      title={p.published ? "Dépublier" : "Publier"}
                      className="p-1 text-gray-400 hover:text-[#CC0000]"
                    >
                      {p.published ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      title={t("edit")}
                      className="p-1 text-gray-400 hover:text-blue-500"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => del(p)}
                      title={t("delete")}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-100 px-2 py-1">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onChange={setPage}
            />
          </div>
        </div>

        {/* ── RIGHT PANEL: editor ───────────────────────────────────────── */}
        <div
          className={`
            flex-1 flex flex-col overflow-hidden bg-gray-50
            ${mobileShowEditor || isEditorOpen ? "flex" : "hidden md:flex"}
          `}
        >
          {!isEditorOpen ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
              <Newspaper size={48} className="opacity-20" />
              <p className="text-sm">Sélectionnez un article ou créez-en un</p>
              <button
                onClick={openNew}
                className="flex items-center gap-2 bg-[#CC0000] hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus size={15} />
                Nouvel article
              </button>
            </div>
          ) : (
            <>
              {/* Editor header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white shrink-0">
                {/* Mobile back button */}
                <button
                  onClick={closeEditor}
                  className="md:hidden flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Articles
                </button>
                <h2 className="hidden md:block text-base font-bold">
                  {editing
                    ? ar
                      ? "تعديل المقال"
                      : "Modifier l'article"
                    : ar
                    ? "مقال جديد"
                    : "Nouvel article"}
                </h2>
                <div className="flex items-center gap-2">
                  {/* Preview */}
                  {editing?.slug && (
                    <a
                      href={`/fr/blog/${editing.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#CC0000] border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <ExternalLink size={13} />
                      Aperçu
                    </a>
                  )}
                  {/* Save actions */}
                  {editing?.published ? (
                    <>
                      <button
                        onClick={() => save(false)}
                        disabled={saving || !form.titleFr || !form.slug}
                        className="border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        {saving ? t("saving") : "Dépublier"}
                      </button>
                      <button
                        onClick={() => save(true)}
                        disabled={saving || !form.titleFr || !form.slug}
                        className="bg-[#CC0000] hover:bg-red-700 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        {saving ? t("saving") : t("save")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => save(false)}
                        disabled={saving || !form.titleFr || !form.slug}
                        className="border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        {saving ? t("saving") : t("draft")}
                      </button>
                      <button
                        onClick={() => save(true)}
                        disabled={saving || !form.titleFr || !form.slug}
                        className="bg-[#CC0000] hover:bg-red-700 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        {saving ? t("saving") : t("publish")}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Scrollable editor body */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                {/* Cover image */}
                <div>
                  <label className={lbl}>{t("cover")}</label>
                  <ImageUploader
                    value={form.coverImageUrl ?? ""}
                    onChange={(url) =>
                      setForm({ ...form, coverImageUrl: url })
                    }
                  />
                </div>

                {/* Fields grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title FR */}
                  <div>
                    <label className={lbl}>
                      {t("titleFr")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={inp}
                      value={form.titleFr}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          titleFr: e.target.value,
                          slug: slugify(e.target.value),
                        })
                      }
                    />
                  </div>

                  {/* Title AR */}
                  <div>
                    <label className={lbl}>{t("titleAr")}</label>
                    <input
                      className={`${inp} text-right`}
                      dir="rtl"
                      value={form.titleAr}
                      onChange={(e) =>
                        setForm({ ...form, titleAr: e.target.value })
                      }
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className={lbl}>{t("slug")}</label>
                    <input
                      className={`${inp} font-mono text-xs`}
                      value={form.slug}
                      onChange={(e) =>
                        setForm({ ...form, slug: slugify(e.target.value) })
                      }
                    />
                  </div>

                  {/* Author */}
                  <div>
                    <label className={lbl}>{t("author")}</label>
                    <input
                      className={inp}
                      value={form.author}
                      onChange={(e) =>
                        setForm({ ...form, author: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Language tabs + editor */}
                <div>
                  <div className="flex gap-1 mb-3 border-b border-gray-200">
                    {(["fr", "ar"] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLangTab(lang)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                          langTab === lang
                            ? "border-[#CC0000] text-[#CC0000]"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {lang === "fr" ? "🇫🇷 Français" : "🇲🇦 العربية"}
                      </button>
                    ))}
                  </div>

                  {/* Missing content banner */}
                  {contentMissing && (
                    <div className="mb-3 flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-lg px-3 py-2">
                      <span>⚠</span>
                      <span>
                        Contenu{" "}
                        {langTab === "fr" ? "Français" : "Arabe"} manquant —
                        à compléter avant publication.
                      </span>
                    </div>
                  )}

                  <BlogEditor
                    key={`${editing?.id ?? "new"}-${langTab}`}
                    value={
                      langTab === "fr" ? form.contentFr : form.contentAr
                    }
                    onChange={(html) =>
                      langTab === "fr"
                        ? setForm({ ...form, contentFr: html })
                        : setForm({ ...form, contentAr: html })
                    }
                    dir={langTab === "ar" ? "rtl" : "ltr"}
                  />

                  {/* Word count */}
                  <p className="text-xs text-gray-400 mt-2 text-right">
                    {wc.words} mot{wc.words !== 1 ? "s" : ""} · ~
                    {wc.minutes} min de lecture
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
