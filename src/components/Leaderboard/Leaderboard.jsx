import { useEffect, useMemo, useState } from "react";
import { Trophy, Medal, RefreshCw, PawPrint } from "lucide-react";
import { loadLeaderboard } from "../../services/firebaseData";
import { firebaseConfigured } from "../../firebase";
import "./Leaderboard.css";
export default function Leaderboard({ entries, pet, user }) {
  const [people, setPeople] = useState([]);
  const [filter, setFilter] = useState({ species: "all", animalType: "all" });
  const [loading, setLoading] = useState(false);
  const refresh = async () => {
    if (!firebaseConfigured) return;
    setLoading(true);
    try {
      setPeople(await loadLeaderboard());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  const demoPeople = useMemo(
    () => [
      {
        displayName: "Sofi y Milo",
        points: 95,
        species: "Perro",
        animalType: "Mascota doméstica",
        petName: "Milo",
      },
      {
        displayName: "Vale y Nube",
        points: 70,
        species: "Gato",
        animalType: "Mascota doméstica",
        petName: "Nube",
      },
      {
        displayName: "Dani y Kiwi",
        points: 45,
        species: "Ave",
        animalType: "Mascota doméstica",
        petName: "Kiwi",
      },
    ],
    [],
  );
  const source = firebaseConfigured ? people : demoPeople;
  const species = [...new Set(source.map((x) => x.species).filter(Boolean))];
  const kinds = [...new Set(source.map((x) => x.animalType).filter(Boolean))];
  const shown = source
    .filter(
      (x) =>
        (filter.species === "all" || x.species === filter.species) &&
        (filter.animalType === "all" || x.animalType === filter.animalType),
    )
    .sort((a, b) => b.points - a.points);
  const mine = Number(user?.points ?? entries.length * 10);
  return (
    <section className="leaderboard-page">
      <div className="leaderboard-hero">
        <div>
          <span className="section-kicker">LA COMUNIDAD QUE CUIDA</span>
          <h2>
            Club de Buenas Huellas <span>✦</span>
          </h2>
          <p>
            Cada paseo, recuerdo y gesto de cuidado suma puntos. ¡Celebramos a
            quienes están presentes!
          </p>
        </div>
        <div className="trophy-spot">
          <Trophy size={35} />
        </div>
      </div>
      <div className="points-card">
        <div className="points-icon">
          <PawPrint size={23} />
        </div>
        <div>
          <span>TUS PUNTOS DE CUIDADO</span>
          <strong>
            {mine} <small>pts</small>
          </strong>
          <p>Sumá puntos registrando momentos en el diario.</p>
        </div>
        <div className="points-badge">
          Nivel {mine >= 100 ? "Estrella" : mine >= 50 ? "Amoroso" : "Aprendiz"}
        </div>
      </div>
      <div className="leaderboard-toolbar">
        <div>
          <h3>Ranking de la comunidad</h3>
          <p>Un poquito de inspiración entre familias.</p>
        </div>
        <button
          onClick={refresh}
          disabled={!firebaseConfigured || loading}
          title="Actualizar ranking"
        >
          <RefreshCw size={15} />
          {loading ? "Actualizando" : "Actualizar"}
        </button>
      </div>
      <div className="leaderboard-filters">
        <label>
          Especie
          <select
            value={filter.species}
            onChange={(e) => setFilter({ ...filter, species: e.target.value })}
          >
            <option value="all">Todas las especies</option>
            {species.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Tipo de animal
          <select
            value={filter.animalType}
            onChange={(e) =>
              setFilter({ ...filter, animalType: e.target.value })
            }
          >
            <option value="all">Todos los tipos</option>
            {kinds.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="ranking-list">
        {shown.map((person, i) => (
          <article
            className={`ranking-row ${i === 0 ? "rank-first" : ""}`}
            key={person.uid || person.displayName}
          >
            <span className="rank-number">
              {i === 0 ? <Medal size={19} /> : String(i + 1).padStart(2, "0")}
            </span>
            <div className="rank-avatar">
              {(person.petName || person.displayName || "🐾")
                .slice(0, 1)
                .toUpperCase()}
            </div>
            <div className="rank-person">
              <strong>{person.displayName || "Familia huellita"}</strong>
              <span>
                {person.petName || "Su mascota"} ·{" "}
                {person.species || "Otra especie"}
              </span>
            </div>
            <strong className="rank-points">
              {person.points || 0} <small>pts</small>
            </strong>
          </article>
        ))}
        {!shown.length && (
          <p className="ranking-empty">
            Todavía no hay perfiles con esos filtros.
          </p>
        )}
      </div>
      <p className="ranking-footnote">
        {firebaseConfigured
          ? "Ranking sincronizado con los perfiles públicos de Huellita."
          : "Vista de muestra: el ranking entre usuarios se activa al configurar Firebase."}{" "}
        Los puntos reconocen la constancia; no son una evaluación de la calidad
        del cuidado.
      </p>
    </section>
  );
}
