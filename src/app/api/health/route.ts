import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Verifica se a API e o banco estão acessíveis (útil para diagnóstico em produção).
 * Indica se DATABASE_URL está definida (sem expor o valor) e se a conexão funciona.
 */
export async function GET() {
  const databaseUrlDefinida = Boolean(
    process.env.DATABASE_URL != null && String(process.env.DATABASE_URL).trim() !== ""
  );

  if (!databaseUrlDefinida) {
    return NextResponse.json(
      {
        ok: false,
        database: "config_missing",
        message: "DATABASE_URL não está definida no ambiente",
        env: { DATABASE_URL: "ausente" },
      },
      { status: 503 }
    );
  }

  try {
    await prisma.$connect();
    return NextResponse.json({
      ok: true,
      database: "connected",
      env: { DATABASE_URL: "definida" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[health] Banco indisponível:", message);
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        message: "Falha ao conectar ao banco",
        env: { DATABASE_URL: "definida" },
      },
      { status: 503 }
    );
  }
}
