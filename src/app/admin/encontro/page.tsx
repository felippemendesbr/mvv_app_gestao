"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Save, AlertCircle, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/api";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const IMAGEM_TIPOS = ["image/webp", "image/png", "image/jpeg", "image/jpg"];

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

interface EncontroImagem {
  id: number;
  contentType: string;
  conteudoBase64: string;
}

export default function EncontroPage() {
  const { usuario, canEdit } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingImg, setSavingImg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successImg, setSuccessImg] = useState(false);
  const [items, setItems] = useState<EncontroDescricao[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [texto, setTexto] = useState("");
  const [imagem, setImagem] = useState<EncontroImagem | null>(null);
  const [imagemBase64, setImagemBase64] = useState<string | null>(null);
  const [imagemContentType, setImagemContentType] = useState<string | null>(null);

  const isAdmin = usuario ? /administrador/i.test(usuario.tipoUsuario) : false;

  useEffect(() => {
    async function load() {
      try {
        const [resDesc, resImg] = await Promise.all([
          fetch("/api/encontro-descricoes"),
          fetch("/api/encontro/imagem"),
        ]);
        if (!resDesc.ok) {
          if (resDesc.status === 404) {
            setError("Nenhum registro encontrado no banco de dados");
          } else {
            throw new Error("Erro ao carregar dados");
          }
          return;
        }
        const data = await resDesc.json();
        const list = Array.isArray(data) ? data : [data];
        setItems(list);

        if (list.length > 0) {
          const first = list[0];
          setSelectedId(first.id);
          setTexto(first.texto ?? "");
        }

        if (resImg.ok) {
          const imgData = await resImg.json();
          if (imgData.imagem) setImagem(imgData.imagem);
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
    if (!selectedId || !canEdit) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const selectedItem = items.find((item) => item.id === selectedId);
      if (!selectedItem) throw new Error("Item não encontrado");

      const res = await authFetch(`/api/encontro-descricoes/${selectedId}`, {
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setImagemBase64(null);
      setImagemContentType(null);
      return;
    }
    if (!IMAGEM_TIPOS.includes(file.type)) {
      setError("Formato inválido. Use WEBP, PNG, JPEG ou JPG.");
      setImagemBase64(null);
      setImagemContentType(null);
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const [prefix, data] = result.split(",", 2);
        if (data) {
          setImagemBase64(data);
          setImagemContentType(prefix);
        }
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleEnviarImagem(e: React.FormEvent) {
    e.preventDefault();
    if (!imagemBase64 || !imagemContentType || !isAdmin) return;
    setSavingImg(true);
    setError(null);
    setSuccessImg(false);
    try {
      const res = await authFetch("/api/encontro/imagem", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagemBase64,
          imagemContentType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar imagem");
      setImagem({
        id: data.idImagem,
        contentType: imagemContentType,
        conteudoBase64: imagemBase64,
      });
      setImagemBase64(null);
      setImagemContentType(null);
      setSuccessImg(true);
      setTimeout(() => setSuccessImg(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setSavingImg(false);
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
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Encontro com Deus</h1>
        <p className="text-[var(--foreground)]/80 mt-1">
          {canEdit
            ? "Edite a descrição e a imagem exibidas no aplicativo"
            : "Visualize a descrição e a imagem exibidas no aplicativo"}
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

      {successImg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
          <p className="font-medium">✓ Imagem atualizada com sucesso!</p>
        </div>
      )}

      {/* Imagem do aplicativo - visualização para todos; upload só admin */}
      <Card>
        <CardHeader>
          <CardTitle>Imagem no aplicativo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(imagem?.conteudoBase64 || imagemBase64) && (
            <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 max-w-md">
              <img
                src={
                  imagemBase64 && imagemContentType
                    ? `${imagemContentType},${imagemBase64}`
                    : imagem
                    ? `${imagem.contentType},${imagem.conteudoBase64}`
                    : ""
                }
                alt="Encontro com Deus"
                className="w-full h-auto object-contain max-h-64"
              />
            </div>
          )}
          {!imagem?.conteudoBase64 && !imagemBase64 && (
            <p className="text-sm text-slate-500">Nenhuma imagem enviada.</p>
          )}
          {isAdmin && (
            <form onSubmit={handleEnviarImagem} className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">
                  Nova imagem (webp, png, jpeg, jpg)
                </span>
                <input
                  type="file"
                  accept=".webp,.png,.jpeg,.jpg,image/webp,image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-slate-300 file:bg-slate-50"
                />
              </label>
              <Button
                type="submit"
                loading={savingImg}
                disabled={!imagemBase64 || !imagemContentType}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Enviar imagem
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Editor - apenas administrador */}
      {selectedId && canEdit && (
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

      {/* Preview - todos */}
      {selectedId && (
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização do texto</CardTitle>
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
