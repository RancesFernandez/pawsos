import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import "./ImagePreview.css";

export default function ImagePreview() {
  const [image, setImage] = useState(null);
  useEffect(() => {
    const open = (event) => setImage(event.detail || null);
    window.addEventListener("huellita:image-preview", open);
    return () => window.removeEventListener("huellita:image-preview", open);
  }, []);
  useEffect(() => {
    if (!image) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => { if (event.key === "Escape") setImage(null); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); };
  }, [image]);
  if (!image) return null;
  return <div className="huellita-image-viewer" role="dialog" aria-modal="true" aria-label={image.title || "Imagen ampliada"} onClick={() => setImage(null)}>
    <button className="huellita-image-close" onClick={() => setImage(null)} aria-label="Cerrar imagen"><X size={25} /></button>
    <div className="huellita-image-stage" onClick={(e) => e.stopPropagation()}>
      <img src={image.src} alt={image.title || "Imagen ampliada"} />
      {image.title && <span>{image.title}</span>}
    </div>
  </div>;
}
