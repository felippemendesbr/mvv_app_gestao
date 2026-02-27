import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_CONTENT_TYPES = [
  "data:image/png;base64",
  "data:image/jpeg;base64",
  "data:image/jpg;base64",
  "data:image/webp;base64",
  "data:image/webp",
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id, 10);
    const curso = await prisma.curso.findUnique({
      where: { id: idNum },
      include: { imagem: true },
    });

    if (!curso) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(curso);
  } catch (error) {
    console.error("Erro ao buscar curso:", error);
    return NextResponse.json(
      { error: "Erro ao carregar curso" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id, 10);
    const body = await request.json();
    const { titulo, descricao, url, imagemBase64, imagemContentType } = body;

    if (!titulo) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }

    const updateData: {
      titulo: string;
      descricao: string | null;
      url: string | null;
      idImagem?: number | null;
    } = {
      titulo,
      descricao: descricao ?? null,
      url: url ?? null,
    };

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
      updateData.idImagem = imagem.id;
    }

    const curso = await prisma.curso.update({
      where: { id: idNum },
      data: updateData,
    });

    return NextResponse.json(curso);
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar curso" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id, 10);
    await prisma.curso.delete({
      where: { id: idNum },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir curso:", error);
    return NextResponse.json(
      { error: "Erro ao excluir curso" },
      { status: 500 }
    );
  }
}
