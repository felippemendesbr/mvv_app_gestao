"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Music } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DataGridPaginated, type Column } from "@/components/admin/DataGridPaginated";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Song {
  id: number;
  nome: string;
  thumbnail: string | null;
  spotify: string | null;
  deezer: string | null;
  youtube: string | null;
}

export default function MVVMusicPage() {
  const { canEdit } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs() {
    try {
      const res = await fetch("/api/songs");
      if (!res.ok) throw new Error("Erro ao carregar músicas");
      const data = await res.json();
      setSongs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir esta música?")) return;
    try {
      const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      setSongs((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  const columns: Column<Song>[] = [
    {
      key: "nome",
      label: "Nome",
      sortable: true,
      exportValue: (s) => s.nome,
    },
    {
      key: "spotify",
      label: "Spotify",
      sortable: true,
      render: (s) => (
        <span className="text-[var(--foreground)]/80 text-xs">
          {s.spotify ? "✓" : "-"}
        </span>
      ),
      exportValue: (s) => s.spotify || "",
    },
    {
      key: "deezer",
      label: "Deezer",
      sortable: true,
      render: (s) => (
        <span className="text-[var(--foreground)]/80 text-xs">
          {s.deezer ? "✓" : "-"}
        </span>
      ),
      exportValue: (s) => s.deezer || "",
    },
    {
      key: "youtube",
      label: "YouTube",
      sortable: true,
      render: (s) => (
        <span className="text-[var(--foreground)]/80 text-xs">
          {s.youtube ? "✓" : "-"}
        </span>
      ),
      exportValue: (s) => s.youtube || "",
    },
    ...(canEdit
      ? [
          {
            key: "acoes" as const,
            label: "Ações",
            sortable: false as const,
            className: "w-28",
            render: (s: Song) => (
              <div className="flex gap-2">
                <Link
                  href={`/admin/mvv-music/${s.id}`}
                  className="p-2 text-[#083262] dark:text-[#6B9BD1] hover:bg-[#EDE6D6] dark:hover:bg-[var(--muted)] rounded-full transition-colors"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(s.id)}
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
            <Music className="h-8 w-8 text-[var(--secondary)] dark:text-[#D7C7A3]" />
            <h1 className="text-3xl font-bold text-[var(--foreground)]">MVV Music</h1>
          </div>
          <p className="text-[var(--foreground)]/80 mt-1">
            Gerencie as músicas do aplicativo
          </p>
        </div>
        {canEdit && (
          <Link href="/admin/mvv-music/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Música
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
            data={songs}
            columns={columns}
            getRowId={(s) => s.id}
            emptyMessage="Nenhuma música cadastrada"
            exportFileName="mvv-music"
          />
        </div>
      </Card>
    </div>
  );
}
