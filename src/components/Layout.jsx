import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const navItems = [
  ["About", "#about"], ["Departments", "#departments"], ["Team", "#team"], ["Events", "#events"],
];

export function Loader({ onComplete }) {
  const root = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.body.classList.add("loading");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finish = () => {
      if (!root.current || root.current.dataset.done) return;
      root.current.dataset.done = "true";
      const done = () => {
        document.body.classList.remove("loading");
        onComplete();
      };
      if (reduce) return done();
      gsap.timeline({ onComplete: done })
        .to(root.current.querySelector(".loader-inner"), { opacity: 0, duration: .25 })
        .to(root.current.querySelector(".loader-panel:first-child"), { xPercent: -100, duration: .8, ease: "power4.inOut" }, "split")
        .to(root.current.querySelector(".loader-panel:nth-child(2)"), { xPercent: 100, duration: .8, ease: "power4.inOut" }, "split");
    };
    if (reduce) { finish(); return; }
    const meter = { value: 0 };
    const timeline = gsap.timeline({ onComplete: finish })
      .to(root.current.querySelector(".loader-mark"), { opacity: 1, y: 0, scale: 1, duration: .65, ease: "expo.out" })
      .from(root.current.querySelector(".loader-cap"), { y: -180, rotation: -30, duration: .8, ease: "bounce.out" }, "<")
      .to(meter, { value: 100, duration: 1.8, ease: "power2.inOut", onUpdate: () => setCount(Math.round(meter.value)) }, "<.2")
      .to({}, { duration: .2 });
    return () => { timeline.kill(); document.body.classList.remove("loading"); };
  }, [onComplete]);

  return (
    <div className="loader" aria-label="Loading ISITCOM Google Club" role="status" ref={root}>
      <div className="loader-panel" /><div className="loader-panel" />
      <div className="loader-inner"><div className="loader-lockup"><div className="loader-mark"><span className="loader-cap" aria-hidden="true" /><img src="/assets/IGC.svg" alt="ISITCOM Google Club" /></div><div className="loader-count"><span>{count}</span>%</div></div></div>
      <button className="loader-skip" type="button" onClick={() => { root.current?.setAttribute("data-done", "true"); onComplete(); document.body.classList.remove("loading"); }}>Skip intro</button>
    </div>
  );
}

export function Header({ dark, onThemeToggle, menuOpen, setMenuOpen }) {
  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  return <>
    <header className="site-header">
      <div className="shell nav">
        <a className="brand" href="#home" aria-label="ISITCOM Google Club home"><img src="/assets/IGC.svg" alt="" /><span>ISITCOM<br />GOOGLE CLUB</span></a>
        <nav className="nav-links" aria-label="Primary navigation">{navItems.map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>
        <div className="nav-actions">
          <button className="icon-btn theme-toggle" type="button" aria-label={`Switch to ${dark ? "light" : "dark"} theme`} aria-pressed={dark} onClick={onThemeToggle}><span className="theme-icon" aria-hidden="true" /></button>
          <a className="button magnetic" href="#join" data-cursor="Join">Join us <span className="button-arrow">↗</span></a>
          <button className="icon-btn menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(v => !v)}><span className="menu-lines" aria-hidden="true" /></button>
        </div>
      </div>
    </header>
    <aside className="mobile-menu" id="mobile-menu" aria-label="Mobile navigation" aria-hidden={!menuOpen}>
      <nav>{[...navItems, ["Join us", "#join"]].map(([label, href], i) => <a style={{ "--i": i }} href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
      <small>INSPIRE. GROW. CREATE. — Hammam Sousse, Tunisia</small>
    </aside>
  </>;
}

export function ScrollNav({ active }) {
  const items = [["Start", "home"], ["Story", "about"], ["Acts", "departments"], ["People", "team"], ["Events", "events"], ["Join", "join"]];
  return <aside className="scroll-nav" aria-label="Page sections"><div className="scroll-track"><div className="scroll-fill" /></div>{items.map(([label, id]) => <a href={`#${id}`} className={active === id ? "active" : ""} key={id}>{label}</a>)}</aside>;
}

export function Cursor() {
  return <><div className="cursor-dot" /><div className="cursor-ring" data-label="" /></>;
}
