export const PERFIS_MEMBRO = [
  "Administrador",
  "Colaborador",
  "Lider",
  "Líder de Célula",
  "Lider em treinamento",
  "Membro",
  "Pastor",
  "Visitante",
] as const;

export type PerfilMembro = (typeof PERFIS_MEMBRO)[number];

export function isPerfilValido(valor: string): boolean {
  return (PERFIS_MEMBRO as readonly string[]).includes(valor);
}

export function opcoesPerfil(atual?: string | null): string[] {
  const atualTrim = atual?.trim() ?? "";
  if (atualTrim && !isPerfilValido(atualTrim)) {
    return [atualTrim, ...PERFIS_MEMBRO];
  }
  return [...PERFIS_MEMBRO];
}

export function isTipoAceito(valor: string, atual?: string | null): boolean {
  return isPerfilValido(valor) || (!!atual && valor === atual);
}
