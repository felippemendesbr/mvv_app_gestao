"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, FileText, Video } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DataGridPaginated, type Column } from "@/components/admin/DataGridPaginated";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Pdf {
  id: number;
  titulo: string;
  url: string;
}

interface VideoItem {
  id: number;
  titulo: string;
  url: string;
}

interface EdificandoItem {
  id: number;
  titulo: string;
  pdfs: Pdf[];
  videos: VideoItem[];
}

export default function EdificandoPage() {
  const { canEdit } = useAuth();
  const [items, setItems] = useState<EdificandoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch("/api/edificando");
      if (!res.ok) throw new Error("Erro ao carregar dados");
      const data = await res.json();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir este registro? Os PDFs e vídeos vinculados também serão excluídos."))
      return;
    try {
      const res = await fetch(`/api/edificando/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  const columns: Column<EdificandoItem>[] = [
    {
      key: "titulo",
      label: "Título",
      sortable: true,
      exportValue: (i) => i.titulo,
    },
    {
      key: "pdfs",
      label: "PDFs",
      sortable: false,
      render: (i) => (
        <div className="space-y-1">
          {i.pdfs.length === 0 ? (
            <span className="text-slate-500 text-sm">—</span>
          ) : (
            i.pdfs.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-red-500 shrink-0" />
                <a
                  href={p.url.startsWith("http") ? p.url : p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#083262] hover:text-[#A47C3B] hover:underline truncate max-w-xs transition-colors"
                >
                  {p.titulo}
                </a>
              </div>
            ))
          )}
        </div>
      ),
      exportValue: (i) => i.pdfs.map((p) => p.titulo).join(", "),
    },
    {
      key: "videos",
      label: "Vídeos",
      sortable: false,
      render: (i) => (
        <div className="space-y-1">
          {i.videos.length === 0 ? (
            <span className="text-slate-500 text-sm">—</span>
          ) : (
            i.videos.map((v) => (
              <div key={v.id} className="flex items-center gap-2 text-sm">
                <Video className="h-4 w-4 text-red-600 shrink-0" />
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#083262] hover:text-[#A47C3B] hover:underline truncate max-w-xs transition-colors"
                >
                  {v.titulo}
                </a>
              </div>
            ))
          )}
        </div>
      ),
      exportValue: (i) => i.videos.map((v) => v.titulo).join(", "),
    },
    ...(canEdit
      ? [
          {
            key: "acoes" as const,
            label: "Ações",
            sortable: false as const,
            className: "w-28",
            render: (i: EdificandoItem) => (
              <div className="flex gap-2">
                <Link
                  href={`/admin/edificando/${i.id}`}
                  className="p-2 text-[#083262] dark:text-[#6B9BD1] hover:bg-[#EDE6D6] dark:hover:bg-[var(--muted)] rounded-full transition-colors"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(i.id)}
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
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Edificando</h1>
          <p className="text-[var(--foreground)]/80 mt-1">
            Gerencie edições, PDFs e vídeos
          </p>
        </div>
        {canEdit && (
          <Link href="/admin/edificando/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Edição
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
            getRowId={(i) => i.id}
            emptyMessage="Nenhum registro cadastrado"
            exportFileName="edificando"
          />
        </div>
      </Card>
    </div>
  );
}
