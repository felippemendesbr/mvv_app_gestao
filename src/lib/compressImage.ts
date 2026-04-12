const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;
const WEBP_QUALITY = 0.82;

const ACCEPTED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
]);

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível carregar a imagem"));
    };
    img.src = url;
  });
}

/**
 * Redimensiona (se necessário) e comprime a imagem no navegador, depois retorna
 * o mesmo formato usado pelo restante do sistema: prefixo data URL + base64 puro.
 */
export async function compressImageFileToBase64Parts(file: File): Promise<{
  imagemBase64: string;
  imagemContentType: string;
}> {
  if (!file.type.startsWith("image/") || !ACCEPTED_MIME.has(file.type)) {
    throw new Error("Formato de imagem não suportado");
  }

  const img = await loadImageFromFile(file);
  const { width, height } = img;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas indisponível");
  }
  ctx.drawImage(img, 0, 0, w, h);

  let dataUrl = "";
  try {
    dataUrl = canvas.toDataURL("image/webp", WEBP_QUALITY);
  } catch {
    dataUrl = "";
  }
  if (!dataUrl || !dataUrl.startsWith("data:image/webp")) {
    dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  }

  const [prefix, data] = dataUrl.split(",", 2);
  if (!data || !prefix) {
    throw new Error("Falha ao comprimir a imagem");
  }

  return { imagemBase64: data, imagemContentType: prefix };
}

export function isCompressibleImageFile(file: File): boolean {
  return file.type.startsWith("image/") && ACCEPTED_MIME.has(file.type);
}
