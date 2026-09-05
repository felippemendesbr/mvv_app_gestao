/** Escapa curingas do LIKE do SQL Server. */
export function escapeLike(term: string): string {
  return term.replace(/[%_[\]]/g, (ch) => `[${ch}]`);
}
