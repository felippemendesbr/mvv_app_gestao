"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DataGridPaginated, type Column } from "@/components/admin/DataGridPaginated";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Evento {
  id: string;
  title: string;
  description: string;
  idImagem: number;
  url: string;
}

export default function EventosPage() {
  const { canEdit } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEventos();
  }, []);

  async function fetchEventos() {
    try {
      const res = await fetch("/api/eventos");
      if (!res.ok) throw new Error("Erro ao carregar eventos");
      const data = await res.json();
      setEventos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir este evento?")) return;
    try {
      const res = await fetch(`/api/eventos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      setEventos((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  const columns: Column<Evento>[] = [
    {
      key: "title",
      label: "Título",
      sortable: true,
      exportValue: (e) => e.title,
    },
    {
      key: "description",
      label: "Descrição",
      sortable: true,
      render: (e) => (
        <span className="max-w-md truncate block text-[var(--foreground)]/80">
          {e.description || "-"}
        </span>
      ),
      exportValue: (e) => e.description || "",
    },
    {
      key: "url",
      label: "URL",
      sortable: true,
      render: (e) => (
        <span className="max-w-xs truncate block text-[var(--foreground)]/80">
          {e.url || "-"}
        </span>
      ),
      exportValue: (e) => e.url || "",
    },
    ...(canEdit
      ? [
          {
            key: "acoes" as const,
            label: "Ações",
            sortable: false as const,
            className: "w-28",
            render: (e: Evento) => (
              <div className="flex gap-2">
                <Link
                  href={`/admin/eventos/${e.id}`}
                  className="p-2 text-[#083262] dark:text-[#6B9BD1] hover:bg-[#EDE6D6] dark:hover:bg-[var(--muted)] rounded-full transition-colors"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(e.id)}
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
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Eventos</h1>
          <p className="text-[var(--foreground)]/80 mt-1">
            Gerencie os eventos do aplicativo
          </p>
        </div>
        {canEdit && (
          <Link href="/admin/eventos/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
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
            data={eventos}
            columns={columns}
            getRowId={(e) => e.id}
            emptyMessage="Nenhum evento cadastrado"
            exportFileName="eventos"
            defaultPageSize={9999}
          />
        </div>
      </Card>
    </div>
  );
}
