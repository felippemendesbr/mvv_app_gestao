import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const songs = await prisma.song.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(songs);
  } catch (error) {
    console.error("Erro ao buscar músicas:", error);
    return NextResponse.json(
      { error: "Erro ao carregar músicas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, thumbnail, spotify, deezer, youtube } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const song = await prisma.song.create({
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
    console.error("Erro ao criar música:", error);
    return NextResponse.json(
      { error: "Erro ao criar música" },
      { status: 500 }
    );
  }
}
