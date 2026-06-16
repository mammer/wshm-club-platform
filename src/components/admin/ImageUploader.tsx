"use client";

import { useState, useRef } from "react";
import { IconUpload as Upload, IconX as X, IconCamera as Camera } from "@tabler/icons-react";

export default function ImageUploader({
  value,
  onChange,
  label = "Photo",
  size = "md",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const avatarSize = { sm: "w-16 h-16", md: "w-24 h-24", lg: "w-32 h-32" }[size];

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Avatar preview */}
      <div className={`${avatarSize} rounded-2xl overflow-hidden border-2 ${dragOver ? "border-[#CC0000]" : value ? "border-gray-200" : "border-dashed border-gray-300"} bg-gray-50 shrink-0 relative transition-all`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}>
        {value ? (
          <>
            <img src={value} alt="photo" className="w-full h-full object-cover" />
            {/* Overlay on hover */}
            <button type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center transition-all group">
              <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#CC0000] transition-colors">
            {uploading ? (
              <div className="w-5 h-5 border-2 border-[#CC0000]/30 border-t-[#CC0000] rounded-full animate-spin" />
            ) : (
              <>
                <Upload size={18} />
                <span className="text-[10px] font-medium">Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 hover:border-[#CC0000] text-gray-600 hover:text-[#CC0000] px-3 py-2 rounded-xl text-xs font-semibold transition-all">
          <Upload size={13} />
          {uploading ? "Téléchargement..." : value ? "Changer la photo" : "Choisir une photo"}
          <input ref={inputRef} type="file" className="hidden" accept="image/*" disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-1">
            <X size={12} /> Supprimer
          </button>
        )}
        <p className="text-[10px] text-gray-400">JPG, PNG ou WebP — max 5 Mo</p>
      </div>
    </div>
  );
}
