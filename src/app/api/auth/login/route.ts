import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return NextResponse.json(
    { error: "Método não permitido. Use POST com email e senha no corpo (JSON)." },
    { status: 405 }
  );
}

export async function POST(request: Request) {
  try {
    let body: { email?: unknown; senha?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Corpo da requisição inválido" },
        { status: 400 }
      );
    }

    const email = body?.email != null ? String(body.email).trim() : "";
    const senha = body?.senha != null ? String(body.senha) : "";

    if (!email || !senha) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findFirst({
      where: {
        email,
        senha,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Email ou senha inválidos" },
        { status: 401 }
      );
    }

    if (/membro/i.test(usuario.tipoUsuario)) {
      return NextResponse.json(
        { error: "Área restrita a pastores e colaboradores do MVV" },
        { status: 403 }
      );
    }

    if (!usuario.flgAtivo) {
      return NextResponse.json(
        { error: "Conta aguardando aprovação. Entre em contato com o administrador." },
        { status: 403 }
      );
    }

    const usuarioSemSenha = {
      id: usuario.id,
      nomeCompleto: usuario.nomeCompleto,
      email: usuario.email,
      telefone: usuario.telefone,
      dataNascimento: usuario.dataNascimento,
      rede: usuario.rede,
      tipoUsuario: usuario.tipoUsuario,
      flgParticipaMVV: usuario.flgParticipaMVV,
      flgAceitoNotificacao: usuario.flgAceitoNotificacao,
      flgAceitoEmail: usuario.flgAceitoEmail,
      flgAtivo: usuario.flgAtivo,
    };

    return NextResponse.json({
      success: true,
      usuario: usuarioSemSenha,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const name = error instanceof Error ? error.name : "Error";
    console.error("[login] Erro:", name, message);
    if (error instanceof Error && error.stack) console.error("[login] Stack:", error.stack);
    return NextResponse.json(
      { error: "Erro ao processar login" },
      { status: 500 }
    );
  }
}
