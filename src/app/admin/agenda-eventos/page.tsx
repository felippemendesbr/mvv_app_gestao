"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DataGridPaginated, type Column } from "@/components/admin/DataGridPaginated";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface AgendaEvento {
  id: number;
  titulo: string;
  local: string;
  data: string;
  descricao: string | null;
  tipoUsuario: string | null;
  perfil: string | null;
  rede: string | null;
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AgendaEventosPage() {
  const { canEdit } = useAuth();
  const [items, setItems] = useState<AgendaEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/agenda-eventos");
        if (!res.ok) throw new Error("Erro ao carregar agenda");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir este item da agenda?")) return;
    try {
      const res = await fetch(`/api/agenda-eventos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  const columns: Column<AgendaEvento>[] = [
    {
      key: "titulo",
      label: "Título",
      sortable: true,
      exportValue: (r) => r.titulo,
    },
    {
      key: "local",
      label: "Local",
      sortable: true,
      exportValue: (r) => r.local,
    },
    {
      key: "data",
      label: "Data",
      sortable: true,
      sortValue: (r) => new Date(r.data).getTime(),
      render: (r) => (
        <span className="text-[var(--foreground)]/80 text-sm whitespace-nowrap">
          {formatarData(r.data)}
        </span>
      ),
      exportValue: (r) => formatarData(r.data),
    },
    {
      key: "rede",
      label: "Rede",
      sortable: true,
      sortValue: (r) => r.rede ?? "",
      render: (r) => (
        <span className="text-[var(--foreground)]/80 text-sm">
          {r.rede ?? "—"}
        </span>
      ),
      exportValue: (r) => r.rede ?? "",
    },
    {
      key: "tipoUsuario",
      label: "Tipo usuário",
      sortable: true,
      sortValue: (r) => r.tipoUsuario ?? "",
      render: (r) => (
        <span className="text-[var(--foreground)]/80 text-sm max-w-[140px] truncate block">
          {r.tipoUsuario ?? "—"}
        </span>
      ),
      exportValue: (r) => r.tipoUsuario ?? "",
    },
    ...(canEdit
      ? [
          {
            key: "acoes" as const,
            label: "Ações",
            sortable: false as const,
            className: "w-28",
            render: (r: AgendaEvento) => (
              <div className="flex gap-2">
                <Link
                  href={`/admin/agenda-eventos/${r.id}`}
                  className="p-2 text-[#083262] dark:text-[#6B9BD1] hover:bg-[#EDE6D6] dark:hover:bg-[var(--muted)] rounded-full transition-colors"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#A47C3B] border-r-transparent" />
          <p className="mt-4 text-[var(--foreground)]/80">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-[var(--secondary)]" />
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Agenda</h1>
            <p className="text-[var(--foreground)]/80 mt-1">
              Eventos da tabela AgendaEventos
            </p>
          </div>
        </div>
        {canEdit && (
          <Link href="/admin/agenda-eventos/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo item
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      <Card>
        <div className="p-6">
          <DataGridPaginated
            data={items}
            columns={columns}
            getRowId={(r) => r.id}
            emptyMessage="Nenhum registro na agenda"
            exportFileName="agenda-eventos"
          />
        </div>
      </Card>
    </div>
  );
}
