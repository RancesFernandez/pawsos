import { useEffect, useState } from "react";
import { Heart, X, LogOut, PawPrint } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { emptyPet, starterEntries } from "./data/initialData";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { auth, db, firebaseConfigured } from "./firebase";
import {
  loadUserData,
  savePet as savePetRemote,
  saveEntries as saveEntriesRemote,
  getPublicPet,
  updateLeaderboard,
} from "./services/firebaseData";
import Sidebar from "./components/Sidebar/Sidebar";
import Topbar from "./components/Topbar/Topbar";
import Dashboard from "./components/Dashboard/Dashboard";
import PetProfile from "./components/PetProfile/PetProfile";
import QRCard from "./components/QRCard/QRCard";
import Diary from "./components/Diary/Diary";
import PublicPet from "./components/PublicPet/PublicPet";
import AuthGate from "./components/AuthGate/AuthGate";
import Leaderboard from "./components/Leaderboard/Leaderboard";
import "./App.css";

const pageMeta = {
  home: {
    title: "Tu lugar feliz",
    subtitle: "Un poquito de amor, organizado en un solo lugar.",
  },
  profile: {
    title: "Su ficha personal",
    subtitle: "Todo lo que hace única a tu mascota.",
  },
  qr: {
    title: "Su placa QR",
    subtitle: "Una forma sencilla de ayudarla a volver a casa.",
  },
  diary: {
    title: "Diario de huellitas",
    subtitle: "Guardá los momentos que hacen su historia.",
  },
  ranking: {
    title: "Club de Buenas Huellas",
    subtitle: "Cada gesto de cuidado suma.",
  },
};
export default function App() {
  const [pet, setPetLocal] = useLocalStorage("huellita-pet-v1", emptyPet);
  const [entries, setEntriesLocal] = useLocalStorage(
    "huellita-entries-v1",
    starterEntries,
  );
  const [active, setActive] = useState("home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dataReady, setDataReady] = useState(false);
  const [authReady, setAuthReady] = useState(!firebaseConfigured);
  const [demo, setDemo] = useState(!firebaseConfigured);
  const [publicProfile, setPublicProfile] = useState(false);
  const [publicPet, setPublicPet] = useState(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const [points, setPoints] = useLocalStorage("huellita-care-points-v1", 0);
  useEffect(() => {
    if (!firebaseConfigured) return;
    return onAuthStateChanged(auth, async (current) => {
      setUser(current);
      setAuthReady(true);
      if (!current) {
        setPetLocal({ ...emptyPet });
        setEntriesLocal([]);
        setPoints(0);
        setDataReady(false);
        return;
      }
      setDemo(false);
      setDataReady(false);
      if (current) {
        // Clear any previous browser cache before loading this account's own data.
        setPetLocal({ ...emptyPet });
        setEntriesLocal([]);
        setPoints(0);
        try {
          const data = await loadUserData(current.uid);
          setPetLocal(data.pet || { ...emptyPet });
          setEntriesLocal(data.entries);
          const { doc, getDoc } = await import("firebase/firestore");
          const snap = await getDoc(
            doc(db, "leaderboardProfiles", current.uid),
          );
          setPoints(snap.exists() ? Number(snap.data().points || 0) : 0);
          setDataReady(true);
        } catch (e) {
          console.error("No se pudo cargar el perfil de Firebase", e);
          setPetLocal({ ...emptyPet });
          setEntriesLocal([]);
          setDataReady(true);
        }
      }
    });
  }, []);
  useEffect(() => {
    const sync = async () => {
      const match = window.location.hash.match(/^#\/pet\/(.+)$/);
      setPublicProfile(Boolean(match));
      if (match) {
        setPublicLoading(true);
        try {
          if (firebaseConfigured) {
            const remote = await getPublicPet(decodeURIComponent(match[1]));
            setPublicPet(remote);
          } else if (decodeURIComponent(match[1]) === pet.id) setPublicPet(pet);
          else setPublicPet(null);
        } catch (e) {
          console.error(e);
          setPublicPet(null);
        } finally {
          setPublicLoading(false);
        }
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pet.id]);
  const setPet = async (next) => {
    setPetLocal(next);
    if (user && firebaseConfigured) {
      try {
        const saved = await savePetRemote(user.uid, next, user);
        setPetLocal(saved);
      } catch (e) {
        console.error("Error guardando mascota en Firebase", e);
        window.alert(
          "No se pudo guardar en Firebase. Revisá la configuración y las reglas.",
        );
      }
    }
  };
  const setEntries = (updater) =>
    setEntriesLocal((current) =>
      typeof updater === "function" ? updater(current) : updater,
    );
  useEffect(() => {
    if (user && firebaseConfigured && dataReady)
      saveEntriesRemote(user.uid, entries).catch((e) =>
        console.error("Error guardando diario", e),
      );
  }, [entries, user, dataReady]);
  const awardPoints = async (amount) => {
    const next = points + amount;
    setPoints(next);
    if (user && firebaseConfigured) {
      try {
        await updateLeaderboard(user.uid, next, pet, user);
      } catch (e) {
        console.error("No se pudieron actualizar los puntos", e);
      }
    }
  };
  const navigate = (page) => {
    setActive(page);
    setMobileNavOpen(false);
    if (window.location.hash.startsWith("#/pet/"))
      history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${page === "home" ? "" : "#/" + page}`,
      );
  };
  const addMemory = () => {
    setActive("diary");
    setMobileNavOpen(false);
    window.setTimeout(
      () => document.querySelector(".diary-toolbar .primary-button")?.click(),
      80,
    );
  };
  const meta = pageMeta[active] || pageMeta.home;
  if (publicProfile) {
    if (publicLoading)
      return (
        <div className="public-loading">Buscando la ficha de la mascota…</div>
      );
    return publicPet ? (
      <PublicPet
        pet={publicPet}
        onBack={() => {
          history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search,
          );
          setPublicProfile(false);
          setActive("home");
        }}
      />
    ) : (
      <main className="public-missing">
        <h1>No encontramos esta ficha</h1>
        <p>
          El QR puede ser de una demo antigua o la ficha todavía no se publicó.
        </p>
        <a href={window.location.pathname}>Volver a Huellita</a>
      </main>
    );
  }
  if (firebaseConfigured && !authReady)
    return <div className="public-loading">Preparando tu espacio…</div>;
  if (firebaseConfigured && !user)
    return <AuthGate onDemo={() => setDemo(true)} />;
  if (firebaseConfigured && user && !dataReady)
    return (
      <div className="public-loading paw-loading" role="status" aria-label="Cargando">
        <PawPrint className="paw-loading-icon" size={42} strokeWidth={1.8} />
        <span className="paw-loading-spinner" aria-hidden="true" />
      </div>
    );
  if (!user && !demo) return <AuthGate onDemo={() => setDemo(true)} />;
  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={navigate} pet={pet} />
      {mobileNavOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setMobileNavOpen(false)}
        >
          <button
            className="mobile-nav-close"
            aria-label="Cerrar menú"
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={20} />
          </button>
          <Sidebar active={active} onNavigate={navigate} pet={pet} />
        </div>
      )}
      <main className="main-content">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          onAdd={addMemory}
          onMobileMenu={() => setMobileNavOpen(true)}
        />
        <div className="session-strip">
          <span>
            {firebaseConfigured
              ? "Sesión sincronizada con Firebase"
              : "Modo demostración · los datos se guardan en este navegador"}
          </span>
          {user && (
            <button onClick={() => signOut(auth)}>
              <LogOut size={13} /> Cerrar sesión
            </button>
          )}
        </div>
        {active === "home" && (
          <Dashboard pet={pet} entries={entries} onNavigate={navigate} />
        )}
        {active === "profile" && (
          <PetProfile pet={pet} setPet={setPet} onNavigate={navigate} />
        )}
        {active === "qr" && <QRCard pet={pet} onNavigate={navigate} />}
        {active === "diary" && (
          <Diary
            pet={pet}
            entries={entries}
            setEntries={setEntries}
            onPoints={awardPoints}
          />
        )}
        {active === "ranking" && (
          <Leaderboard entries={entries} pet={pet} user={{ ...user, points }} />
        )}
        <footer className="app-footer">
          <span>
            HUELLITA <Heart size={10} fill="currentColor" /> HECHO CON AMOR
          </span>
          <span>Una demo que crece con vos y tu mejor amigo.</span>
        </footer>
      </main>
    </div>
  );
}
