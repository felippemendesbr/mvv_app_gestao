import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, canWrite } from "@/lib/api";

export async function GET() {
  try {
    const item = await prisma.galeraSanta.findFirst();
    
    if (!item) {
      return NextResponse.json(
        { error: "Registro não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Erro ao buscar GaleraSanta:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (auth && !canWrite(auth.tipoUsuario)) {
      return NextResponse.json(
        { error: "Apenas visualização. Alterações não permitidas." },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { descricao } = body;

    if (!descricao) {
      return NextResponse.json(
        { error: "Descrição é obrigatória" },
        { status: 400 }
      );
    }

    const item = await prisma.galeraSanta.findFirst();

    if (!item) {
      return NextResponse.json(
        { error: "Registro não encontrado" },
        { status: 404 }
      );
    }

    const updated = await prisma.galeraSanta.update({
      where: { id: item.id },
      data: { descricao },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar GaleraSanta:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar dados" },
      { status: 500 }
    );
  }
}
