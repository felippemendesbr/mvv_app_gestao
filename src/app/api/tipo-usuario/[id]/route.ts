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

    const tipo = await prisma.tipoUsuario.findUnique({
      where: { id },
    });
    if (!tipo) {
      return NextResponse.json(
        { error: "Tipo de usuário não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(tipo);
  } catch (error) {
    console.error("Erro ao buscar tipo de usuário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tipo de usuário" },
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
    const { label } = body;

    if (!label || typeof label !== "string") {
      return NextResponse.json(
        { error: "Label é obrigatório" },
        { status: 400 }
      );
    }

    const labelTrimmed = label.trim();
    if (labelTrimmed.length > 240) {
      return NextResponse.json(
        { error: "O nome não pode ter mais de 240 caracteres" },
        { status: 400 }
      );
    }

    const existente = await prisma.tipoUsuario.findFirst({
      where: {
        label: labelTrimmed,
        id: { not: id },
      },
    });
    if (existente) {
      return NextResponse.json(
        { error: "Já existe um tipo de usuário com este nome" },
        { status: 400 }
      );
    }

    const tipo = await prisma.tipoUsuario.update({
      where: { id },
      data: { label: labelTrimmed },
    });
    return NextResponse.json(tipo);
  } catch (error) {
    console.error("Erro ao atualizar tipo de usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar tipo de usuário" },
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

    await prisma.tipoUsuario.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir tipo de usuário:", error);
    return NextResponse.json(
      { error: "Erro ao excluir tipo de usuário" },
      { status: 500 }
    );
  }
}
