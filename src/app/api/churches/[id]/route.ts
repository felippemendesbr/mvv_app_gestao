import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const church = await prisma.church.findUnique({
      where: { id },
    });

    if (!church) {
      return NextResponse.json(
        { error: "Igreja não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(church);
  } catch (error) {
    console.error("Erro ao buscar igreja:", error);
    return NextResponse.json(
      { error: "Erro ao carregar igreja" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { nome, horario, local, maps } = body;

    if (!nome || !local) {
      return NextResponse.json(
        { error: "Nome e Local são obrigatórios" },
        { status: 400 }
      );
    }

    const church = await prisma.church.update({
      where: { id },
      data: {
        nome,
        horario: horario || null,
        local,
        maps: maps || null,
      },
    });

    return NextResponse.json(church);
  } catch (error) {
    console.error("Erro ao atualizar igreja:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar igreja" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    await prisma.church.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir igreja:", error);
    return NextResponse.json(
      { error: "Erro ao excluir igreja" },
      { status: 500 }
    );
  }
}
