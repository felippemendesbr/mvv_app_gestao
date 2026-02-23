import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const edicoes = await prisma.edificandoEdicoes.findMany({
      orderBy: { id: "desc" },
      include: {
        pdfs: true,
        videos: true,
      },
    });
    return NextResponse.json(edicoes);
  } catch (error) {
    console.error("Erro ao buscar edificando:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titulo, pdfs = [], videos = [] } = body;

    if (!titulo) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }

    const edificando = await prisma.edificandoEdicoes.create({
      data: {
        titulo,
        pdfs: {
          create: pdfs.map((p: { titulo: string; url: string }) => ({
            titulo: p.titulo,
            url: p.url,
          })),
        },
        videos: {
          create: videos.map((v: { titulo: string; url: string }) => ({
            titulo: v.titulo,
            url: v.url,
          })),
        },
      },
      include: {
        pdfs: true,
        videos: true,
      },
    });

    return NextResponse.json(edificando);
  } catch (error) {
    console.error("Erro ao criar edificando:", error);
    return NextResponse.json(
      { error: "Erro ao criar registro" },
      { status: 500 }
    );
  }
}
