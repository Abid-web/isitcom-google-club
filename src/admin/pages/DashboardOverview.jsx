import { useEffect, useState } from "react";
import { getAuditLogs, getDashboardKPIs } from "../lib/adminApi";
import StatCard from "../components/StatCard";
import TrendChart from "../components/TrendChart";

export default function DashboardOverview({ setActivePage }) {
  const [kpis, setKpis] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [kpiData, logs] = await Promise.all([
          getDashboardKPIs().catch(() => null),
          getAuditLogs(8).catch(() => []),
        ]);
        setKpis(kpiData);
        setAuditLogs(logs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement des statistiques.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)" }}>
        Chargement des métriques du dashboard…
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Tableau de Bord</h1>
          <div className="admin-page-desc">
            Vue d'ensemble en temps réel des activités et candidatures de l'ISITCOM Google Club.
          </div>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          type="button"
          onClick={() => setActivePage("applications")}
        >
          Consulter les candidatures ↗
        </button>
      </div>

      {error && (
        <div className="admin-card" style={{ borderLeft: "4px solid var(--red)" }}>
          <p style={{ margin: 0, color: "var(--red)" }}>{error}</p>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="admin-stats-grid">
        <StatCard
          label="Total Candidatures"
          value={kpis?.total_applications ?? 0}
          icon="📝"
          color="var(--blue)"
          meta={`${kpis?.new_applications ?? 0} en attente de révision`}
        />
        <StatCard
          label="Nouvelles"
          value={kpis?.new_applications ?? 0}
          icon="✨"
          color="var(--yellow)"
          meta="À traiter par le bureau"
        />
        <StatCard
          label="Admis / Acceptés"
          value={kpis?.accepted_applications ?? 0}
          icon="✓"
          color="var(--green)"
          meta={`Taux d'acceptation : ${kpis?.acceptance_rate ?? 0}%`}
        />
        <StatCard
          label="Événements Prévus"
          value={kpis?.upcoming_events ?? 0}
          icon="📅"
          color="var(--red)"
          meta="Ateliers et rencontres"
        />
        <StatCard
          label="Membres du Bureau"
          value={kpis?.team_members ?? 0}
          icon="👥"
          color="var(--blue)"
          meta="Actifs sur le site"
        />
      </div>

      {/* Activity Chart & Department Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", marginBottom: "28px" }}>
        <div className="admin-card" style={{ margin: 0 }}>
          <div className="admin-card-title">
            <span>Flux des candidatures (30 derniers jours)</span>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: "normal" }}>Mis à jour en direct</span>
          </div>
          <TrendChart data={kpis?.daily_trend || []} />
        </div>

        <div className="admin-card" style={{ margin: 0 }}>
          <div className="admin-card-title">
            <span>Répartition par département souhaité</span>
          </div>
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {kpis?.department_distribution && kpis.department_distribution.length > 0 ? (
              kpis.department_distribution.map(item => {
                const total = Math.max(1, kpis.total_applications || 1);
                const percent = Math.round((item.count / total) * 100);
                const color =
                  item.department === "Technical"
                    ? "var(--blue)"
                    : item.department === "Marketing"
                    ? "var(--red)"
                    : item.department === "Communication"
                    ? "var(--yellow)"
                    : "var(--green)";

                return (
                  <div key={item.department}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "4px" }}>
                      <strong>{item.department}</strong>
                      <span style={{ color: "var(--muted)" }}>{item.count} ({percent}%)</span>
                    </div>
                    <div style={{ height: "8px", background: "rgba(var(--paper-rgb), 0.8)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${percent}%`, background: color, borderRadius: "4px" }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>
                Aucune candidature enregistrée pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Log */}
      <div className="admin-card">
        <div className="admin-card-title">
          <span>Activité récente du bureau</span>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: "normal" }}>Journal d'audit</span>
        </div>
        {auditLogs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {auditLogs.map(log => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(var(--paper-rgb), 0.5)",
                  fontSize: "0.85rem",
                }}
              >
                <div>
                  <strong>{log.user_email || "Admin"}</strong> a effectué l'action{" "}
                  <code style={{ background: "var(--paper)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--line)" }}>
                    {log.action}
                  </code>{" "}
                  sur {log.target_table}
                </div>
                <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                  {new Date(log.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "var(--muted)", textAlign: "center", padding: "16px 0" }}>
            Aucun événement d'audit récent.
          </div>
        )}
      </div>
    </div>
  );
}
