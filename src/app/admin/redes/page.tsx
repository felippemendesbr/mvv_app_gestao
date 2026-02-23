"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DataGridPaginated, type Column } from "@/components/admin/DataGridPaginated";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Rede {
  id: number;
  label: string;
  churchId?: number | null;
  churchNome?: string | null;
  _count?: { membros: number };
}

export default function RedesPage() {
  const { canEdit } = useAuth();
  const [redes, setRedes] = useState<Rede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRedes();
  }, []);

  async function fetchRedes() {
    try {
      const res = await fetch("/api/redes");
      if (!res.ok) throw new Error("Erro ao carregar redes");
      const data = await res.json();
      setRedes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "Deseja realmente excluir esta rede? Membros vinculados serão afetados."
      )
    )
      return;
    try {
      const res = await fetch(`/api/redes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      setRedes((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  const columns: Column<Rede>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      className: "w-20",
      render: (r) => (
        <span className="text-slate-500 font-mono text-xs">{r.id}</span>
      ),
      exportValue: (r) => r.id,
    },
    {
      key: "label",
      label: "Nome",
      sortable: true,
      exportValue: (r) => r.label,
    },
    {
      key: "churchNome",
      label: "Igreja",
      sortable: true,
      sortValue: (r) => r.churchNome ?? "",
      render: (r) => (
        <span className="text-[var(--foreground)]">
          {r.churchNome ?? "—"}
        </span>
      ),
      exportValue: (r) => r.churchNome ?? "—",
    },
    {
      key: "membros",
      label: "Membros",
      sortable: true,
      sortValue: (r) => r._count?.membros ?? 0,
      render: (r) => {
        const count = r._count?.membros ?? 0;
        return (
          <Badge variant={count > 0 ? "info" : "default"}>
            {count} {count === 1 ? "membro" : "membros"}
          </Badge>
        );
      },
      exportValue: (r) => r._count?.membros ?? 0,
    },
    ...(canEdit
      ? [
          {
            key: "acoes" as const,
            label: "Ações",
            sortable: false as const,
            className: "w-28",
            render: (r: Rede) => (
              <div className="flex gap-2">
                <Link
                  href={`/admin/redes/${r.id}`}
                  className="p-2 text-[#083262] dark:text-[#6B9BD1] hover:bg-[#EDE6D6] dark:hover:bg-[var(--muted)] rounded-full transition-colors"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#A47C3B] border-r-transparent"></div>
          <p className="mt-4 text-[var(--foreground)]/80">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Redes</h1>
          <p className="text-[var(--foreground)]/80 mt-1">Gerencie as redes de membros</p>
        </div>
        {canEdit && (
          <Link href="/admin/redes/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Rede
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Table */}
      <Card>
        <div className="p-6">
          <DataGridPaginated
            data={redes}
            columns={columns}
            getRowId={(r) => r.id}
            emptyMessage="Nenhuma rede cadastrada"
            exportFileName="redes"
          />
        </div>
      </Card>
    </div>
  );
}
