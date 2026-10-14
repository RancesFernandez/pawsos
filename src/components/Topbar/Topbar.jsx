import { Bell, Search, Plus, Menu } from 'lucide-react';
import './Topbar.css';

export default function Topbar({ title, subtitle, onAdd, onMobileMenu }) {
  return (
    <header className="topbar">
      <div className="topbar-title-wrap">
        <button className="mobile-menu" onClick={onMobileMenu} aria-label="Abrir menú"><Menu size={20} /></button>
        <div><div className="eyebrow">MI RINCÓN DE MASCOTAS</div><h1>{title}</h1><p>{subtitle}</p></div>
      </div>
      <div className="topbar-actions">
        <button className="icon-button search-button" aria-label="Buscar" onClick={() => document.getElementById('diary-search')?.focus()}><Search size={18} /></button>
        <button className="icon-button notification-button" aria-label="Notificaciones"><Bell size={18} /><i /></button>
        <button className="primary-button top-add" onClick={onAdd}><Plus size={17} /> Añadir recuerdo</button>
      </div>
    </header>
  );
}