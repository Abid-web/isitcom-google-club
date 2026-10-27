import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { id: "overview", label: "Vue d'ensemble", icon: "📊", accent: "var(--blue)" },
  { id: "applications", label: "Candidatures", icon: "📝", accent: "var(--yellow)" },
  { id: "events", label: "Événements", icon: "📅", accent: "var(--green)" },
  { id: "team", label: "Bureau & Équipe", icon: "👥", accent: "var(--red)" },
  { id: "content", label: "Contenu & Stats", icon: "✨", accent: "var(--blue)" },
  { id: "gallery", label: "Galerie Média", icon: "🖼️", accent: "var(--yellow)" },
  { id: "security", label: "Sécurité & Anti-Spam", icon: "🛡️", accent: "var(--red)" },
  { id: "settings", label: "Paramètres Club", icon: "⚙️", accent: "var(--green)" },
];

export default function AdminLayout({ activePage, setActivePage, dark, onThemeToggle, children }) {
  const { admin, user, logout, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeNav = NAV_ITEMS.find(item => item.id === activePage) || NAV_ITEMS[0];

  return (
    <div className="admin-root">
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="admin-drawer-backdrop"
          style={{ zIndex: 95 }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${mobileMenuOpen ? " open" : ""}`}>
        <div className="admin-sidebar-header">
          <a className="admin-brand" href="#home" title="Retour au site public">
            <img src="/assets/igc.png" alt="ISITCOM Google Club" />
            <span className="admin-brand-text">
              ISITCOM<br />GOOGLE CLUB
              <span className="admin-brand-tag">ADMIN</span>
            </span>
          </a>
        </div>

        <nav className="admin-nav" aria-label="Navigation administration">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              type="button"
              className={`admin-nav-item${activePage === item.id ? " active" : ""}`}
              style={{ "--nav-accent": item.accent }}
              onClick={() => {
                setActivePage(item.id);
                setMobileMenuOpen(false);
              }}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-user-avatar">
              {(admin?.full_name || user?.email || "A")[0].toUpperCase()}
            </div>
            <div className="admin-user-info">
              <div className="admin-user-name" title={admin?.full_name || user?.email}>
                {admin?.full_name || user?.email?.split("@")[0]}
              </div>
              <div className="admin-user-role">{role || "Admin"}</div>
            </div>
          </div>
          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            type="button"
            onClick={logout}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(open => !open)}
              aria-label="Ouvrir le menu"
            >
              ☰
            </button>
            <div className="admin-breadcrumbs">
              <span>Admin</span>
              <span>/</span>
              <span>{activeNav.label}</span>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <a
              className="admin-btn admin-btn-secondary admin-btn-sm"
              href="#home"
              target="_blank"
              rel="noopener noreferrer"
              title="Voir le site en direct dans un nouvel onglet"
            >
              Voir le site ↗
            </a>
            <button
              className="admin-btn-icon"
              type="button"
              onClick={onThemeToggle}
              title={`Passer au mode ${dark ? "clair" : "sombre"}`}
              aria-label="Basculer le thème"
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
