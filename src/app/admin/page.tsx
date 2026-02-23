"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users, Network, Video, ArrowRight, UserCheck, Cake, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { authFetch } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth, isAdmin } from "@/contexts/AuthContext";

interface Aniversariante {
  dia: number;
  nomeCompleto: string;
  rede: string | null;
  telefone: string | null;
}

interface DashboardData {
  membrosPorRede: { redeId: number; label: string; quantidade: number }[];
  distribuicaoTipoUsuario: { tipo: string; quantidade: number }[];
  comparativoFaixaEtaria: { faixa: string; quantidade: number }[];
  totalMembros: number;
  totalLideres?: number;
  totalVideos: number;
  showMembrosPorRede?: boolean;
  showTotalRedes?: boolean;
  showTiposUsuario?: boolean;
  showVideos?: boolean;
  aniversariantes?: Aniversariante[];
  pendentesAprovacao?: number;
}

const CORES_PIZZA_LIGHT = [
  "#083262",
  "#A47C3B",
  "#242D3F",
  "#10b981",
  "#D7C7A3",
  "#8B6929",
];

const CORES_PIZZA_DARK = [
  "#6B9BD1",
  "#C9A959",
  "#8B9BB5",
  "#34d399",
  "#A89870",
  "#C9A959",
];

