"use client";

import { useEffect, useState } from "react";
import { Check, X, UserCheck } from "lucide-react";
import { authFetch } from "@/lib/api";
import { DataGridPaginated, type Column } from "@/components/admin/DataGridPaginated";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface UsuarioPendente {
  id: number;
  nomeCompleto: string;
  email: string;
  telefone: string | null;
  rede: string | null;
  tipoUsuario: string;
  flgAtivo: boolean;
}

export default function AprovarMembrosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/aprovar-membros");
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setUsuarios(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAprovar(u: UsuarioPendente) {
    if (!confirm(`Aprovar o cadastro de ${u.nomeCompleto}?`)) return;
    setActing(u.id);
    try {
      const res = await authFetch("/api/aprovar-membros/aprovar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: u.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao aprovar");
      setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao aprovar");
    } finally {
      setActing(null);
    }
  }

  async function handleReprovar(u: UsuarioPendente) {
    if (
      !confirm(
        `Reprovar e excluir o cadastro de ${u.nomeCompleto}? O registro será removido da tabela de usuários e membros.`
      )
    )
      return;
    setActing(u.id);
    try {
      const res = await authFetch("/api/aprovar-membros/reprovar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: u.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao reprovar");
      setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao reprovar");
    } finally {
      setActing(null);
    }
  }

  const columns: Column<UsuarioPendente>[] = [
    {
      key: "nomeCompleto",
      label: "Nome",
      sortable: true,
      exportValue: (u) => u.nomeCompleto,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (u) => (
        <span className="text-[var(--foreground)]/80 text-sm">{u.email}</span>
      ),
      exportValue: (u) => u.email,
    },
    {
      key: "telefone",
      label: "Telefone",
      sortable: true,
      render: (u) => (
        <span className="text-[var(--foreground)]/80 text-sm">{u.telefone ?? "-"}</span>
      ),
      exportValue: (u) => u.telefone ?? "",
    },
    {
      key: "rede",
      label: "Rede",
      sortable: true,
      render: (u) => (
        <Badge variant="default">{u.rede ?? "Sem rede"}</Badge>
      ),
      exportValue: (u) => u.rede ?? "",
    },
    {
      key: "tipoUsuario",
      label: "Tipo",
      sortable: true,
      render: (u) => (
        <Badge variant="info">{u.tipoUsuario}</Badge>
      ),
      exportValue: (u) => u.tipoUsuario,
    },
    {
      key: "acoes",
      label: "Ações",
      sortable: false,
      className: "w-28",
      render: (u) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleAprovar(u)}
            disabled={acting === u.id}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors disabled:opacity-50"
            title="Aprovar"
          >
            <Check className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleReprovar(u)}
            disabled={acting === u.id}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
            title="Reprovar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  if (loading && usuarios.length === 0) {
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
      <div>
        <div className="flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-[var(--secondary)] dark:text-[#D7C7A3]" />
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Aprovar Membros</h1>
        </div>
        <p className="text-[var(--foreground)]/80 mt-1">
          Usuários aguardando aprovação (flgAtivo = 0)
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      <Card>
        <div className="p-6">
          <DataGridPaginated
            data={usuarios}
            columns={columns}
            getRowId={(u) => u.id}
            emptyMessage="Nenhum usuário aguardando aprovação"
            exportFileName="aprovar-membros"
          />
        </div>
      </Card>
    </div>
  );
}
