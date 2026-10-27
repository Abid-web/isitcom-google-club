import { useEffect, useState } from "react";
import "./admin.css";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ToastProvider } from "./hooks/useToast";
import AdminLayout from "./components/AdminLayout";
import LoginPage from "./pages/LoginPage";
import DashboardOverview from "./pages/DashboardOverview";
import ApplicationsPage from "./pages/ApplicationsPage";
import EventsPage from "./pages/EventsPage";
import TeamPage from "./pages/TeamPage";
import ContentPage from "./pages/ContentPage";
import GalleryPage from "./pages/GalleryPage";
import SettingsPage from "./pages/SettingsPage";
import SecurityMonitorPage from "./pages/SecurityMonitorPage";

function parseAdminPage() {
  const hash = window.location.hash || "";
  const match = hash.match(/^#\/admin\/?([a-zA-Z0-9_-]*)/);
  if (match && match[1]) {
    return match[1];
  }
  return "overview";
}

function AdminRouter({ dark, onThemeToggle }) {
  const { isAuthenticated, loading } = useAuth();
  const [activePage, setActivePage] = useState(parseAdminPage);

  useEffect(() => {
    const onHashChange = () => {
      setActivePage(parseAdminPage());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleNavigate = pageId => {
    setActivePage(pageId);
    window.location.hash = `#/admin/${pageId === "overview" ? "" : pageId}`;
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--paper)",
          color: "var(--ink)",
          fontFamily: "var(--body)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <img src="/assets/igc.png" alt="ISITCOM Google Club" style={{ width: "48px", marginBottom: "16px" }} />
          <div>Vérification des accès administrateur…</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AdminLayout
      activePage={activePage}
      setActivePage={handleNavigate}
      dark={dark}
      onThemeToggle={onThemeToggle}
    >
      {activePage === "overview" && <DashboardOverview setActivePage={handleNavigate} />}
      {activePage === "applications" && <ApplicationsPage />}
      {activePage === "events" && <EventsPage />}
      {activePage === "team" && <TeamPage />}
      {activePage === "content" && <ContentPage />}
      {activePage === "gallery" && <GalleryPage />}
      {activePage === "security" && <SecurityMonitorPage />}
      {activePage === "settings" && <SettingsPage />}
    </AdminLayout>
  );
}

export default function AdminApp({ dark, onThemeToggle }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminRouter dark={dark} onThemeToggle={onThemeToggle} />
      </ToastProvider>
    </AuthProvider>
  );
}
