"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, UserCog } from "lucide-react";
import { useAuth, isAdmin } from "@/contexts/AuthContext";
import { DataGridPaginated, type Column } from "@/components/admin/DataGridPaginated";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { authFetch } from "@/lib/api";

interface TipoUsuario {
  id: number;
  label: string;
}

export default function TipoUsuarioPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [tipos, setTipos] = useState<TipoUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuario && !isAdmin(usuario.tipoUsuario)) {
      router.replace("/admin");
      return;
    }
    fetchTipos();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch apenas ao montar/validar admin
  }, [usuario, router]);

  async function fetchTipos() {
    try {
      const res = await authFetch("/api/tipo-usuario");
      if (res.status === 403) {
        router.replace("/admin");
        return;
      }
      if (!res.ok) throw new Error("Erro ao carregar tipos de usuário");
      const data = await res.json();
      setTipos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "Deseja realmente excluir este tipo de usuário? Membros e usuários vinculados podem ser afetados."
      )
    )
      return;
    try {
      const res = await authFetch(`/api/tipo-usuario/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao excluir");
      }
      setTipos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  const columns: Column<TipoUsuario>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      className: "w-20",
      render: (t) => (
        <span className="text-[var(--foreground)]/70 font-mono text-xs">
          {t.id}
        </span>
      ),
      exportValue: (t) => t.id,
    },
    {
      key: "label",
      label: "Nome",
      sortable: true,
      exportValue: (t) => t.label,
    },
    {
      key: "acoes",
      label: "Ações",
      sortable: false,
      className: "w-28",
      render: (t) => (
        <div className="flex gap-2">
          <Link
            href={`/admin/tipo-usuario/${t.id}`}
            className="p-2 text-[#083262] dark:text-[#6B9BD1] hover:bg-[#EDE6D6] dark:hover:bg-[var(--muted)] rounded-full transition-colors"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(t.id)}
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
          <UserCog className="h-8 w-8 text-[var(--secondary)] dark:text-[#D7C7A3]" />
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              Tipos de Usuário
            </h1>
            <p className="text-[var(--foreground)]/80 mt-1">
              Gerencie os tipos de usuário do sistema
            </p>
          </div>
        </div>
        <Link href="/admin/tipo-usuario/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Tipo
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
            data={tipos}
            columns={columns}
            getRowId={(t) => t.id}
            emptyMessage="Nenhum tipo de usuário cadastrado"
            exportFileName="tipos-usuario"
          />
        </div>
      </Card>
    </div>
  );
}
