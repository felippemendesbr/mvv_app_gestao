import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthFromRequest,
  isAdmin,
  isPastor,
} from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const tipo = auth.tipoUsuario;
    if (!isAdmin(tipo) && !isPastor(tipo)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findFirst({
      where: { email: email.trim().toLowerCase(), flgAtivo: false },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado ou já aprovado" },
        { status: 404 }
      );
    }

    if (isPastor(tipo)) {
      const userRede = auth.rede?.trim();
      if (!userRede || (usuario.rede ?? "") !== userRede) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { flgAtivo: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao aprovar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao aprovar" },
      { status: 500 }
    );
  }
}
