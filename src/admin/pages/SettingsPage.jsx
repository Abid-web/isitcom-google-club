import { useEffect, useState } from "react";
import { getAdminUsers, getSiteSettings, updateSiteSettings } from "../lib/adminApi";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    applications_open: true,
    applications_closed_message: "",
    contact_email: "",
    instagram_url: "",
    linkedin_url: "",
    facebook_url: "",
  });
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, usersData] = await Promise.all([
        getSiteSettings().catch(() => null),
        getAdminUsers().catch(() => []),
      ]);
      if (settingsData) {
        setSettings({
          applications_open: Boolean(settingsData.applications_open),
          applications_closed_message: settingsData.applications_closed_message || "",
          contact_email: settingsData.contact_email || "",
          instagram_url: settingsData.instagram_url || "",
          linkedin_url: settingsData.linkedin_url || "",
          facebook_url: settingsData.facebook_url || "",
        });
      }
      setAdminUsers(usersData || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de chargement des réglages.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSiteSettings(settings);
      showToast("Paramètres du club enregistrés avec succès !", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur d'enregistrement.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
        Chargement des paramètres…
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Paramètres Généraux du Club</h1>
          <div className="admin-page-desc">
            Contrôlez les campagnes d'adhésion, les coordonnées publiques et les comptes d'accès administrateurs.
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Applications Open/Close Switch */}
        <div className="admin-card">
          <div className="admin-card-title">
            <span>Campagne de Recrutement & Inscriptions</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <strong>Ouverture des candidatures publiques</strong>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "2px" }}>
                Lorsque cet interrupteur est désactivé, le formulaire de recrutement est bloqué et affiche le message de fermeture.
              </div>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "50px", height: "26px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.applications_open}
                onChange={e => setSettings({ ...settings, applications_open: e.target.checked })}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: settings.applications_open ? "var(--green)" : "var(--line)",
                  borderRadius: "26px",
                  transition: "background-color 0.2s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: settings.applications_open ? "26px" : "3px",
                    top: "3px",
                    width: "20px",
                    height: "20px",
                    backgroundColor: "#fff",
                    borderRadius: "50%",
                    transition: "left 0.2s",
                  }}
                />
              </span>
            </label>
          </div>

          {!settings.applications_open && (
            <div className="admin-field" style={{ marginTop: "16px" }}>
              <label className="admin-label">Message d'information pour les candidats</label>
              <textarea
                className="admin-textarea"
                rows={3}
                value={settings.applications_closed_message}
                onChange={e => setSettings({ ...settings, applications_closed_message: e.target.value })}
                placeholder="Ex : Les candidatures sont actuellement closes pour ce semestre…"
              />
            </div>
          )}
        </div>

        {/* Contact and Social Links */}
        <div className="admin-card">
          <div className="admin-card-title">
            <span>Coordonnées & Réseaux Sociaux</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-field">
              <label className="admin-label">Email officiel du club</label>
              <input
                className="admin-input"
                type="email"
                value={settings.contact_email}
                onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
                placeholder="hello@isitcomgoogleclub.tn"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Lien Instagram</label>
              <input
                className="admin-input"
                type="url"
                value={settings.instagram_url}
                onChange={e => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://www.instagram.com/isitcomgoogleclub2/"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Lien LinkedIn</label>
              <input
                className="admin-input"
                type="url"
                value={settings.linkedin_url}
                onChange={e => setSettings({ ...settings, linkedin_url: e.target.value })}
                placeholder="https://www.linkedin.com/company/isitcom-google-club/"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Lien Facebook (optionnel)</label>
              <input
                className="admin-input"
                type="url"
                value={settings.facebook_url}
                onChange={e => setSettings({ ...settings, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
            <button className="admin-btn admin-btn-primary" type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </form>

      {/* Admin Users & Permissions */}
      <div className="admin-card">
        <div className="admin-card-title">
          <span>Comptes Administrateurs & Accès au Dashboard</span>
        </div>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 0 }}>
          Seuls les comptes répertoriés dans la table sécurisée <code>public.admin_users</code> peuvent se connecter au dashboard.
        </p>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom / Email</th>
                <th>Rôle</th>
                <th>Date d'ajout</th>
                <th>Dernière connexion</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map(u => (
                <tr key={u.id}>
                  <td data-label="Nom / Email">
                    <strong>{u.full_name || u.email.split("@")[0]}</strong>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{u.email}</div>
                  </td>
                  <td data-label="Rôle">
                    <span className={`admin-badge ${u.role === "admin" ? "admin-badge-new" : "admin-badge-reviewing"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td data-label="Date d'ajout">
                    {new Date(u.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td data-label="Dernière connexion">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("fr-FR") : "Jamais"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "16px", padding: "12px 16px", background: "rgba(var(--paper-rgb), 0.7)", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", color: "var(--muted)" }}>
          💡 <strong>Astuce sécurité :</strong> Pour créer un nouvel administrateur, créez le compte dans <em>Supabase Auth</em>, puis insérez son identifiant dans <code>admin_users</code> avec le rôle <code>admin</code> ou <code>editor</code>.
        </div>
      </div>
    </div>
  );
}
