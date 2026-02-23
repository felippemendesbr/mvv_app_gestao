"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Video } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DataGridPaginated, type Column } from "@/components/admin/DataGridPaginated";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface VideoItem {
  id: number;
  title: string;
  description: string | null;
  videoId: string;
}

export default function VideosPage() {
  const { canEdit } = useAuth();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    try {
      const res = await fetch("/api/videos");
      if (!res.ok) throw new Error("Erro ao carregar vídeos");
      const data = await res.json();
      setVideos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir este vídeo?")) return;
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  const columns: Column<VideoItem>[] = [
    {
      key: "title",
      label: "Título",
      sortable: true,
      exportValue: (v) => v.title,
    },
    {
      key: "videoId",
      label: "Video ID",
      sortable: true,
      render: (v) => (
        <span className="text-[var(--foreground)]/80 font-mono text-sm">{v.videoId}</span>
      ),
      exportValue: (v) => v.videoId,
    },
    {
      key: "description",
      label: "Descrição",
      sortable: true,
      render: (v) => (
        <span className="max-w-md truncate block text-[var(--foreground)]/80">
          {v.description || "-"}
        </span>
      ),
      exportValue: (v) => v.description || "",
    },
    ...(canEdit
      ? [
          {
            key: "acoes" as const,
            label: "Ações",
            sortable: false as const,
            className: "w-28",
            render: (v: VideoItem) => (
              <div className="flex gap-2">
                <Link
                  href={`/admin/videos/${v.id}`}
                  className="p-2 text-[#083262] dark:text-[#6B9BD1] hover:bg-[#EDE6D6] dark:hover:bg-[var(--muted)] rounded-full transition-colors"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(v.id)}
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
            <Video className="h-8 w-8 text-[var(--secondary)] dark:text-[#D7C7A3]" />
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Vídeos</h1>
          </div>
          <p className="text-[var(--foreground)]/80 mt-1">
            Gerencie os vídeos do aplicativo
          </p>
        </div>
        {canEdit && (
          <Link href="/admin/videos/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Vídeo
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
            data={videos}
            columns={columns}
            getRowId={(v) => v.id}
            emptyMessage="Nenhum vídeo cadastrado"
            exportFileName="videos"
          />
        </div>
      </Card>
    </div>
  );
}
