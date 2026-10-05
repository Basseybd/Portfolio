"use client";

// Selected work as a wheel you turn.
//
// At rest the work sits in a ring around the section title, each cover tangent
// to the circle. The first notch of scroll (or the first swipe) blows the ring
// open into a vertical drum: the cover at the front lies flat and full size,
// its neighbours rotate away in perspective and run off the frame. Keep turning
// and the drum carries the next piece round to the front.
//
// One number drives everything: `turn`. 0 is the ring, 1 is the drum with item
// 0 at the front, and every whole number after that is one more item turned
// past. A single rAF pass eases toward the target and writes transforms
// straight to the DOM, then stops until the target moves again.
//
// Adapted from the works-wheel component. Changes: the wheel only takes the
// page's scroll while the section fills most of the viewport, docks it, and
// hands scrolling back at both ends (including the momentum tail of a gesture
// that hit an end). Touch gets a native vertical swipe with the same release
// rule. Previous and Next buttons, arrow keys, Home and End all work. On a
// phone the drum rides high and the detail panel sits under it.

import * as React from "react";
import { selectedWork, sideBuilds } from "@/lib/content";
import { cn } from "@/lib/utils";

export type WheelLink = { href: string; label: string };

export type WheelItem = {
  /** File stem for the cover in public/work. */
  slug: string;
  title: string;
  /** His exact role on the piece. */
  verb: string;
  outcome: string;
  detail?: string;
  stack: string[];
  /** Short description of the generated cover art, for alt text. */
  cover: string;
  links?: WheelLink[];
};

export type WorksWheelProps = {
  items?: WheelItem[];
  /** Ring title, also the section's heading. */
  label?: string;
  id?: string;
  className?: string;
};

/** Same rule as slugify() in scripts/make-work-covers.py. */
export const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const COVERS: Record<string, string> = {
  "ai-message-assistant":
    "Graphite cover: a message card with one span redacted in polished chrome and a chrome checkmark over it.",
  "preference-aware-chat-prototype":
    "Brushed aluminum cover: a small bubble reading seafood, answered by a chrome speech bubble reading What kind?",
  "session-reliability-fix":
    "Graphite cover: three stacked browser tabs held on one chrome thread with four knots, and a chrome session capsule.",
  "build-migration": "Brushed aluminum cover: tapered chrome speed lines racing right into a polished post.",
  "react-upgrade-with-coding-agents": "Graphite cover: a grid of 79 polished chrome tiles, each with a check.",
};

export const defaultWheelItems: WheelItem[] = [
  ...selectedWork.map((w) => {
    const slug = slugify(w.title);
    return {
      slug,
      title: w.title,
      verb: w.verb,
      outcome: w.outcome,
      detail: w.detail,
      stack: w.stack,
      cover: COVERS[slug] ?? "Graphite cover with a polished chrome motif.",
    };
  }),
  ...sideBuilds.map((s) => {
    const slug = slugify(s.title);
    return {
      slug,
      title: s.title,
      verb: "Side build",
      outcome: s.body,
      stack: s.stack.split(",").map((x) => x.trim()),
      cover: COVERS[slug] ?? "Graphite cover with a polished chrome motif.",
      links: [
        { href: s.live, label: s.liveLabel },
        { href: s.code, label: "View code" },
      ],
    };
  }),
];

/* Geometry. The card is measured against the stage; the drum is measured
   against the card. STEP against DRUM sets how hard neighbours rotate away,
   DRUM against LENS decides whether they land inside the frame. BOW curves the
   strip round an arc whose centre sits off to the left, so neighbours swing
   back left as well as up and down. */
const RATIO = 1.45; // cover width / height (covers are 1450 x 1000)
const STEP = 40; // degrees between cards on the drum (phones: 38)
const DRUM = 2.22; // drum radius, in card heights (phones: 1.8, so neighbours stay in frame)
const LENS = 2.7; // perspective distance, in card heights
const BOW = 1.82; // bow radius, in card heights
const CULL = 1.6; // items either side of the front still drawn

