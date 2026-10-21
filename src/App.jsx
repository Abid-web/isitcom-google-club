import { useCallback, useEffect, useState } from "react";
import { About, Departments, Events, Footer, Gallery, Hero, MarqueeBand } from "./components/Sections";
import JoinForm from "./components/JoinForm";
import { Cursor, Header, Loader, ScrollNav } from "./components/Layout";
import TeamSection from "./components/TeamSection";
import { useSiteMotion } from "./useSiteMotion";

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const finishLoading = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document.querySelector('meta[name="theme-color"]').content = dark ? "#0e0f12" : "#f7f5f0";
    };
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) document.startViewTransition(apply);
    else apply();
  }, [dark]);

  useSiteMotion(loaded, setActiveSection);

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="grain" aria-hidden="true" />
    {!loaded && <Loader onComplete={finishLoading} />}
    <Header dark={dark} onThemeToggle={() => setDark(value => !value)} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    <ScrollNav active={activeSection} />
    <main id="main"><Hero /><MarqueeBand /><About /><Departments /><TeamSection /><Events /><Gallery /><JoinForm /></main>
    <Footer />
    <Cursor />
  </>;
}
