import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, needsRedeFilter, canWrite } from "@/lib/api";

export const dynamic = "force-dynamic";

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function canAccessMembro(membro: { rede: string | null }, auth: { rede: string } | null): boolean {
  if (!auth) return true;
  const userRede = auth.rede?.trim() || "";
  if (!userRede) return true;
  return (membro.rede ?? "") === userRede;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const membro = await prisma.membro.findUnique({
      where: { id },
    });
    if (!membro) {
      return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
    }
    const auth = getAuthFromRequest(request);
    if (auth && needsRedeFilter(auth.tipoUsuario) && !canAccessMembro(membro, auth)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
    return NextResponse.json(membro);
  } catch (error) {
    console.error("Erro ao buscar membro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar membro" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authPut = getAuthFromRequest(request);
    if (authPut && !canWrite(authPut.tipoUsuario)) {
      return NextResponse.json(
        { error: "Apenas visualização. Alterações não permitidas." },
        { status: 403 }
      );
    }
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const {
      nomeCompleto,
      email,
      telefone,
      dataNascimento,
      redeId,
      tipoUsuario,
      participaMvv,
      aceitaNotificacoes,
      aceitaEmail,
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

    const auth = getAuthFromRequest(request);
    if (auth && needsRedeFilter(auth.tipoUsuario)) {
      const existente = await prisma.membro.findUnique({ where: { id } });
      if (!existente || !canAccessMembro(existente, auth)) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
      if (rede.label !== auth.rede?.trim()) {
        return NextResponse.json(
          { error: "Só é possível alterar membros da sua rede" },
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

    const membro = await prisma.membro.update({
      where: { id },
      data: {
        nomeCompleto: nomeCompleto.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone ? String(telefone).trim() : null,
        dataNascimento: dataNasc,
        rede: rede.label,
        tipoUsuario: tipoUsuario ? String(tipoUsuario).trim() : null,
        participaMvv: Boolean(participaMvv),
        aceitaNotificacoes: Boolean(aceitaNotificacoes),
        aceitaEmail: Boolean(aceitaEmail),
      },
    });
    return NextResponse.json(membro);
  } catch (error) {
    console.error("Erro ao atualizar membro:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar membro" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authDel = getAuthFromRequest(request);
    if (authDel && !canWrite(authDel.tipoUsuario)) {
      return NextResponse.json(
        { error: "Apenas visualização. Alterações não permitidas." },
        { status: 403 }
      );
    }
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = getAuthFromRequest(request);
    if (auth && needsRedeFilter(auth.tipoUsuario)) {
      const existente = await prisma.membro.findUnique({ where: { id } });
      if (!existente || !canAccessMembro(existente, auth)) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    }
    await prisma.membro.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir membro:", error);
    return NextResponse.json(
      { error: "Erro ao excluir membro" },
      { status: 500 }
    );
  }
}
