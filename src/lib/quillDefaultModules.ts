import { quillCompressedImageHandler } from "@/lib/quillCompressedImage";

export const DEFAULT_QUILL_TOOLBAR = [
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
];

export const DEFAULT_QUILL_FORMATS = [
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

export function getQuillModulesWithCompressedImages() {
  return {
    toolbar: {
      container: DEFAULT_QUILL_TOOLBAR,
      handlers: {
        image: quillCompressedImageHandler(),
      },
    },
  };
}
