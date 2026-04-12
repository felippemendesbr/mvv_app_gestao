"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { isoToDatetimeLocal } from "@/lib/agendaDateUtils";
import { authFetch } from "@/lib/api";

interface AgendaEvento {
  id: number;
  titulo: string;
  local: string;
  data: string;
  descricao: string | null;
  tipoUsuario: string | null;
  perfil: string | null;
  rede: string | null;
}

export default function EditarAgendaEventoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AgendaEvento | null>(null);
  const [dataLocal, setDataLocal] = useState("");
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

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/agenda-eventos/${id}`);
        if (!res.ok) throw new Error("Registro não encontrado");
        const data: AgendaEvento = await res.json();
        setForm(data);
        setDataLocal(isoToDatetimeLocal(data.data));
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !dataLocal) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/agenda-eventos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          local: form.local,
          data: new Date(dataLocal).toISOString(),
          descricao: form.descricao || null,
          tipoUsuario: form.tipoUsuario || null,
          perfil: form.perfil || null,
          rede: form.rede || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar");
      router.push("/admin/agenda-eventos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#A47C3B] border-r-transparent" />
          <p className="mt-4 text-[var(--foreground)]/80">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error || "Não encontrado"}
        </div>
        <Link href="/admin/agenda-eventos">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>
    );
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
            Editar agenda
          </h1>
          <p className="text-[var(--foreground)]/80 mt-1">ID {form.id}</p>
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
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
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
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data e hora *
              </label>
              <input
                type="datetime-local"
                required
                value={dataLocal}
                onChange={(e) => setDataLocal(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descrição
              </label>
              <textarea
                value={form.descricao ?? ""}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value || null })
                }
                maxLength={1024}
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de usuário
              </label>
              <select
                value={form.tipoUsuario ?? ""}
                onChange={(e) =>
                  setForm({ ...form, tipoUsuario: e.target.value || null })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-[var(--background)]"
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
                value={form.perfil ?? ""}
                onChange={(e) =>
                  setForm({ ...form, perfil: e.target.value || null })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rede
              </label>
              <select
                value={form.rede ?? ""}
                onChange={(e) =>
                  setForm({ ...form, rede: e.target.value || null })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-[var(--background)]"
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
              <Button type="submit" loading={saving}>
                Salvar alterações
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
