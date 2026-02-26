import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Verifica se a API e o banco estão acessíveis (útil para diagnóstico em produção).
 * Retorna 200 se conseguir conectar ao banco, 503 caso contrário.
 */
export async function GET() {
  try {
    await prisma.$connect();
    return NextResponse.json({
      ok: true,
      database: "connected",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[health] Banco indisponível:", message);
    return NextResponse.json(
      { ok: false, database: "error", message: "Falha ao conectar ao banco" },
      { status: 503 }
    );
  }
}
