"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { authFetch } from "@/lib/api";
import { useAuth, isAdmin } from "@/contexts/AuthContext";

export default function EditarTipoSalaInfantilPage() {
  const router = useRouter();
  const params = useParams();
  const { usuario } = useAuth();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nome, setNome] = useState("");

  useEffect(() => {
    if (usuario && !isAdmin(usuario.tipoUsuario)) {
      router.replace("/admin");
      return;
    }
    async function load() {
      try {
        const res = await authFetch(`/api/tipo-sala-infantil/${id}`);
        if (res.status === 403) {
          router.replace("/admin");
          return;
        }
        if (!res.ok) throw new Error("Tipo de sala infantil não encontrado");
        const data = await res.json();
        setNome(data.nome);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, usuario, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await authFetch(`/api/tipo-sala-infantil/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar");
      router.push("/admin/tipo-sala-infantil");
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

  if (error && !nome) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 rounded-xl">
          {error}
        </div>
        <Link href="/admin/tipo-sala-infantil">
          <Button variant="outline" colorScheme="gold">
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
          href="/admin/tipo-sala-infantil"
          className="p-2 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Editar Tipo de Sala Infantil
          </h1>
          <p className="text-[var(--foreground)]/80 mt-1">
            Atualize as informações
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 rounded-xl">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações do Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Nome *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--foreground)] placeholder:text-[var(--foreground)]/50 focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-colors"
                placeholder="Ex: Berçário, Maternal, Jardim"
              />
              <p className="text-xs text-[var(--foreground)]/60 mt-1">
                {nome.length}/100 caracteres
              </p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
              <Button type="submit" loading={saving}>
                Salvar Alterações
              </Button>
              <Link href="/admin/tipo-sala-infantil">
                <Button type="button" variant="outline" colorScheme="gold">
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
