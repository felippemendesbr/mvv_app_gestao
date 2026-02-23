import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findFirst({
      where: {
        email: email,
        flgAtivo: true,
      },
    });

    if (!usuario) {
      // Por segurança, não informamos se o email existe ou não
      return NextResponse.json({
        success: true,
        message: "Se o email existir, você receberá instruções para redefinir sua senha.",
      });
    }

    // TODO: Implementar envio de email com link de recuperação
    // Por enquanto, apenas retornamos sucesso
    return NextResponse.json({
      success: true,
      message: "Instruções enviadas para o email cadastrado.",
    });
  } catch (error) {
    console.error("Erro ao processar recuperação de senha:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}
