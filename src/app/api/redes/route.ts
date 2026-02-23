import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [redes, membros] = await Promise.all([
      prisma.rede.findMany({
        orderBy: { id: "asc" },
        include: { church: { select: { id: true, nome: true } } },
      }),
      prisma.membro.findMany({ select: { rede: true } }),
    ]);
    const countByRedeLabel = membros.reduce<Record<string, number>>((acc, m) => {
      const label = m.rede ?? "";
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});
    const result = redes.map((r) => ({
      ...r,
      churchNome: r.church?.nome ?? null,
      _count: { membros: countByRedeLabel[r.label] ?? 0 },
    }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao listar redes:", error);
    return NextResponse.json(
      { error: "Erro ao listar redes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { label, churchId } = body;

    if (!label || typeof label !== "string") {
      return NextResponse.json(
        { error: "Label é obrigatório" },
        { status: 400 }
      );
    }

    const churchIdNum =
      churchId != null ? parseInt(String(churchId), 10) : null;
    if (churchIdNum != null && !isNaN(churchIdNum)) {
      const church = await prisma.church.findUnique({
        where: { id: churchIdNum },
      });
      if (!church) {
        return NextResponse.json(
          { error: "Igreja não encontrada" },
          { status: 400 }
        );
      }
    }

    const rede = await prisma.rede.create({
      data: {
        label: label.trim(),
        churchId: churchIdNum != null && !isNaN(churchIdNum) ? churchIdNum : null,
      },
    });
    return NextResponse.json(rede);
  } catch (error) {
    console.error("Erro ao criar rede:", error);
    return NextResponse.json(
      { error: "Erro ao criar rede" },
      { status: 500 }
    );
  }
}
