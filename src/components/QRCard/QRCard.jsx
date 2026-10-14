import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, ExternalLink, ShieldCheck, Copy, Check, Link2, Printer } from 'lucide-react';
import PetAvatar from '../PetAvatar/PetAvatar';
import './QRCard.css';

export default function QRCard({ pet, onNavigate }) {
  const qrRef = useRef(null);
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/pet/${pet.id}` : `https://tu-dominio.com/#/pet/${pet.id}`;
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(profileUrl); window.alert('¡Enlace copiado! Cuando publiques la web, compartí ese enlace con quien quieras.'); }
    catch { window.prompt('Copiá el enlace de tu ficha:', profileUrl); }
  };
  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-${(pet.name || 'mascota').toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  const printCard = () => window.print();

  return <section className="qr-page">
    <div className="qr-intro"><div><span className="section-kicker">UNA HUELLITA QUE PUEDE HACER LA DIFERENCIA</span><h2>Su placa, su historia. <span>♡</span></h2><p>Un código, toda la información importante. Si alguien encuentra a {pet.name || 'tu mascota'}, podrá ayudarte a reunirlos.</p></div><div className="qr-shield"><ShieldCheck size={35}/></div></div>
    <div className="qr-layout">
      <div className="qr-preview-column">
        <div className="qr-preview">
          <div className="qr-card-top"><span className="mini-brand"><span>♥</span> huellita.</span><span className="safe-pill"><ShieldCheck size={12}/> FICHA SEGURA</span></div>
          <div className="qr-pet-info"><PetAvatar pet={pet} size="medium"/><div><h3>{pet.name || 'Mi mascota'}</h3><p>{[pet.breed, pet.species].filter(Boolean).join(' · ')}</p><span>MI FAMILIA ME ESTÁ BUSCANDO</span></div></div>
          <div className="qr-code-frame" ref={qrRef}><QRCodeCanvas value={profileUrl} size={178} level="H" includeMargin bgColor="#fffefa" fgColor="#294b3b" imageSettings={{src:'/favicon.svg',height:26,width:26,excavate:true}} /></div>
          <div className="qr-scan-copy"><strong>¿Me encontraste?</strong><span>Escaneá el código para ver cómo ayudarme a volver a casa.</span></div>
          <div className="qr-card-footer"><PawMark/> <span>GRACIAS POR CUIDARME</span><PawMark/></div>
        </div>
        <p className="qr-preview-note">Vista previa de la placa digital. El QR abre el perfil de emergencia de esta mascota.</p>
      </div>
      <div className="qr-actions-column">
        <div className="qr-action-card"><span className="action-card-icon"><Download size={19}/></span><h3>Descargá tu código QR</h3><p>Guardalo como imagen para imprimirlo en una placa, tarjeta o accesorio.</p><button className="primary-button full-button" onClick={downloadQR}><Download size={16}/> Descargar QR en PNG</button></div>
        <div className="qr-action-card"><span className="action-card-icon action-orange"><Link2 size={19}/></span><h3>Compartí su ficha</h3><p>Mandale el enlace a familiares, cuidadores o a su veterinaria de confianza.</p><button className="secondary-button full-button" onClick={copyLink}><Copy size={15}/> Copiar enlace de la ficha</button><button className="text-link-button" onClick={() => onNavigate('profile')}>Completar o editar datos <ExternalLink size={13}/></button></div>
        <div className="qr-safety-note"><ShieldCheck size={19}/><div><strong>Vos decidís qué compartir</strong><p>Esta demo guarda la información en tu navegador. Antes de publicar, conectaremos una base de datos y controles de privacidad para que el QR funcione en otros dispositivos.</p></div></div>
        <button className="print-button" onClick={printCard}><Printer size={15}/> Imprimir vista de la placa</button>
      </div>
    </div>
  </section>;
}

function PawMark(){return <span className="paw-mark">✦</span>}