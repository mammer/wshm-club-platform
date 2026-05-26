"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload, Trash2, Pencil, Eye, X, ChevronLeft, ChevronRight,
  Camera, FolderOpen, Plus, Check,
} from "lucide-react";
import { useAdminT } from "@/lib/adminT";
import { usePagination } from "@/lib/usePagination";
import Pagination from "@/components/ui/Pagination";
import { swal } from "@/lib/swal";

// ─── Types ────────────────────────────────────────────────────────────────────

type Photo = {
  id: string;
  imageUrl: string;
  titleFr: string | null;
  titleAr: string | null;
  category: string | null;
};

type UploadProgress = { done: number; total: number };

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  photos,
  index,
  onClose,
  onChange,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onChange(index - 1);
      if (e.key === "ArrowRight" && index < photos.length - 1) onChange(index + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, photos.length, onClose, onChange]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[index].imageUrl}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain rounded"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        onClick={onClose}
        aria-label="Fermer"
      >
        <X size={28} />
      </button>
      {index > 0 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
          onClick={(e) => { e.stopPropagation(); onChange(index - 1); }}
          aria-label="Photo précédente"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
          onClick={(e) => { e.stopPropagation(); onChange(index + 1); }}
          aria-label="Photo suivante"
        >
          <ChevronRight size={24} />
        </button>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {index + 1} / {photos.length}
      </div>
    </div>
  );
}

// ─── Photo Card ───────────────────────────────────────────────────────────────

