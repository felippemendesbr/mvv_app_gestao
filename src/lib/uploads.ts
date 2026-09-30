import path from "path";
import { mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { NextResponse } from "next/server";

const ALLOWED_SUBDIRS = new Set(["edificando"]);

export function getUploadsRoot(): string {
  const envDir = process.env.UPLOADS_DIR?.trim();
  if (envDir) return envDir;
  return path.join(process.cwd(), "uploads");
}

export function getUploadDir(subdir: string): string {
  return path.join(getUploadsRoot(), subdir);
}

export function getLegacyPublicUploadDir(subdir: string): string {
  return path.join(process.cwd(), "public", "uploads", subdir);
}

export async function ensureUploadDir(subdir: string): Promise<string> {
  const dir = getUploadDir(subdir);
  await mkdir(dir, { recursive: true });
  return dir;
}

export function sanitizeUploadFilename(originalName: string): string {
  const base = path.basename(originalName).replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${Date.now()}-${base}`;
}

function isSafeSegment(segment: string): boolean {
  return (
    Boolean(segment) &&
    !segment.includes("..") &&
    !segment.includes("/") &&
    !segment.includes("\\") &&
    segment !== "." &&
    segment !== ".."
  );
}

/**
 * Resolve um arquivo de upload no disco.
 * Tenta a pasta persistente (`uploads/`) e, em seguida, o caminho legado (`public/uploads/`).
 */
export function resolveUploadFile(segments: string[]): string | null {
  if (segments.length < 2) return null;
  const [subdir, ...rest] = segments;
  const filename = rest.join("/");
  if (!ALLOWED_SUBDIRS.has(subdir) || !isSafeSegment(subdir)) return null;
  if (!filename || filename.includes("..")) return null;
  const name = path.basename(filename);
  if (!isSafeSegment(name) || !name.toLowerCase().endsWith(".pdf")) return null;

  const candidates = [
    path.join(getUploadDir(subdir), name),
    path.join(getLegacyPublicUploadDir(subdir), name),
  ];
  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    const root = path.resolve(path.dirname(candidate));
    if (!resolved.startsWith(root + path.sep) && resolved !== root) continue;
    if (existsSync(resolved)) return resolved;
  }
  return null;
}

export async function serveUploadFromSegments(
  segments: string[]
): Promise<NextResponse> {
  const filepath = resolveUploadFile(segments);
  if (!filepath) {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }

  const buffer = await readFile(filepath);
  const filename = path.basename(filepath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
