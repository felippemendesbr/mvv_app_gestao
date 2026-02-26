"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Church as ChurchIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DataGridPaginated, type Column } from "@/components/admin/DataGridPaginated";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Church {
  id: number;
  nome: string;
  horario: string | null;
  local: string;
  maps: string | null;
  totalRedes?: number;
  totalMembros?: number;
}

export default function IgrejasPage() {
  const { canEdit } = useAuth();
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChurches();
  }, []);

  async function fetchChurches() {
    try {
      const res = await fetch("/api/churches");
      if (!res.ok) throw new Error("Erro ao carregar igrejas");
      const data = await res.json();
      setChurches(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir esta igreja?")) return;
    try {
      const res = await fetch(`/api/churches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      setChurches((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  const columns: Column<Church>[] = [
    {
      key: "nome",
      label: "Nome",
      sortable: true,
      exportValue: (c) => c.nome,
    },
    {
      key: "local",
      label: "Local",
      sortable: true,
      exportValue: (c) => c.local,
    },
    {
      key: "totalRedes",
      label: "Redes",
      sortable: true,
      render: (c) => (
        <span className="text-[var(--foreground)]/80 font-medium">
          {c.totalRedes ?? 0}
        </span>
      ),
      exportValue: (c) => String(c.totalRedes ?? 0),
    },
    {
      key: "totalMembros",
      label: "Membros",
      sortable: true,
      render: (c) => (
        <span className="text-[var(--foreground)]/80 font-medium">
          {c.totalMembros ?? 0}
        </span>
      ),
      exportValue: (c) => String(c.totalMembros ?? 0),
    },
    {
      key: "horario",
      label: "Horário",
      sortable: true,
      render: (c) => (
        <span className="text-[var(--foreground)]/80">{c.horario || "-"}</span>
      ),
      exportValue: (c) => c.horario || "",
    },
    {
      key: "maps",
      label: "Maps",
      sortable: true,
      render: (c) => (
        <span className="text-[var(--foreground)]/80 text-xs">
          {c.maps ? "✓" : "-"}
        </span>
      ),
      exportValue: (c) => c.maps || "",
    },
    ...(canEdit
      ? [
          {
            key: "acoes" as const,
            label: "Ações",
            sortable: false as const,
            className: "w-28",
            render: (c: Church) => (
              <div className="flex gap-2">
                <Link
                  href={`/admin/igrejas/${c.id}`}
                  className="p-2 text-[#083262] dark:text-[#6B9BD1] hover:bg-[#EDE6D6] dark:hover:bg-[var(--muted)] rounded-full transition-colors"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(c.id)}
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
          <div className="flex items-center gap-3">
            <ChurchIcon className="h-8 w-8 text-[var(--secondary)] dark:text-[#D7C7A3]" />
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Igrejas</h1>
          </div>
          <p className="text-[var(--foreground)]/80 mt-1">
            Gerencie as igrejas cadastradas
          </p>
        </div>
        {canEdit && (
          <Link href="/admin/igrejas/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Igreja
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
            data={churches}
            columns={columns}
            getRowId={(c) => c.id}
            emptyMessage="Nenhuma igreja cadastrada"
            exportFileName="igrejas"
          />
        </div>
      </Card>
    </div>
  );
}
