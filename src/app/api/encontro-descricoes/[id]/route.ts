import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, isAdmin } from "@/lib/api";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthFromRequest(request);
  if (!auth || !isAdmin(auth.tipoUsuario)) {
    return NextResponse.json(
      { error: "Acesso negado. Apenas administrador pode editar." },
      { status: 403 }
    );
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { ordem, texto, encontroId } = body;

    if (texto === undefined) {
      return NextResponse.json(
        { error: "Texto é obrigatório" },
        { status: 400 }
      );
    }

    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const updated = await prisma.encontroDescricoes.update({
      where: { id: idNum },
      data: {
        ...(typeof ordem === "number" && { ordem }),
        texto: String(texto),
        ...(typeof encontroId === "number" && { encontroId }),
      },
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