const WHEEL_UNITS = 900; // wheel delta (px) per item
const DRAG_UNITS = 380; // mouse drag (px) per item
const IDLE = 160; // quiet time (ms) that ends a wheel gesture
const EASE = 0.12; // fraction of the gap closed per 60fps frame

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (deg: number) => (deg * Math.PI) / 180;

type Metrics = {
  w: number;
  h: number;
  compact: boolean;
  cardW: number;
  cardH: number;
  ringR: number;
  ringScale: number;
  step: number;
  drumR: number;
  bow: number;
  depth: number;
  ringY: number;
  drumY: number;
  labelSize: number;
  labelMax: number;
  pad: number;
  titleSize: number;
  titleWidth: number;
  panelLeft: number;
  panelTop: number;
  panelWidth: number;
};

function measure(w: number, h: number, count: number): Metrics {
  const compact = w < 960;
  const pad = compact ? 20 : Math.max(32, w * 0.05);
  let cardW: number;
  if (compact) cardW = Math.min(w - 2 * pad - 24, h * (h < 740 ? 0.24 : 0.28) * RATIO, 440);
  else cardW = Math.min(h * 0.4 * RATIO, w * 0.3);
  cardW = Math.max(cardW, 120);
  const cardH = cardW / RATIO;
  const ringR = compact ? Math.min(cardH * 1.14, w * 0.36, h * 0.3) : Math.min(cardH * 1.14, h * 0.29, w * 0.3);
  const ringScale = count ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / cardW, 0.16, 1) : 1;
  const inner = 2 * (ringR - (cardH * ringScale) / 2);
  const labelSize = Math.min(cardH * 0.17, (inner * 0.8) / (compact ? 4.6 : 6.9));
  const drumY = compact ? Math.max(cardH / 2 + 40, h * 0.33) : h / 2;
  const ringY = compact ? h * 0.45 : h / 2;
  const titleWidth = compact ? w - 2 * pad : w / 2 - cardW / 2 - 44 - pad;
  const titleSize = compact ? clamp(w * 0.068, 24, 34) : clamp(titleWidth / 8.2, 28, 56);
  const panelLeft = compact ? Math.max(pad, (w - 640) / 2) : w / 2 + cardW / 2 + 48;
  const panelWidth = compact ? Math.min(w - 2 * pad, 640) : w - panelLeft - pad;
  return {
    w,
    h,
    compact,
    cardW,
    cardH,
    ringR,
    ringScale,
    step: compact ? 38 : STEP,
    drumR: cardH * (compact ? 1.8 : DRUM),
    bow: cardH * (compact ? 1.1 : BOW),
    depth: cardH * LENS,
    ringY,
    drumY,
    labelSize,
    labelMax: inner * 0.9,
    pad,
    titleSize,
    titleWidth,
    panelLeft,
    panelTop: compact ? drumY + cardH / 2 + 22 : h / 2,
    panelWidth,
  };
}

/** Both states in one chain: ring terms fall away as `m` reaches the drum,
    drum terms are zero while the ring is up. The bow is applied first, in the
    wheel's own plane, so it slides the card sideways rather than turning it. */
