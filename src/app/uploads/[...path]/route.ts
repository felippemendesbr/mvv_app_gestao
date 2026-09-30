import { NextResponse } from "next/server";
import { serveUploadFromSegments } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const segments = (await params).path ?? [];
    return await serveUploadFromSegments(segments);
  } catch (error) {
    console.error("Erro ao servir upload:", error);
    return NextResponse.json({ error: "Erro ao baixar arquivo" }, { status: 500 });
  }
}
