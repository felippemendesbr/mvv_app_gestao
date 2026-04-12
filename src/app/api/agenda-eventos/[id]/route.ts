import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const item = await prisma.agendaEvento.findUnique({
      where: { id: idNum },
    });
    if (!item) {
      return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("Erro ao buscar AgendaEvento:", error);
    return NextResponse.json(
      { error: "Erro ao carregar registro" },
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
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { titulo, local, data, descricao, tipoUsuario, perfil, rede } = body;

    if (!titulo || typeof titulo !== "string" || !titulo.trim()) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }
    if (!local || typeof local !== "string" || !local.trim()) {
      return NextResponse.json(
        { error: "Local é obrigatório" },
        { status: 400 }
      );
    }
    if (data == null || data === "") {
      return NextResponse.json(
        { error: "Data é obrigatória" },
        { status: 400 }
      );
    }

    const dt = new Date(data);
    if (Number.isNaN(dt.getTime())) {
      return NextResponse.json({ error: "Data inválida" }, { status: 400 });
    }

    const item = await prisma.agendaEvento.update({
      where: { id: idNum },
      data: {
        titulo: titulo.trim().slice(0, 180),
        local: local.trim().slice(0, 180),
        data: dt,
        descricao:
          descricao != null && String(descricao).trim()
            ? String(descricao).trim().slice(0, 1024)
            : null,
        tipoUsuario:
          tipoUsuario != null && String(tipoUsuario).trim()
            ? String(tipoUsuario).trim().slice(0, 100)
            : null,
        perfil:
          perfil != null && String(perfil).trim()
            ? String(perfil).trim().slice(0, 100)
            : null,
        rede:
          rede != null && String(rede).trim()
            ? String(rede).trim().slice(0, 100)
            : null,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Erro ao atualizar AgendaEvento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar registro" },
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
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    await prisma.agendaEvento.delete({ where: { id: idNum } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir AgendaEvento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir registro" },
      { status: 500 }
    );
  }
}
