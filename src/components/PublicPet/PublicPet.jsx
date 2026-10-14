import { useState } from 'react';
import { Phone, MessageCircle, MapPin, Heart, ShieldCheck, Stethoscope, AlertTriangle, PawPrint, Share2 } from 'lucide-react';
import PetAvatar from '../PetAvatar/PetAvatar';
import { getAgeLabel } from '../../utils/pet';
import './PublicPet.css';

export default function PublicPet({ pet, onBack }) {
  const [showDetails, setShowDetails] = useState(false);
  const phone = (pet.phone || '').replace(/[^\d+]/g, '');
  const whatsapp = (pet.whatsapp || pet.phone || '').replace(/\D/g, '');
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({title:`Ficha de ${pet.name}`,text:`Esta es la ficha de ${pet.name}.`,url:window.location.href});
      else { await navigator.clipboard.writeText(window.location.href); window.alert('Enlace copiado.'); }
    } catch {}
  };
  return <main className="public-pet-page">
    <header className="public-brand"><span className="public-brand-mark"><PawPrint size={19}/></span><strong>huellita<span>.</span></strong><span className="public-secure"><ShieldCheck size={13}/> FICHA DE IDENTIFICACIÓN</span></header>
    <section className="public-pet-card">
      <div className="public-cover"><div className="public-cover-sun"/><span>SIEMPRE CERCA DE CASA <Heart size={13} fill="currentColor"/></span></div>
      <div className="public-main-info"><PetAvatar pet={pet} size="large"/><div><span className="public-found-label">¡HOLA! SOY</span><h1>{pet.name || 'Una mascota'}</h1><p>{[pet.breed,pet.species==='Otro'?(pet.speciesOther||'Otra especie'):pet.species].filter(Boolean).join(' · ')}</p><div className="public-tags">{pet.birthDate && <span>{getAgeLabel(pet.birthDate)}</span>}{pet.sex && <span>{pet.sex}</span>}</div></div></div>
      <p className="public-bio">{pet.bio || pet.temperament || 'Soy parte de una familia que me quiere mucho. ¡Ayudame a volver a casa!'}</p>
      <div className="public-contact-heading"><span>¿ME ENCONTRASTE?</span><p>¡Gracias por ayudarme a volver con mi familia!</p></div>
      <div className="public-contact-actions">
        {phone && <a className="public-call" href={`tel:${phone}`}><Phone size={18}/><span><strong>Llamar a mi familia</strong><small>Contacto directo</small></span></a>}
        {whatsapp && <a className="public-whatsapp" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola, encontré a ${pet.name || 'tu mascota'}. Estoy viendo su ficha de Huellita.`)}`} target="_blank" rel="noreferrer"><MessageCircle size={18}/><span><strong>Contactar por WhatsApp</strong><small>Enviar un mensaje</small></span></a>}
        {!phone && !whatsapp && <div className="public-no-contact"><AlertTriangle size={17}/> La familia todavía no agregó un teléfono de contacto.</div>}
      </div>
      {(pet.allergies || pet.conditions || pet.medication || pet.emergencyNotes || pet.fears) && <div className="public-alert-box"><AlertTriangle size={18}/><div><strong>Información importante para cuidarme</strong><p>{pet.allergies && `Alergias: ${pet.allergies}. `}{pet.conditions && `Condiciones: ${pet.conditions}. `}{pet.medication && `Medicación: ${pet.medication}. `}{pet.fears && `A tener en cuenta: ${pet.fears}. `}{pet.emergencyNotes}</p></div></div>}
      <button className="public-details-toggle" onClick={() => setShowDetails((v) => !v)}>{showDetails ? 'Ocultar detalles' : 'Ver más información'} <span>{showDetails ? '−' : '+'}</span></button>
      {showDetails && <div className="public-details">
        {pet.color && <Detail label="Señas particulares" value={pet.color}/>}
        {pet.weight && <Detail label="Peso registrado" value={`${pet.weight} kg`}/>}
        {pet.microchip && <Detail label="Microchip" value={pet.microchip}/>}
        {pet.food && <Detail label="Alimento habitual" value={`${pet.food}${pet.foodAmount ? ` · ${pet.foodAmount}` : ''}`}/>}
        {pet.foodSchedule && <Detail label="Horarios de comida" value={pet.foodSchedule}/>}
        {pet.walkNotes && <Detail label="Paseos y actividad" value={pet.walkNotes}/>}
        {pet.vetName && <Detail label="Veterinaria de confianza" value={`${pet.vetName}${pet.vetPhone ? ` · ${pet.vetPhone}` : ''}`}/>}
        {pet.city && <Detail label="Zona" value={pet.city}/>}
      </div>}
      <button className="public-share" onClick={share}><Share2 size={15}/> Compartir esta ficha</button>
    </section>
    <footer className="public-footer"><span>Hecho con <Heart size={11} fill="currentColor"/> para cuidar de quienes más queremos.</span><small>Huellita · Ficha pública de identificación</small></footer>
    <button className="public-back" onClick={onBack}>Volver al panel de demostración</button>
  </main>;
}
function Detail({label,value}){return <div className="public-detail"><span>{label}</span><strong>{value}</strong></div>}