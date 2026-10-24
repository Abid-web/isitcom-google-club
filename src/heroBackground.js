import { gsap } from "gsap";

// One emergency switch: false restores the original hero markup and motion path.
export const HERO_BG_V2 = true;

const HERO_DOTS = {
  desktopMax: 2500,
  mobileMax: 600,
  lowPowerMax: 1200,
  desktopSpacing: 22,
  mobileSpacing: 30,
  pointerRadius: 220,
  pointerShift: 15,
  desktopFps: 60,
  mobileFps: 24,
};

const BRAND_COLORS = ["#4285f4", "#ea4335", "#fbbc05", "#34a853"];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function readDotOpacity() {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--hero-dot-opacity");
  return Number.parseFloat(value) || .12;
}

function createDotGrid(width, height, mobile, lowPower) {
  const cap = mobile ? HERO_DOTS.mobileMax : lowPower ? HERO_DOTS.lowPowerMax : HERO_DOTS.desktopMax;
  const minimum = mobile ? HERO_DOTS.mobileSpacing : HERO_DOTS.desktopSpacing;
  const spacing = Math.max(minimum, Math.sqrt((width * height) / cap));
  const dots = [];
  let row = 0;

  for (let y = spacing * .5; y < height; y += spacing, row += 1) {
    let column = 0;
    for (let x = spacing * .5; x < width; x += spacing, column += 1) {
      dots.push({
        x,
        y,
        radius: clamp(spacing * .085, 1.35, 2.7),
        colorIndex: (row * 3 + column * 5) % BRAND_COLORS.length,
        phase: (row * .37 + column * .21) % (Math.PI * 2),
      });
    }
  }

  return dots;
}

function drawRegistrationMark(context, x, y, size, time, dark) {
  const offset = size * .12;
  const rotation = time * .00006;

  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.lineWidth = 1.15;
  context.globalAlpha = dark ? .28 : .22;

  BRAND_COLORS.slice(0, 2).forEach((color, index) => {
    const drift = index ? offset : -offset;
    context.strokeStyle = color;
    context.beginPath();
    context.arc(drift, -drift, size * .42, 0, Math.PI * 2);
    context.moveTo(drift - size * .7, -drift);
    context.lineTo(drift + size * .7, -drift);
    context.moveTo(drift, -drift - size * .7);
    context.lineTo(drift, -drift + size * .7);
    context.stroke();
  });

  context.restore();
}

function drawPrintGuides(context, bounds, time, mobile, reduced, lowPower, dark) {
  if (lowPower) return;

  const unit = Math.min(bounds.width, bounds.height);
  const motion = reduced ? 0 : time * .0001;
  const guides = mobile
    ? [{ x: .72, y: .19, radius: .19, start: -.85, span: 1.65 }]
    : [
        { x: .58, y: .12, radius: .22, start: -.2, span: 1.52 },
        { x: .88, y: .49, radius: .18, start: 1.48, span: 1.62 },
      ];

  context.save();
  context.globalCompositeOperation = dark ? "screen" : "multiply";
  context.lineCap = "round";

  guides.forEach((guide, guideIndex) => {
    for (let layer = 0; layer < 3; layer += 1) {
      const radius = unit * (guide.radius + layer * .021);
      const direction = guideIndex % 2 ? -1 : 1;
      const start = guide.start + motion * direction + layer * .055;
      context.globalAlpha = (dark ? .2 : .16) - layer * .025;
      context.strokeStyle = BRAND_COLORS[(guideIndex + layer) % BRAND_COLORS.length];
      context.lineWidth = 1.2 + layer * .6;
      context.setLineDash([unit * .012, unit * (.013 + layer * .005)]);
      context.lineDashOffset = reduced ? 0 : time * .006 * direction * (layer + 1);
      context.beginPath();
      context.arc(
        bounds.width * guide.x,
        bounds.height * guide.y,
        radius,
        start,
        start + Math.PI * guide.span,
      );
      context.stroke();
    }
  });

  context.setLineDash([]);
  context.globalCompositeOperation = "source-over";
  if (!mobile) {
    drawRegistrationMark(context, bounds.width * .73, bounds.height * .19, 18, time, dark);
    drawRegistrationMark(context, bounds.width * .84, bounds.height * .58, 13, -time, dark);
  }
  context.restore();
}

