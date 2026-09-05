import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, needsRedeFilter } from "@/lib/api";
import { parseAreasAtuacao } from "@/lib/areasAtuacao";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    const userRede = auth?.rede?.trim() || "";
    const userTipo = auth?.tipoUsuario ?? "";
    const forceRedeFilter = auth && needsRedeFilter(userTipo) && userRede;

    const { searchParams } = new URL(request.url);
    const area = searchParams.get("area")?.trim() ?? "";

    const [areas, vinculos, membros] = await Promise.all([
      prisma.perfilUsuario.findMany({ orderBy: { label: "asc" } }),
      prisma.perfilUsuarioUsuario.findMany(),
      prisma.membro.findMany({
        where: forceRedeFilter ? { rede: userRede } : {},
        orderBy: { nomeCompleto: "asc" },
      }),
    ]);

    const areasPorEmail = new Map<string, string[]>();
    for (const vinculo of vinculos) {
      const email = vinculo.email.trim().toLowerCase();
      const parsed = parseAreasAtuacao(vinculo.label);
      if (parsed.length === 0) continue;
      const atual = areasPorEmail.get(email) ?? [];
      for (const item of parsed) {
        if (!atual.some((a) => a.toLowerCase() === item.toLowerCase())) {
          atual.push(item);
        }
      }
      areasPorEmail.set(email, atual);
    }

    const resultado = membros
      .map((m) => {
        const areasMembro = areasPorEmail.get(m.email.trim().toLowerCase()) ?? [];
        return {
          id: m.id,
          nomeCompleto: m.nomeCompleto,
          email: m.email,
          telefone: m.telefone,
          rede: m.rede,
          tipoUsuario: m.tipoUsuario,
          areasAtuacao: areasMembro,
        };
      })
      .filter((m) => {
        if (m.areasAtuacao.length === 0) return false;
        if (!area) return true;
        return m.areasAtuacao.some((a) => a.toLowerCase() === area.toLowerCase());
      })
      .map((m) => ({
        ...m,
        areasAtuacao: m.areasAtuacao.join(", "),
      }));

    return NextResponse.json(
      {
        areas: areas.map((a) => ({ id: a.id, label: a.label })),
        membros: resultado,
        total: resultado.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao gerar relatório de área de atuação:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    );
  }
}
