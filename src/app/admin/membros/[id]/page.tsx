"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface Rede {
  id: number;
  label: string;
}

interface MembroForm {
  id: number;
  nomeCompleto: string;
  email: string;
  telefone: string | null;
  dataNascimento: string | null;
  redeId: number;
  tipoUsuario: string | null;
  participaMvv: boolean;
  aceitaNotificacoes: boolean;
  aceitaEmail: boolean;
}

export default function EditarMembroPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [redes, setRedes] = useState<Rede[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<MembroForm | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [resMembro, resRedes] = await Promise.all([
          authFetch(`/api/membros/${id}`),
          fetch("/api/redes"),
        ]);
        if (!resMembro.ok) throw new Error("Membro não encontrado");
        const data = await resMembro.json();
        const redeList: Rede[] = await resRedes.json();
        const redeId =
          redeList.find((r) => r.label === data.rede)?.id ??
          redeList[0]?.id ??
          0;
        setForm({
          ...data,
          redeId,
          dataNascimento: data.dataNascimento
            ? String(data.dataNascimento).split("T")[0]
            : "",
        });
        setRedes(redeList);
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
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        nomeCompleto: form.nomeCompleto,
        email: form.email,
        telefone: form.telefone || null,
        dataNascimento: form.dataNascimento || null,
        redeId: form.redeId,
        tipoUsuario: form.tipoUsuario,
        participaMvv: form.participaMvv,
        aceitaNotificacoes: form.aceitaNotificacoes,
        aceitaEmail: form.aceitaEmail,
      };
      const res = await authFetch(`/api/membros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar");
      router.push("/admin/membros");
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#A47C3B] border-r-transparent"></div>
          <p className="mt-4 text-[var(--foreground)]/80">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
        <Link href="/admin/membros">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/membros"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#242D3F]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Editar Membro</h1>
          <p className="text-[var(--foreground)]/80 mt-1">Atualize as informações</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações do Membro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={form.nomeCompleto}
                  onChange={(e) =>
                    setForm({ ...form, nomeCompleto: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={form.telefone ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, telefone: e.target.value || null })
                  }
                  className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={form.dataNascimento ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dataNascimento: e.target.value || null,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rede *
                </label>
                <select
                  required
                  value={form.redeId || ""}
                  onChange={(e) =>
                    setForm({ ...form, redeId: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B] transition-colors"
                >
                  {redes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Usuário
                </label>
                <input
                  type="text"
                  value={form.tipoUsuario ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, tipoUsuario: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Preferências
              </label>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.participaMvv}
                    onChange={(e) =>
                      setForm({ ...form, participaMvv: e.target.checked })
                    }
                    className="w-4 h-4 text-[#083262] border-[#D7C7A3] rounded focus:ring-[#A47C3B]/30"
                  />
                  <span className="text-sm text-slate-700 font-medium">
                    Participa MVV
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.aceitaNotificacoes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        aceitaNotificacoes: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#083262] border-[#D7C7A3] rounded focus:ring-[#A47C3B]/30"
                  />
                  <span className="text-sm text-slate-700 font-medium">
                    Aceita Notificações
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.aceitaEmail}
                    onChange={(e) =>
                      setForm({ ...form, aceitaEmail: e.target.checked })
                    }
                    className="w-4 h-4 text-[#083262] border-[#D7C7A3] rounded focus:ring-[#A47C3B]/30"
                  />
                  <span className="text-sm text-slate-700 font-medium">
                    Aceita Email
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button type="submit" loading={saving}>
                Salvar Alterações
              </Button>
              <Link href="/admin/membros">
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
