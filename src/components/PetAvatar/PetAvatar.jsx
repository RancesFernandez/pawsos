import { Camera, PawPrint } from 'lucide-react';
import './PetAvatar.css';
import { compressImage } from '../../utils/compressImage';

export default function PetAvatar({ pet, size = 'large', editable = false, onPhotoChange }) {
  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try { onPhotoChange?.(await compressImage(file, 180 * 1024)); }
    catch (error) { window.alert(error.message || 'No se pudo optimizar la foto.'); }
    event.target.value = '';
  };
  return (
    <div className={`pet-avatar pet-avatar-${size}`}>
      {pet.photo ? <img src={pet.photo} alt={`Foto de ${pet.name}`} /> : <div className="avatar-placeholder"><PawPrint size={size === 'large' ? 36 : 24} /></div>}
      {editable && <label className="avatar-edit" title="Cambiar foto"><Camera size={15} /><input type="file" accept="image/*" onChange={handleChange} /></label>}
    </div>
  );
}