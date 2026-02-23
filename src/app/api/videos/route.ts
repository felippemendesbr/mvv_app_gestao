import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const videos = await prisma.videoResource.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    return NextResponse.json(
      { error: "Erro ao carregar vídeos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, videoId } = body;

    if (!title || !videoId) {
      return NextResponse.json(
        { error: "Título e VideoId são obrigatórios" },
        { status: 400 }
      );
    }

    const video = await prisma.videoResource.create({
      data: {
        title,
        description: description || null,
        videoId,
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error("Erro ao criar vídeo:", error);
    return NextResponse.json(
      { error: "Erro ao criar vídeo" },
      { status: 500 }
    );
  }
}
