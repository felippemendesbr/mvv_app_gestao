import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest, isAdmin } from "@/lib/api";

export const dynamic = "force-dynamic";

const ALLOWED_CONTENT_TYPE = /^data:image\/(webp|png|jpeg|jpg)(;base64)?$/i;

/**
 * GET - Retorna a imagem do Encontro (se existir). Pastor e admin podem visualizar.
 */
export async function GET() {
  try {
    const encontro = await prisma.encontro.findFirst({
      include: { imagem: true },
    });
    if (!encontro || !encontro.imagem) {
      return NextResponse.json({ imagem: null });
    }
    return NextResponse.json({
      imagem: {
        id: encontro.imagem.id,
        contentType: encontro.imagem.contentType,
        conteudoBase64: encontro.imagem.conteudoBase64,
      },
    });
  } catch (error: unknown) {
    const isP2021 =
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2021";
    if (isP2021) {
      return NextResponse.json({ imagem: null });
    }
    console.error("Erro ao buscar imagem do Encontro:", error);
    return NextResponse.json(
      { error: "Erro ao carregar imagem" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Envia/substitui a imagem do Encontro (base64). Apenas administrador.
 * Formatos: webp, png, jpeg, jpg. Se já existir imagem, remove a antiga e insere a nova.
 */
export async function PUT(request: Request) {
  const auth = getAuthFromRequest(request);
  if (!auth || !isAdmin(auth.tipoUsuario)) {
    return NextResponse.json(
      { error: "Acesso negado. Apenas administrador pode enviar a imagem." },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const { imagemBase64, imagemContentType } = body;

    if (
      typeof imagemBase64 !== "string" ||
      !imagemBase64 ||
      typeof imagemContentType !== "string" ||
      !imagemContentType
    ) {
      return NextResponse.json(
        { error: "imagemBase64 e imagemContentType são obrigatórios" },
        { status: 400 }
      );
    }

    if (!ALLOWED_CONTENT_TYPE.test(imagemContentType)) {
      return NextResponse.json(
        { error: "Formato não permitido. Use webp, png, jpeg ou jpg." },
        { status: 400 }
      );
    }

    let encontro = await prisma.encontro.findFirst();
    if (!encontro) {
      encontro = await prisma.encontro.create({
        data: {},
      });
    }

    const oldIdImagem = encontro.idImagem;

    const novaImagem = await prisma.imagem.create({
      data: {
        conteudoBase64: imagemBase64,
        contentType: imagemContentType,
      },
    });

    await prisma.encontro.update({
      where: { id: encontro.id },
      data: { idImagem: novaImagem.id },
    });

    if (oldIdImagem != null) {
      await prisma.imagem.delete({ where: { id: oldIdImagem } }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      idImagem: novaImagem.id,
    });
  } catch (error) {
    console.error("Erro ao salvar imagem do Encontro:", error);
    return NextResponse.json(
      { error: "Erro ao salvar imagem" },
      { status: 500 }
    );
  }
}
