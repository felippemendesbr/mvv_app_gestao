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

    const emailNorm = email.trim().toLowerCase();

    const usuario = await prisma.usuario.findFirst({
      where: { email: emailNorm },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (isPastor(tipo)) {
      const userRede = auth.rede?.trim();
      if (!userRede || (usuario.rede ?? "") !== userRede) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    }

    await prisma.$transaction([
      prisma.membro.deleteMany({ where: { email: emailNorm } }),
      prisma.usuario.delete({ where: { id: usuario.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao reprovar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao reprovar" },
      { status: 500 }
    );
  }
}
