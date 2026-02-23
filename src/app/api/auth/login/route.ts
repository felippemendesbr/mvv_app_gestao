import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findFirst({
      where: {
        email: email,
        senha: senha,
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

    // Retorna dados do usuário (sem a senha)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { senha: _, ...usuarioSemSenha } = usuario;

    return NextResponse.json({
      success: true,
      usuario: usuarioSemSenha,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return NextResponse.json(
      { error: "Erro ao processar login" },
      { status: 500 }
    );
  }
}
