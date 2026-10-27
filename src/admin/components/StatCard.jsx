export default function StatCard({ label, value, icon, color = "var(--blue)", meta }) {
  return (
    <div className="admin-stat-card" style={{ "--stat-color": color }}>
      <div className="admin-stat-header">
        <span className="admin-stat-label">{label}</span>
        <span className="admin-stat-icon">{icon}</span>
      </div>
      <div className="admin-stat-value">{value}</div>
      {meta && <div className="admin-stat-meta">{meta}</div>}
    </div>
  );
}
