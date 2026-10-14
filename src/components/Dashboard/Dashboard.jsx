import { useMemo } from "react";
import {
  ArrowRight,
  Cake,
  CalendarDays,
  Heart,
  HeartPulse,
  PawPrint,
  QrCode,
  Sparkles,
  Utensils,
  Footprints,
  Plus,
  Clock3,
  ChevronRight,
} from "lucide-react";
import PetAvatar from "../PetAvatar/PetAvatar";
import StatCard from "../StatCard/StatCard";
import { getAgeLabel, formatDate } from "../../utils/pet";
import "./Dashboard.css";

export default function Dashboard({ pet, entries, onNavigate }) {
  const age = getAgeLabel(pet.birthDate);
  const recent = useMemo(
    () =>
      [...entries]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3),
    [entries],
  );
  const iconMap = {
    walk: Footprints,
    food: Utensils,
    health: HeartPulse,
    memory: Sparkles,
  };
  const daysToBirthday = useMemo(() => {
    if (!pet.birthDate) return null;
    const birth = new Date(`${pet.birthDate}T12:00:00`);
    const today = new Date();
    let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate()))
      next.setFullYear(next.getFullYear() + 1);
    return Math.ceil(
      (next -
        new Date(today.getFullYear(), today.getMonth(), today.getDate())) /
        86400000,
    );
  }, [pet.birthDate]);

  return (
    <section className="dashboard-page">
      <div className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-kicker">
            <Sparkles size={13} /> UN LUGAR HECHO CON AMOR
          </span>
          <h2>¡Qué lindo verte por acá!</h2>
          <p>
            Un día más para llenar de momentos la vida de{" "}
            {pet.name || "tu compañero"}.
          </p>
          <button
            className="welcome-button"
            onClick={() => onNavigate("diary")}
          >
            Guardar un recuerdo <ArrowRight size={15} />
          </button>
        </div>
        <div className="welcome-art">
          <div className="sun-shape" />
          <div className="art-paw">🐾</div>
          <div className="art-heart">♥</div>
          <div className="art-sparkle">✦</div>
        </div>
        <span className="banner-deco deco-one">✦</span>
        <span className="banner-deco deco-two">✧</span>
      </div>
      <div className="section-heading">
        <div>
          <h2>El mundo de {pet.name || "tu mascota"}</h2>
          <p>Todo lo importante, en un mismo lugar.</p>
        </div>
        <button className="subtle-link" onClick={() => onNavigate("profile")}>
          Ver ficha completa <ArrowRight size={14} />
        </button>
      </div>
      <div className="stats-grid">
        <StatCard
          icon={Cake}
          label="Edad actual"
          value={age}
          note="SU ETAPA"
          tone="green"
        />
        <StatCard
          icon={Heart}
          label="Peso registrado"
          value={pet.weight ? `${pet.weight} kg` : "Sin dato"}
          note="BIENESTAR"
          tone="orange"
        />
        <StatCard
          icon={CalendarDays}
          label="Próximo cumple"
          value={
            daysToBirthday === null
              ? "Sin fecha"
              : daysToBirthday === 0
                ? "¡Hoy!"
                : `${daysToBirthday} días`
          }
          note="PARA CELEBRAR"
          tone="lilac"
        />
        <StatCard
          icon={BookIcon}
          label="Recuerdos guardados"
          value={entries.length}
          note="TU HISTORIA"
          tone="blue"
        />
      </div>
      <div className="dashboard-columns">
        <div className="pet-overview card-panel">
          <div className="panel-heading">
            <div>
              <h3>Mi compañero de aventuras</h3>
              <p>Una ficha que crece con ustedes.</p>
            </div>
            <button
              className="round-arrow"
              onClick={() => onNavigate("profile")}
              aria-label="Editar perfil"
            >
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="pet-overview-main">
            <PetAvatar pet={pet} size="large" />
            <div className="pet-overview-copy">
              <h3>
                {pet.name || "Mi mascota"} <span>♥</span>
              </h3>
              <p>{[pet.breed, pet.species].filter(Boolean).join(" · ")}</p>
              <div className="pet-tags">
                <span>
                  <PawPrint size={12} />
                  {pet.sex || "Sin dato"}
                </span>
                <span>
                  <HeartPulse size={12} />
                  {pet.weight ? `${pet.weight} kg` : "Peso pendiente"}
                </span>
              </div>
            </div>
          </div>
          <div className="pet-mini-bio">
            {pet.bio ||
              pet.temperament ||
              "Cada mascota tiene una historia única. Agregá una pequeña presentación para compartir lo que la hace especial."}
          </div>
          <button
            className="panel-bottom-link"
            onClick={() => onNavigate("profile")}
          >
            Completar su historia <ChevronRight size={15} />
          </button>
        </div>
        <div className="quick-actions card-panel">
          <div className="panel-heading">
            <div>
              <h3>Accesos rápidos</h3>
              <p>Un poquito de cuidado cada día.</p>
            </div>
            <span className="quick-sparkle">
              <Sparkles size={16} />
            </span>
          </div>
          <button className="quick-action" onClick={() => onNavigate("qr")}>
            <span className="quick-icon green">
              <QrCode size={17} />
            </span>
            <span>
              <strong>Su placa QR</strong>
              <small>Que siempre pueda volver a casa</small>
            </span>
            <ChevronRight size={16} />
          </button>
          <button className="quick-action" onClick={() => onNavigate("diary")}>
            <span className="quick-icon orange">
              <BookIcon size={17} />
            </span>
            <span>
              <strong>Guardar un recuerdo</strong>
              <small>Un momento para no olvidar</small>
            </span>
            <ChevronRight size={16} />
          </button>
          <button
            className="quick-action"
            onClick={() => onNavigate("profile")}
          >
            <span className="quick-icon lilac">
              <HeartPulse size={17} />
            </span>
            <span>
              <strong>Actualizar sus cuidados</strong>
              <small>Rutina, alergias y veterinaria</small>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="recent-panel card-panel">
        <div className="panel-heading">
          <div>
            <h3>Huellitas recientes</h3>
            <p>Los últimos momentos que guardaste.</p>
          </div>
          <button className="subtle-link" onClick={() => onNavigate("diary")}>
            Ver diario <ArrowRight size={14} />
          </button>
        </div>
        {recent.length ? (
          <div className="recent-list">
            {recent.map((entry) => {
              const Icon = iconMap[entry.type] || Sparkles;
              return (
                <div className="recent-item" key={entry.id}>
                  <span className={`recent-icon recent-${entry.type}`}>
                    <Icon size={16} />
                  </span>
                  <div>
                    <strong>{entry.title}</strong>
                    <small>{entry.note || "Un recuerdo para guardar."}</small>
                  </div>
                  <span className="recent-date">
                    <Clock3 size={12} />
                    {formatDate(entry.date)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="recent-empty">
            <p>Tu historia está por empezar.</p>
            <button className="subtle-link" onClick={() => onNavigate("diary")}>
              <Plus size={14} /> Guardar primer recuerdo
            </button>
          </div>
        )}
      </div>
      <div className="tiny-footer">
        <PawPrint size={13} /> Hecho con amor, para quienes nos hacen mejores
        personas. <Heart size={12} fill="currentColor" />
      </div>
    </section>
  );
}
function BookIcon(props) {
  return (
    <span className="book-icon-wrap">
      <Utensils size={0} />
      <Sparkles {...props} />
    </span>
  );
}
