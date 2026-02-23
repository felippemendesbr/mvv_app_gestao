"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  sortValue?: (item: T) => string | number | null;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (item: T) => string | number;
  emptyMessage?: string;
}

type SortDir = "asc" | "desc" | null;

export function DataGrid<T>({
  data,
  columns,
  getRowId,
  emptyMessage = "Nenhum registro encontrado",
}: DataGridProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc");
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getSortValue = (item: T, key: string): string | number | null => {
    const col = columns.find((c) => String(c.key) === key);
    if (col?.sortValue) return col.sortValue(item);
    const val = (item as Record<string, unknown>)[key];
    return val != null && typeof val !== "object" ? (val as string | number) : null;
  };

  const sortedData = [...data];
  if (sortKey && sortDir) {
    sortedData.sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      const cmp =
        aVal == null && bVal == null
          ? 0
          : aVal == null
            ? 1
            : bVal == null
              ? -1
              : String(aVal).localeCompare(String(bVal), undefined, {
                  numeric: true,
                });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
            {columns.map((col) => {
              const key = String(col.key);
              const isSortable = col.sortable !== false;
              const isActive = sortKey === key;
              return (
                <th
                  key={key}
                  className={`px-6 py-3 text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider select-none ${
                    isSortable ? "cursor-pointer hover:bg-[var(--muted)]/80" : ""
                  } ${col.className ?? ""}`}
                  onClick={() => isSortable && handleSort(key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.label}</span>
                    {isSortable && (
                      <span className="text-[var(--foreground)]/60">
                        {!isActive && <ArrowUpDown className="h-3.5 w-3.5" />}
                        {isActive && sortDir === "asc" && (
                          <ArrowUp className="h-3.5 w-3.5 text-[var(--secondary)]" />
                        )}
                        {isActive && sortDir === "desc" && (
                          <ArrowDown className="h-3.5 w-3.5 text-[var(--secondary)]" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-[var(--foreground)]/70"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="h-12 w-12 text-[var(--foreground)]/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <span className="text-sm">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((item) => (
              <tr
                key={String(getRowId(item))}
                className="hover:bg-[var(--muted)]/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-6 py-4 text-sm text-[var(--foreground)] ${col.className ?? ""}`}
                  >
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key as string] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
