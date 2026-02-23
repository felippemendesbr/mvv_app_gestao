import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_CONTENT_TYPES = [
  "data:image/png;base64",
  "data:image/jpeg;base64",
  "data:image/jpg;base64",
  "data:image/webp",
  "data:image/avif;base64",
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evento = await prisma.evento.findUnique({
      where: { id },
    });
    if (!evento) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }
    return NextResponse.json(evento);
  } catch (error) {
    console.error("Erro ao buscar evento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar evento" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      idImagem = 0,
      url = "",
      imagemBase64,
      imagemContentType,
    } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }

    let finalImagemId: number | null = idImagem ? Number(idImagem) : null;

    if (imagemBase64 && imagemContentType) {
      if (
        typeof imagemBase64 !== "string" ||
        typeof imagemContentType !== "string"
      ) {
        return NextResponse.json(
          { error: "Dados da imagem são inválidos" },
          { status: 400 }
        );
      }

      if (!ALLOWED_CONTENT_TYPES.includes(imagemContentType)) {
        return NextResponse.json(
          { error: "Formato de imagem não permitido" },
          { status: 400 }
        );
      }

      const imagem = await prisma.imagem.create({
        data: {
          conteudoBase64: imagemBase64,
          contentType: imagemContentType,
        },
      });
      finalImagemId = imagem.id;
    }

    const evento = await prisma.evento.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description ? String(description) : null,
        idImagem: finalImagemId,
        url: url ? String(url) : null,
      },
    });
    return NextResponse.json(evento);
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar evento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.evento.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir evento" },
      { status: 500 }
    );
  }
}
