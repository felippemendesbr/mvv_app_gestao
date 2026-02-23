"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DataGridPaginated, type Column } from "@/components/admin/DataGridPaginated";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Curso {
  id: number;
  titulo: string;
  descricao: string | null;
  idImagem: number | null;
  url: string | null;
}

export default function CursosPage() {
  const { canEdit } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCursos();
  }, []);

  async function fetchCursos() {
    try {
      const res = await fetch("/api/cursos");
      if (!res.ok) throw new Error("Erro ao carregar cursos");
      const data = await res.json();
      setCursos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir este curso?")) return;
    try {
      const res = await fetch(`/api/cursos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      setCursos((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  const columns: Column<Curso>[] = [
    {
      key: "titulo",
      label: "Título",
      sortable: true,
      exportValue: (c) => c.titulo,
    },
    {
      key: "descricao",
      label: "Descrição",
      sortable: true,
      render: (c) => (
        <span className="max-w-md truncate block text-[var(--foreground)]/80">
          {c.descricao || "-"}
        </span>
      ),
      exportValue: (c) => c.descricao || "",
    },
    {
      key: "idImagem",
      label: "ID Imagem",
      sortable: true,
      className: "w-24",
      render: (c) => (
        <span className="text-[var(--foreground)]/80">{c.idImagem ?? "-"}</span>
      ),
      exportValue: (c) => c.idImagem ?? "",
    },
    {
      key: "url",
      label: "URL",
      sortable: true,
      render: (c) => (
        <span className="max-w-xs truncate block text-[var(--foreground)]/80">
          {c.url || "-"}
        </span>
      ),
      exportValue: (c) => c.url || "",
    },
    ...(canEdit
      ? [
          {
            key: "acoes" as const,
            label: "Ações",
            sortable: false as const,
            className: "w-28",
            render: (c: Curso) => (
              <div className="flex gap-2">
                <Link
                  href={`/admin/cursos/${c.id}`}
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-[var(--secondary)] dark:text-[#D7C7A3]" />
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Cursos</h1>
          </div>
          <p className="text-[var(--foreground)]/80 mt-1">Gerencie os cursos cadastrados</p>
        </div>
        {canEdit && (
          <Link href="/admin/cursos/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Curso
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
            data={cursos}
            columns={columns}
            getRowId={(c) => c.id}
            emptyMessage="Nenhum curso cadastrado"
            exportFileName="cursos"
          />
        </div>
      </Card>
    </div>
  );
}
