import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { About, Departments, Events, Footer, Gallery, Hero, MarqueeBand } from "./components/Sections";
import JoinForm from "./components/JoinForm";
import { Cursor, Header, Loader, ScrollNav } from "./components/Layout";
import TeamSection from "./components/TeamSection";
import { useSiteMotion } from "./useSiteMotion";
import { usePublicClubData } from "./lib/publicData";

// Lazy load the admin dashboard so GSAP, Lenis, and canvas stay completely isolated from /admin
const AdminApp = lazy(() => import("./admin/AdminApp"));

function checkIsAdminRoute() {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return path.startsWith("/admin") || hash.startsWith("#/admin");
}

function AdminPreloader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper, #f7f5f0)",
        color: "var(--ink, #0e0f12)",
        fontFamily: "var(--body, sans-serif)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <img src="/assets/igc.png" alt="ISITCOM Google Club" style={{ width: "48px", marginBottom: "16px" }} />
        <div style={{ fontWeight: 600 }}>Chargement de l'espace administration…</div>
      </div>
    </div>
  );
}

function PublicSite({ dark, setDark }) {
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const finishLoading = useCallback(() => setLoaded(true), []);

  const publicData = usePublicClubData();

  useSiteMotion(loaded, setActiveSection);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="grain" aria-hidden="true" />
      {!loaded && <Loader onComplete={finishLoading} />}
      <Header dark={dark} onThemeToggle={() => setDark(v => !v)} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <ScrollNav active={activeSection} />
      <main id="main">
        <Hero />
        <MarqueeBand />
        <About mission={publicData.mission} counters={publicData.counters} />
        <Departments departments={publicData.departments} />
        <TeamSection team={publicData.team} />
        <Events events={publicData.events} />
        <Gallery gallery={publicData.gallery} />
        <JoinForm settings={publicData.settings} />
      </main>
      <Footer settings={publicData.settings} />
      <Cursor />
    </>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);
  const [isAdmin, setIsAdmin] = useState(checkIsAdminRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdmin(checkIsAdminRoute());
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.content = dark ? "#0e0f12" : "#f7f5f0";
    };
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  }, [dark]);

  if (isAdmin) {
    return (
      <Suspense fallback={<AdminPreloader />}>
        <AdminApp dark={dark} onThemeToggle={() => setDark(v => !v)} />
      </Suspense>
    );
  }

  return <PublicSite dark={dark} setDark={setDark} />;
}
