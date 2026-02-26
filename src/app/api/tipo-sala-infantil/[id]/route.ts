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

    const tipo = await prisma.tipoSalaInfantil.findUnique({
      where: { id },
    });
    if (!tipo) {
      return NextResponse.json(
        { error: "Tipo de sala infantil não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(tipo);
  } catch (error) {
    console.error("Erro ao buscar tipo de sala infantil:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tipo de sala infantil" },
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
    const { nome } = body;

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

    const existente = await prisma.tipoSalaInfantil.findFirst({
      where: {
        nome: nomeTrimmed,
        id: { not: id },
      },
    });
    if (existente) {
      return NextResponse.json(
        { error: "Já existe um tipo de sala infantil com este nome" },
        { status: 400 }
      );
    }

    const tipo = await prisma.tipoSalaInfantil.update({
      where: { id },
      data: { nome: nomeTrimmed },
    });
    return NextResponse.json(tipo);
  } catch (error) {
    console.error("Erro ao atualizar tipo de sala infantil:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar tipo de sala infantil" },
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

    await prisma.tipoSalaInfantil.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir tipo de sala infantil:", error);
    return NextResponse.json(
      { error: "Erro ao excluir tipo de sala infantil" },
      { status: 500 }
    );
  }
}
