"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { authFetch } from "@/lib/api";
import { useAuth, isAdmin } from "@/contexts/AuthContext";

interface TipoSalaInfantil {
  id: number;
  nome: string;
}

interface Church {
  id: number;
  nome: string;
}

export default function NovaSalaInfantilPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [tipoSalaId, setTipoSalaId] = useState<string>("");
  const [idChurch, setIdChurch] = useState<string>("");
  const [enabled, setEnabled] = useState(true);
  const [idadeMinima, setIdadeMinima] = useState<string>("0");
  const [idadeMaxima, setIdadeMaxima] = useState<string>("14");
  const [tipos, setTipos] = useState<TipoSalaInfantil[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);

  useEffect(() => {
    if (usuario && !isAdmin(usuario.tipoUsuario)) {
      router.replace("/admin");
      return;
    }
    Promise.all([
      authFetch("/api/tipo-sala-infantil").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/churches").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([tiposData, churchesData]) => {
        setTipos(tiposData);
        setChurches(churchesData);
      })
      .catch(() => {});
  }, [usuario, router]);

  function handleIdadeMinimaChange(value: string) {
    if (value === "" || /^\d+$/.test(value)) setIdadeMinima(value);
  }
  function handleIdadeMaximaChange(value: string) {
    if (value === "" || /^\d+$/.test(value)) setIdadeMaxima(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const idadeMin = parseInt(idadeMinima, 10);
    const idadeMax = parseInt(idadeMaxima, 10);
    if (isNaN(idadeMin) || idadeMin < 0) {
      setError("Idade mínima deve ser um número válido (0 ou maior)");
      return;
    }
    if (isNaN(idadeMax) || idadeMax < 0) {
      setError("Idade máxima deve ser um número válido (0 ou maior)");
      return;
    }
    if (idadeMax > 14) {
      setError("Idade máxima não pode ser maior que 14 anos");
      return;
    }
    if (idadeMin >= idadeMax) {
      setError("Idade mínima deve ser menor que idade máxima");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/sala-infantil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          tipoSalaId: parseInt(tipoSalaId, 10),
          idChurch: parseInt(idChurch, 10),
          enabled,
          idadeMinima: parseInt(idadeMinima, 10),
          idadeMaxima: parseInt(idadeMaxima, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar");
      router.push("/admin/sala-infantil");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setLoading(false);
    }
  }

  if (usuario && !isAdmin(usuario.tipoUsuario)) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-3xl w-full">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/sala-infantil"
          className="p-2 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Nova Sala Infantil
          </h1>
          <p className="text-[var(--foreground)]/80 mt-1">
            Cadastre uma nova sala infantil
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
          <CardTitle>Informações da Sala</CardTitle>
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
                placeholder="Ex: Berçário, Maternal"
              />
              <p className="text-xs text-[var(--foreground)]/60 mt-1">
                {nome.length}/100 caracteres
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Tipo de Sala *
              </label>
              <select
                required
                value={tipoSalaId}
                onChange={(e) => setTipoSalaId(e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-colors"
              >
                <option value="">Selecione o tipo</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Igreja *
              </label>
              <select
                required
                value={idChurch}
                onChange={(e) => setIdChurch(e.target.value)}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-colors"
              >
                <option value="">Selecione a igreja</option>
                {churches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Idade mínima (anos) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={idadeMinima}
                  onChange={(e) => handleIdadeMinimaChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-colors"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Idade máxima (anos) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={idadeMaxima}
                  onChange={(e) => handleIdadeMaximaChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-colors"
                  placeholder="14"
                />
                <p className="text-xs text-[var(--foreground)]/60 mt-1">
                  Máximo 14 anos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enabled"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <label htmlFor="enabled" className="text-sm font-medium text-[var(--foreground)]">
                Habilitada
              </label>
            </div>
            <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
              <Button type="submit" loading={loading}>
                Salvar
              </Button>
              <Link href="/admin/sala-infantil">
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
