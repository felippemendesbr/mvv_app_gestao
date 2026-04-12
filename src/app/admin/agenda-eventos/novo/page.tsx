"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { authFetch } from "@/lib/api";

export default function NovoAgendaEventoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    local: "",
    dataLocal: "",
    descricao: "",
    tipoUsuario: "",
    perfil: "",
    rede: "",
  });
  const [opcoesRedes, setOpcoesRedes] = useState<{ id: number; label: string }[]>(
    []
  );
  const [opcoesTipos, setOpcoesTipos] = useState<{ id: number; label: string }[]>(
    []
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/redes").then((r) => (r.ok ? r.json() : [])),
      authFetch("/api/tipo-usuario").then((r) => (r.ok ? r.json() : [])),
    ]).then(([redesRes, tiposRes]) => {
      const redesList = Array.isArray(redesRes) ? redesRes : [];
      setOpcoesRedes(
        redesList.map((r: { id: number; label: string }) => ({
          id: r.id,
          label: r.label,
        }))
      );
      const tiposList = Array.isArray(tiposRes) ? tiposRes : [];
      setOpcoesTipos(
        tiposList.map((t: { id: number; label: string }) => ({
          id: t.id,
          label: t.label,
        }))
      );
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.dataLocal) {
      setError("Informe data e hora.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agenda-eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          local: form.local,
          data: new Date(form.dataLocal).toISOString(),
          descricao: form.descricao || null,
          tipoUsuario: form.tipoUsuario || null,
          perfil: form.perfil || null,
          rede: form.rede || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar");
      router.push("/admin/agenda-eventos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/agenda-eventos"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#242D3F]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Novo item da agenda
          </h1>
          <p className="text-[var(--foreground)]/80 mt-1">
            Cadastro em AgendaEventos
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                required
                maxLength={180}
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Local *
              </label>
              <input
                type="text"
                required
                maxLength={180}
                value={form.local}
                onChange={(e) => setForm({ ...form, local: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data e hora *
              </label>
              <input
                type="datetime-local"
                required
                value={form.dataLocal}
                onChange={(e) =>
                  setForm({ ...form, dataLocal: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descrição
              </label>
              <textarea
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                maxLength={1024}
                rows={4}
                className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de usuário
              </label>
              <select
                value={form.tipoUsuario}
                onChange={(e) =>
                  setForm({ ...form, tipoUsuario: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg bg-[var(--background)]"
              >
                <option value="">—</option>
                {opcoesTipos.map((t) => (
                  <option key={t.id} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Perfil
              </label>
              <input
                type="text"
                maxLength={100}
                value={form.perfil}
                onChange={(e) => setForm({ ...form, perfil: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg"
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rede
              </label>
              <select
                value={form.rede}
                onChange={(e) => setForm({ ...form, rede: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg bg-[var(--background)]"
              >
                <option value="">—</option>
                {opcoesRedes.map((r) => (
                  <option key={r.id} value={r.label}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button type="submit" loading={loading}>
                Salvar
              </Button>
              <Link href="/admin/agenda-eventos">
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
