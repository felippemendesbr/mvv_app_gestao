import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const video = await prisma.videoResource.findUnique({
      where: { id },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Vídeo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Erro ao buscar vídeo:", error);
    return NextResponse.json(
      { error: "Erro ao carregar vídeo" },
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
    const { title, description, videoId } = body;

    if (!title || !videoId) {
      return NextResponse.json(
        { error: "Título e VideoId são obrigatórios" },
        { status: 400 }
      );
    }

    const video = await prisma.videoResource.update({
      where: { id },
      data: {
        title,
        description: description || null,
        videoId,
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error("Erro ao atualizar vídeo:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar vídeo" },
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
    await prisma.videoResource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir vídeo:", error);
    return NextResponse.json(
      { error: "Erro ao excluir vídeo" },
      { status: 500 }
    );
  }
}
