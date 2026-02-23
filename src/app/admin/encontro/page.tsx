"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image", "video"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["clean"],
  ],
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "background",
  "align",
];

interface EncontroDescricao {
  id: number;
  ordem: number;
  texto: string;
  encontroId: number;
}

export default function EncontroPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [items, setItems] = useState<EncontroDescricao[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/encontro-descricoes");
        if (!res.ok) {
          if (res.status === 404) {
            setError("Nenhum registro encontrado no banco de dados");
          } else {
            throw new Error("Erro ao carregar dados");
          }
          return;
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : [data];
        setItems(list);
        
        if (list.length > 0) {
          const first = list[0];
          setSelectedId(first.id);
          setTexto(first.texto ?? "");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const selectedItem = items.find((item) => item.id === selectedId);
      if (!selectedItem) throw new Error("Item não encontrado");

      const res = await fetch(`/api/encontro-descricoes/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ordem: selectedItem.ordem,
          texto,
          encontroId: selectedItem.encontroId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");

      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedId ? { ...item, texto } : item
        )
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
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

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Encontro</h1>
        <p className="text-[var(--foreground)]/80 mt-1">
          Edite a descrição do encontro exibida no aplicativo
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Erro</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
          <p className="font-medium">✓ Descrição atualizada com sucesso!</p>
        </div>
      )}

      {/* Editor */}
      {selectedId && (
        <Card>
          <CardHeader>
            <CardTitle>Editor de Conteúdo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Texto HTML
                </label>
                <div className="bg-white border border-slate-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={texto}
                    onChange={setTexto}
                    modules={modules}
                    formats={formats}
                    className="h-96"
                    placeholder="Digite o conteúdo da descrição..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button type="submit" loading={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {selectedId && (
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: texto }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
