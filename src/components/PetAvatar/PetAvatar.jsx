import { Camera, PawPrint } from "lucide-react";
import "./PetAvatar.css";
import { compressImage } from "../../utils/compressImage";
import { openImagePreview } from "../../utils/imagePreview";

export default function PetAvatar({
  pet,
  size = "large",
  editable = false,
  onPhotoChange,
  onPreview,
}) {
  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      onPhotoChange?.(await compressImage(file, 180 * 1024));
    } catch (error) {
      window.alert(error.message || "No se pudo optimizar la foto.");
    }
    event.target.value = "";
  };
  return (
    <div className={`pet-avatar pet-avatar-${size}`}>
      {pet.photo ? (
        <img src={pet.photo} alt={`Foto de ${pet.name}`} onClick={() => openImagePreview(pet.photo, `Foto de ${pet.name || "tu mascota"}`)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openImagePreview(pet.photo, `Foto de ${pet.name || "tu mascota"}`))} title="Ver foto ampliada" />
      ) : (
        <div className="avatar-placeholder">
          <PawPrint size={size === "large" ? 36 : 24} />
        </div>
      )}
      {editable && (
        <label
          className="avatar-edit"
          title="Cambiar foto"
          aria-label="Subir o cambiar foto de la mascota"
        >
          <Camera size={15} />
          <input type="file" accept="image/*" onChange={handleChange} />
        </label>
      )}
    </div>
  );
}
