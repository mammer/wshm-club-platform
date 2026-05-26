import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { auth } from "@/lib/auth";

// Magic bytes for allowed formats (OWASP: never trust Content-Type alone)
const MAGIC: Record<string, number[][]> = {
  "image/jpeg": [[0xFF, 0xD8, 0xFF]],
  "image/png":  [[0x89, 0x50, 0x4E, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header; bytes 8-11 are "WEBP"
  "image/gif":  [[0x47, 0x49, 0x46, 0x38]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
};

// Safe extensions per MIME type
const SAFE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

function checkMagicBytes(buf: Buffer, mime: string): boolean {
  const signatures = MAGIC[mime];
  if (!signatures) return true; // no magic check for Office docs (zip-based)
  return signatures.some((sig) => sig.every((byte, i) => buf[i] === byte));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const isDoc = req.nextUrl.searchParams.get("kind") === "doc";
  const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const allowedDocs = ["application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
  const allowed = isDoc ? [...allowedImages, ...allowedDocs] : allowedImages;

  // 1. Check declared MIME type
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Type de fichier non autorisé" }, { status: 400 });
  }

  // 2. Size limit
  const maxSize = isDoc ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: `Fichier trop volumineux (max ${isDoc ? "20" : "5"}MB)` }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 3. Magic bytes check — rejects renamed executables
  if (!checkMagicBytes(buffer, file.type)) {
    return NextResponse.json({ error: "Fichier corrompu ou type invalide" }, { status: 400 });
  }

  // 4. Use server-dictated extension — never trust the client filename
  const ext = SAFE_EXT[file.type] ?? "bin";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
