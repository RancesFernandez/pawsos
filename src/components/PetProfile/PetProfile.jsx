import { useState } from "react";
import {
  Save,
  ShieldCheck,
  Heart,
  Stethoscope,
  Utensils,
  Phone,
  MapPin,
  PawPrint,
  Info,
} from "lucide-react";
import PetAvatar from "../PetAvatar/PetAvatar";
import "./PetProfile.css";

const sections = [
  {
    id: "basic",
    title: "Sobre mi mascota",
    subtitle: "Lo que la hace única",
    icon: PawPrint,
  },
  {
    id: "contact",
    title: "Su familia",
    subtitle: "Cómo encontrarte",
    icon: Phone,
  },
  {
    id: "health",
    title: "Salud y cuidados",
    subtitle: "Información importante",
    icon: Stethoscope,
  },
  {
    id: "routine",
    title: "Su rutina",
    subtitle: "Pequeños detalles que ayudan",
    icon: Utensils,
  },
];

const fields = {
  basic: [
    ["name", "Nombre", "text"],
    [
      "species",
      "Especie",
      "select",
      [
        "Perro",
        "Gato",
        "Conejo",
        "Ave",
        "Pez",
        "Reptil",
        "Roedor",
        "Hurón",
        "Caballo",
        "Otro",
      ],
    ],
    [
      "animalType",
      "Tipo de animal",
      "select",
      [
        "Mascota doméstica",
        "Animal de asistencia",
        "Animal de granja",
        "Animal exótico",
        "Fauna silvestre rescatada",
        "Otro",
      ],
    ],
    ["breed", "Raza", "text"],
    ["birthDate", "Fecha de nacimiento", "date"],
    ["sex", "Sexo", "select", ["Hembra", "Macho", "No especificado"]],
    ["weight", "Peso (kg)", "number"],
    ["color", "Color y señas particulares", "text"],
    ["microchip", "N.º de microchip", "text"],
    ["temperament", "Personalidad", "text"],
    ["bio", "Una pequeña presentación", "textarea"],
    ["reward", "Recompensa (opcional)", "text"],
  ],
  contact: [
    ["ownerName", "Nombre de contacto", "text"],
    ["phone", "Teléfono de contacto", "tel"],
    ["whatsapp", "WhatsApp (con código de país)", "tel"],
    ["email", "Email", "email"],
    ["city", "Ciudad / zona", "text"],
    ["vetName", "Veterinaria de confianza", "text"],
    ["vetPhone", "Teléfono de la veterinaria", "tel"],
  ],
  health: [
    ["allergies", "Alergias", "text"],
    ["conditions", "Condiciones médicas importantes", "textarea"],
    ["medication", "Medicamentos y dosis", "textarea"],
    ["fears", "Miedos o cosas que evitar", "textarea"],
    ["emergencyNotes", "Qué hacer en una emergencia", "textarea"],
  ],
  routine: [
    ["food", "Alimento habitual", "text"],
    ["foodAmount", "Porción por comida", "text"],
    ["foodSchedule", "Horarios de comida", "text"],
    ["walkNotes", "Paseos y actividad", "textarea"],
  ],
};

export default function PetProfile({ pet, setPet, onNavigate }) {
  const [draft, setDraft] = useState(pet);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState("basic");

  const change = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };
  const save = (event) => {
    event.preventDefault();
    setPet({ ...draft, updatedAt: new Date().toISOString() });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2800);
  };

  return (
    <section className="profile-page">
      <div className="profile-hero">
        <PetAvatar
          pet={draft}
          size="large"
          editable
          onPhotoChange={(photo) => change("photo", photo)}
        />
        <div className="profile-hero-copy">
          <span className="section-kicker">ESTA ES MI HISTORIA</span>
          <h2>Conocé mejor a {draft.name || "tu mascota"}</h2>
          <p>
            Cuanto más nos contás, mejor podemos cuidar de ella. Los campos son
            opcionales.
          </p>
          <button className="profile-qr-link" onClick={() => onNavigate("qr")}>
            <ShieldCheck size={15} /> Ver su ficha de emergencia
          </button>
        </div>
        <div className="profile-completion">
          <span>Tu ficha</span>
          <strong>
            {Math.round(
              (Object.values(draft).filter((v) => String(v || "").trim())
                .length /
                Object.keys(draft).length) *
                100,
            )}
            %
          </strong>
          <div>
            <i
              style={{
                width: `${Math.round((Object.values(draft).filter((v) => String(v || "").trim()).length / Object.keys(draft).length) * 100)}%`,
              }}
            />
          </div>
          <small>¡Cada detalle suma!</small>
        </div>
      </div>
      <div className="profile-layout">
        <aside className="profile-section-nav">
          {sections.map(({ id, title, subtitle, icon: Icon }) => (
            <button
              key={id}
              className={section === id ? "chosen" : ""}
              onClick={() => setSection(id)}
            >
              <Icon size={18} />
              <span>
                <strong>{title}</strong>
                <small>{subtitle}</small>
              </span>
            </button>
          ))}
        </aside>
        <form className="profile-form" onSubmit={save}>
          {sections
            .filter((item) => item.id === section)
            .map(({ id, title, subtitle, icon: Icon }) => (
              <div key={id}>
                <div className="profile-form-heading">
                  <span className="profile-form-icon">
                    <Icon size={19} />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{subtitle}</p>
                  </div>
                </div>
                <div className="profile-fields">
                  {fields[id].map(([key, label, type, options]) => (
                    <label
                      key={key}
                      className={type === "textarea" ? "field-wide" : ""}
                    >
                      {label}
                      {type === "select" ? (
                        <select
                          value={draft[key] || ""}
                          onChange={(e) => change(key, e.target.value)}
                        >
                          {options.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      ) : type === "textarea" ? (
                        <textarea
                          rows={3}
                          value={draft[key] || ""}
                          onChange={(e) => change(key, e.target.value)}
                          placeholder={
                            key === "bio"
                              ? "Contanos un poquito más..."
                              : `Ingresá ${label.toLowerCase()} (opcional)`
                          }
                        />
                      ) : (
                        <input
                          type={type}
                          min={type === "number" ? 0 : undefined}
                          step={type === "number" ? "0.1" : undefined}
                          value={draft[key] || ""}
                          onChange={(e) => change(key, e.target.value)}
                          placeholder={
                            key === "reward"
                              ? "Ej. $1.000 o una recompensa simbólica"
                              : label
                          }
                        />
                      )}
                      {type === "select" && draft[key] === "Otro" && (
                        <input
                          aria-label={`${label}: especificar`}
                          value={draft[key + "Other"] || ""}
                          onChange={(e) =>
                            change(key + "Other", e.target.value)
                          }
                          placeholder={`¿Cuál es la ${label.toLowerCase()}?`}
                          required
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          <div className="profile-form-footer">
            <span>
              <Info size={14} /> Podés dejar en blanco lo que prefieras.
            </span>
            <button className="primary-button" type="submit">
              <Save size={16} />
              {saved ? "¡Guardado!" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