function place(ringDeg: number, drumDeg: number, ringR: number, drumR: number, bow: number, m: number) {
  const bowX = -bow * (1 - Math.cos(rad(drumDeg)));
  return (
    `translateX(${m * bowX}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${-m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export default function WorksWheel({
  items = defaultWheelItems,
  label = "Selected work",
  id = "work",
  className,
}: WorksWheelProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = React.useRef<HTMLHeadingElement>(null);
  const fadeRefs = React.useRef<(HTMLElement | null)[]>([]);

  const count = items.length;
  const turn = React.useRef(0);
  const target = React.useRef(0);
  const frame = React.useRef(0);
  const lastTime = React.useRef(0);

  const [active, setActive] = React.useState(0);
  const [goal, setGoal] = React.useState(0); // where the wheel is heading, rounded
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const [coarse, setCoarse] = React.useState(false);
  const reducedRef = React.useRef(false);

  const headingId = `${id}-heading`;
  const metrics = React.useMemo(() => measure(size.w, size.h, count), [size, count]);
  const metricsRef = React.useRef(metrics);
  metricsRef.current = metrics;

  React.useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pc = window.matchMedia("(pointer: coarse)");
    const read = () => {
      reducedRef.current = rm.matches;
      setCoarse(pc.matches);
    };
    read();
    rm.addEventListener("change", read);
    pc.addEventListener("change", read);
    return () => {
      rm.removeEventListener("change", read);
      pc.removeEventListener("change", read);
    };
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Write every transform for the current `turn`. */
  const write = React.useCallback(() => {
    const M = metricsRef.current;
    if (!M.w) return;
    const t = turn.current;
    const m = clamp(t, 0, 1);
    const pos = Math.max(0, t - 1);
    const cx = M.w / 2;
    const cy = lerp(M.ringY, M.drumY, m);

    if (stageRef.current) stageRef.current.style.perspectiveOrigin = `${cx}px ${cy}px`;
    // The drum is pulled back so its front face lands on the picture plane.
    if (wheelRef.current) {
      wheelRef.current.style.transform = `translate3d(${cx}px, ${cy}px, ${-m * M.drumR}px)`;
    }
    for (let i = 0; i < count; i++) {
      const card = cardRefs.current[i];
      if (!card) continue;
      const d = i - pos;
      card.style.transform = place(d * (360 / count), d * M.step, M.ringR, M.drumR, M.bow, m);
      const hidden = m > 0.5 && Math.abs(d) > CULL;
      card.style.opacity = hidden ? "0" : "1";
      card.style.visibility = hidden ? "hidden" : "visible";
      card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
      const face = card.firstElementChild as HTMLElement | null;
      if (face) face.style.transform = `scale(${lerp(M.ringScale, 1, m)})`;
    }
    if (labelRef.current) {
      labelRef.current.style.opacity = String(clamp(1 - m * 1.6, 0, 1));
      labelRef.current.style.transform = `translate(-50%, -50%) translateY(${cy - M.h / 2}px) scale(${1 + m * 0.06})`;
    }
    const show = String(clamp((m - 0.45) / 0.55, 0, 1));
    fadeRefs.current.forEach((el) => {
      if (el) el.style.opacity = show;
    });
    const near = clamp(Math.round(pos), 0, Math.max(count - 1, 0));
    setActive((prev) => (prev === near ? prev : near));
  }, [count]);

  const draw = React.useCallback(
    (now: number) => {
      const dt = Math.min(64, now - (lastTime.current || now));
      lastTime.current = now;
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005 || reducedRef.current) {
        turn.current = target.current;
        write();
        frame.current = 0;
        return;
      }
      turn.current += gap * (1 - Math.pow(1 - EASE, dt / 16.667));
      write();
      frame.current = requestAnimationFrame(draw);
    },
    [write],
  );

  const kick = React.useCallback(() => {
    if (frame.current) return;
    lastTime.current = 0;
    frame.current = requestAnimationFrame(draw);
  }, [draw]);

  React.useEffect(() => {
    write();
  }, [metrics, write]);

  React.useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const to = React.useCallback(
    (next: number) => {
      target.current = clamp(next, 0, count);
      setGoal(Math.round(target.current));
      kick();
    },
    [count, kick],
  );

  /** Land on a whole item after a gesture, at least one step in the direction
      it moved, so a single mouse notch or a short flick always turns a card. */
  const settle = React.useCallback(
    (from: number, fling = 0) => {
      const t = target.current + fling;
      const start = Math.round(from);
      const moved = t - from;
      let dest = start;
      if (moved > 0.06) dest = Math.max(start + 1, Math.ceil(t - 0.25));
      else if (moved < -0.06) dest = Math.min(start - 1, Math.floor(t + 0.25));
      to(dest);
    },
    [to],
  );

  /** Does the section fill enough of the viewport to own the scroll? */
  const inView = React.useCallback(() => {
    const el = rootRef.current;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    return visible >= Math.min(r.height, vh) * 0.6;
  }, []);

  /** Bring the whole section into view when the wheel takes over. */
  const dock = React.useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (Math.abs(top) < 2) return;
    window.scrollTo({ top: window.scrollY + top, behavior: reducedRef.current ? "auto" : "smooth" });
  }, []);

  // Wheel and touch, as native listeners so they can be cancelled. Each only
  // cancels while the wheel still has somewhere to go, so the page scrolls on
  // at either end. A gesture that turned the wheel and then hit an end keeps
  // being absorbed until it goes quiet, so trackpad momentum cannot fling the
  // reader past the section.
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let owned = false;
    let from = 0;
    let idle = 0;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1;
      const delta = e.deltaY * unit;
      if (!delta) return;
      const t = target.current;
      const canMove = delta > 0 ? t < count : t > 0;
      if (!owned) {
        if (!canMove || !inView()) return;
        owned = true;
        from = t;
        dock();
      }
      e.preventDefault();
      if (canMove) to(t + delta / WHEEL_UNITS);
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        owned = false;
        settle(from);
      }, IDLE);
    };

    let y0 = 0;
    let x0 = 0;
    let t0 = 0;
    let mode: "wheel" | "page" | null = null;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0; // items per ms
    const touchUnits = () => (metricsRef.current.compact ? 230 : 340);

    // Move and end listeners go on the touch target itself: touch events keep
    // going to the node the finger landed on even if React swaps it out of the
    // DOM mid-swipe (the detail panel re-keys when the front card changes),
    // and a detached node no longer bubbles to the section.
    let held: EventTarget | null = null;
    const release = () => {
      if (!held) return;
      held.removeEventListener("touchmove", onTouchMove as EventListener);
      held.removeEventListener("touchend", onTouchEnd);
      held.removeEventListener("touchcancel", onTouchEnd);
      held = null;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        mode = "page";
        return;
      }
      release();
      held = e.target;
      held?.addEventListener("touchmove", onTouchMove as EventListener, { passive: false });
      held?.addEventListener("touchend", onTouchEnd);
      held?.addEventListener("touchcancel", onTouchEnd);
      const p = e.touches[0];
      y0 = lastY = p.clientY;
      x0 = p.clientX;
      t0 = target.current;
      lastT = e.timeStamp;
      velocity = 0;
      mode = null;
    };

    function onTouchMove(e: TouchEvent) {
      if (mode === "page" || e.touches.length !== 1) return;
      const p = e.touches[0];
      const dy = y0 - p.clientY; // positive: finger moving up, turn forward
      if (mode === null) {
        const dx = Math.abs(p.clientX - x0);
        if (Math.abs(dy) < 4 && dx < 4) return;
        const canMove = dy > 0 ? t0 < count : t0 > 0;
        if (dx > Math.abs(dy) || !canMove || !inView()) {
          mode = "page";
          return;
        }
        mode = "wheel";
        dock();
      }
      if (e.cancelable) e.preventDefault();
      const dt = Math.max(1, e.timeStamp - lastT);
      velocity = lerp(velocity, (lastY - p.clientY) / touchUnits() / dt, 0.4);
      lastY = p.clientY;
      lastT = e.timeStamp;
      to(t0 + dy / touchUnits());
    }

    function onTouchEnd() {
      release();
      if (mode === "wheel") settle(t0, clamp(velocity * 140, -1, 1));
      mode = null;
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      release();
      window.clearTimeout(idle);
    };
  }, [count, to, settle, inView, dock]);

  // Mouse drag on the stage (touch is handled above).
  const drag = React.useRef<{ y: number; from: number; moved: number } | null>(null);
  const dragged = React.useRef(false);

  const step = (dir: 1 | -1) => to(Math.round(target.current) + dir);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const t = Math.round(target.current);
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") next = t + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") next = t - 1;
    else if (e.key === "Home") next = 1;
    else if (e.key === "End") next = count;
    if (next === null || next < 0 || next > count) return;
    e.preventDefault();
    to(next);
  };

  const M = metrics;
  const current = items[active];
  const open = goal >= 1;
  const ready = M.w > 0;

  return (
    <section
      ref={rootRef}
      id={id}
      aria-labelledby={headingId}
      data-ready={ready ? "" : undefined}
      className={cn("ww on-dark relative isolate h-[100svh] min-h-[600px] w-full overflow-hidden bg-graphite text-rice", className)}
    >
      <style>{CSS}</style>

      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label={`${label}. Use the arrow keys to turn the wheel.`}
        aria-activedescendant={open ? `${id}-card-${active}` : undefined}
        onKeyDown={onKeyDown}
        className="ww-stage absolute inset-0 cursor-grab select-none outline-none active:cursor-grabbing"
        style={{ perspective: `${M.depth}px` }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          drag.current = { y: e.clientY, from: target.current, moved: 0 };
          dragged.current = false;
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dy = d.y - e.clientY;
          d.moved = Math.max(d.moved, Math.abs(dy));
          if (d.moved > 5 && !dragged.current) {
            // Capture only once it is a drag, so a plain click still reaches the card.
            dragged.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          to(d.from + dy / DRAG_UNITS);
        }}
        onPointerUp={() => {
          const d = drag.current;
          drag.current = null;
          if (d && d.moved > 5) settle(d.from);
        }}
        onPointerCancel={() => {
          const d = drag.current;
          drag.current = null;
          if (d) settle(d.from);
        }}
      >
        <div ref={wheelRef} className="absolute left-0 top-0 [transform-style:preserve-3d]">
          {items.map((item, i) => (
            <div
              key={item.slug}
              id={`${id}-card-${i}`}
              role="option"
              aria-selected={open && i === active}
              ref={(node) => {
                cardRefs.current[i] = node;
              }}
              onClick={() => {
                if (dragged.current) return;
                if (!(open && i === active)) to(i + 1);
              }}
              className="ww-card absolute [backface-visibility:hidden]"
              style={{
                width: M.cardW,
                height: M.cardH,
                marginLeft: -M.cardW / 2,
                marginTop: -M.cardH / 2,
              }}
            >
              <span className="ww-face relative block size-full overflow-hidden rounded-[10px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/work/${item.slug}.webp`}
                  srcSet={`/work/${item.slug}-725.webp 725w, /work/${item.slug}.webp 1450w`}
                  sizes={`${Math.round(M.cardW) || 440}px`}
                  width={1450}
                  height={1000}
                  alt={`${item.title}. ${item.cover}`}
                  draggable={false}
                  decoding="async"
                  className="size-full object-cover"
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ring title. Fades as the ring opens; stays the section heading. */}
      <h2
        ref={labelRef}
        id={headingId}
        className="ww-label pointer-events-none absolute left-1/2 top-1/2 m-0 text-center font-display font-medium leading-[1.04] tracking-[-0.02em]"
        style={{ fontSize: M.labelSize || 40, maxWidth: M.labelMax || 320 }}
      >
        {label}
      </h2>

      {/* Small heading in the corner once the drum is open (wide screens). */}
      {!M.compact && (
        <p
          aria-hidden
          ref={(n) => {
            fadeRefs.current[0] = n;
          }}
          className="ww-fade pointer-events-none absolute font-display text-[1.05rem] font-medium text-chrome-light"
          style={{ left: M.pad, top: 36 }}
        >
          {label}
        </p>
      )}

      {/* Front card title and detail panel. */}
      {current && (
        <>
          {!M.compact && (
            <div
              ref={(n) => {
                fadeRefs.current[1] = n;
              }}
              className="ww-fade pointer-events-none absolute top-1/2 -translate-y-1/2"
              style={{ left: M.pad, width: M.titleWidth }}
              aria-hidden
            >
              <p
                key={current.slug}
                className="ww-swap font-display font-medium leading-[1.06] tracking-[-0.02em] text-rice"
                style={{ fontSize: M.titleSize }}
              >
                {current.title}
              </p>
            </div>
          )}

          {M.compact && (
            <div
              aria-hidden
              ref={(n) => {
                fadeRefs.current[3] = n;
              }}
              className="ww-fade ww-backdrop pointer-events-none absolute inset-x-0 bottom-0"
              style={{ top: M.panelTop - 26 }}
            />
          )}
          <div
            ref={(n) => {
              fadeRefs.current[2] = n;
            }}
            className={cn("ww-fade ww-panel absolute", M.compact ? "ww-panel-compact" : "-translate-y-1/2")}
            style={{ left: M.panelLeft, top: M.panelTop, width: M.panelWidth }}
            aria-hidden={!open}
          >
            <article key={current.slug} className="ww-swap">
              <h3
                className={cn(
                  "font-display font-medium leading-[1.1] tracking-[-0.015em] text-rice",
                  M.compact ? "mb-3" : "sr-only",
                )}
                style={M.compact ? { fontSize: M.titleSize } : undefined}
              >
                {current.title}
              </h3>
              <dl className="m-0">
                <dt className="sr-only">My part</dt>
                <dd className="m-0 text-[0.9rem] font-bold leading-snug tracking-[0.005em] text-chrome-light">
                  {current.verb}
                </dd>
                <dt className="sr-only">Outcome</dt>
                <dd
                  className={cn(
                    "m-0 mt-2 font-display leading-[1.3] text-rice",
                    M.compact ? "text-[1.12rem]" : "text-[1.3rem]",
                  )}
                >
                  {current.outcome}
                </dd>
                {current.detail && (
                  <>
                    <dt className="sr-only">What I did</dt>
                    <dd
                      className={cn(
                        "m-0 mt-3 text-silver",
                        M.compact ? "text-[0.9rem] leading-[1.6]" : "text-[0.98rem] leading-[1.7]",
                      )}
                    >
                      {current.detail}
                    </dd>
                  </>
                )}
                <dt className="sr-only">Stack</dt>
                <dd className="ww-stack m-0 mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.75rem] leading-[1.5] text-silver">
                  {current.stack.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </dd>
              </dl>
              {current.links && (
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                  {current.links.map((l, i) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={open ? 0 : -1}
                      className={cn(
                        "inline-flex min-h-[44px] items-center text-[0.95rem]",
                        i === 0 ? "ww-pill px-5 font-medium" : "link text-chrome-light decoration-chrome-light/50 hover:decoration-chrome-light",
                      )}
                    >
                      {l.label}
                      <span className="sr-only"> for {current.title} (opens in a new tab)</span>
                    </a>
                  ))}
                </div>
              )}
            </article>
          </div>
        </>
      )}

      {/* Controls. */}
      <div
        className={cn("ww-controls absolute flex items-center gap-3", M.compact && "justify-center")}
        style={M.compact ? { left: 0, right: 0, bottom: 20 } : { left: M.pad, bottom: 40 }}
      >
        <button
          type="button"
          className="ww-btn"
          onClick={() => step(-1)}
          disabled={goal <= 0}
          aria-label={goal <= 1 ? "Back to the ring" : "Previous project"}
        >
          <svg viewBox="0 0 20 20" aria-hidden className="size-[18px]">
            <path d="M5 12.5 10 7.5l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="ww-count m-0 min-w-[7.5rem] text-center font-mono text-[0.78rem] text-silver" aria-hidden>
          {open ? `${pad2(active + 1)} / ${pad2(count)}` : coarse ? "Swipe to turn" : "Scroll to turn"}
        </p>
        <button
          type="button"
          className="ww-btn"
          onClick={() => step(1)}
          disabled={goal >= count}
          aria-label={goal < 1 ? "Open the wheel" : "Next project"}
        >
          <svg viewBox="0 0 20 20" aria-hidden className="size-[18px]">
            <path d="M5 7.5 10 12.5l5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Index (wide screens). */}
      {!M.compact && (
        <nav aria-label={`${label} index`} className="ww-nav absolute" style={{ left: M.panelLeft, bottom: 36 }}>
          <ol className="m-0 list-none p-0">
            {items.map((item, i) => (
              <li key={item.slug}>
                <button
                  type="button"
                  onClick={() => to(i + 1)}
                  aria-current={open && i === active ? "true" : undefined}
                  className="ww-index flex min-h-[28px] items-center gap-3 text-left text-[0.86rem]"
                >
                  <span aria-hidden className="ww-tick" />
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <p className="sr-only" aria-live="polite">
        {open && current ? `${current.title}, ${active + 1} of ${count}` : ""}
      </p>
    </section>
  );
}

const CSS = `
.ww:not([data-ready]) .ww-stage,
.ww:not([data-ready]) .ww-label { visibility: hidden; }
.ww-stage { touch-action: pan-y; -webkit-user-select: none; }
.ww-stage:focus-visible { outline: 1px solid #C9CDD1; outline-offset: -10px; border-radius: 14px; }
.ww-card { cursor: pointer; will-change: transform; }
.ww-face {
  background: #222326;
  box-shadow: 0 0 0 1px rgba(201,205,209,0.16), 0 28px 60px -28px rgba(0,0,0,0.9), 0 10px 24px -14px rgba(0,0,0,0.7);
  transform-origin: 50% 50%;
}
.ww-face::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 32%);
}
.ww-label { color: #ECEDEB; text-wrap: balance; will-change: transform, opacity; }
.ww-fade { opacity: 0; }
.ww-panel { pointer-events: auto; z-index: 1; }
.ww-controls, .ww-nav { z-index: 2; }
.ww-backdrop { z-index: 1; background: linear-gradient(180deg, rgba(23,24,26,0) 0, #17181A 24px); }
.ww-swap { animation: ww-in 520ms cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes ww-in {
  from { opacity: 0; transform: translateY(8px); filter: blur(5px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
.ww-btn {
  display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 999px;
  color: #ECEDEB; border: 1px solid rgba(201,205,209,0.32);
  background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.01));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 18px -12px rgba(0,0,0,0.9);
  transition: border-color 0.25s ease, background-color 0.25s ease, opacity 0.25s ease, color 0.25s ease;
}
.ww-btn:hover:not(:disabled) { border-color: #C9CDD1; background-color: rgba(201,205,209,0.08); }
.ww-btn:disabled { opacity: 0.32; cursor: default; }
.ww-count { font-variant-numeric: tabular-nums; letter-spacing: 0.04em; }
.ww-pill {
  color: #17181A; border-radius: 999px; border: 1px solid #9a9fa4;
  background: linear-gradient(180deg, #f8f9f9 0%, #e1e3e5 46%, #cbcfd2 54%, #eceef0 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.85), 0 8px 18px -12px rgba(0,0,0,0.9);
  transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
.ww-pill:hover { color: #ECEDEB; background: #17181A; border-color: #C9CDD1; }
.ww-index { color: #A7ABAF; transition: color 0.2s ease; }
.ww-index:hover, .ww-index[aria-current] { color: #ECEDEB; }
.ww-tick { display: inline-block; width: 14px; height: 1px; background: #C9CDD1; opacity: 0; transform: scaleX(0.3); transform-origin: left; transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1); }
.ww-index[aria-current] .ww-tick { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .ww-swap { animation: none; }
  .ww-card { will-change: auto; }
}
`;
