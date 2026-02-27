import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_CONTENT_TYPES = [
  "data:image/png;base64",
  "data:image/jpeg;base64",
  "data:image/jpg;base64",
  "data:image/webp;base64",
  "data:image/webp",
];

export async function GET() {
  try {
    const cursos = await prisma.curso.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(cursos);
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    return NextResponse.json(
      { error: "Erro ao carregar cursos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titulo, descricao, idImagem, url, imagemBase64, imagemContentType } = body;

    if (!titulo) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }

    let finalIdImagem: number | null = idImagem != null ? Number(idImagem) : null;

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
          { error: "Formato de imagem não permitido. Use PNG, JPEG, JPG ou WEBP." },
          { status: 400 }
        );
      }
      const imagem = await prisma.imagem.create({
        data: {
          conteudoBase64: imagemBase64,
          contentType: imagemContentType,
        },
      });
      finalIdImagem = imagem.id;
    }

    const curso = await prisma.curso.create({
      data: {
        titulo,
        descricao: descricao || null,
        idImagem: finalIdImagem,
        url: url || null,
      },
    });

    return NextResponse.json(curso);
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    return NextResponse.json(
      { error: "Erro ao criar curso" },
      { status: 500 }
    );
  }
}
