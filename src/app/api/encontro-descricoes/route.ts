import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, isAdmin } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.encontroDescricoes.findMany({
      orderBy: { ordem: "asc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Erro ao buscar EncontroDescricoes:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const auth = getAuthFromRequest(request);
  if (!auth || !isAdmin(auth.tipoUsuario)) {
    return NextResponse.json(
      { error: "Acesso negado. Apenas administrador pode editar." },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const { texto } = body;

    if (!texto) {
      return NextResponse.json(
        { error: "Texto é obrigatório" },
        { status: 400 }
      );
    }

    const item = await prisma.encontroDescricoes.findFirst();

    if (!item) {
      return NextResponse.json(
        { error: "Registro não encontrado" },
        { status: 404 }
      );
    }

    const updated = await prisma.encontroDescricoes.update({
      where: { id: item.id },
      data: { texto },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar EncontroDescricoes:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar dados" },
      { status: 500 }
    );
  }
}
