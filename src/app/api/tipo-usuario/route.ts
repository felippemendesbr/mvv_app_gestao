import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, isAdmin } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth || !isAdmin(auth.tipoUsuario)) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administrador." },
        { status: 403 }
      );
    }

    const tipos = await prisma.tipoUsuario.findMany({
      orderBy: { label: "asc" },
    });
    return NextResponse.json(tipos);
  } catch (error) {
    console.error("Erro ao listar tipos de usuário:", error);
    return NextResponse.json(
      { error: "Erro ao listar tipos de usuário" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth || !isAdmin(auth.tipoUsuario)) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administrador." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { label } = body;

    if (!label || typeof label !== "string") {
      return NextResponse.json(
        { error: "Label é obrigatório" },
        { status: 400 }
      );
    }

    const labelTrimmed = label.trim();
    if (labelTrimmed.length > 240) {
      return NextResponse.json(
        { error: "O nome não pode ter mais de 240 caracteres" },
        { status: 400 }
      );
    }

    const existente = await prisma.tipoUsuario.findFirst({
      where: { label: labelTrimmed },
    });
    if (existente) {
      return NextResponse.json(
        { error: "Já existe um tipo de usuário com este nome" },
        { status: 400 }
      );
    }

    const tipo = await prisma.tipoUsuario.create({
      data: { label: labelTrimmed },
    });
    return NextResponse.json(tipo);
  } catch (error) {
    console.error("Erro ao criar tipo de usuário:", error);
    return NextResponse.json(
      { error: "Erro ao criar tipo de usuário" },
      { status: 500 }
    );
  }
}
