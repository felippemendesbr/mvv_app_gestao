import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthFromRequest,
  isAdmin,
  isPastor,
  needsRedeFilter,
} from "@/lib/api";
import { parseDateLocal } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

function isLider(tipo: string | null): boolean {
  if (!tipo) return false;
  return /líder|lider/i.test(tipo.trim());
}

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    const userRede = auth?.rede?.trim() || "";
    const userTipo = auth?.tipoUsuario ?? "";
    const filterByRede = auth && needsRedeFilter(userTipo) && userRede;

    const whereMembros = filterByRede
      ? { rede: userRede }
      : {};

    const whereUsuarioPendente: { flgAtivo: boolean; rede?: string } = { flgAtivo: false };
    if (isPastor(userTipo) && userRede) {
      whereUsuarioPendente.rede = userRede;
    }

    const [membros, totalVideos, pendentesAprovacao] = await Promise.all([
      prisma.membro.findMany({ where: whereMembros }),
      isAdmin(userTipo) ? prisma.videoResource.count() : Promise.resolve(0),
      isAdmin(userTipo) || isPastor(userTipo)
        ? prisma.usuario.count({ where: whereUsuarioPendente })
        : Promise.resolve(0),
    ]);

    // Membros por rede (apenas para admin)
    let membrosPorRede: { redeId: number; label: string; quantidade: number }[] = [];
    if (isAdmin(userTipo)) {
      const membrosPorRedeMap = new Map<string, number>();
      membros.forEach((m) => {
        const redeLabel = m.rede ?? "Sem rede";
        membrosPorRedeMap.set(redeLabel, (membrosPorRedeMap.get(redeLabel) ?? 0) + 1);
      });
      membrosPorRede = Array.from(membrosPorRedeMap.entries()).map(
        ([label, quantidade], idx) => ({
          redeId: idx + 1,
          label,
          quantidade,
        })
      );
    }

    // Distribuição por tipo de usuário (apenas para admin)
    let distribuicaoTipoUsuario: { tipo: string; quantidade: number }[] = [];
    if (isAdmin(userTipo)) {
      const tiposMap = new Map<string, number>();
      membros.forEach((m) => {
        const tipo = m.tipoUsuario || "(não informado)";
        tiposMap.set(tipo, (tiposMap.get(tipo) ?? 0) + 1);
      });
      distribuicaoTipoUsuario = Array.from(tiposMap.entries())
        .filter(([tipo]) => !/administrador/i.test(tipo))
        .map(([tipo, quantidade]) => ({ tipo, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);
    }

    // Total de líderes (membros com tipoUsuario contendo "Líder")
    const totalLideres = membros.filter((m) => isLider(m.tipoUsuario)).length;

    // Faixas etárias
    const hoje = new Date();
    const faixas = {
      "Até 17": 0,
      "18 a 25": 0,
      "26 a 35": 0,
      "36 a 50": 0,
      "Acima de 50": 0,
    };

    // Faixas etárias (idade pelo ano e mês/dia local, sem deslocar por timezone)
    const anoHoje = hoje.getFullYear();
    membros.forEach((m) => {
      if (!m.dataNascimento) return;
      const p = parseDateLocal(m.dataNascimento);
      if (!p) return;
      let idade = anoHoje - p.year;
      if (
        hoje.getMonth() + 1 < p.month ||
        (hoje.getMonth() + 1 === p.month && hoje.getDate() < p.day)
      ) {
        idade--;
      }
      if (idade <= 17) faixas["Até 17"]++;
      else if (idade <= 25) faixas["18 a 25"]++;
      else if (idade <= 35) faixas["26 a 35"]++;
      else if (idade <= 50) faixas["36 a 50"]++;
      else faixas["Acima de 50"]++;
    });

    const comparativoFaixaEtaria = Object.entries(faixas).map(
      ([faixa, quantidade]) => ({ faixa, quantidade })
    );

    const showMembrosPorRede = isAdmin(userTipo);
    const showTotalRedes = isAdmin(userTipo);
    const showTiposUsuario = isAdmin(userTipo);
    const showVideos = isAdmin(userTipo);

    // Aniversariantes do mês: dia civil (local), sem timezone
    const mesAtual = hoje.getMonth() + 1;
    const diaAtual = hoje.getDate();
    const aniversariantes = membros
      .filter((m) => {
        if (!m.dataNascimento) return false;
        const p = parseDateLocal(m.dataNascimento);
        if (!p) return false;
        return p.month === mesAtual && p.day >= diaAtual;
      })
      .sort((a, b) => {
        const pA = parseDateLocal(a.dataNascimento!);
        const pB = parseDateLocal(b.dataNascimento!);
        if (!pA || !pB) return 0;
        return pA.day - pB.day;
      })
      .map((m) => {
        const p = parseDateLocal(m.dataNascimento!);
        return {
          dia: p?.day ?? 0,
          nomeCompleto: m.nomeCompleto,
          rede: m.rede ?? null,
          telefone: m.telefone ?? null,
        };
      });

    return NextResponse.json({
      membrosPorRede,
      distribuicaoTipoUsuario,
      comparativoFaixaEtaria,
      totalMembros: membros.length,
      totalLideres,
      totalVideos,
      showMembrosPorRede,
      showTotalRedes,
      showTiposUsuario,
      showVideos,
      aniversariantes: isAdmin(userTipo) || isPastor(userTipo) ? aniversariantes : [],
      pendentesAprovacao: isAdmin(userTipo) || isPastor(userTipo) ? pendentesAprovacao : 0,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados" },
      { status: 500 }
    );
  }
}
