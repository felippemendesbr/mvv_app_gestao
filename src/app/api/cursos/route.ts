import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { titulo, descricao, idImagem, url } = body;

    if (!titulo) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }

    const curso = await prisma.curso.create({
      data: {
        titulo,
        descricao: descricao || null,
        idImagem: idImagem != null ? Number(idImagem) : null,
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
