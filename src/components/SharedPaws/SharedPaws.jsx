import { useCallback, useEffect, useState } from "react";
import {
  Heart,
  RefreshCw,
  PawPrint,
  MessageCircleHeart,
  Sparkles,
} from "lucide-react";

import {
  loadSharedPaws,
  loadPostReactions,
  setPostReaction,
} from "../../services/firebaseData";
import { openImagePreview } from "../../utils/imagePreview";
import "./SharedPaws.css";

const emojis = ["❤️", "🥰", "🐾", "😂", "👏"];
const labels = {
  walk: "Paseo",
  food: "Comida",
  health: "Bienestar",
  memory: "Recuerdo",
};
export default function SharedPaws({ user, firebaseConfigured }) {
  const [posts, setPosts] = useState([]);
  const [reactions, setReactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const refresh = useCallback(async () => {
    if (!firebaseConfigured) {
      setPosts([]);
      setLoading(false);
      setError(
        "La comunidad necesita conectar Firebase para compartir publicaciones entre usuarios.",
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const items = await loadSharedPaws();
      setPosts(items);
      const loaded = await loadPostReactions(items.map((p) => p.id));
      setReactions(Object.fromEntries(loaded));
    } catch (e) {
      console.error("No se pudo cargar Huellitas compartidas", e);
      setError(
        "No pudimos cargar la comunidad. Revisá las reglas de Firestore y volvé a intentar.",
      );
    } finally {
      setLoading(false);
    }
  }, [firebaseConfigured]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const react = async (post, emoji) => {
    if (!user?.uid) {
      setError("Iniciá sesión para reaccionar a las huellitas.");
      return;
    }
    const existing = (reactions[post.id] || []).find(
      (r) => r.uid === user.uid,
    )?.emoji;
    const next = existing === emoji ? null : emoji;
    setBusy(post.id);
    try {
      await setPostReaction(post.id, user.uid, next);
      setReactions((prev) => {
        const list = (prev[post.id] || []).filter((r) => r.uid !== user.uid);
        if (next) list.push({ uid: user.uid, emoji: next });
        return { ...prev, [post.id]: list };
      });
    } catch (e) {
      console.error(e);
      setError(
        "No se pudo guardar tu reacción. Revisá las reglas de Firestore.",
      );
    } finally {
      setBusy("");
    }
  };
  return (
    <section className="shared-paws-page">
      <header className="shared-paws-hero">
        <div className="shared-paws-icon">
          <PawPrint size={27} />
        </div>
        <div>
          <span className="section-kicker">UNA COMUNIDAD LLENA DE AMOR</span>
          <h2>
            Huellitas compartidas <span>♡</span>
          </h2>
          <p>
            Momentos que sus familias eligieron compartir. Cada recuerdo suma
            cariño.
          </p>
        </div>
        <button
          className="shared-refresh"
          onClick={refresh}
          title="Actualizar comunidad"
          aria-label="Actualizar comunidad"
        >
          <RefreshCw size={17} />
        </button>
      </header>
      {error && (
        <div className="shared-notice" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <div className="shared-empty">
          <PawPrint size={26} />
          <p>Buscando huellitas compartidas…</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="shared-empty">
          <MessageCircleHeart size={31} />
          <h3>La comunidad está esperando su primera huellita</h3>
          <p>
            Desde tu Diario de huellitas, elegí qué recuerdo querés compartir.
            Nada se publica automáticamente.
          </p>
        </div>
      ) : (
        <div className="shared-feed">
          {posts.map((post) => {
            const list = reactions[post.id] || [];
            const mine = list.find((r) => r.uid === user?.uid)?.emoji;
            const counts = emojis
              .map((emoji) => ({
                emoji,
                count: list.filter((r) => r.emoji === emoji).length,
              }))
              .filter((x) => x.count);
            return (
              <article className="shared-post" key={post.id}>
                <div className="shared-post-author">
                  <div className="shared-avatar">
                    {post.petPhoto ? (
                      <img src={post.petPhoto} alt="" />
                    ) : (
                      <PawPrint size={18} />
                    )}
                  </div>
                  <div>
                    <strong>{post.petName || "Una mascota"}</strong>
                    <span>
                      por {post.authorName || "Una familia de Huellita"} ·{" "}
                      {new Date(
                        post.createdAt || post.entryDate || Date.now(),
                      ).toLocaleDateString("es-UY", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="shared-type">
                    {labels[post.type] || "Recuerdo"}
                  </span>
                </div>
                <div className="shared-post-body">
                  <h3>{post.title}</h3>
                  {post.note && <p>{post.note}</p>}

                  {post.photo && (
                    <img
                      className="shared-post-photo image-zoomable"
                      src={post.photo}
                      alt={`Foto compartida: ${post.title}`}
                      loading="lazy"
                      role="button"
                      tabIndex={0}
                      title="Ver imagen ampliada"
                      onClick={() =>
                        openImagePreview(
                          post.photo,
                          post.title || "Foto compartida",
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openImagePreview(
                            post.photo,
                            post.title || "Foto compartida",
                          );
                        }
                      }}
                    />
                  )}
                </div>
                <div className="shared-reaction-summary">
                  {counts.length ? (
                    counts.map((x) => (
                      <span key={x.emoji}>
                        {x.emoji} {x.count}
                      </span>
                    ))
                  ) : (
                    <span>Sé la primera persona en dejar cariño</span>
                  )}
                </div>
                <div
                  className="shared-reaction-actions"
                  aria-label="Reaccionar a esta publicación"
                >
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      disabled={busy === post.id}
                      className={mine === emoji ? "chosen" : ""}
                      onClick={() => react(post, emoji)}
                      aria-pressed={mine === emoji}
                      title={`Reaccionar con ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
      <p className="shared-privacy-note">
        <Heart size={14} /> Solo se muestran los recuerdos que cada persona
        publica voluntariamente. Los registros privados del diario siguen siendo
        privados.
      </p>
    </section>
  );
}
