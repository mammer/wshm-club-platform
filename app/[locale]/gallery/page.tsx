"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { IconX as X, IconChevronLeft as ChevronLeft, IconChevronRight as ChevronRight } from "@tabler/icons-react";

const PAGE_SIZE = 24;

type Photo = {
  id: string;
  imageUrl: string;
  titleFr: string | null;
  titleAr: string | null;
  category: string | null;
};

export default function GalleryPage() {
  const t = useTranslations("gallery");
  const { locale } = useParams<{ locale: string }>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data: Photo[]) => {
        setPhotos(data);
        const cats = [...new Set(data.map((p) => p.category).filter(Boolean))] as string[];
        setCategories(cats);
      });
  }, []);

  const filtered = filter ? photos.filter((p) => p.category === filter) : photos;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const changeFilter = (f: string) => { setFilter(f); setPage(1); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-2">{t("title")}</h1>
      {filtered.length > 0 && (
        <p className="text-sm text-gray-400 mb-6">
          {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length}
        </p>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => changeFilter("")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            filter === "" ? "bg-[#CC0000] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t("all")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => changeFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === cat ? "bg-[#CC0000] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400">{t("no_photos")}</p>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {paged.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setLightbox(photo)}
              className="w-full break-inside-avoid rounded-xl overflow-hidden block"
            >
              <img
                src={photo.imageUrl}
                alt={locale === "ar" ? photo.titleAr ?? "" : photo.titleFr ?? ""}
                className="w-full hover:opacity-90 transition-opacity"
              />
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
          <span className="text-sm text-gray-400">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                  p === safePage ? "bg-[#CC0000] text-white" : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-gray-300">
            <X size={28} />
          </button>
          <img
            src={lightbox.imageUrl}
            alt={locale === "ar" ? lightbox.titleAr ?? "" : lightbox.titleFr ?? ""}
            className="max-h-[90vh] max-w-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
