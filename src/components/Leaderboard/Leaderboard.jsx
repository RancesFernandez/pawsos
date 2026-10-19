import { useEffect, useState } from "react";
import { Trophy, Medal, RefreshCw, PawPrint, MapPin, Phone, CheckCircle2, Siren, Plus, HeartHandshake } from "lucide-react";
import { loadLeaderboard, loadLostPetAlerts, createLostPetAlert, resolveLostPetAlert } from "../../services/firebaseData";
import { firebaseConfigured, auth } from "../../firebase";
import { compressImage } from "../../utils/compressImage";
import { openImagePreview } from "../../utils/imagePreview";
import "./Leaderboard.css";

export default function Leaderboard({ entries, pet, user }) {
  const [people, setPeople] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState({ species: "all", animalType: "all" });
  const [loading, setLoading] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [savingAlert, setSavingAlert] = useState(false);
  const [alertError, setAlertError] = useState("");
  const [demoAlerts, setDemoAlerts] = useState([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [form, setForm] = useState({ name: pet?.name || "", species: pet?.species || "", city: pet?.city || "", contact: pet?.whatsapp || pet?.phone || "", details: "", photo: pet?.photo || "" });

  const refresh = async () => {
    if (!firebaseConfigured) return;
    setLoading(true);
    try { setPeople(await loadLeaderboard()); }
    catch (e) { console.error("No se pudo actualizar el ranking", e); }
    finally { setLoading(false); }
  };
  const refreshAlerts = async () => {
    if (!firebaseConfigured) return;
    setAlertsLoading(true);
    try { setAlerts(await loadLostPetAlerts()); }
    catch (e) { console.error("No se pudieron cargar los avisos", e); setAlertError("No se pudieron cargar los avisos. Revisá las reglas de Firestore."); }
    finally { setAlertsLoading(false); }
  };
  useEffect(() => { refresh(); refreshAlerts(); }, []);
  const source = firebaseConfigured ? people : [];
  const species = [...new Set(source.map((x) => x.species).filter(Boolean))];
  const kinds = [...new Set(source.map((x) => x.animalType).filter(Boolean))];
  const shown = source.filter((x) => (filter.species === "all" || x.species === filter.species) && (filter.animalType === "all" || x.animalType === filter.animalType)).sort((a, b) => b.points - a.points);
  const mine = Number(user?.points ?? entries.length * 10);
  const visibleAlerts = (firebaseConfigured ? alerts : demoAlerts).filter((a) => a.status !== "found").sort((a,b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  const submitAlert = async (event) => {
    event.preventDefault();
    if (savingAlert) return;
    setSavingAlert(true); setAlertError("");
    const payload = { name: form.name.trim(), species: form.species.trim(), city: form.city.trim(), contact: form.contact.trim(), details: form.details.trim(), photo: form.photo || "", displayName: user?.displayName || user?.email?.split("@")[0] || "Una familia Huellita" };
    try {
      if (firebaseConfigured) {
        const current = auth?.currentUser;
        if (!current) throw new Error("Iniciá sesión para publicar un aviso visible a la comunidad.");
        const created = await createLostPetAlert(current.uid, payload);
        setAlerts((currentAlerts) => [created, ...currentAlerts]);
      } else {
        setDemoAlerts((current) => [{ ...payload, id: crypto.randomUUID?.() || String(Date.now()), status: "searching", createdAt: new Date().toISOString(), ownerUid: "demo" }, ...current]);
      }
      setForm({ name: pet?.name || "", species: pet?.species || "", city: pet?.city || "", contact: pet?.whatsapp || pet?.phone || "", details: "", photo: pet?.photo || "" });
      setShowAlertForm(false);
    } catch (e) { console.error(e); setAlertError(e.message || "No se pudo publicar el aviso. Intentá nuevamente."); }
    finally { setSavingAlert(false); }
  };
  const markFound = async (alert) => {
    if (!window.confirm(`¿Confirmás que ${alert.name || "la mascota"} ya volvió a casa?`)) return;
    try {
      if (firebaseConfigured) { await resolveLostPetAlert(alert.id, auth.currentUser.uid); setAlerts((list) => list.map((item) => item.id === alert.id ? { ...item, status: "found" } : item)); }
      else setDemoAlerts((list) => list.map((item) => item.id === alert.id ? { ...item, status: "found" } : item));
    } catch (e) { setAlertError("No se pudo cerrar el aviso. Revisá que seas quien lo publicó."); }
  };
  const formatDate = (date) => { try { return new Intl.DateTimeFormat("es-UY", { dateStyle: "medium" }).format(new Date(date)); } catch { return "Fecha no disponible"; } };

  return (
    <section className="leaderboard-page">
      <div className="leaderboard-hero"><div><span className="section-kicker">LA COMUNIDAD QUE CUIDA</span><h2>Club de Buenas Huellas <span>✦</span></h2><p>Compartimos cuidados, celebramos buenas acciones y nos ayudamos cuando una mascota necesita volver a casa.</p></div><div className="trophy-spot"><Trophy size={35} /></div></div>
      <section className="lost-pets-panel">
        <div className="lost-pets-heading"><div className="lost-pets-icon"><Siren size={23}/></div><div className="lost-pets-heading-copy"><span className="section-kicker">AYUDEMOS A QUE VUELVAN A CASA</span><h3>Mascotas perdidas</h3><p>Publicá un aviso para que la comunidad pueda reconocerlas y ayudar.</p></div><button className="primary-button lost-add-button" onClick={() => { setAlertError(""); setShowAlertForm((v) => !v); }}><Plus size={16}/>{showAlertForm ? "Cerrar" : "Publicar aviso"}</button></div>
        {showAlertForm && <form className="lost-alert-form" onSubmit={submitAlert}>
          <div className="lost-alert-form-intro"><HeartHandshake size={19}/><span>Compartí solo datos de contacto que estés de acuerdo en hacer públicos.</span></div>
          <label>Nombre de la mascota *<input required maxLength={70} value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} placeholder="Ej. Luna"/></label>
          <label>Especie / descripción<input maxLength={80} value={form.species} onChange={(e) => setForm({...form,species:e.target.value})} placeholder="Perra mestiza, mediana…"/></label>
          <label>Zona donde se perdió *<input required maxLength={100} value={form.city} onChange={(e) => setForm({...form,city:e.target.value})} placeholder="Barrio y ciudad"/></label>
          <label>Teléfono o WhatsApp de contacto *<input required maxLength={60} value={form.contact} onChange={(e) => setForm({...form,contact:e.target.value})} placeholder="Número para recibir información"/></label>
          <label className="lost-details-field">Señas particulares y circunstancias *<textarea required maxLength={700} rows={3} value={form.details} onChange={(e) => setForm({...form,details:e.target.value})} placeholder="Última vez vista, color del collar, señas particulares…"/></label>
          <label className="lost-photo-field">Foto de la mascota<input type="file" accept="image/*" onChange={async (e) => { const file=e.target.files?.[0]; if(!file)return; setPhotoBusy(true); setAlertError(""); try { const photo = await compressImage(file,180*1024); setForm((current)=>({...current,photo})); } catch(err) { setAlertError(err.message || "No se pudo procesar la foto."); } finally { setPhotoBusy(false); e.target.value=""; } }}/>{photoBusy && <small>Optimizando foto…</small>}{form.photo && <img className="lost-form-photo image-zoomable" src={form.photo} alt="Foto del aviso" role="button" tabIndex={0} onClick={() => openImagePreview(form.photo, `Foto de ${form.name || "la mascota perdida"}`)} onKeyDown={(e)=>(e.key === "Enter" || e.key === " ") && (e.preventDefault(),openImagePreview(form.photo, `Foto de ${form.name || "la mascota perdida"}`))}/>}</label>
          {alertError && <p className="lost-alert-error" role="alert">{alertError}</p>}
          <div className="lost-form-actions"><button type="button" className="text-button" onClick={() => setShowAlertForm(false)}>Cancelar</button><button type="submit" className="primary-button" disabled={savingAlert || photoBusy}>{savingAlert ? "Publicando…" : "Publicar aviso"}</button></div>
          {firebaseConfigured && !auth?.currentUser && <small>Necesitás iniciar sesión para publicar avisos en la comunidad.</small>}
        </form>}
        {!showAlertForm && alertError && <p className="lost-alert-error" role="alert">{alertError}</p>}
        <div className="lost-alert-list">{alertsLoading ? <p className="lost-empty">Cargando avisos…</p> : visibleAlerts.map((alert) => <article className="lost-alert-card" key={alert.id}>
          {alert.photo ? <img className="lost-alert-photo image-zoomable" src={alert.photo} alt={`Foto de ${alert.name}`} role="button" tabIndex={0} onClick={() => openImagePreview(alert.photo, `Mascota perdida: ${alert.name}`)} onKeyDown={(e)=>(e.key === "Enter" || e.key === " ") && (e.preventDefault(),openImagePreview(alert.photo, `Mascota perdida: ${alert.name}`))}/> : <div className="lost-alert-photo-placeholder"><PawPrint size={30}/></div>}
          <div className="lost-alert-content"><div className="lost-alert-card-title"><span className="lost-status-pill"><span/>SE BUSCA</span><small>{formatDate(alert.createdAt)}</small></div><h4>{alert.name}</h4>{alert.species && <p className="lost-alert-species">{alert.species}</p>}<p className="lost-alert-details">{alert.details}</p><p className="lost-alert-meta"><MapPin size={15}/>{alert.city}</p><a className="lost-contact-link" href={`https://wa.me/${String(alert.contact || "").replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"><Phone size={15}/>Contactar por WhatsApp</a><small className="lost-published-by">Publicado por {alert.displayName || "una familia Huellita"}</small>{alert.ownerUid && (user?.uid === alert.ownerUid || (!firebaseConfigured && alert.ownerUid === "demo")) && <button className="lost-found-button" onClick={() => markFound(alert)}><CheckCircle2 size={15}/>Marcar como encontrada</button>}</div>
        </article>)}{!alertsLoading && !visibleAlerts.length && <div className="lost-empty"><PawPrint size={24}/><strong>No hay avisos activos</strong><span>Si alguien necesita ayuda, podés ser la primera persona en compartir un aviso.</span></div>}</div>
        <p className="lost-privacy-note">Los avisos se muestran a la comunidad. Publicá un número de contacto que aceptes compartir y evitá incluir tu dirección exacta.</p>
      </section>
      <div className="points-card"><div className="points-icon"><PawPrint size={23}/></div><div><span>TUS PUNTOS DE CUIDADO</span><strong>{mine} <small>pts</small></strong><p>Sumá puntos registrando momentos en el diario.</p></div><div className="points-badge">Nivel {mine >= 100 ? "Estrella" : mine >= 50 ? "Amoroso" : "Aprendiz"}</div></div>
      <div className="leaderboard-toolbar"><div><h3>Ranking de la comunidad</h3><p>Un poquito de inspiración entre familias.</p></div><button onClick={refresh} disabled={!firebaseConfigured || loading} title="Actualizar ranking"><RefreshCw size={15}/>{loading ? "Actualizando" : "Actualizar"}</button></div>
      <div className="leaderboard-filters"><label>Especie<select value={filter.species} onChange={(e) => setFilter({ ...filter, species: e.target.value })}><option value="all">Todas las especies</option>{species.map((s) => <option key={s}>{s}</option>)}</select></label><label>Tipo de animal<select value={filter.animalType} onChange={(e) => setFilter({ ...filter, animalType: e.target.value })}><option value="all">Todos los tipos</option>{kinds.map((s) => <option key={s}>{s}</option>)}</select></label></div>
      <div className="ranking-list">{shown.map((person, i) => <article className={`ranking-row ${i === 0 ? "rank-first" : ""}`} key={person.uid || person.displayName}><span className="rank-number">{i === 0 ? <Medal size={19}/> : String(i + 1).padStart(2, "0")}</span><div className="rank-avatar">{(person.petName || person.displayName || "🐾").slice(0, 1).toUpperCase()}</div><div className="rank-person"><strong>{person.displayName || "Familia huellita"}</strong><span>{person.petName || "Su mascota"} · {person.species || "Otra especie"}</span></div><strong className="rank-points">{person.points || 0} <small>pts</small></strong></article>)}{!shown.length && <p className="ranking-empty">Todavía no hay perfiles con esos filtros.</p>}</div>
      <p className="ranking-footnote">{firebaseConfigured ? "Ranking sincronizado con los perfiles públicos de Huellita." : "Vista de muestra: el ranking entre usuarios se activa al configurar Firebase."} Los puntos reconocen la constancia; no son una evaluación de la calidad del cuidado.</p>
    </section>
  );
}
