import { prisma } from "@/lib/prisma";

export async function syncTipoUsuario(
  emails: Array<string | null | undefined>,
  tipoUsuario: string
): Promise<void> {
  const unique = Array.from(
    new Set(
      emails
        .map((e) => e?.trim())
        .filter((e): e is string => Boolean(e))
    )
  );
  if (unique.length === 0) return;

  await prisma.usuario.updateMany({
    where: { email: { in: unique } },
    data: { tipoUsuario },
  });
}
