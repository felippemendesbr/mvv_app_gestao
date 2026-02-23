import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const edificando = await prisma.edificandoEdicoes.findUnique({
      where: { id },
      include: {
        pdfs: true,
        videos: true,
      },
    });

    if (!edificando) {
      return NextResponse.json(
        { error: "Registro não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(edificando);
  } catch (error) {
    console.error("Erro ao buscar edificando:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados" },
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
    const { titulo, pdfs = [], videos = [] } = body;

    if (!titulo) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.edificandoEdicoes.update({
      where: { id },
      data: {
        titulo,
        pdfs: {
          deleteMany: {},
          create: pdfs.map((p: { titulo: string; url: string }) => ({
            titulo: p.titulo,
            url: p.url,
          })),
        },
        videos: {
          deleteMany: {},
          create: videos.map((v: { titulo: string; url: string }) => ({
            titulo: v.titulo,
            url: v.url,
          })),
        },
      },
    });

    const edificando = await prisma.edificandoEdicoes.findUnique({
      where: { id },
      include: { pdfs: true, videos: true },
    });

    return NextResponse.json(edificando);
  } catch (error) {
    console.error("Erro ao atualizar edificando:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar registro" },
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
    await prisma.edificandoEdicoes.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir edificando:", error);
    return NextResponse.json(
      { error: "Erro ao excluir registro" },
      { status: 500 }
    );
  }
}
