import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, isAdmin } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth || !isAdmin(auth.tipoUsuario)) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administrador." },
        { status: 403 }
      );
    }

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const sala = await prisma.salaInfantil.findUnique({
      where: { id },
      include: {
        tipoSala: { select: { id: true, nome: true } },
        church: { select: { id: true, nome: true } },
      },
    });
    if (!sala) {
      return NextResponse.json(
        { error: "Sala infantil não encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(sala);
  } catch (error) {
    console.error("Erro ao buscar sala infantil:", error);
    return NextResponse.json(
      { error: "Erro ao buscar sala infantil" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth || !isAdmin(auth.tipoUsuario)) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administrador." },
        { status: 403 }
      );
    }

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { nome, tipoSalaId, idChurch, enabled, idadeMinima, idadeMaxima } = body;

    if (!nome || typeof nome !== "string") {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const nomeTrimmed = nome.trim();
    if (nomeTrimmed.length > 100) {
      return NextResponse.json(
        { error: "O nome não pode ter mais de 100 caracteres" },
        { status: 400 }
      );
    }

    const tipoSalaIdNum = parseInt(String(tipoSalaId), 10);
    if (isNaN(tipoSalaIdNum) || tipoSalaIdNum <= 0) {
      return NextResponse.json(
        { error: "Tipo de sala é obrigatório" },
        { status: 400 }
      );
    }

    const idChurchNum = parseInt(String(idChurch), 10);
    if (isNaN(idChurchNum) || idChurchNum <= 0) {
      return NextResponse.json(
        { error: "Igreja é obrigatória" },
        { status: 400 }
      );
    }

    const [tipoSala, church] = await Promise.all([
      prisma.tipoSalaInfantil.findUnique({ where: { id: tipoSalaIdNum } }),
      prisma.church.findUnique({ where: { id: idChurchNum } }),
    ]);
    if (!tipoSala) {
      return NextResponse.json(
        { error: "Tipo de sala não encontrado" },
        { status: 400 }
      );
    }
    if (!church) {
      return NextResponse.json(
        { error: "Igreja não encontrada" },
        { status: 400 }
      );
    }

    const idadeMin = parseInt(String(idadeMinima), 10);
    const idadeMax = parseInt(String(idadeMaxima), 10);
    if (isNaN(idadeMin) || idadeMin < 0) {
      return NextResponse.json(
        { error: "Idade mínima deve ser um número válido (0 ou maior)" },
        { status: 400 }
      );
    }
    if (isNaN(idadeMax) || idadeMax < 0) {
      return NextResponse.json(
        { error: "Idade máxima deve ser um número válido (0 ou maior)" },
        { status: 400 }
      );
    }
    if (idadeMax > 14) {
      return NextResponse.json(
        { error: "Idade máxima não pode ser maior que 14 anos" },
        { status: 400 }
      );
    }
    if (idadeMin >= idadeMax) {
      return NextResponse.json(
        { error: "Idade mínima deve ser menor que idade máxima" },
        { status: 400 }
      );
    }

    const sala = await prisma.salaInfantil.update({
      where: { id },
      data: {
        nome: nomeTrimmed,
        tipoSalaId: tipoSalaIdNum,
        idChurch: idChurchNum,
        enabled: enabled === true || enabled === "true" || enabled === 1,
        idadeMinima: idadeMin,
        idadeMaxima: idadeMax,
      },
    });
    return NextResponse.json(sala);
  } catch (error) {
    console.error("Erro ao atualizar sala infantil:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar sala infantil" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth || !isAdmin(auth.tipoUsuario)) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administrador." },
        { status: 403 }
      );
    }

    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.salaInfantil.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir sala infantil:", error);
    return NextResponse.json(
      { error: "Erro ao excluir sala infantil" },
      { status: 500 }
    );
  }
}
