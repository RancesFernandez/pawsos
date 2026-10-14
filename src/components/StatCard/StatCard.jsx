import "./StatCard.css";

export default function StatCard({
  icon: Icon,
  label,
  value,
  note,
  tone = "green",
}) {
  return (
    <article className={`stat-card tone-${tone}`}>
      <div className="stat-top">
        <span className="stat-icon">
          <Icon size={18} />
        </span>
        <span className="stat-note">{note}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </article>
  );
}
