export function openImagePreview(src, title = "Imagen ampliada") {
  if (!src || typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("huellita:image-preview", { detail: { src, title } }));
}
