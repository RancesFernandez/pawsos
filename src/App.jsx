import { useEffect, useState } from 'react';
import { Heart, Menu, X } from 'lucide-react';
import { starterPet, starterEntries } from './data/initialData';
import { useLocalStorage } from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar/Sidebar';
import Topbar from './components/Topbar/Topbar';
import Dashboard from './components/Dashboard/Dashboard';
import PetProfile from './components/PetProfile/PetProfile';
import QRCard from './components/QRCard/QRCard';
import Diary from './components/Diary/Diary';
import PublicPet from './components/PublicPet/PublicPet';
import './App.css';

const pageMeta = {
  home: { title: 'Tu lugar feliz', subtitle: 'Un poquito de amor, organizado en un solo lugar.' },
  profile: { title: 'Su ficha personal', subtitle: 'Todo lo que hace única a tu mascota.' },
  qr: { title: 'Su placa QR', subtitle: 'Una forma sencilla de ayudarla a volver a casa.' },
  diary: { title: 'Diario de huellitas', subtitle: 'Guardá los momentos que hacen su historia.' }
};

export default function App() {
  const [pet, setPet] = useLocalStorage('huellita-pet-v1', starterPet);
  const [entries, setEntries] = useLocalStorage('huellita-entries-v1', starterEntries);
  const [active, setActive] = useState('home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);

  useEffect(() => {
    const syncRoute = () => {
      const match = window.location.hash.match(/^#\/pet\/(.+)$/);
      setPublicProfile(Boolean(match));
    };
    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  const navigate = (page) => {
    setActive(page);
    setMobileNavOpen(false);
    if (window.location.hash.startsWith('#/pet/')) history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/${page === 'home' ? '' : page}`);
  };
  const addMemory = () => { setActive('diary'); setMobileNavOpen(false); window.setTimeout(() => document.querySelector('.diary-toolbar .primary-button')?.click(), 80); };
  const meta = pageMeta[active] || pageMeta.home;

  if (publicProfile) return <PublicPet pet={pet} onBack={() => { history.replaceState(null, '', window.location.pathname + window.location.search); setPublicProfile(false); setActive('home'); }} />;

  return <div className="app-shell">
    <Sidebar active={active} onNavigate={navigate} pet={pet}/>
    {mobileNavOpen && <div className="mobile-nav-overlay" onClick={() => setMobileNavOpen(false)}><button className="mobile-nav-close" aria-label="Cerrar menú" onClick={() => setMobileNavOpen(false)}><X size={20}/></button><Sidebar active={active} onNavigate={navigate} pet={pet}/></div>}
    <main className="main-content">
      <Topbar title={meta.title} subtitle={meta.subtitle} onAdd={addMemory} onMobileMenu={() => setMobileNavOpen(true)}/>
      {active === 'home' && <Dashboard pet={pet} entries={entries} onNavigate={navigate}/>}
      {active === 'profile' && <PetProfile pet={pet} setPet={setPet} onNavigate={navigate}/>}
      {active === 'qr' && <QRCard pet={pet} onNavigate={navigate}/>}
      {active === 'diary' && <Diary pet={pet} entries={entries} setEntries={setEntries}/>}
      <footer className="app-footer"><span>HUELLITA <Heart size={10} fill="currentColor"/> HECHO CON AMOR</span><span>Una demo que crece con vos y tu mejor amigo.</span></footer>
    </main>
  </div>;
}