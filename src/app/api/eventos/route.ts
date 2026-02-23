import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateHexId } from "@/lib/utils";

const ALLOWED_CONTENT_TYPES = [
  "data:image/png;base64",
  "data:image/jpeg;base64",
  "data:image/jpg;base64",
  "data:image/webp",
  "data:image/avif;base64",
];

export async function GET() {
  try {
    const eventos = await prisma.evento.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(eventos);
  } catch (error) {
    console.error("Erro ao listar eventos:", error);
    return NextResponse.json(
      { error: "Erro ao listar eventos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const id = generateHexId();
    const evento = await prisma.evento.create({
      data: {
        id,
        title: title.trim(),
        description: description ? String(description) : null,
        idImagem: finalImagemId,
        url: url ? String(url) : null,
      },
    });
    return NextResponse.json(evento);
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return NextResponse.json(
      { error: "Erro ao criar evento" },
      { status: 500 }
    );
  }
}
