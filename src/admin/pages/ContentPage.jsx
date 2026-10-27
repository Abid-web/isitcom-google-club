import { useEffect, useState } from "react";
import { getDepartments, getSiteSettings, getSiteStats, updateDepartment, updateSiteSettings, updateSiteStat } from "../lib/adminApi";
import { useToast } from "../hooks/useToast";

export default function ContentPage() {
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState([]);
  const [mission, setMission] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingDept, setSavingDept] = useState(null);
  const [savingStat, setSavingStat] = useState(null);
  const [savingMission, setSavingMission] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptData, statData, settingsData] = await Promise.all([
        getDepartments().catch(() => []),
        getSiteStats().catch(() => []),
        getSiteSettings().catch(() => null),
      ]);
      setDepartments(deptData || []);
      setStats(statData || []);
      setMission(settingsData?.mission_text || "");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de chargement du contenu.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveDepartment = async dept => {
    setSavingDept(dept.id);
    try {
      await updateDepartment(dept.id, {
        act: dept.act,
        title: dept.title,
        copy: dept.copy,
        chips: typeof dept.chips === "string" ? dept.chips.split(",").map(c => c.trim()).filter(Boolean) : dept.chips,
        color: dept.color,
        accent: dept.accent,
      });
      showToast(`Département « ${dept.title} » mis à jour !`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de sauvegarde.", "error");
    } finally {
      setSavingDept(null);
    }
  };

  const handleSaveStat = async stat => {
    setSavingStat(stat.id);
    try {
      await updateSiteStat(stat.id, {
        value: Number(stat.value),
        suffix: stat.suffix,
        label: stat.label,
      });
      showToast(`Compteur « ${stat.label} » mis à jour !`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de sauvegarde.", "error");
    } finally {
      setSavingStat(null);
    }
  };

  const handleSaveMission = async () => {
    setSavingMission(true);
    try {
      await updateSiteSettings({ mission_text: mission });
      showToast("Déclaration de mission mise à jour !", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de mise à jour.", "error");
    } finally {
      setSavingMission(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
        Chargement des contenus du site…
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Contenu & Chiffres Clés</h1>
          <div className="admin-page-desc">
            Modifiez directement la mission du club, les compteurs d'impact et les textes des départements.
          </div>
        </div>
      </div>

      {/* Mission Text */}
      <div className="admin-card">
        <div className="admin-card-title">
          <span>Mission & Vision du Club</span>
        </div>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 0 }}>
          Ce texte s'affiche en grand sur la section « About / Story » du site public avec l'animation de défilement mot par mot.
        </p>
        <div className="admin-field">
          <textarea
            className="admin-textarea"
            rows={3}
            value={mission}
            onChange={e => setMission(e.target.value)}
          />
        </div>
        <button
          className="admin-btn admin-btn-primary admin-btn-sm"
          type="button"
          onClick={handleSaveMission}
          disabled={savingMission}
        >
          {savingMission ? "Enregistrement…" : "Enregistrer la mission"}
        </button>
      </div>

      {/* Impact Counters */}
      <div className="admin-card">
        <div className="admin-card-title">
          <span>Chiffres Clés (Compteurs animés)</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {stats.map(stat => (
            <div key={stat.id} style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "16px", background: "var(--paper)" }}>
              <div className="admin-field">
                <label className="admin-label">Libellé</label>
                <input
                  className="admin-input"
                  value={stat.label}
                  onChange={e => {
                    const next = stats.map(s => (s.id === stat.id ? { ...s, label: e.target.value } : s));
                    setStats(next);
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "8px" }} className="admin-field">
                <div>
                  <label className="admin-label">Valeur</label>
                  <input
                    className="admin-input"
                    type="number"
                    value={stat.value}
                    onChange={e => {
                      const next = stats.map(s => (s.id === stat.id ? { ...s, value: e.target.value } : s));
                      setStats(next);
                    }}
                  />
                </div>
                <div>
                  <label className="admin-label">Suffixe</label>
                  <input
                    className="admin-input"
                    value={stat.suffix}
                    onChange={e => {
                      const next = stats.map(s => (s.id === stat.id ? { ...s, suffix: e.target.value } : s));
                      setStats(next);
                    }}
                  />
                </div>
              </div>
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                type="button"
                style={{ width: "100%" }}
                onClick={() => handleSaveStat(stat)}
                disabled={savingStat === stat.id}
              >
                {savingStat === stat.id ? "Sauvegarde…" : "Mettre à jour"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Departments */}
      <div className="admin-card">
        <div className="admin-card-title">
          <span>Départements (Les 3 Actes)</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {departments.map(dept => {
            const chipsStr = Array.isArray(dept.chips) ? dept.chips.join(", ") : dept.chips || "";
            return (
              <div
                key={dept.id}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-sm)",
                  padding: "20px",
                  background: "var(--paper)",
                  borderLeft: `4px solid ${dept.accent || "var(--blue)"}`,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-field">
                    <label className="admin-label">Acte</label>
                    <input
                      className="admin-input"
                      value={dept.act}
                      onChange={e => {
                        const next = departments.map(d => (d.id === dept.id ? { ...d, act: e.target.value } : d));
                        setDepartments(next);
                      }}
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Titre du Pôle</label>
                    <input
                      className="admin-input"
                      value={dept.title}
                      onChange={e => {
                        const next = departments.map(d => (d.id === dept.id ? { ...d, title: e.target.value } : d));
                        setDepartments(next);
                      }}
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label className="admin-label">Description / Accroche</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    value={dept.copy}
                    onChange={e => {
                      const next = departments.map(d => (d.id === dept.id ? { ...d, copy: e.target.value } : d));
                      setDepartments(next);
                    }}
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Mots-clés / Badges (séparés par une virgule)</label>
                  <input
                    className="admin-input"
                    value={chipsStr}
                    onChange={e => {
                      const next = departments.map(d => (d.id === dept.id ? { ...d, chips: e.target.value } : d));
                      setDepartments(next);
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    type="button"
                    onClick={() => handleSaveDepartment(dept)}
                    disabled={savingDept === dept.id}
                  >
                    {savingDept === dept.id ? "Sauvegarde…" : `Sauvegarder ${dept.title}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