function drawPointerLens(context, x, y, time, dark) {
  if (x < 0 || y < 0) return;

  const pulse = Math.sin(time * .0024) * 4;
  context.save();
  context.globalCompositeOperation = dark ? "screen" : "multiply";
  context.lineCap = "round";

  [0, 1, 2].forEach(index => {
    const radius = 56 + index * 29 + pulse * (index === 1 ? -1 : 1);
    const start = time * .00042 * (index % 2 ? -1 : 1) + index * 1.7;
    context.globalAlpha = (dark ? .34 : .27) - index * .045;
    context.strokeStyle = BRAND_COLORS[index];
    context.lineWidth = 1.4 + index * .45;
    context.setLineDash([12 + index * 3, 11 + index * 5]);
    context.lineDashOffset = -time * .018 * (index % 2 ? -1 : 1);
    context.beginPath();
    context.arc(x, y, radius, start, start + Math.PI * (1.08 + index * .16));
    context.stroke();
  });

  context.restore();
}

export function initHeroLivingPrint({ getPointer } = {}) {
  if (!HERO_BG_V2) return () => {};

  const hero = document.querySelector(".hero-bg-v2");
  const canvas = hero?.querySelector(".hero-halftone");
  const title = hero?.querySelector(".hero-title");
  const shapes = hero ? gsap.utils.toArray(".shape", hero) : [];
  if (!hero || !canvas || !title || !shapes.length) return () => {};

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return () => {};

  const media = gsap.matchMedia();
  media.add({
    desktop: "(min-width: 901px) and (pointer: fine)",
    mobile: "(max-width: 900px), (pointer: coarse)",
    reduced: "(prefers-reduced-motion: reduce)",
  }, match => {
    const { desktop, mobile, reduced } = match.conditions;
    const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
      || (navigator.deviceMemory && navigator.deviceMemory <= 4);
    const frameInterval = 1000 / (mobile || lowPower ? HERO_DOTS.mobileFps : HERO_DOTS.desktopFps);
    const shapeMotion = shapes.map(shape => ({
      element: shape,
      depth: Number(shape.dataset.depth) || 0,
      x: 0,
      y: 0,
    }));

    let bounds;
    let titleBounds;
    let dots = [];
    let dotOpacity = readDotOpacity();
    let dpr = 1;
    let resizeTimer;
    let heroVisible = true;
    let tabVisible = !document.hidden;
    let lastFrame = -Infinity;
    let pointerX = -1000;
    let pointerY = -1000;

    hero.classList.toggle("hero-low-power", Boolean(lowPower));

    // L1 — one capped Canvas 2D halftone grid, rebuilt only after debounced resizes.
    const resize = () => {
      bounds = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * dpr));
      canvas.height = Math.max(1, Math.round(bounds.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = createDotGrid(bounds.width, bounds.height, mobile, lowPower);

      const rect = title.getBoundingClientRect();
      titleBounds = {
        left: rect.left - bounds.left - 24,
        right: rect.right - bounds.left + 24,
        top: rect.top - bounds.top - 18,
        bottom: rect.bottom - bounds.top + 18,
      };
      dotOpacity = readDotOpacity();
    };

    const queueResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    };

    const draw = time => {
      if (!heroVisible || !tabVisible || !bounds || time - lastFrame < frameInterval) return;
      lastFrame = time;
      context.clearRect(0, 0, bounds.width, bounds.height);

      const pointer = desktop && getPointer ? getPointer() : null;
      const targetX = pointer && pointer.x >= 0 ? pointer.x - bounds.left : -1000;
      const targetY = pointer && pointer.y >= 0 ? pointer.y - bounds.top : -1000;
      pointerX += (targetX - pointerX) * .16;
      pointerY += (targetY - pointerY) * .16;
      const ambient = reduced ? 0 : time * .001;
      const dark = document.documentElement.dataset.theme === "dark";
      const validPointer = targetX > -500 && targetY > -500;

      // Oversized crop and registration guides establish the visible print-art direction.
      drawPrintGuides(context, bounds, time, mobile, reduced, lowPower, dark);

      dots.forEach(dot => {
        const dx = dot.x - pointerX;
        const dy = dot.y - pointerY;
        const distance = Math.hypot(dx, dy);
        const pointerInfluence = desktop && validPointer
          ? Math.pow(clamp(1 - distance / HERO_DOTS.pointerRadius, 0, 1), 1.55)
          : 0;
        const waveA = Math.sin(dot.x * .0105 + dot.y * .0068 - ambient * .9 + dot.phase * .24);
        const waveB = Math.sin(dot.x * -.0048 + dot.y * .012 - ambient * .58 - dot.phase * .16);
        const printWave = reduced ? .45 : clamp((waveA + waveB + 2) * .25, 0, 1);
        const titleSafe = dot.x > titleBounds.left && dot.x < titleBounds.right
          && dot.y > titleBounds.top && dot.y < titleBounds.bottom;
        const openZone = dot.y < bounds.height * .44 && dot.x > bounds.width * .26 ? 1.24 : 1;
        const alpha = dotOpacity
          * openZone
          * (titleSafe ? .11 : 1)
          * (.48 + printWave * 1.08)
          * (1 + pointerInfluence * 1.55);
        const radius = dot.radius * (.68 + printWave * .88 + pointerInfluence * 2.65);
        const shift = pointerInfluence * HERO_DOTS.pointerShift;
        const length = distance || 1;
        const tangentX = -dy / length;
        const tangentY = dx / length;
        const x = dot.x + (dx / length) * shift + tangentX * shift * .48;
        const y = dot.y + (dy / length) * shift + tangentY * shift * .48;
        const colorStep = printWave > .72 ? 1 : 0;

        context.globalAlpha = alpha;
        context.fillStyle = BRAND_COLORS[(dot.colorIndex + colorStep) % BRAND_COLORS.length];
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;

      if (desktop && validPointer && !reduced && !lowPower) {
        drawPointerLens(context, pointerX, pointerY, time, dark);
      }

      // L3 — pointer depth reuses the custom cursor coordinates and this same ticker.
      if (desktop && !reduced) {
        shapeMotion.forEach(item => {
          const x = validPointer ? (targetX - bounds.width / 2) * item.depth * .58 : 0;
          const y = validPointer ? (targetY - bounds.height / 2) * item.depth * .48 : 0;
          item.x += (x - item.x) * .11;
          item.y += (y - item.y) * .11;
          item.element.style.setProperty("--hero-parallax-x", `${item.x.toFixed(2)}px`);
          item.element.style.setProperty("--hero-parallax-y", `${item.y.toFixed(2)}px`);
        });
      }
    };

    const onVisibility = () => { tabVisible = !document.hidden; };
    const visibilityObserver = new IntersectionObserver(entries => {
      heroVisible = entries[0]?.isIntersecting ?? false;
    }, { rootMargin: "10% 0px" });
    const themeObserver = new MutationObserver(() => {
      dotOpacity = readDotOpacity();
      if (reduced) draw(performance.now());
    });

    visibilityObserver.observe(hero);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", queueResize, { passive: true });
    window.addEventListener("orientationchange", queueResize, { passive: true });
    resize();

    const breathers = [];
    let continuity;
    if (!reduced) {
      // L3 — slow, desynchronised breathing uses only transform channels and opacity.
      shapes.forEach((shape, index) => {
        breathers.push(gsap.to(shape, {
          "--hero-float-x": `${index % 2 ? -5 : 4}px`,
          "--hero-float-y": `${index % 2 ? 9 : -11}px`,
          opacity: index % 2 ? .78 : .88,
          duration: 4.8 + index * .75,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        }));
      });

      // L4 — one scrubbed timeline carries the print shapes into the marquee/story edge.
      const targets = [
        { x: -.08, y: .6, scale: .72 },
        { x: .22, y: .42, scale: .68 },
        { x: -.12, y: .28, scale: .8 },
        { x: -.32, y: .58, scale: .64 },
      ];
      continuity = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: .8,
          invalidateOnRefresh: true,
        },
      });
      shapes.forEach((shape, index) => {
        const target = targets[index];
        continuity.to(shape, {
          "--hero-scroll-x": () => `${hero.getBoundingClientRect().width * target.x}px`,
          "--hero-scroll-y": () => `${hero.getBoundingClientRect().height * target.y}px`,
          "--hero-scale": target.scale,
          ease: "none",
        }, 0);
      });
      continuity.to(canvas, { opacity: .28, yPercent: 12, ease: "none" }, 0);
      gsap.ticker.add(draw);
    } else {
      draw(performance.now());
    }

    return () => {
      window.clearTimeout(resizeTimer);
      breathers.forEach(tween => tween.kill());
      continuity?.kill();
      gsap.ticker.remove(draw);
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", queueResize);
      window.removeEventListener("orientationchange", queueResize);
      shapeMotion.forEach(item => {
        item.element.style.removeProperty("--hero-parallax-x");
        item.element.style.removeProperty("--hero-parallax-y");
      });
      hero.classList.remove("hero-low-power");
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  });

  return () => media.revert();
}
