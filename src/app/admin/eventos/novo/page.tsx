"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface EventoRequestBody {
  title: string;
  description: string;
  idImagem: number;
  url: string;
  imagemBase64?: string | null;
  imagemContentType?: string | null;
}
export default function NovoEventoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    idImagem: 0,
    url: "",
  });
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body: EventoRequestBody = {
        ...form,
      };
      if (imagemBase64 && imagemContentType) {
        body.imagemBase64 = imagemBase64;
        body.imagemContentType = imagemContentType;
      }
      const res = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar");
      router.push("/admin/eventos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/eventos"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#242D3F]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Novo Evento</h1>
          <p className="text-[var(--foreground)]/80 mt-1">Cadastre um novo evento</p>
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
                className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B] transition-colors"
                placeholder="Digite o título do evento"
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
                className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B] transition-colors resize-none"
                placeholder="Descreva o evento"
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
                className="w-full text-sm text-slate-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#A47C3B]/10 file:text-[#A47C3B] hover:file:bg-[#A47C3B]/20"
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
                className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B] transition-colors"
                placeholder="https://exemplo.com"
              />
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button type="submit" loading={loading}>
                Salvar Evento
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
