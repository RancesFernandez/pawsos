import { Camera, PawPrint } from 'lucide-react';
import './PetAvatar.css';

export default function PetAvatar({ pet, size = 'large', editable = false, onPhotoChange }) {
  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 3 * 1024 * 1024) {
      window.alert('La foto debe pesar menos de 3 MB.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onPhotoChange?.(reader.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className={`pet-avatar pet-avatar-${size}`}>
      {pet.photo ? <img src={pet.photo} alt={`Foto de ${pet.name}`} /> : <div className="avatar-placeholder"><PawPrint size={size === 'large' ? 36 : 24} /></div>}
      {editable && <label className="avatar-edit" title="Cambiar foto"><Camera size={15} /><input type="file" accept="image/*" onChange={handleChange} /></label>}
    </div>
  );
}