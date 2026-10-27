import { useEffect, useState } from "react";
import { getSecuritySummary } from "../lib/adminApi";
import { useToast } from "../hooks/useToast";

export default function SecurityMonitorPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getSecuritySummary();
      setSummary(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de chargement du monitoring.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Sécurité & Surveillance Anti-Spam</h1>
          <div className="admin-page-desc">
            Visualisation des mécanismes de protection, des limitations de débit et de la prévention anti-abus.
          </div>
        </div>
        <button className="admin-btn admin-btn-secondary" type="button" onClick={loadData}>
          🔄 Actualiser
        </button>
      </div>

      {/* Security Architecture Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        <div className="admin-card" style={{ margin: 0, borderTop: "4px solid var(--blue)" }}>
          <strong style={{ fontSize: "1rem", display: "block", marginBottom: "8px" }}>
            🍯 Piège à Robots (Honeypot)
          </strong>
          <p style={{ fontSize: "0.88rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
            Un champ caché invisible pour les humains (<code>website</code>) est inséré dans le formulaire. Les robots automatisés le remplissent systématiquement et reçoivent une réponse factice positive sans qu'aucune donnée ne soit injectée en base.
          </p>
        </div>

        <div className="admin-card" style={{ margin: 0, borderTop: "4px solid var(--yellow)" }}>
          <strong style={{ fontSize: "1rem", display: "block", marginBottom: "8px" }}>
            🔒 Verrous Transactionnels (Locks)
          </strong>
          <p style={{ fontSize: "0.88rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
            Chaque soumission acquiert un verrou exclusif PostgreSQL (<code>pg_advisory_xact_lock</code>) sur le hash de l'adresse IP et de l'email, éliminant tout risque d'attaque par concurrence ou par rafale (race conditions).
          </p>
        </div>

        <div className="admin-card" style={{ margin: 0, borderTop: "4px solid var(--green)" }}>
          <strong style={{ fontSize: "1rem", display: "block", marginBottom: "8px" }}>
            ⏱️ Limitation de Débit Roulante
          </strong>
          <p style={{ fontSize: "0.88rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
            • Max <strong>1 candidature par email / 24h</strong>.<br />
            • Max <strong>5 candidatures par IP / 10 minutes</strong>.<br />
            • Max <strong>25 candidatures par IP / 24h</strong>.<br />
            En cas de dépassement, le code HTTP <code>429 Too Many Requests</code> est retourné.
          </p>
        </div>
      </div>

      {/* Live Monitoring Table */}
      <div className="admin-card">
        <div className="admin-card-title">
          <span>Journal d'activité du Rate-Limiter (Adresses masquées)</span>
          <span style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: "normal" }}>
            {summary?.last_24h_count ?? 0} tentatives suivies ces dernières 24h
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)" }}>
            Chargement des événements de sécurité…
          </div>
        ) : summary?.recent_events && summary.recent_events.length > 0 ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Horodatage</th>
                  <th>IP masquée (Respect de la vie privée)</th>
                  <th>Empreinte Email (Hash MD5 partiel)</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {summary.recent_events.map(ev => (
                  <tr key={ev.id}>
                    <td data-label="Horodatage">
                      {new Date(ev.submitted_at).toLocaleString("fr-FR")}
                    </td>
                    <td data-label="IP masquée">
                      <code>{ev.ip_masked}</code>
                    </td>
                    <td data-label="Empreinte Email">
                      <code>{ev.email_hash}***</code>
                    </td>
                    <td data-label="Statut">
                      <span className="admin-badge admin-badge-accepted">Enregistré dans la fenêtre roulante</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "24px 0", textAlign: "center", color: "var(--muted)" }}>
            Aucun événement suspect ou limitation enregistrée récemment.
          </div>
        )}
      </div>
    </div>
  );
}
