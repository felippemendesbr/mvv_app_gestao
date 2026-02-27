"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/Button";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  sortValue?: (item: T) => string | number | null;
  render?: (item: T) => React.ReactNode;
  exportValue?: (item: T) => string | number;
  className?: string;
}

interface DataGridPaginatedProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (item: T) => string | number;
  emptyMessage?: string;
  exportFileName?: string;
  defaultPageSize?: number;
}

type SortDir = "asc" | "desc" | null;

export function DataGridPaginated<T>({
  data,
  columns,
  getRowId,
  emptyMessage = "Nenhum registro encontrado",
  exportFileName = "dados",
  defaultPageSize = 20,
}: DataGridPaginatedProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc");
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const getSortValue = (item: T, key: string): string | number | null => {
    const col = columns.find((c) => String(c.key) === key);
    if (col?.sortValue) return col.sortValue(item);
    const val = (item as Record<string, unknown>)[key];
    return val != null && typeof val !== "object" ? (val as string | number) : null;
  };

  const sortedData = useMemo(() => {
    const sorted = [...data];
    if (sortKey && sortDir) {
      sorted.sort((a, b) => {
        const aVal = getSortValue(a, sortKey);
        const bVal = getSortValue(b, sortKey);
        let cmp: number;
        if (aVal == null && bVal == null) {
          cmp = 0;
        } else if (aVal == null) {
          cmp = 1;
        } else if (bVal == null) {
          cmp = -1;
        } else if (typeof aVal === "number" && typeof bVal === "number") {
          cmp = aVal - bVal;
        } else {
          cmp = String(aVal).localeCompare(String(bVal), undefined, {
            numeric: true,
          });
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sortKey, sortDir, columns]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportColumns = columns.filter((col) => String(col.key).toLowerCase() !== "acoes");

  const exportToExcel = () => {
    const exportData = sortedData.map((item) => {
      const row: Record<string, unknown> = {};
      exportColumns.forEach((col) => {
        if (col.exportValue) {
          row[col.label] = col.exportValue(item);
        } else {
          const val = (item as Record<string, unknown>)[col.key as string];
          row[col.label] = val ?? "";
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    const tableData = sortedData.map((item) =>
      exportColumns.map((col) => {
        if (col.exportValue) {
          return String(col.exportValue(item));
        }
        const val = (item as Record<string, unknown>)[col.key as string];
        return String(val ?? "");
      })
    );

    autoTable(doc, {
      head: [exportColumns.map((col) => col.label)],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [8, 50, 98] },
    });

    doc.save(`${exportFileName}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm text-[var(--foreground)]/80">
            Exibindo {paginatedData.length} de {sortedData.length} registros
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            colorScheme="gold"
            size="sm"
            onClick={exportToExcel}
            disabled={sortedData.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="ml-2">Excel</span>
          </Button>
          <Button
            variant="outline"
            colorScheme="gold"
            size="sm"
            onClick={exportToPDF}
            disabled={sortedData.length === 0}
          >
            <FileText className="h-4 w-4" />
            <span className="ml-2">PDF</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              {columns.map((col) => {
                const key = String(col.key);
                const isSortable = col.sortable !== false;
                const isActive = sortKey === key;
                return (
                  <th
                    key={key}
                    className={`px-3 py-2 sm:px-4 sm:py-3 md:px-6 text-[0.7rem] sm:text-xs font-bold text-[var(--foreground)] uppercase tracking-wider select-none ${
                      isSortable ? "cursor-pointer hover:bg-[var(--muted)]/80" : ""
                    } ${col.className ?? ""}`}
                    onClick={() => isSortable && handleSort(key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{col.label}</span>
                      {isSortable && (
                        <span className="text-[var(--secondary)]">
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
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 sm:px-6 py-10 sm:py-12 text-center text-[var(--foreground)]/70"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="h-12 w-12 text-[var(--border)]"
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
              paginatedData.map((item) => (
                <tr
                  key={String(getRowId(item))}
                  className="hover:bg-[var(--muted)]/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`px-3 py-3 sm:px-4 sm:py-3 md:px-6 text-xs sm:text-sm text-[var(--foreground)] font-medium ${col.className ?? ""}`}
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

      {/* Pagination */}
      {sortedData.length > 0 && (
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--foreground)]/80 font-medium">Registros por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] bg-[var(--card)] focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={9999}>Todos</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              colorScheme="navy"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              colorScheme="navy"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              <span className="text-sm text-[var(--foreground)]/80 font-medium">
                Página {currentPage} de {totalPages}
              </span>
            </div>

            <Button
              variant="ghost"
              colorScheme="navy"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              colorScheme="navy"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
