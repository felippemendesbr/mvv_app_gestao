"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface PdfItem {
  titulo: string;
  url: string;
}

interface VideoItem {
  titulo: string;
  url: string;
}

export default function NovoEdificandoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [pdfs, setPdfs] = useState<PdfItem[]>([{ titulo: "", url: "" }]);
  const [videos, setVideos] = useState<VideoItem[]>([{ titulo: "", url: "" }]);

  async function handlePdfUpload(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Apenas arquivos PDF são permitidos.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/edificando/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload");
      const next = [...pdfs];
      next[idx] = {
        ...next[idx],
        titulo: next[idx].titulo || file.name.replace(/\.pdf$/i, ""),
        url: data.url,
      };
      setPdfs(next);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro no upload");
    }
    e.target.value = "";
  }

  function addPdf() {
    if (pdfs.length < 3) setPdfs([...pdfs, { titulo: "", url: "" }]);
  }

  function removePdf(idx: number) {
    if (pdfs.length > 1) setPdfs(pdfs.filter((_, i) => i !== idx));
  }

  function addVideo() {
    setVideos([...videos, { titulo: "", url: "" }]);
  }

  function removeVideo(idx: number) {
    if (videos.length > 1) setVideos(videos.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const pdfsFiltered = pdfs.filter((p) => p.titulo && p.url);
      const videosFiltered = videos.filter((v) => v.titulo && v.url);
      if (pdfsFiltered.length === 0) {
        throw new Error("Adicione pelo menos um PDF.");
      }
      const res = await fetch("/api/edificando", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          pdfs: pdfsFiltered,
          videos: videosFiltered,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar");
      router.push("/admin/edificando");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/edificando" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-[#242D3F]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Nova Edição</h1>
          <p className="text-[var(--foreground)]/80 mt-1">Cadastre título, PDFs (1 a 3) e vídeos</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Título *</label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#D7C7A3] rounded-lg focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B]"
                placeholder="Título da edição"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700">PDFs (1 a 3) *</label>
                {pdfs.length < 3 && (
                  <Button type="button" variant="secondary" size="sm" onClick={addPdf}>
                    <Plus className="h-4 w-4 mr-1" /> Adicionar
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {pdfs.map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-center flex-wrap">
                    <input
                      type="text"
                      value={p.titulo}
                      onChange={(e) => {
                        const next = [...pdfs];
                        next[idx] = { ...next[idx], titulo: e.target.value };
                        setPdfs(next);
                      }}
                      placeholder="Título do PDF"
                      className="w-48 px-4 py-2 border border-slate-300 rounded-lg"
                    />
                    <label className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer text-sm">
                      {p.url ? "✓ PDF enviado" : "Enviar PDF"}
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handlePdfUpload(idx, e)}
                        className="hidden"
                      />
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePdf(idx)}
                      disabled={pdfs.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700">Vídeos (YouTube)</label>
                <Button type="button" variant="secondary" size="sm" onClick={addVideo}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="space-y-3">
                {videos.map((v, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={v.titulo}
                      onChange={(e) => {
                        const next = [...videos];
                        next[idx] = { ...next[idx], titulo: e.target.value };
                        setVideos(next);
                      }}
                      placeholder="Título do vídeo"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                    />
                    <input
                      type="url"
                      value={v.url}
                      onChange={(e) => {
                        const next = [...videos];
                        next[idx] = { ...next[idx], url: e.target.value };
                        setVideos(next);
                      }}
                      placeholder="https://youtube.com/..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVideo(idx)}
                      disabled={videos.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button type="submit" loading={loading}>
                Salvar
              </Button>
              <Link href="/admin/edificando">
                <Button type="button" variant="secondary">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
