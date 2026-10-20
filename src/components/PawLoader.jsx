import { PawPrint } from "lucide-react";

/** Friendly, accessible loading state used across authentication and data screens. */
export default function PawLoader({ message = "Preparando todo para vos…", compact = false }) {
  return (
    <div className={`paw-loader${compact ? " paw-loader-compact" : ""}`} role="status" aria-live="polite">
      <div className="paw-trail" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((step) => (
          <span className="paw-step" key={step} style={{ "--paw-delay": `${step * 180}ms` }}>
            <PawPrint size={compact ? 17 : 24} strokeWidth={2.3} />
          </span>
        ))}
      </div>
      <span className="paw-loader-message">{message}</span>
    </div>
  );
}
