"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface Evento {
  id: string;
  title: string;
  description: string;
  idImagem: number;
  url: string;
}

interface EditEventoRequestBody extends Evento {
  imagemBase64?: string | null;
  imagemContentType?: string | null;
}

export default function EditarEventoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Evento | null>(null);
  const [imagemBase64, setImagemBase64] = useState<string | null>(null);
  const [imagemContentType, setImagemContentType] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setImagemBase64(null);
      setImagemContentType(null);
      return;
    }
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/avif",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Formato de imagem inválido. Use PNG, JPG, JPEG, WEBP ou AVIF.");
      setImagemBase64(null);
      setImagemContentType(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const [prefix, data] = result.split(",", 2);
        if (!data) {
          setError("Erro ao ler a imagem.");
          return;
        }
        setImagemBase64(data);
        setImagemContentType(prefix);
      }
    };
    reader.onerror = () => {
      setError("Erro ao ler a imagem.");
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/eventos/${id}`);
        if (!res.ok) throw new Error("Evento não encontrado");
        const data = await res.json();
        setForm(data);
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
      const body: EditEventoRequestBody = {
        ...form,
      };
      if (imagemBase64 && imagemContentType) {
        body.imagemBase64 = imagemBase64;
        body.imagemContentType = imagemContentType;
      }
      const res = await fetch(`/api/eventos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar");
      router.push("/admin/eventos");
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

  if (error || !form) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error || "Evento não encontrado"}
        </div>
        <Link href="/admin/eventos">
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/eventos"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#242D3F]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Editar Evento</h1>
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
          <CardTitle>Informações do Evento</CardTitle>
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
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descrição
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Imagem (PNG, JPG, JPEG, WEBP ou AVIF)
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button type="submit" loading={saving}>
                Salvar Alterações
              </Button>
              <Link href="/admin/eventos">
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