function formatWhatsAppUrl(telefone: string | null): string | null {
  if (!telefone || !telefone.trim()) return null;
  const digits = telefone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const num = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${num}`;
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const { usuario } = useAuth();
  const isDark = theme === "dark";
  const [data, setData] = useState<DashboardData | null>(null);
  const [anivPage, setAnivPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartTextColor = isDark ? "#EDE6D6" : "#242D3F";
  const chartGridColor = isDark ? "#3D3A45" : "#D7C7A3";
  const chartTooltipBg = isDark ? "#242329" : "#fff";
  const chartTooltipBorder = isDark ? "#3D3A45" : "#D7C7A3";

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await authFetch("/api/dashboard");
        if (!res.ok) throw new Error("Erro ao carregar dados");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#A47C3B] border-r-transparent"></div>
          <p className="mt-4 text-[var(--foreground)]/80 font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        <p className="font-medium">Erro ao carregar dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const membrosPorRedeOrdenada = [...data.membrosPorRede].sort(
    (a, b) => b.quantidade - a.quantidade
  );

  const top5Redes = membrosPorRedeOrdenada.slice(0, 5);

  const aniversariantes = data.aniversariantes ?? [];
  const anivPageSize = 5;
  const anivTotalPages = Math.ceil(aniversariantes.length / anivPageSize);
  const anivPaginated = aniversariantes.slice(
    (anivPage - 1) * anivPageSize,
    anivPage * anivPageSize
  );
  const showAniversariantes = aniversariantes.length > 0;
  const isAdminUser = usuario ? isAdmin(usuario.tipoUsuario) : false;
  const pendentesAprovacao = data.pendentesAprovacao ?? 0;
  const diaHoje = new Date().getDate();

  return (
    <div className="space-y-8">
      {/* Alerta: cadastros pendentes de aprovação */}
      {pendentesAprovacao > 0 && (
        <Link href="/admin/aprovar-membros">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">
                {pendentesAprovacao} {pendentesAprovacao === 1 ? "membro aguardando" : "membros aguardando"} aprovação de cadastro
              </p>
              <p className="text-sm mt-0.5 opacity-90">
                Clique para aprovar ou reprovar
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0" />
          </div>
        </Link>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-[var(--foreground)]/80 mt-1 font-medium">
          Visão geral do sistema de gestão
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Membros"
          value={data.totalMembros}
          icon={Users}
          iconColor="text-[#083262]"
        />
        {data.showTotalRedes !== false && (
          <StatCard
            title="Total de Redes"
            value={data.membrosPorRede.length}
            icon={Network}
            iconColor="text-[#A47C3B]"
          />
        )}
        <StatCard
          title="Líderes"
          value={data.totalLideres ?? 0}
          icon={UserCheck}
          iconColor="text-[#083262]"
        />
        {data.showVideos !== false && (
          <StatCard
            title="Vídeos"
            value={data.totalVideos}
            icon={Video}
            iconColor="text-[#8B6929]"
          />
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membros por Rede - Tabela (apenas Admin) */}
        {data.showMembrosPorRede !== false && (
        <Card>
          <CardHeader>
            <CardTitle>Membros por Rede (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            {membrosPorRedeOrdenada.length === 0 ? (
              <p className="text-[var(--foreground)]/70 text-sm py-8 text-center font-medium">
                Nenhuma rede cadastrada
              </p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {top5Redes.map((r, idx) => {
                    const maxQtd = membrosPorRedeOrdenada[0].quantidade;
                    const percentage = (r.quantidade / maxQtd) * 100;
                    return (
                      <div key={r.redeId} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--foreground)]">
                              {idx + 1}.
                            </span>
                            <span className="text-[var(--foreground)]">{r.label}</span>
                          </div>
                          <span className="font-bold text-[var(--foreground)]">
                            {r.quantidade}
                          </span>
                        </div>
                        <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#A47C3B] rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {membrosPorRedeOrdenada.length > 5 && (
                  <div className="pt-3 border-t border-[var(--border)]">
                    <Link href="/admin/membros">
                      <Button variant="outline" colorScheme="gold" size="sm" className="w-full" showArrow>
                        Ver mais
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Distribuição por Tipo - Gráfico de Barras Vertical (apenas Admin) */}
        {data.showTiposUsuario !== false && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Usuário</CardTitle>
          </CardHeader>
          <CardContent className="h-[28rem]">
            {data.distribuicaoTipoUsuario.length === 0 ? (
              <p className="text-[var(--foreground)]/70 text-sm py-8 text-center font-medium">
                Nenhum membro cadastrado
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.distribuicaoTipoUsuario}
                  margin={{ top: 40, right: 30, left: 20, bottom: 140 }}
                  barCategoryGap="15%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis
                    dataKey="tipo"
                    angle={0}
                    textAnchor="middle"
                    interval={0}
                    height={80}
                    tick={{ fill: chartTextColor, fontSize: 10 }}
                    tickFormatter={(v) => {
                      const s = String(v);
                      if (/l[ií]der em treinamento/i.test(s)) return "LT";
                      if (s === "Colaborador") return "Colab.";
                      if (s === "Visitante") return "Visit.";
                      return s;
                    }}
                  />
                  <YAxis
                    tick={{ fill: chartTextColor, fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTooltipBg,
                      border: `1px solid ${chartTooltipBorder}`,
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ color: chartTextColor, fontWeight: 600 }}
                    cursor={{ fill: isDark ? "#2D2A24" : "#EDE6D6" }}
                  />
                  <Bar
                    dataKey="quantidade"
                    fill={isDark ? "#C9A959" : "#A47C3B"}
                    radius={[8, 8, 0, 0]}
                    label={{
                      position: "top",
                      fill: chartTextColor,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        )}
      </div>

      {/* Faixa Etária + Aniversariantes - lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faixa Etária - Gráfico de Pizza */}
        <Card>
          <CardHeader>
            <CardTitle>Comparativo por Faixa Etária</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            {data.comparativoFaixaEtaria.every((f) => f.quantidade === 0) ? (
              <p className="text-[var(--foreground)]/70 text-sm py-8 text-center font-medium">
                Sem dados de faixa etária
              </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.comparativoFaixaEtaria}
                  dataKey="quantidade"
                  nameKey="faixa"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ x, y, name, value }: { x?: number; y?: number; name?: string; value?: number }) =>
                    (value ?? 0) > 0 && x != null && y != null
                      ? (
                        <text
                          x={x}
                          y={y}
                          fill={isDark ? "#FFFFFF" : "#242D3F"}
                          stroke={isDark ? "#1A1920" : "#FFFFFF"}
                          strokeWidth={isDark ? 4 : 3}
                          strokeLinejoin="round"
                          paintOrder="stroke fill"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={13}
                          fontWeight={700}
                        >
                          {`${name ?? ""}: ${value}`}
                        </text>
                      )
                      : null
                  }
                  labelLine={{ stroke: chartTextColor }}
                >
                  {data.comparativoFaixaEtaria.map((_, i) => (
                    <Cell
                      key={i}
                      fill={(isDark ? CORES_PIZZA_DARK : CORES_PIZZA_LIGHT)[i % 6]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartTooltipBg,
                    border: `1px solid ${chartTooltipBorder}`,
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => [value ?? 0, "Membros"]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: chartTextColor }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
        </Card>

        {/* Aniversariantes do mês */}
        {showAniversariantes ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cake className="h-5 w-5 text-[var(--primary)]" />
                <CardTitle>Aniversariantes do mês</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="py-3 px-4 text-sm font-semibold text-[var(--foreground)]">
                        Dia
                      </th>
                      <th className="py-3 px-4 text-sm font-semibold text-[var(--foreground)]">
                        Nome
                      </th>
                      {isAdminUser && (
                        <th className="py-3 px-4 text-sm font-semibold text-[var(--foreground)]">
                          Rede
                        </th>
                      )}
                      <th className="py-3 px-4 text-sm font-semibold text-[var(--foreground)]">
                        Telefone
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {anivPaginated.map((a, i) => {
                      const waUrl = formatWhatsAppUrl(a.telefone);
                      const isHoje = a.dia === diaHoje;
                      return (
                        <tr
                          key={`${a.nomeCompleto}-${a.dia}-${i}`}
                          className={`border-b border-[var(--border)] hover:bg-[var(--muted)]/50 ${
                            isHoje
                              ? "bg-amber-50/80 dark:bg-amber-900/25 border-l-4 border-l-[#A47C3B] dark:border-l-[#C9A959]"
                              : ""
                          }`}
                        >
                          <td className="py-3 px-4 text-sm font-medium text-[var(--foreground)]">
                            {a.dia}
                          </td>
                          <td className="py-3 px-4 text-sm text-[var(--foreground)]">
                            {a.nomeCompleto}
                          </td>
                          {isAdminUser && (
                            <td className="py-3 px-4 text-sm text-[var(--foreground)]/80">
                              {a.rede ?? "—"}
                            </td>
                          )}
                          <td className="py-3 px-4">
                            {waUrl && a.telefone ? (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[var(--secondary)] hover:text-[var(--primary)] hover:underline"
                              >
                                {a.telefone}
                              </a>
                            ) : (
                              <span className="text-sm text-[var(--foreground)]/60">
                                {a.telefone ?? "—"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {aniversariantes.length > anivPageSize && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
                  <span className="text-sm text-[var(--foreground)]/80">
                    Página {anivPage} de {anivTotalPages} • {aniversariantes.length} aniversariantes
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      colorScheme="navy"
                      size="sm"
                      onClick={() => setAnivPage((p) => Math.max(1, p - 1))}
                      disabled={anivPage <= 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="ghost"
                      colorScheme="navy"
                      size="sm"
                      onClick={() => setAnivPage((p) => Math.min(anivTotalPages, p + 1))}
                      disabled={anivPage >= anivTotalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cake className="h-5 w-5 text-[var(--primary)]" />
                <CardTitle>Aniversariantes do mês</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--foreground)]/70 text-sm py-12 text-center">
                Nenhum aniversariante a partir de hoje neste mês
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
