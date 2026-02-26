/**
 * Formata data para exibição em pt-BR (DD/MM/AAAA) sem alterar o dia por timezone.
 * Quando o backend envia "1982-09-28" (sem hora), o JavaScript interpreta como UTC
 * e em fusos como Brasil pode exibir 27/09. Aqui tratamos data-only como dia civil.
 */
export function formatDateLocal(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "-";
  const s = typeof value === "string" ? value.trim() : value.toISOString?.() ?? "";
  if (!s) return "-";
  const dateOnly = s.split("T")[0];
  const match = dateOnly?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Retorna partes da data em horário local (para cálculos de idade/aniversário).
 * Para string ISO date-only (YYYY-MM-DD), interpreta como dia civil local.
 */
export function parseDateLocal(value: string | Date | null | undefined): {
  year: number;
  month: number;
  day: number;
} | null {
  if (value == null || value === "") return null;
  const s = typeof value === "string" ? value.trim() : value.toISOString?.() ?? "";
  const dateOnly = s.split("T")[0];
  const match = dateOnly?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return {
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10),
      day: parseInt(match[3], 10),
    };
  }
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return null;
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}
