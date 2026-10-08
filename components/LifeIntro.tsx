"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { photoSrc, photoSrcSet, type Photo } from "@/lib/content";
import { getLifeTop, subscribeLifeTop } from "@/lib/lifeTop";

// /life opens on the top print, full bleed. Scrolling shrinks it into its slot
// in the print stack. Transform only, reversible, and skipped for reduced motion.

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);

export default function LifeIntro({ first, credit }: { first: Photo; credit: string }) {
  const photo = useSyncExternalStore(subscribeLifeTop, () => getLifeTop() ?? first, () => first);
  const root = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const html = document.documentElement;
    const rootEl = root.current;
    const boxEl = box.current;
    const shadeEl = shade.current;
    if (!rootEl || !boxEl || !shadeEl) return;

    let geo: { w: number; h: number; left: number; top: number; end: number } | null = null;
    let raf = 0;

    const frame = () => {
      raf = 0;
      if (!geo) return;
      const vw = html.clientWidth;
      const vh = window.innerHeight;
      const k = clamp(window.scrollY / geo.end);
      const e = easeOut(k);
      const s0 = Math.max(vw / geo.w, vh / geo.h);
      const x0 = (vw - geo.w * s0) / 2;
      const y0 = (vh - geo.h * s0) / 2;
      const s = s0 + (1 - s0) * e;
      const x = x0 + (geo.left - x0) * e;
      const y = y0 + (geo.top - y0) * e;
      boxEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
      // The headline leaves within the first sliver of scroll, before the real one arrives.
      const fade = clamp(window.scrollY / (vh * 0.12));
      shadeEl.style.opacity = String(1 - fade);
      shadeEl.style.transform = `translate3d(0, ${-fade * 24}px, 0)`;
      const done = k >= 1;
      rootEl.dataset.done = done ? "true" : "false";
      html.dataset.lifeIntro = done ? "done" : "active";
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const measure = () => {
      const slot = document.querySelector<HTMLElement>("[data-life-slot]");
      if (!slot) return;
      const r = slot.getBoundingClientRect();
      const vh = window.innerHeight;
      const docTop = r.top + window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - vh;
      // Land with the print centered (a little higher on tall phones), but never make anyone
      // scroll more than about 1.4 screens for it: on short screens it lands lower instead.
      const preferred = Math.max(16, Math.min((vh - r.height) / 2, vh * 0.12 + 32));
      const rest = Math.min(Math.max(preferred, docTop - vh * 1.4), vh * 0.6);
      const end = Math.max(1, Math.min(docTop - rest, maxScroll));
      geo = { w: r.width, h: r.height, left: r.left, top: docTop - end, end };
      boxEl.style.width = `${r.width}px`;
      boxEl.style.height = `${r.height}px`;
      rootEl.dataset.ready = "true";
      frame();
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
      delete html.dataset.lifeIntro;
    };
  }, []);

  return (
    <div ref={root} className="life-intro" data-done="false">
      <div aria-hidden className="life-intro-spacer" />
      <div aria-hidden className="life-intro-layer">
        <div ref={box} className="life-intro-box">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoSrc(photo.slug, 1200)}
            srcSet={photoSrcSet(photo.slug)}
            sizes="100vw"
            width={photo.width}
            height={photo.height}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
        <div ref={shade} className="absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-graphite/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-graphite/85 via-graphite/35 to-transparent" />
          <div className="page absolute inset-x-0 bottom-0 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
            <p className="max-w-[12ch] font-display text-[clamp(2.6rem,7.5vw,4.8rem)] font-medium leading-[1] tracking-[-0.025em] text-rice">
              {credit}
            </p>
            <p className="mt-4 text-[0.95rem] text-silver">
              {photo.title}, {photo.place}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