function PhotoCard({
  photo,
  onDelete,
  onViewFull,
  onSaved,
}: {
  photo: Photo;
  onDelete: () => void;
  onViewFull: () => void;
  onSaved: (updated: Photo) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [titleFr, setTitleFr] = useState(photo.titleFr ?? "");
  const [titleAr, setTitleAr] = useState(photo.titleAr ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/gallery/${photo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleFr: titleFr || null, titleAr: titleAr || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        onSaved(updated);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
      {/* Image area */}
      <div className="group relative aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.imageUrl}
          alt={photo.titleFr ?? ""}
          className="w-full h-full object-cover"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => setEditing((v) => !v)}
            className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow transition-colors"
            title="Modifier"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onViewFull}
            className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow transition-colors"
            title="Agrandir"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow transition-colors"
            title="Supprimer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Caption */}
      {!editing && photo.titleFr && (
        <p className="px-2 py-1 text-xs text-gray-600 truncate">{photo.titleFr}</p>
      )}

      {/* Edit form */}
      {editing && (
        <div className="p-2 flex flex-col gap-1.5 bg-white border-t border-gray-100">
          <input
            className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#CC0000]"
            placeholder="Titre (FR)"
            value={titleFr}
            onChange={(e) => setTitleFr(e.target.value)}
          />
          <input
            dir="rtl"
            className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#CC0000]"
            placeholder="العنوان (AR)"
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
          />
          <div className="flex gap-1.5">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 bg-[#CC0000] hover:bg-red-700 text-white rounded px-2 py-1 text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              {saving ? "..." : "Enregistrer"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-2 py-1 rounded border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminGalleryPage() {
  const { t, ar } = useAdminT();

  // All photos from API
  const [photos, setPhotos] = useState<Photo[]>([]);

  // Album state
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null); // null = "Sans album"
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const newAlbumInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ done: 0, total: 0 });

  // Drag state
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Load all photos once
  const load = useCallback(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => {
        // API can return array directly or paginated object
        if (Array.isArray(data)) setPhotos(data);
        else if (data.data) setPhotos(data.data);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  // Focus new album input when creating
  useEffect(() => {
    if (creatingAlbum) newAlbumInputRef.current?.focus();
  }, [creatingAlbum]);

  // ── Derived album list ──────────────────────────────────────────────────────

  const albums = Array.from(
    new Set(photos.map((p) => p.category).filter(Boolean) as string[])
  ).sort();

  const uncategorizedCount = photos.filter((p) => !p.category).length;

  // ── Photos in active album ──────────────────────────────────────────────────

  const albumPhotos = activeAlbum === null
    ? photos.filter((p) => !p.category)
    : photos.filter((p) => p.category === activeAlbum);

  const { paged: pagedPhotos, page, setPage, totalPages, total, pageSize } =
    usePagination(albumPhotos, 20);

  // ── Album helpers ───────────────────────────────────────────────────────────

  const confirmNewAlbum = () => {
    const name = newAlbumName.trim();
    if (!name) { setCreatingAlbum(false); return; }
    setActiveAlbum(name);
    setNewAlbumName("");
    setCreatingAlbum(false);
  };

  // ── Upload logic ────────────────────────────────────────────────────────────

  const handleDrop = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setUploading(true);
      setUploadProgress({ done: 0, total: files.length });
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const { url } = await res.json();
        if (url) {
          await fetch("/api/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: url, category: activeAlbum || null }),
          });
        }
        setUploadProgress((p) => ({ ...p, done: p.done + 1 }));
      }
      setUploading(false);
      load();
    },
    [activeAlbum, load]
  );

  // ── Delete ──────────────────────────────────────────────────────────────────

  const del = async (id: string) => {
    const result = await swal.confirmDelete();
    if (!result.isConfirmed) return;
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (lightboxIndex !== null) setLightboxIndex(null);
  };

  // ── Photo update (after edit) ───────────────────────────────────────────────

  const handleSaved = (updated: Photo) => {
    setPhotos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // ── Drag-and-drop handlers ──────────────────────────────────────────────────

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDropEvent = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    handleDrop(files);
  };
  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleDrop(Array.from(e.target.files));
    e.target.value = "";
  };

  // ── Sidebar content (shared between desktop sidebar and mobile pills) ───────

  const AlbumList = ({ mobile }: { mobile?: boolean }) => (
    <ul className={mobile ? "flex gap-2 overflow-x-auto pb-1" : "space-y-0.5"}>
      {albums.map((album) => {
        const count = photos.filter((p) => p.category === album).length;
        const isActive = activeAlbum === album;
        if (mobile) {
          return (
            <li key={album} className="shrink-0">
              <button
                onClick={() => setActiveAlbum(album)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#CC0000] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {album}
                <span className="ml-1.5 opacity-70 text-xs">{count}</span>
              </button>
            </li>
          );
        }
        return (
          <li key={album}>
            <button
              onClick={() => setActiveAlbum(album)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                isActive
                  ? "bg-[#CC0000] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="truncate">{album}</span>
              <span
                className={`ml-2 shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          </li>
        );
      })}

      {/* Sans album */}
      {(() => {
        const isActive = activeAlbum === null;
        if (mobile) {
          return (
            <li className="shrink-0">
              <button
                onClick={() => setActiveAlbum(null)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#CC0000] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Sans album
                <span className="ml-1.5 opacity-70 text-xs">{uncategorizedCount}</span>
              </button>
            </li>
          );
        }
        return (
          <li>
            <button
              onClick={() => setActiveAlbum(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                isActive
                  ? "bg-[#CC0000] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <span className="italic">Sans album</span>
              <span
                className={`ml-2 shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {uncategorizedCount}
              </span>
            </button>
          </li>
        );
      })()}
    </ul>
  );

  // ── Upload zone ─────────────────────────────────────────────────────────────

  const UploadZone = () => (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDropEvent}
      onClick={() => !uploading && fileInputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-8 px-4 transition-colors cursor-pointer ${
        dragging
          ? "border-[#CC0000] bg-red-50"
          : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
      } ${uploading ? "pointer-events-none opacity-70" : ""}`}
    >
      <Camera size={32} className="text-gray-400" />
      {uploading ? (
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <p className="text-sm text-gray-600 font-medium">
            {uploadProgress.done} / {uploadProgress.total} photo
            {uploadProgress.total > 1 ? "s" : ""} téléchargée
            {uploadProgress.total > 1 ? "s" : ""}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#CC0000] h-2 rounded-full transition-all duration-300"
              style={{
                width: `${uploadProgress.total > 0 ? (uploadProgress.done / uploadProgress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 text-center">
            Glissez vos photos ici ou cliquez pour sélectionner
          </p>
          <span className="flex items-center gap-1.5 text-xs text-white bg-[#CC0000] hover:bg-red-700 px-3 py-1.5 rounded-lg font-semibold transition-colors">
            <Upload size={13} />
            Choisir des photos
          </span>
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={onFileInput}
      />
    </div>
  );

  // ── Lightbox photos for current album ───────────────────────────────────────
  // We use pagedPhotos for the grid but the full albumPhotos for lightbox nav
  const lightboxPhotos = albumPhotos;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div dir={ar ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold mb-6">{t("gallery")}</h1>

      {/* ── Mobile layout: horizontal pills at top ── */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Albums</h2>
          <button
            onClick={() => setCreatingAlbum(true)}
            className="flex items-center gap-1 text-xs text-[#CC0000] hover:underline font-medium"
          >
            <Plus size={13} />
            Nouvel album
          </button>
        </div>

        {creatingAlbum && (
          <div className="flex items-center gap-2 mb-3">
            <input
              ref={newAlbumInputRef}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#CC0000]"
              placeholder="Nom de l'album..."
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmNewAlbum();
                if (e.key === "Escape") { setCreatingAlbum(false); setNewAlbumName(""); }
              }}
            />
            <button
              onClick={confirmNewAlbum}
              className="p-1.5 bg-[#CC0000] text-white rounded-lg"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => { setCreatingAlbum(false); setNewAlbumName(""); }}
              className="p-1.5 border border-gray-200 rounded-lg text-gray-500"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <AlbumList mobile />
      </div>

      {/* ── Desktop: two-panel layout ── */}
      <div className="flex gap-5 items-start">

        {/* Left sidebar — desktop only */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm p-4 gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <FolderOpen size={16} className="text-[#CC0000]" />
              Albums
            </h2>
            <button
              onClick={() => setCreatingAlbum((v) => !v)}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#CC0000] transition-colors"
              title="Nouvel album"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* New album inline input */}
          {creatingAlbum && (
            <div className="flex items-center gap-1.5">
              <input
                ref={newAlbumInputRef}
                className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#CC0000]"
                placeholder="Nom de l'album..."
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmNewAlbum();
                  if (e.key === "Escape") { setCreatingAlbum(false); setNewAlbumName(""); }
                }}
              />
              <button
                onClick={confirmNewAlbum}
                className="p-1.5 bg-[#CC0000] text-white rounded-lg hover:bg-red-700 transition-colors shrink-0"
              >
                <Check size={14} />
              </button>
            </div>
          )}

          <nav>
            <AlbumList />
          </nav>
        </aside>

        {/* Right panel */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Album header */}
          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <FolderOpen size={18} className="text-[#CC0000] shrink-0" />
            <h2 className="font-semibold text-gray-800 text-lg truncate">
              {activeAlbum ?? <span className="italic text-gray-400">Sans album</span>}
            </h2>
            <span className="ml-auto text-sm text-gray-400 shrink-0">
              {albumPhotos.length} photo{albumPhotos.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Upload zone */}
          <UploadZone />

          {/* Photo grid */}
          {pagedPhotos.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pagedPhotos.map((photo, idx) => {
                  // idx in pagedPhotos maps to absolute index in albumPhotos
                  const absoluteIdx = (page - 1) * pageSize + idx;
                  return (
                    <PhotoCard
                      key={photo.id}
                      photo={photo}
                      onDelete={() => del(photo.id)}
                      onViewFull={() => setLightboxIndex(absoluteIdx)}
                      onSaved={handleSaved}
                    />
                  );
                })}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onChange={setPage}
                className="mt-2"
              />
            </>
          ) : !uploading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <Camera size={40} strokeWidth={1.2} />
              <p className="text-sm">
                {activeAlbum
                  ? `Aucune photo dans l'album « ${activeAlbum} »`
                  : "Aucune photo sans album"}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && lightboxPhotos.length > 0 && (
        <Lightbox
          photos={lightboxPhotos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      )}
    </div>
  );
}
