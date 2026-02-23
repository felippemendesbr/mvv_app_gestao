import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const rede = await prisma.rede.findUnique({
      where: { id },
      include: { church: { select: { id: true, nome: true } } },
    });
    if (!rede) {
      return NextResponse.json({ error: "Rede não encontrada" }, { status: 404 });
    }
    return NextResponse.json(rede);
  } catch (error) {
    console.error("Erro ao buscar rede:", error);
    return NextResponse.json(
      { error: "Erro ao buscar rede" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const body = await request.json();
    const { label, churchId } = body;

    if (!label || typeof label !== "string") {
      return NextResponse.json(
        { error: "Label é obrigatório" },
        { status: 400 }
      );
    }

    const churchIdNum =
      churchId != null ? parseInt(String(churchId), 10) : null;
    if (churchIdNum != null && !isNaN(churchIdNum)) {
      const church = await prisma.church.findUnique({
        where: { id: churchIdNum },
      });
      if (!church) {
        return NextResponse.json(
          { error: "Igreja não encontrada" },
          { status: 400 }
        );
      }
    }

    const rede = await prisma.rede.update({
      where: { id },
      data: {
        label: label.trim(),
        churchId: churchIdNum != null && !isNaN(churchIdNum) ? churchIdNum : null,
      },
    });
    return NextResponse.json(rede);
  } catch (error) {
    console.error("Erro ao atualizar rede:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar rede" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    await prisma.rede.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir rede:", error);
    return NextResponse.json(
      { error: "Erro ao excluir rede" },
      { status: 500 }
    );
  }
}
