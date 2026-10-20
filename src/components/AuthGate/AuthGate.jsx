import { useState } from "react";
import { PawPrint, Mail, LockKeyhole, Sparkles } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, firebaseConfigured } from "../../firebase";
import PawLoader from "../PawLoader";
import "./AuthGate.css";
export default function AuthGate({ onDemo }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!firebaseConfigured)
        throw new Error(
          "Configurá Firebase con las instrucciones del README para crear una cuenta real. Mientras tanto podés probar la demo.",
        );
      if (mode === "register") {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        if (name.trim())
          await updateProfile(cred.user, { displayName: name.trim() });
      } else await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(
        err.code === "auth/invalid-credential"
          ? "Email o contraseña incorrectos."
          : err.code === "auth/email-already-in-use"
            ? "Ese email ya tiene una cuenta."
            : err.code === "auth/weak-password"
              ? "La contraseña debe tener al menos 6 caracteres."
              : err.message || "No se pudo iniciar sesión.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="auth-page">
      <div className="auth-art">
        <div className="auth-orbit orbit-one" />
        <div className="auth-orbit orbit-two" />
        <div className="auth-paw">
          <PawPrint size={42} />
        </div>
        <span className="auth-floating float-one">♡</span>
        <span className="auth-floating float-two">✦</span>
        <div className="auth-art-copy">
          <span>UN LUGAR PARA CADA HUELLITA</span>
          <h1>
            Su mundo,
            <br />
            lleno de amor.
          </h1>
          <p>
            Guardá sus recuerdos, cuidá su bienestar y ayudá a que siempre pueda
            volver a casa.
          </p>
        </div>
      </div>
      <section className="auth-panel">
        <div className="auth-brand">
          <span>
            <PawPrint size={20} />
          </span>
          <strong>
            huellita<span>.</span>
          </strong>
        </div>
        <div className="auth-form-wrap">
          {busy && <div className="auth-loading-overlay"><PawLoader compact message="Un momento, estamos preparando todo…" /></div>}
          <span className="auth-kicker">
            <Sparkles size={14} /> TU ESPACIO PELUDO
          </span>
          <h2>
            {mode === "login"
              ? "Qué lindo verte de nuevo"
              : "Empezá su historia"}
          </h2>
          <p>
            {mode === "login"
              ? "Entrá a tu espacio para seguir cuidando de quien más querés."
              : "Creá tu cuenta gratis y armá su ficha digital."}
          </p>
          <form onSubmit={submit}>
            {mode === "register" && (
              <label>
                Cómo te llamás
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="name"
                  required
                />
              </label>
            )}
            <label>
              <span>Email</span>
              <div className="auth-input">
                <Mail size={17} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vos@ejemplo.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>
            <label>
              <span>Contraseña</span>
              <div className="auth-input">
                <LockKeyhole size={17} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  required
                />
              </div>
            </label>
            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}
            <button className="auth-submit" disabled={busy}>
              {busy
                ? "Un momento…"
                : mode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
            </button>
          </form>
          <div className="auth-switch">
            {mode === "login"
              ? "¿Todavía no tenés cuenta?"
              : "¿Ya tenés cuenta?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "Registrate" : "Iniciá sesión"}
            </button>
          </div>
          <div className="auth-demo-note">
            <span>✧</span>
            <p>
              Las fichas QR públicas se pueden consultar sin iniciar sesión. El
              acceso es solo para administrar la información.
            </p>
          </div>
          {!firebaseConfigured && (
            <button className="auth-demo" onClick={onDemo}>
              Explorar demo sin cuenta
            </button>
          )}
        </div>
        <footer>HECHO CON AMOR, PATITAS Y MUCHOS RECUERDOS</footer>
      </section>
    </main>
  );
}
