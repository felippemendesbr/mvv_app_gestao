import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const song = await prisma.song.findUnique({
      where: { id },
    });

    if (!song) {
      return NextResponse.json(
        { error: "Música não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(song);
  } catch (error) {
    console.error("Erro ao buscar música:", error);
    return NextResponse.json(
      { error: "Erro ao carregar música" },
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
    const { nome, thumbnail, spotify, deezer, youtube } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const song = await prisma.song.update({
      where: { id },
      data: {
        nome,
        thumbnail: thumbnail || null,
        spotify: spotify || null,
        deezer: deezer || null,
        youtube: youtube || null,
      },
    });

    return NextResponse.json(song);
  } catch (error) {
    console.error("Erro ao atualizar música:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar música" },
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
    await prisma.song.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir música:", error);
    return NextResponse.json(
      { error: "Erro ao excluir música" },
      { status: 500 }
    );
  }
}
