"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Pencil, Trash2 } from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateLocal, parseDateLocal } from "@/lib/dateUtils";
import { DataGridPaginated, type Column } from "@/components/admin/DataGridPaginated";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Rede {
  id: number;
  label: string;
}

interface Membro {
  id: number;
  nomeCompleto: string;
  email: string;
  telefone: string | null;
  dataNascimento: string | null;
  tipoUsuario: string | null;
  participaMvv: boolean;
  aceitaNotificacoes: boolean;
  aceitaEmail: boolean;
  rede: string | null;
}

export default function MembrosPage() {
  const { canEdit } = useAuth();
  const [membros, setMembros] = useState<Membro[]>([]);
  const [redes, setRedes] = useState<Rede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroRede, setFiltroRede] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busca, setBusca] = useState("");

  const [filtroTipoDebounced, setFiltroTipoDebounced] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");

  useEffect(() => {
    fetchRedes();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setFiltroTipoDebounced(filtroTipo), 500);
    return () => clearTimeout(timer);
  }, [filtroTipo]);

  useEffect(() => {
    const timer = setTimeout(() => setBuscaDebounced(busca), 500);
    return () => clearTimeout(timer);
  }, [busca]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filtroRede) params.set("redeId", filtroRede);
        if (filtroTipoDebounced) params.set("tipoUsuario", filtroTipoDebounced);
        if (buscaDebounced) params.set("busca", buscaDebounced);
        const res = await authFetch(`/api/membros?${params}`);
        if (!res.ok) throw new Error("Erro ao carregar membros");
        const data = await res.json();
        setMembros(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filtroRede, filtroTipoDebounced, buscaDebounced]);

  async function fetchRedes() {
    try {
      const res = await fetch("/api/redes");
      if (res.ok) {
        const data = await res.json();
        setRedes(data);
      }
    } catch {
      // ignora
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir este membro?")) return;
    try {
      const res = await authFetch(`/api/membros/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      setMembros((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
    }
  }

  function formatDate(s: string | null) {
    return formatDateLocal(s);
  }

  const columns: Column<Membro>[] = [
    {
      key: "nomeCompleto",
      label: "Nome",
      sortable: true,
      exportValue: (m) => m.nomeCompleto,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (m) => (
        <span className="text-[var(--foreground)]/80 text-sm">{m.email}</span>
      ),
      exportValue: (m) => m.email,
    },
    {
      key: "rede",
      label: "Rede",
      sortable: true,
      render: (m) => (
        <Badge variant="default">{m.rede ?? "Sem rede"}</Badge>
      ),
      exportValue: (m) => m.rede ?? "Sem rede",
    },
    {
      key: "tipoUsuario",
      label: "Tipo",
      sortable: true,
      render: (m) => (
        <Badge variant="info">{m.tipoUsuario ?? "Não informado"}</Badge>
      ),
      exportValue: (m) => m.tipoUsuario ?? "Não informado",
    },
    {
      key: "dataNascimento",
      label: "Nascimento",
      sortable: true,
      sortValue: (m) => {
        if (!m.dataNascimento) return 0;
        const p = parseDateLocal(m.dataNascimento);
        return p ? p.year * 10000 + p.month * 100 + p.day : 0;
      },
      render: (m) => (
        <span className="text-[var(--foreground)]/80 text-sm">
          {formatDate(m.dataNascimento)}
        </span>
      ),
      exportValue: (m) => formatDate(m.dataNascimento),
    },
    ...(canEdit
      ? [
          {
            key: "acoes" as const,
            label: "Ações",
            sortable: false as const,
            className: "w-28",
            render: (m: Membro) => (
              <div className="flex gap-2">
                <Link
                  href={`/admin/membros/${m.id}`}
                  className="p-2 text-[#083262] dark:text-[#6B9BD1] hover:bg-[#EDE6D6] dark:hover:bg-[var(--muted)] rounded-full transition-colors"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(m.id)}
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

  if (loading && membros.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#A47C3B] border-r-transparent"></div>
          <p className="mt-4 text-[var(--foreground)]/80 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Membros</h1>
          <p className="text-[var(--foreground)]/80 mt-1">
            Gerencie os membros cadastrados
          </p>
        </div>
        {canEdit && (
          <Link href="/admin/membros/novo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Membro
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-[#083262] shrink-0" />
            <h3 className="font-bold text-[var(--foreground)]">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                <Search className="h-4 w-4 inline mr-1 text-[#083262]" />
                Busca
              </label>
              <input
                type="text"
                placeholder="Nome, email ou telefone"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full px-4 py-2 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                Rede
              </label>
              <select
                value={filtroRede}
                onChange={(e) => setFiltroRede(e.target.value)}
                className="w-full px-4 py-2 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B] transition-colors"
              >
                <option value="">Todas</option>
                {redes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                Tipo de Usuário
              </label>
              <input
                type="text"
                placeholder="Ex: Líder, Membro"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-2 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B] transition-colors"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="p-6">
          <DataGridPaginated
            data={membros}
            columns={columns}
            getRowId={(m) => m.id}
            emptyMessage="Nenhum membro encontrado"
            exportFileName="membros"
          />
        </div>
      </Card>
    </div>
  );
}
