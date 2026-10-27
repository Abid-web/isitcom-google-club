import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const isLocked = Date.now() < lockedUntil;

  const handleSubmit = async e => {
    e.preventDefault();
    if (isLocked || loading) return;

    if (!email.trim() || !password) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= 4) {
        setLockedUntil(Date.now() + 30_000); // 30s lock
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <img className="admin-login-logo" src="/assets/igc.png" alt="ISITCOM Google Club" />
        <h1 style={{ fontFamily: "var(--display)", fontSize: "1.45rem", margin: "0 0 8px 0" }}>
          Espace Administration
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.88rem", margin: "0 0 24px 0" }}>
          Connectez-vous avec vos identifiants du bureau du club.
        </p>

        {error && (
          <div
            style={{
              background: "rgba(234, 67, 53, 0.12)",
              color: "var(--red)",
              border: "1px solid rgba(234, 67, 53, 0.25)",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              marginBottom: "16px",
              textAlign: "left",
            }}
          >
            {error}
          </div>
        )}

        {isLocked && (
          <div
            style={{
              background: "rgba(251, 188, 5, 0.15)",
              color: "#b07a00",
              border: "1px solid rgba(251, 188, 5, 0.3)",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              marginBottom: "16px",
              textAlign: "left",
            }}
          >
            Trop de tentatives infructueuses. Veuillez patienter 30 secondes avant de réessayer.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-field" style={{ textAlign: "left" }}>
            <label className="admin-label" htmlFor="admin-email">
              Adresse email
            </label>
            <input
              id="admin-email"
              className="admin-input"
              type="email"
              autoComplete="email"
              placeholder="khalil@isitcomgoogleclub.tn"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading || isLocked}
              required
            />
          </div>

          <div className="admin-field" style={{ textAlign: "left" }}>
            <label className="admin-label" htmlFor="admin-password">
              Mot de passe
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="admin-password"
                className="admin-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading || isLocked}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          <button
            className="admin-btn admin-btn-primary"
            type="submit"
            style={{ width: "100%", marginTop: "12px" }}
            disabled={loading || isLocked}
          >
            {loading ? "Connexion en cours…" : "Se connecter au Dashboard"}
          </button>
        </form>

        <div style={{ marginTop: "24px", fontSize: "0.82rem", color: "var(--muted)" }}>
          <a href="#home" style={{ color: "var(--muted)", textDecoration: "none" }}>
            ← Retourner sur le site public
          </a>
        </div>
      </div>
    </div>
  );
}
