import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, isAdmin } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth || !isAdmin(auth.tipoUsuario)) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administrador." },
        { status: 403 }
      );
    }

    const tipos = await prisma.tipoSalaInfantil.findMany({
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(tipos);
  } catch (error) {
    console.error("Erro ao listar tipos de sala infantil:", error);
    return NextResponse.json(
      { error: "Erro ao listar tipos de sala infantil" },
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
    const { nome } = body;

    if (!nome || typeof nome !== "string") {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const nomeTrimmed = nome.trim();
    if (nomeTrimmed.length > 100) {
      return NextResponse.json(
        { error: "O nome não pode ter mais de 100 caracteres" },
        { status: 400 }
      );
    }

    const existente = await prisma.tipoSalaInfantil.findFirst({
      where: { nome: nomeTrimmed },
    });
    if (existente) {
      return NextResponse.json(
        { error: "Já existe um tipo de sala infantil com este nome" },
        { status: 400 }
      );
    }

    const tipo = await prisma.tipoSalaInfantil.create({
      data: { nome: nomeTrimmed },
    });
    return NextResponse.json(tipo);
  } catch (error) {
    console.error("Erro ao criar tipo de sala infantil:", error);
    return NextResponse.json(
      { error: "Erro ao criar tipo de sala infantil" },
      { status: 500 }
    );
  }
}
