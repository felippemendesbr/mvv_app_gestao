import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthFromRequest,
  isAdmin,
  isPastor,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const tipo = auth.tipoUsuario;
    if (!isAdmin(tipo) && !isPastor(tipo)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const where: { flgAtivo: boolean; rede?: string; tipoUsuario?: string } = {
      flgAtivo: false,
    };

    if (isPastor(tipo)) {
      const userRede = auth.rede?.trim();
      if (!userRede) {
        return NextResponse.json([]);
      }
      where.rede = userRede;
    }

    if (isAdmin(tipo)) {
      const rede = request.nextUrl.searchParams.get("rede");
      const tipoUsuario = request.nextUrl.searchParams.get("tipoUsuario");
      if (rede?.trim()) where.rede = rede.trim();
      if (tipoUsuario?.trim()) where.tipoUsuario = tipoUsuario.trim();
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        telefone: true,
        rede: true,
        tipoUsuario: true,
        flgAtivo: true,
      },
      orderBy: { nomeCompleto: "asc" },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários pendentes:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados" },
      { status: 500 }
    );
  }
}
