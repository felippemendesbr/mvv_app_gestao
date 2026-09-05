"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Filter } from "lucide-react";
import { authFetch } from "@/lib/api";
import { DataGridPaginated, type Column } from "@/components/admin/DataGridPaginated";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface AreaAtuacao {
  id: number;
  label: string;
}

interface MembroRelatorio {
  id: number;
  nomeCompleto: string;
  email: string;
  telefone: string | null;
  rede: string | null;
  tipoUsuario: string | null;
  areasAtuacao: string;
}

export default function RelatorioAreaAtuacaoPage() {
  const [areas, setAreas] = useState<AreaAtuacao[]>([]);
  const [membros, setMembros] = useState<MembroRelatorio[]>([]);
  const [filtroArea, setFiltroArea] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filtroArea) params.set("area", filtroArea);
        const res = await authFetch(`/api/relatorios/area-atuacao?${params}`);
        if (!res.ok) throw new Error("Erro ao carregar relatório");
        const data = await res.json();
        setAreas(data.areas ?? []);
        setMembros(data.membros ?? []);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filtroArea]);

  const columns: Column<MembroRelatorio>[] = [
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
      key: "telefone",
      label: "Telefone",
      sortable: true,
      exportValue: (m) => m.telefone ?? "",
    },
    {
      key: "rede",
      label: "Rede",
      sortable: true,
      render: (m) => <Badge variant="default">{m.rede ?? "Sem rede"}</Badge>,
      exportValue: (m) => m.rede ?? "Sem rede",
    },
    {
      key: "tipoUsuario",
      label: "Perfil",
      sortable: true,
      render: (m) => (
        <Badge variant="info">{m.tipoUsuario ?? "Não informado"}</Badge>
      ),
      exportValue: (m) => m.tipoUsuario ?? "Não informado",
    },
    {
      key: "areasAtuacao",
      label: "Área de Atuação",
      sortable: true,
      exportValue: (m) => m.areasAtuacao,
    },
  ];

  if (loading && membros.length === 0 && areas.length === 0) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-[var(--secondary)] dark:text-[#D7C7A3]" />
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Relatório por Área de Atuação
          </h1>
          <p className="text-[var(--foreground)]/80 mt-1">
            Selecione uma área para listar os membros vinculados
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-[#083262] shrink-0" />
            <h3 className="font-bold text-[var(--foreground)]">Filtro</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                Área de Atuação
              </label>
              <select
                value={filtroArea}
                onChange={(e) => setFiltroArea(e.target.value)}
                className="w-full px-4 py-2 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B] transition-colors"
              >
                <option value="">Todas</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.label}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="p-6">
          <p className="text-sm text-[var(--foreground)]/80 mb-4">
            {membros.length}{" "}
            {membros.length === 1 ? "membro encontrado" : "membros encontrados"}
            {filtroArea ? ` em ${filtroArea}` : ""}
          </p>
          <DataGridPaginated
            data={membros}
            columns={columns}
            getRowId={(m) => m.id}
            emptyMessage="Nenhum membro encontrado para a área selecionada"
            exportFileName={
              filtroArea
                ? `membros-area-${filtroArea.toLowerCase()}`
                : "membros-area-atuacao"
            }
          />
        </div>
      </Card>
    </div>
  );
}
