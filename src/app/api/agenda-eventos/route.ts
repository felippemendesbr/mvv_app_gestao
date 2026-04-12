import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.agendaEvento.findMany({
      orderBy: { data: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Erro ao listar AgendaEventos:", error);
    return NextResponse.json(
      { error: "Erro ao carregar agenda" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const item = await prisma.agendaEvento.create({
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
    console.error("Erro ao criar AgendaEvento:", error);
    return NextResponse.json(
      { error: "Erro ao criar registro" },
      { status: 500 }
    );
  }
}
