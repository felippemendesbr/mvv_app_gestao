import { compressImageFileToBase64Parts } from "@/lib/compressImage";

type QuillLike = {
  getSelection: (focus?: boolean) => { index: number } | null;
  insertEmbed: (index: number, type: string, value: string) => void;
  setSelection: (index: number) => void;
};

/**
 * Handler para o botão de imagem do Quill: comprime antes de inserir base64 no HTML.
 */
export function quillCompressedImageHandler() {
  return function (this: { quill: QuillLike }) {
    const quill = this.quill;
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute(
      "accept",
      "image/png,image/jpeg,image/jpg,image/webp,image/avif"
    );
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const { imagemBase64, imagemContentType } =
          await compressImageFileToBase64Parts(file);
        const range = quill.getSelection(true);
        const index = range?.index ?? 0;
        quill.insertEmbed(
          index,
          "image",
          `${imagemContentType},${imagemBase64}`
        );
        quill.setSelection(index + 1);
      } catch {
        // Falha silenciosa; telas podem exibir erro global se necessário
      }
    };
  };
}
