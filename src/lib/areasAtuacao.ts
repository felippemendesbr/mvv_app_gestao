export function parseAreasAtuacao(label: string | null | undefined): string[] {
  if (!label) return [];
  const unique = new Set(
    label
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  return Array.from(unique);
}

export function vinculoTemArea(label: string, area: string): boolean {
  return parseAreasAtuacao(label).some(
    (item) => item.toLowerCase() === area.toLowerCase()
  );
}
