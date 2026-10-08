"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { photoSrc, photoSrcSet, type Photo } from "@/lib/content";
import { getLifeTop, subscribeLifeTop } from "@/lib/lifeTop";

// /life opens on the top print, full bleed, credited to him. Scrolling shrinks
// it into its slot in the print stack. Transform only, reversible, and skipped
// for reduced motion.

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
// A 1x1 gif, so reduced-motion visitors never download the hidden photo.
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

type Props = { first: Photo; credit: string; portrait: string };

export default function LifeIntro({ first, credit, portrait }: Props) {
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

    // Measured on mount and on real resizes. vw and vh are kept here so a phone's
    // toolbar sliding away mid-scroll doesn't make the photo jump.
    let geo: { w: number; h: number; left: number; docTop: number; end: number; vw: number; vh: number } | null = null;
    let raf = 0;
    let idle = 0;

    const frame = () => {
      raf = 0;
      if (!geo) return;
      const sy = window.scrollY;
      const k = clamp(sy / geo.end);
      const e = easeOut(k);
      const s0 = Math.max(geo.vw / geo.w, geo.vh / geo.h);
      const x0 = (geo.vw - geo.w * s0) / 2;
      const y0 = (geo.vh - geo.h * s0) / 2;
      // Aim at where the slot is right now, so the photo rides up with the stack
      // instead of parking early and leaving its frame empty.
      const slotTop = geo.docTop - sy;
      const s = s0 + (1 - s0) * e;
      const x = x0 + (geo.left - x0) * e;
      const y = y0 + (slotTop - y0) * e;
      boxEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
      // The credit leaves within the first sliver of scroll.
      const fade = clamp(sy / (geo.vh * 0.12));
      shadeEl.style.opacity = String(1 - fade);
      shadeEl.style.transform = `translate3d(0, ${-fade * 24}px, 0)`;
      const done = k >= 1;
      rootEl.dataset.done = done ? "true" : "false";
      html.dataset.lifeIntro = done ? "done" : "active";
    };

    const onScroll = () => {
      // will-change only while moving: left on, Chromium keeps a blurry raster
      // of the full-bleed photo after it comes back from print size.
      boxEl.style.willChange = "transform";
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        boxEl.style.willChange = "auto";
      }, 160);
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const measure = () => {
      // The deck's resting slot never moves, unlike the top print, which flies on every flip.
      const slot = document.querySelector<HTMLElement>("[data-life-slot]");
      if (!slot) return;
      const r = slot.getBoundingClientRect();
      const vw = html.clientWidth;
      const vh = window.innerHeight;
      const docTop = r.top + window.scrollY;
      const maxScroll = html.scrollHeight - vh;
      // Land with the print centered (a little higher on tall phones), but never make anyone
      // scroll more than about 1.4 screens for it: on short screens it lands lower instead.
      const preferred = Math.max(16, Math.min((vh - r.height) / 2, vh * 0.12 + 32));
      const rest = Math.min(Math.max(preferred, docTop - vh * 1.4), vh * 0.6);
      const end = Math.max(1, Math.min(docTop - rest, maxScroll));
      geo = { w: r.width, h: r.height, left: r.left, docTop, end, vw, vh };
      boxEl.style.width = `${r.width}px`;
      boxEl.style.height = `${r.height}px`;
      rootEl.dataset.ready = "true";
      frame();
    };

    const onResize = () => {
      // Toolbars sliding in and out only change the height a little. Skip those.
      if (geo && html.clientWidth === geo.vw && Math.abs(window.innerHeight - geo.vh) < 150) return;
      measure();
    };

    measure();
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      window.clearTimeout(idle);
      delete html.dataset.lifeIntro;
    };
  }, []);

  return (
    <div ref={root} className="life-intro" data-done="false">
      <noscript>
        <style>{`.life-intro{display:none}`}</style>
      </noscript>
      <div aria-hidden className="life-intro-spacer" />
      <div aria-hidden className="life-intro-layer">
        <div ref={box} className="life-intro-box">
          <picture>
            <source media="(prefers-reduced-motion: reduce)" srcSet={BLANK} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoSrc(photo.slug, 1200)}
              srcSet={photoSrcSet(photo.slug)}
              sizes="100vw"
              width={photo.width}
              height={photo.height}
              alt=""
              decoding="async"
              className="h-full w-full object-cover"
            />
          </picture>
        </div>
        <div ref={shade} className="absolute inset-0">
          <div className="life-intro-scrim-top absolute inset-x-0 top-0 h-36" />
          <div className="life-intro-scrim-bottom absolute inset-x-0 bottom-0 h-[55%]" />
          <div className="page absolute inset-x-0 bottom-0 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-end gap-4 sm:gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portrait}
                width={64}
                height={64}
                alt=""
                className="mb-1 block h-14 w-14 shrink-0 border border-rice/40 object-cover sm:h-16 sm:w-16"
              />
              <p className="font-display text-[clamp(1.8rem,7.2vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.025em] text-rice">
                {credit}
              </p>
            </div>
            <p className="mt-4 flex items-baseline gap-3 text-[0.95rem]">
              <span className="text-rice">{photo.title}</span>
              <span className="text-rice/75">{photo.place}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
