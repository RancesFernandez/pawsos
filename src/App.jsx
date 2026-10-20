import { useEffect, useState } from "react";
import { Heart, X, LogOut } from "lucide-react";
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
  publishDiaryEntry,
  unpublishDiaryEntry,
  loadMySharedEntryIds,
} from "./services/firebaseData";
import { Analytics } from "@vercel/analytics/react";
import Sidebar from "./components/Sidebar/Sidebar";
import Topbar from "./components/Topbar/Topbar";
import Dashboard from "./components/Dashboard/Dashboard";
import PetProfile from "./components/PetProfile/PetProfile";
import QRCard from "./components/QRCard/QRCard";
import Diary from "./components/Diary/Diary";
import PublicPet from "./components/PublicPet/PublicPet";
import AuthGate from "./components/AuthGate/AuthGate";
import Leaderboard from "./components/Leaderboard/Leaderboard";
import SharedPaws from "./components/SharedPaws/SharedPaws";
import HealthRecords from "./components/HealthRecords/HealthRecords";
import ImagePreview from "./components/ImagePreview/ImagePreview";
import PawLoader from "./components/PawLoader";

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
  health: {
    title: "Salud y veterinaria",
    subtitle: "Vacunas, controles y cuidados importantes en un solo lugar.",
  },
  ranking: {
    title: "Club de Buenas Huellas",
    subtitle: "Cada gesto de cuidado suma.",
  },
  community: {
    title: "Huellitas compartidas",
    subtitle: "Recuerdos elegidos para compartir amor con la comunidad.",
  },
};
export default function App() {
  const [pet, setPetLocal] = useLocalStorage("huellita-pet-v1", emptyPet);
  const [entries, setEntriesLocal] = useLocalStorage(
    "huellita-entries-v1",
    starterEntries,
  );

  const [active, setActive] = useState(() => {
    const route = window.location.hash.replace(/^#\//, "").split("/")[0];
    return Object.prototype.hasOwnProperty.call(pageMeta, route)
      ? route
      : "home";
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dataReady, setDataReady] = useState(false);
  const [dataLoadError, setDataLoadError] = useState("");
  const [authReady, setAuthReady] = useState(!firebaseConfigured);
  const [demo, setDemo] = useState(!firebaseConfigured);
  const [publicProfile, setPublicProfile] = useState(() =>
    window.location.hash.startsWith("#/pet/"),
  );
  const [publicPet, setPublicPet] = useState(null);
  const [publicLoading, setPublicLoading] = useState(() =>
    window.location.hash.startsWith("#/pet/"),
  );
  const [points, setPoints] = useLocalStorage("huellita-care-points-v1", 0);
  const [sharedEntryIds, setSharedEntryIds] = useState([]);
  useEffect(() => {
    if (!firebaseConfigured) return;
    return onAuthStateChanged(auth, async (current) => {
      setUser(current);
      setAuthReady(true);
      if (!current) {
        // Do not erase the browser cache on sign-out. Firestore remains the
        // source of truth for signed-in accounts, and a failed read must never
        // turn into an empty profile that could later overwrite cloud data.
        setDataReady(false);
        setDataLoadError("");
        return;
      }
      setDemo(false);
      setDataReady(false);
      setDataLoadError("");
      try {
        const data = await loadUserData(current.uid);
        setPetLocal(data.pet || { ...emptyPet });
        setEntriesLocal(data.entries);
        const sharedIds = await loadMySharedEntryIds(current.uid).catch(
          (err) => {
            console.warn(
              "No se pudieron consultar las publicaciones compartidas",
              err,
            );
            return [];
          },
        );
        setSharedEntryIds(sharedIds);
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "leaderboardProfiles", current.uid));
        setPoints(snap.exists() ? Number(snap.data().points || 0) : 0);
        setDataReady(true);
      } catch (e) {
        console.error("No se pudo cargar el perfil de Firebase", e);
        // Keep the last local copy intact and block all writes until a successful
        // cloud read. This prevents an empty fallback from deleting diary entries.
        setDataLoadError(
          e?.code === "permission-denied"
            ? "Firebase rechazó la lectura de tus datos. Revisá las reglas de Firestore y que estés usando el proyecto correcto."
            : "No pudimos leer tus datos de Firebase. Revisá tu conexión y la configuración del proyecto. No modificamos tu copia local.",
        );
      }
    });
  }, []);
  useEffect(() => {
    const syncRoute = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#/pet/")) return;
      const route = hash.replace(/^#\//, "").split("/")[0];
      setActive(
        Object.prototype.hasOwnProperty.call(pageMeta, route) ? route : "home",
      );
    };
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
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
  const saveDiaryEntry = async (entry, shareWithCommunity = false) => {
    const nextEntries = [entry, ...entries];
    // In a real account, points are awarded only after Firestore confirms the save.
    if (user && firebaseConfigured) {
      await saveEntriesRemote(user.uid, nextEntries);
      if (shareWithCommunity) {
        await publishDiaryEntry(user.uid, entry, pet, user);
        setSharedEntryIds((current) =>
          current.includes(entry.id) ? current : [...current, entry.id],
        );
      }
    } else if (shareWithCommunity) {
      window.alert(
        "Para compartir recuerdos con la comunidad, iniciá sesión con Firebase. El recuerdo se guardará en tu diario.",
      );
    }
    setEntriesLocal(nextEntries);
    await awardPoints(10);
  };
  const deleteDiaryEntry = async (entryId) => {
    if (user && firebaseConfigured && sharedEntryIds.includes(entryId)) {
      // Primero retiramos la publicación pública; si falla, conservamos el recuerdo.
      await unpublishDiaryEntry(user.uid, entryId);
    }
    const nextEntries = entries.filter((entry) => entry.id !== entryId);
    if (user && firebaseConfigured)
      await saveEntriesRemote(user.uid, nextEntries);
    setEntriesLocal(nextEntries);
    setSharedEntryIds((current) => current.filter((id) => id !== entryId));
  };
  const toggleSharedEntry = async (entry) => {
    if (!user || !firebaseConfigured) {
      window.alert(
        "Para compartir recuerdos con la comunidad, iniciá sesión con Firebase.",
      );
      return;
    }
    const isShared = sharedEntryIds.includes(entry.id);
    try {
      if (isShared) await unpublishDiaryEntry(user.uid, entry.id);
      else await publishDiaryEntry(user.uid, entry, pet, user);
      setSharedEntryIds((current) =>
        isShared
          ? current.filter((id) => id !== entry.id)
          : [...current, entry.id],
      );
    } catch (error) {
      console.error("No se pudo actualizar la publicación comunitaria", error);
      window.alert(
        "No se pudo actualizar Huellitas compartidas. Revisá las reglas de Firestore e intentá nuevamente.",
      );
    }
  };
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
    const safePage = Object.prototype.hasOwnProperty.call(pageMeta, page)
      ? page
      : "home";
    setActive(safePage);
    setMobileNavOpen(false);
    const nextHash = safePage === "home" ? "" : `#/${safePage}`;
    if (window.location.hash !== nextHash) window.location.hash = nextHash;
  };
  const handleLogout = async () => {
    if (!firebaseConfigured || !auth) {
      setDemo(false);
      return;
    }
    try {
      await signOut(auth);
      setMobileNavOpen(false);
    } catch (error) {
      console.error("No se pudo cerrar la sesión", error);
      window.alert("No se pudo cerrar la sesión. Intentá nuevamente.");
    }
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
      return <PawLoader message="Buscando la ficha de tu mascota…" />;
    return publicPet ? (
      <>
        <PublicPet
          pet={publicPet}
          onBack={() => {
            window.location.hash = "";
            setPublicProfile(false);
            setActive("home");
          }}
        />
        <ImagePreview />
      </>
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
    return <PawLoader message="Preparando tu espacio…" />;
  if (firebaseConfigured && !user)
    return <AuthGate onDemo={() => setDemo(true)} />;
  if (firebaseConfigured && user && dataLoadError)
    return (
      <main className="data-error-page" role="alert">
        <div className="data-error-card">
          <div className="data-error-icon">
            <Heart size={25} />
          </div>
          <h1>No pudimos cargar tus datos</h1>
          <p>{dataLoadError}</p>
          <p className="data-error-note">
            Por seguridad, la aplicación no va a guardar una ficha vacía ni a
            sincronizar cambios hasta que Firebase vuelva a responder.
          </p>
          <div className="data-error-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={handleLogout}
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        </div>
      </main>
    );
  if (firebaseConfigured && user && !dataReady)
    return <PawLoader message="Cargando tus huellitas y recuerdos…" />;
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
          {(user || demo) && (
            <button
              className="logout-button"
              onClick={handleLogout}
              type="button"
              aria-label={user ? "Cerrar sesión" : "Salir de la demo"}
              title={user ? "Cerrar sesión" : "Salir de la demo"}
            >
              <LogOut size={16} strokeWidth={2.2} />
              <span>{user ? "Cerrar sesión" : "Salir de la demo"}</span>
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
            onSaveEntry={saveDiaryEntry}
            onDeleteEntry={deleteDiaryEntry}
            sharedEntryIds={sharedEntryIds}
            onToggleShare={toggleSharedEntry}
          />
        )}
        {active === "community" && (
          <SharedPaws
            user={user}
            firebaseConfigured={Boolean(user && firebaseConfigured)}
          />
        )}
        {active === "health" && (
          <HealthRecords entries={entries} setEntries={setEntries} pet={pet} />
        )}
        {active === "ranking" && (
          <Leaderboard
            entries={entries}
            pet={pet}
            user={{ ...user, uid: user?.uid, points }}
          />
        )}
        <footer className="app-footer">
          <span>
            HUELLITA <Heart size={10} fill="currentColor" /> HECHO CON AMOR
          </span>
          <span>Una demo que crece con vos y tu mejor amigo.</span>
        </footer>
      </main>
      <ImagePreview />
      <Analytics />
    </div>
  );
}
