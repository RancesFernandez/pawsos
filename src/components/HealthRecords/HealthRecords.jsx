import { useState } from "react";
import { Syringe, Stethoscope, Plus, CalendarDays, Trash2 } from "lucide-react";
import "./HealthRecords.css";

export default function HealthRecords({ entries, setEntries, pet }) {
  const [kind, setKind] = useState("vaccine");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [nextDate, setNextDate] = useState("");
  const [notes, setNotes] = useState("");
  const [vet, setVet] = useState(pet.vetName || "");
  const records = entries.filter((e) => e.type === "vaccine" || e.type === "vet").sort((a,b) => new Date(b.date) - new Date(a.date));

  const add = (event) => {
    event.preventDefault();
    if (!title.trim() || !date) return;
    const record = {
      id: crypto.randomUUID?.() || String(Date.now()),
      type: kind,
      title: title.trim(),
      date: new Date(`${date}T12:00:00`).toISOString(),
      nextDate,
      note: notes.trim(),
      vetName: vet.trim(),
    };
    setEntries((current) => [record, ...current]);
    setTitle(""); setNextDate(""); setNotes("");
  };

  const remove = (id) => setEntries((current) => current.filter((e) => e.id !== id));
  return (
    <section className="health-page">
      <div className="health-hero">
        <div className="health-hero-icon"><Stethoscope size={28} /></div>
        <div><span className="section-kicker">CUIDAR TAMBIÉN ES RECORDAR</span><h2>La salud de {pet.name || "tu mascota"}</h2><p>Tené a mano vacunas, controles y próximas fechas importantes. Este registro te ayuda a organizarte, pero no sustituye las indicaciones de tu veterinario.</p></div>
      </div>
      <div className="health-layout">
        <form className="health-form" onSubmit={add}>
          <h3><Plus size={18}/> Agregar un registro</h3>
          <label>Tipo de registro<select value={kind} onChange={(e) => setKind(e.target.value)}><option value="vaccine">Vacuna</option><option value="vet">Visita al veterinario</option></select></label>
          <label>{kind === "vaccine" ? "Nombre de la vacuna *" : "Motivo de la visita *"}<input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === "vaccine" ? "Ej. Antirrábica" : "Ej. Control anual"} /></label>
          <label>Fecha *<input type="date" required value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label>Próxima fecha / refuerzo<input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} /></label>
          <label>Veterinaria o profesional<input value={vet} onChange={(e) => setVet(e.target.value)} placeholder="Nombre de la veterinaria" /></label>
          <label>Notas<textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Indicaciones, lote, observaciones..." /></label>
          <button className="primary-button" type="submit">Guardar registro</button>
        </form>
        <div className="health-history">
          <div className="health-history-heading"><div><h3>Historial de salud</h3><p>{records.length} {records.length === 1 ? "registro" : "registros"} guardados</p></div><CalendarDays size={23}/></div>
          {records.length ? records.map((r) => { const Vaccine = r.type === "vaccine"; return <article className="health-record" key={r.id}><div className={Vaccine ? "health-record-icon vaccine" : "health-record-icon"}>{Vaccine ? <Syringe size={19}/> : <Stethoscope size={19}/>}</div><div className="health-record-main"><div className="health-record-title"><h4>{r.title}</h4><span>{new Date(r.date).toLocaleDateString("es-UY")}</span></div><small>{Vaccine ? "Vacuna" : "Visita veterinaria"}{r.vetName ? ` · ${r.vetName}` : ""}</small>{r.note && <p>{r.note}</p>}{r.nextDate && <div className="next-date">Próxima fecha: {new Date(`${r.nextDate}T12:00:00`).toLocaleDateString("es-UY")}</div>}</div><button className="health-delete" onClick={() => remove(r.id)} aria-label={`Eliminar ${r.title}`}><Trash2 size={16}/></button></article>; }) : <div className="health-empty"><Syringe size={30}/><h4>Todo empieza con un registro</h4><p>Agregá una vacuna o una visita para tener el historial de salud ordenado.</p></div>}
        </div>
      </div>
    </section>
  );
}
