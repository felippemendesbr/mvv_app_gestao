"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, DoorOpen } from "lucide-react";
import { useAuth, isAdmin } from "@/contexts/AuthContext";
import { DataGridPaginated, type Column } from "@/components/admin/DataGridPaginated";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { authFetch } from "@/lib/api";

interface SalaInfantil {
  id: number;
  nome: string;
  tipoSalaId: number;
  tipoSalaNome: string;
  idChurch: number;
  churchNome: string;
  enabled: boolean;
  idadeMinima: number;
  idadeMaxima: number;
}

export default function SalaInfantilPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [salas, setSalas] = useState<SalaInfantil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuario && !isAdmin(usuario.tipoUsuario)) {
      router.replace("/admin");
      return;
    }
    fetchSalas();
  }, [usuario, router]);

  async function fetchSalas() {
    try {
      const res = await authFetch("/api/sala-infantil");
      if (res.status === 403) {
        router.replace("/admin");
        return;
      }
      if (!res.ok) throw new Error("Erro ao carregar salas infantis");
      const data = await res.json();
      setSalas(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir esta sala infantil?")) return;
    try {
      const res = await authFetch(`/api/sala-infantil/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao excluir");
      }
      setSalas((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  const columns: Column<SalaInfantil>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      className: "w-20",
      render: (s) => (
        <span className="text-[var(--foreground)]/70 font-mono text-xs">
          {s.id}
        </span>
      ),
      exportValue: (s) => s.id,
    },
    {
      key: "nome",
      label: "Nome",
      sortable: true,
      exportValue: (s) => s.nome,
    },
    {
      key: "tipoSalaNome",
      label: "Tipo",
      sortable: true,
      sortValue: (s) => s.tipoSalaNome,
      exportValue: (s) => s.tipoSalaNome,
    },
    {
      key: "churchNome",
      label: "Igreja",
      sortable: true,
      sortValue: (s) => s.churchNome,
      exportValue: (s) => s.churchNome,
    },
    {
      key: "idade",
      label: "Faixa etária",
      sortable: true,
      sortValue: (s) => s.idadeMinima * 100 + s.idadeMaxima,
      render: (s) => (
        <span className="text-[var(--foreground)]">
          {s.idadeMinima ?? 0} a {s.idadeMaxima ?? 14} anos
        </span>
      ),
      exportValue: (s) => `${s.idadeMinima ?? 0} a ${s.idadeMaxima ?? 14} anos`,
    },
    {
      key: "enabled",
      label: "Status",
      sortable: true,
      sortValue: (s) => (s.enabled ? 1 : 0),
      render: (s) => (
        <Badge variant={s.enabled ? "success" : "default"}>
          {s.enabled ? "Habilitada" : "Desabilitada"}
        </Badge>
      ),
      exportValue: (s) => (s.enabled ? "Habilitada" : "Desabilitada"),
    },
    {
      key: "acoes",
      label: "Ações",
      sortable: false,
      className: "w-28",
      render: (s) => (
        <div className="flex gap-2">
          <Link
            href={`/admin/sala-infantil/${s.id}`}
            className="p-2 text-[#083262] dark:text-[#6B9BD1] hover:bg-[#EDE6D6] dark:hover:bg-[var(--muted)] rounded-full transition-colors"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(s.id)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#A47C3B] border-r-transparent"></div>
          <p className="mt-4 text-[var(--foreground)]/80 font-medium">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  if (usuario && !isAdmin(usuario.tipoUsuario)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DoorOpen className="h-8 w-8 text-[var(--secondary)] dark:text-[#D7C7A3]" />
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              Salas Infantis
            </h1>
            <p className="text-[var(--foreground)]/80 mt-1">
              Gerencie as salas infantis
            </p>
          </div>
        </div>
        <Link href="/admin/sala-infantil/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Sala
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 rounded-xl">
          {error}
        </div>
      )}

      <Card>
        <div className="p-6">
          <DataGridPaginated
            data={salas}
            columns={columns}
            getRowId={(s) => s.id}
            emptyMessage="Nenhuma sala infantil cadastrada"
            exportFileName="salas-infantis"
          />
        </div>
      </Card>
    </div>
  );
}
