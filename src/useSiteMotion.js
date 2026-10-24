import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { HERO_BG_V2, initHeroLivingPrint } from "./heroBackground";

gsap.registerPlugin(ScrollTrigger);
/* MOBILE FIX: ignore mobile toolbar resize triggering jittery ScrollTrigger recalculations */
ScrollTrigger.config({ ignoreMobileResize: true });

export function useSiteMotion(ready, setActiveSection) {
  useLayoutEffect(() => {
    if (!ready) return undefined;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = matchMedia("(pointer:fine) and (min-width:901px)").matches;
    const disposers = [];
    let lenis;

    if (!reduced) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      const update = () => ScrollTrigger.update();
      const raf = time => lenis.raf(time * 1000);
      lenis.on("scroll", update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      disposers.push(() => { gsap.ticker.remove(raf); lenis.destroy(); });

      /* MOBILE FIX: stop Lenis when mobile menu or lightbox is open to eliminate background scroll-jacking */
      const bodyObserver = new MutationObserver(() => {
        const isLocked = document.body.classList.contains("menu-open") || document.body.classList.contains("lightbox-open");
        if (isLocked) {
          lenis.stop();
        } else {
          lenis.start();
        }
      });
      bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
      disposers.push(() => bodyObserver.disconnect());
    }

    const onAnchor = event => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -60 });
      else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    };
    document.addEventListener("click", onAnchor);
    disposers.push(() => document.removeEventListener("click", onAnchor));

    const context = gsap.context(() => {
      if (reduced) {
        gsap.set(".hero-word, .footer-word, .about-word, .story-beat", { clearProps: "transform,opacity" });
        gsap.set(".story-path-fill", { scaleX: 1 });
      } else {
        gsap.to(".hero-word", { y: 0, duration: 1.15, stagger: .1, ease: "power4.out" });
        gsap.from(".hero-kicker, .hero-meta", { opacity: 0, y: 20, duration: .8, stagger: .12, ease: "power3.out", delay: .25 });
        const storyMedia = gsap.matchMedia();
        storyMedia.add("(min-width: 681px)", () => {
          gsap.set(".story-beat", { y: 28 });
          gsap.timeline({ scrollTrigger: { trigger: ".about-stage", start: "top top", end: "+=220%", scrub: .8, pin: true, anticipatePin: 1 } })
            .to(".about-word", { opacity: 1, stagger: .045, duration: 2, ease: "none" })
            .to(".story-path-fill", { scaleX: 1, duration: 1.2, ease: "none" }, "-=.65")
            .to(".story-beat", { opacity: 1, y: 0, stagger: .25, duration: 1, ease: "power2.out" }, "<.1");
        });
        storyMedia.add("(max-width: 680px)", () => {
          gsap.to(".about-word", { opacity: 1, stagger: .045, ease: "none", scrollTrigger: { trigger: ".about-statement", start: "top 82%", end: "bottom 45%", scrub: true } });
          gsap.fromTo(".story-beat", { opacity: 0, y: 28 }, { opacity: 1, y: 0, stagger: .12, duration: .7, ease: "power3.out", scrollTrigger: { trigger: ".story-beats", start: "top 82%" } });
        });
        disposers.push(() => storyMedia.revert());
        document.querySelectorAll(".counter-value").forEach(element => {
          const state = { value: 0 };
          gsap.to(state, { value: Number(element.dataset.value), duration: 1.6, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 90%", once: true }, onUpdate: () => { element.textContent = `${Math.round(state.value)}${element.dataset.suffix}`; } });
        });

        const media = gsap.matchMedia();
        media.add("(min-width: 981px)", () => {
          const panels = gsap.utils.toArray(".department");
          gsap.to(panels, {
            xPercent: -100 * (panels.length - 1), ease: "none", scrollTrigger: {
              trigger: ".departments", pin: true, scrub: 1, snap: 1 / (panels.length - 1), invalidateOnRefresh: true, end: () => `+=${document.querySelector("#department-track").scrollWidth - innerWidth}`, onUpdate: self => {
                const index = Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1)));
                document.querySelector(".departments").style.backgroundColor = panels[index].dataset.bg;
                panels.forEach((panel, panelIndex) => panel.classList.toggle("active", panelIndex === index));
              }
            }
          });
        });
        /* MOBILE FIX: morph departments background color on mobile scroll as user enters each act */
        media.add("(max-width: 980px)", () => {
          const deptContainer = document.querySelector(".departments");
          document.querySelectorAll(".department").forEach(panel => ScrollTrigger.create({
            trigger: panel,
            start: "top 55%",
            end: "bottom 45%",
            onToggle: self => {
              panel.classList.toggle("active", self.isActive);
              if (self.isActive && deptContainer) {
                deptContainer.style.backgroundColor = panel.dataset.bg;
              }
            }
          }));
        });
        disposers.push(() => media.revert());

        gsap.from(".team-card", { y: 70, opacity: 0, stagger: .06, duration: .8, ease: "power3.out", scrollTrigger: { trigger: ".team-hierarchy", start: "top 80%" } });
        gsap.to(".timeline-progress", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 70%", scrub: true } });
        gsap.to(".footer-word", { y: 0, duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: ".footer", start: "top 78%" } });
        document.querySelectorAll(".section-title").forEach(title => gsap.from(title, { y: 45, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: title, start: "top 88%" } }));
      }

      gsap.to(".scroll-fill", { scaleY: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
      document.querySelectorAll("main section[data-section]").forEach(section => ScrollTrigger.create({ trigger: section, start: "top 55%", end: "bottom 55%", onToggle: self => self.isActive && setActiveSection(section.id) }));
    });
    disposers.push(() => context.revert());

    let lastY = window.scrollY;
    /* MOBILE FIX: don't hide navbar when menu is open; check threshold to avoid address-bar micro-resize flutter */
    const onScroll = () => {
      const y = window.scrollY;
      if (document.body.classList.contains("menu-open")) {
        gsap.to(".site-header", { yPercent: 0, duration: .2, ease: "power2.out", overwrite: true });
        lastY = y;
        return;
      }
      if (Math.abs(y - lastY) > 8) {
        gsap.to(".site-header", { yPercent: y > lastY && y > 120 ? -110 : 0, duration: .4, ease: "power2.out", overwrite: true });
        lastY = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    disposers.push(() => window.removeEventListener("scroll", onScroll));

    let getHeroPointer;
    if (finePointer) {
      const dot = document.querySelector(".cursor-dot");
      const ring = document.querySelector(".cursor-ring");
      let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
      const onMouseMove = event => { mouseX = event.clientX; mouseY = event.clientY; gsap.set(dot, { x: mouseX, y: mouseY }); };
      const cursorTick = () => { ringX += (mouseX - ringX) * .16; ringY += (mouseY - ringY) * .16; gsap.set(ring, { x: ringX, y: ringY }); };
      window.addEventListener("mousemove", onMouseMove);
      gsap.ticker.add(cursorTick);
      disposers.push(() => { window.removeEventListener("mousemove", onMouseMove); gsap.ticker.remove(cursorTick); });
      getHeroPointer = () => ({ x: mouseX, y: mouseY });

      document.querySelectorAll("a, button, [data-cursor]").forEach(element => {
        const enter = () => { document.body.classList.add("cursor-active"); ring.dataset.label = element.dataset.cursor || "Open"; };
        const leave = () => document.body.classList.remove("cursor-active");
        element.addEventListener("mouseenter", enter); element.addEventListener("mouseleave", leave);
        disposers.push(() => { element.removeEventListener("mouseenter", enter); element.removeEventListener("mouseleave", leave); });
      });

    }

    if (HERO_BG_V2) {
      disposers.push(initHeroLivingPrint({ getPointer: getHeroPointer }));
    } else if (finePointer) {
      const parallax = event => document.querySelectorAll(".shape").forEach(shape => { const depth = Number(shape.dataset.depth); gsap.to(shape, { x: (event.clientX - innerWidth / 2) * depth, y: (event.clientY - innerHeight / 2) * depth, duration: 1.2, ease: "power2.out" }); });
      window.addEventListener("mousemove", parallax);
      disposers.push(() => window.removeEventListener("mousemove", parallax));
    }

    /* MOBILE FIX: ensure magnetic effect only attaches on desktop pointers with fine hover */
    if (!reduced && matchMedia("(pointer:fine) and (min-width:901px)").matches) {
      document.querySelectorAll(".magnetic").forEach(element => {
        const move = event => { const rect = element.getBoundingClientRect(); gsap.to(element, { x: (event.clientX - rect.left - rect.width / 2) * .16, y: (event.clientY - rect.top - rect.height / 2) * .16, duration: .35, ease: "power2.out" }); };
        const leave = () => gsap.to(element, { x: 0, y: 0, duration: .65, ease: "elastic.out(1,.4)" });
        element.addEventListener("mousemove", move); element.addEventListener("mouseleave", leave);
        disposers.push(() => { element.removeEventListener("mousemove", move); element.removeEventListener("mouseleave", leave); });
      });
    }

    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => { disposers.reverse().forEach(dispose => dispose()); document.body.classList.remove("cursor-active"); };
  }, [ready, setActiveSection]);
}
