import {
  Heart,
  LayoutDashboard,
  QrCode,
  BookHeart,
  Settings,
  PawPrint,
  ChevronRight,
  Trophy,
} from "lucide-react";
import "./Sidebar.css";

const navItems = [
  { id: "home", label: "Resumen", icon: LayoutDashboard },
  { id: "profile", label: "Ficha de mi mascota", icon: PawPrint },
  { id: "qr", label: "Mi placa QR", icon: QrCode },
  { id: "diary", label: "Diario de huellitas", icon: BookHeart },
  { id: "ranking", label: "Club de Buenas Huellas", icon: Trophy },
];

export default function Sidebar({ active, onNavigate, pet }) {
  return (
    <aside className="sidebar">
      <button
        className="brand"
        onClick={() => onNavigate("home")}
        aria-label="Ir al resumen"
      >
        <span className="brand-mark">
          <PawPrint size={22} strokeWidth={2.5} />
        </span>
        <span className="brand-name">
          huellita<span>.</span>
          <small>EL MUNDO DE TU MEJOR AMIGO</small>
        </span>
      </button>
      <div className="sidebar-label">TU ESPACIO</div>
      <nav className="side-nav" aria-label="Navegación principal">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${active === id ? "active" : ""}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={19} />
            <span>{label}</span>
            {active === id && (
              <ChevronRight size={16} className="nav-chevron" />
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="side-tip">
          <span className="tip-heart">
            <Heart size={17} fill="currentColor" />
          </span>
          <p>Los pequeños momentos también cuentan.</p>
          <button onClick={() => onNavigate("diary")}>
            Ir al diario <ChevronRight size={14} />
          </button>
        </div>
        <button
          className="nav-item settings-item"
          onClick={() => onNavigate("profile")}
        >
          <Settings size={18} />
          <span>Editar información</span>
        </button>
        <div className="sidebar-user">
          <div className="user-avatar">
            {pet.name?.slice(0, 1).toUpperCase() || "🐾"}
          </div>
          <div>
            <strong>{pet.name || "Mi mascota"}</strong>
            <small>Tu perfil familiar</small>
          </div>
          <span className="online-dot" />
        </div>
      </div>
    </aside>
  );
}
