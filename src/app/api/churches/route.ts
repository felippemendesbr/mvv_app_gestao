import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const churches = await prisma.church.findMany({
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(churches);
  } catch (error) {
    console.error("Erro ao buscar igrejas:", error);
    return NextResponse.json(
      { error: "Erro ao carregar igrejas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, horario, local, maps } = body;

    if (!nome || !local) {
      return NextResponse.json(
        { error: "Nome e Local são obrigatórios" },
        { status: 400 }
      );
    }

    const church = await prisma.church.create({
      data: {
        nome,
        horario: horario || null,
        local,
        maps: maps || null,
      },
    });

    return NextResponse.json(church);
  } catch (error) {
    console.error("Erro ao criar igreja:", error);
    return NextResponse.json(
      { error: "Erro ao criar igreja" },
      { status: 500 }
    );
  }
}
