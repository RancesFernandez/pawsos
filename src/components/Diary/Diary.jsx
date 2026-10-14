import { useMemo, useState } from 'react';
import { BookHeart, Footprints, HeartPulse, Utensils, Sparkles, Plus, Search, Trash2, CalendarDays } from 'lucide-react';
import { formatDate } from '../../utils/pet';
import './Diary.css';

const types = [
  { id: 'walk', label: 'Paseo', icon: Footprints, color: 'green' },
  { id: 'food', label: 'Comida', icon: Utensils, color: 'orange' },
  { id: 'health', label: 'Bienestar', icon: HeartPulse, color: 'blue' },
  { id: 'memory', label: 'Recuerdo', icon: Sparkles, color: 'lilac' }
];

export default function Diary({ pet, entries, setEntries }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ type: 'memory', title: '', note: '' });
  const filtered = useMemo(() => entries.filter((entry) => (filter === 'all' || entry.type === filter) && `${entry.title} ${entry.note}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => new Date(b.date) - new Date(a.date)), [entries, filter, search]);

  const addEntry = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setEntries((current) => [{ ...form, id: crypto.randomUUID?.() || String(Date.now()), date: new Date().toISOString() }, ...current]);
    setForm({ type: 'memory', title: '', note: '' });
    setShowForm(false);
  };
  const removeEntry = (id) => setEntries((current) => current.filter((entry) => entry.id !== id));

  return <section className="diary-page">
    <div className="diary-intro"><div><span className="section-kicker">PEQUEÑAS COSAS, GRANDES RECUERDOS</span><h2>El diario de {pet.name || 'tu mascota'} <span>♡</span></h2><p>Un paseo, una travesura, un día especial. Guardá lo que no querés olvidar.</p></div><div className="diary-illustration"><BookHeart size={32} /><span>♥</span></div></div>
    <div className="diary-toolbar">
      <div className="diary-filters">{[{id:'all',label:'Todo' }, ...types].map((item) => <button key={item.id} className={filter === item.id ? 'selected' : ''} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>
      <label className="diary-search"><Search size={16}/><input id="diary-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar recuerdos..." /></label>
      <button className="primary-button" onClick={() => setShowForm((value) => !value)}><Plus size={16}/> Nuevo recuerdo</button>
    </div>
    {showForm && <form className="entry-form" onSubmit={addEntry}>
      <div className="entry-form-heading"><h3>Guardar un momento</h3><span>Este recuerdo queda solo en este dispositivo.</span></div>
      <label>Tipo de recuerdo<select value={form.type} onChange={(e) => setForm({...form, type:e.target.value})}>{types.map((type) => <option value={type.id} key={type.id}>{type.label}</option>)}</select></label>
      <label>¿Qué pasó? *<input required maxLength={80} value={form.title} onChange={(e) => setForm({...form, title:e.target.value})} placeholder="Ej. Conoció a su nuevo mejor amigo" /></label>
      <label>Un detalle para recordar<textarea maxLength={400} rows={3} value={form.note} onChange={(e) => setForm({...form, note:e.target.value})} placeholder="Escribí algo lindo, una observación o cómo se sintió..." /></label>
      <div className="entry-form-actions"><button type="button" className="text-button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary-button" type="submit">Guardar recuerdo</button></div>
    </form>}
    <div className="diary-list">
      {filtered.map((entry) => {
        const type = types.find((item) => item.id === entry.type) || types[3];
        const Icon = type.icon;
        return <article className="diary-entry" key={entry.id}>
          <div className={`entry-icon entry-${type.color}`}><Icon size={19}/></div>
          <div className="entry-main"><div className="entry-title-row"><h3>{entry.title}</h3><span>{formatDate(entry.date)}</span></div><p>{entry.note || 'Un pequeño momento para guardar en el corazón.'}</p><span className={`entry-type type-${type.color}`}>{type.label}</span></div>
          <button className="delete-entry" onClick={() => removeEntry(entry.id)} aria-label={`Eliminar ${entry.title}`} title="Eliminar recuerdo"><Trash2 size={15}/></button>
        </article>;
      })}
      {filtered.length === 0 && <div className="empty-diary"><CalendarDays size={29}/><h3>Acá empieza la historia</h3><p>No hay recuerdos con este filtro todavía. Guardá el primero, por más pequeño que sea.</p><button className="primary-button" onClick={() => setShowForm(true)}><Plus size={16}/> Crear recuerdo</button></div>}
    </div>
  </section>;
}