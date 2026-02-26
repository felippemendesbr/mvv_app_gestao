import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, needsRedeFilter, canWrite } from "@/lib/api";

export const dynamic = "force-dynamic";

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    const userRede = auth?.rede?.trim() || "";
    const userTipo = auth?.tipoUsuario ?? "";
    const forceRedeFilter = auth && needsRedeFilter(userTipo) && userRede;

    const { searchParams } = new URL(request.url);
    const redeId = searchParams.get("redeId");
    const tipoUsuario = searchParams.get("tipoUsuario");
    const busca = searchParams.get("busca");

    const where: Record<string, unknown> = {};

    if (forceRedeFilter) {
      where.rede = userRede;
    } else if (redeId) {
      const id = parseInt(redeId, 10);
      if (!isNaN(id)) {
        const rede = await prisma.rede.findUnique({
          where: { id },
          select: { label: true },
        });
        if (rede) where.rede = rede.label;
      }
    }

    if (tipoUsuario && tipoUsuario.trim()) {
      where.tipoUsuario = tipoUsuario.trim();
    }
    if (busca && busca.trim()) {
      const term = busca.trim();
      where.OR = [
        { nomeCompleto: { contains: term } },
        { email: { contains: term } },
        { telefone: { contains: term } },
      ];
    }

    const membros = await prisma.membro.findMany({
      where,
      orderBy: { nomeCompleto: "asc" },
    });
    return NextResponse.json(membros);
  } catch (error) {
    console.error("Erro ao listar membros:", error);
    return NextResponse.json(
      { error: "Erro ao listar membros" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authPost = getAuthFromRequest(request);
    if (authPost && !canWrite(authPost.tipoUsuario)) {
      return NextResponse.json(
        { error: "Apenas visualização. Alterações não permitidas." },
        { status: 403 }
      );
    }
    const body = await request.json();
    const {
      nomeCompleto,
      email,
      telefone,
      dataNascimento,
      redeId,
      tipoUsuario,
      participaMvv = false,
      aceitaNotificacoes = true,
      aceitaEmail = true,
    } = body;

    if (!nomeCompleto || typeof nomeCompleto !== "string") {
      return NextResponse.json(
        { error: "Nome completo é obrigatório" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const redeIdNum = parseInt(redeId, 10);
    if (isNaN(redeIdNum) || redeIdNum <= 0) {
      return NextResponse.json(
        { error: "Rede é obrigatória" },
        { status: 400 }
      );
    }

    const rede = await prisma.rede.findUnique({
      where: { id: redeIdNum },
      select: { label: true },
    });
    if (!rede) {
      return NextResponse.json({ error: "Rede não encontrada" }, { status: 400 });
    }

    const authPostCheck = getAuthFromRequest(request);
    if (authPostCheck && needsRedeFilter(authPostCheck.tipoUsuario)) {
      const userRede = authPostCheck.rede?.trim() || "";
      if (userRede && rede.label !== userRede) {
        return NextResponse.json(
          { error: "Só é possível cadastrar membros na sua rede" },
          { status: 403 }
        );
      }
    }

    let dataNasc: Date | null = null;
    if (dataNascimento) {
      dataNasc = new Date(dataNascimento);
      if (isNaN(dataNasc.getTime())) {
        return NextResponse.json(
          { error: "Data de nascimento inválida" },
          { status: 400 }
        );
      }
    }

    const membro = await prisma.membro.create({
      data: {
        nomeCompleto: nomeCompleto.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone ? String(telefone).trim() : null,
        dataNascimento: dataNasc,
        rede: rede.label,
        tipoUsuario:
          tipoUsuario && typeof tipoUsuario === "string"
            ? tipoUsuario.trim()
            : null,
        participaMvv: Boolean(participaMvv),
        aceitaNotificacoes: Boolean(aceitaNotificacoes),
        aceitaEmail: Boolean(aceitaEmail),
      },
    });
    return NextResponse.json(membro);
  } catch (error) {
    console.error("Erro ao criar membro:", error);
    return NextResponse.json(
      { error: "Erro ao criar membro" },
      { status: 500 }
    );
  }
}
