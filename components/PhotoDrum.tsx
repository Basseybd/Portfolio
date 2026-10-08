"use client";

import { useEffect, useRef, useState } from "react";
import Lightbox from "@/components/Lightbox";
import { photoSrc, photoSrcSet, type Photo } from "@/lib/content";

// The favorites on a drum seen side on. Scrolling the page turns it: each photo
// holds at the front, then rolls down and away as the next one comes over the
// top. Adapted from a 21st.dev works wheel, drum only. It reads page scroll and
// never takes it over; transforms only.

const STEP = 40; // degrees between photos on the drum
const DRUM = 2.22; // drum radius, in card heights
const LENS = 2.7; // perspective distance, in card heights
const BOW = 1.3; // the strip curves away to the right, in card heights
const CULL = 1.6; // photos either side of the front still drawn
const PER = 0.42; // scroll per photo, in screen heights
const EASE = 0.16; // share of the remaining distance closed each frame

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const rad = (deg: number) => (deg * Math.PI) / 180;
// Each photo rests at the front for the first and last quarter of its stretch,
// so they come round one at a time instead of drifting.
const hold = (p: number) => {
  const i = Math.floor(p);
  const t = clamp((p - i - 0.25) / 0.5, 0, 1);
  return i + t * t * (3 - 2 * t);
};

export default function PhotoDrum({ photos }: { photos: Photo[] }) {
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const wheel = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [front, setFront] = useState(0);
  const [viewing, setViewing] = useState<number | null>(null);
  const n = photos.length;
  // Where the stage pins: just under the sticky header.
  const pinTop = () => (pin.current ? parseFloat(getComputedStyle(pin.current).top) || 0 : 0);

  const widest = Math.max(...photos.map((p) => p.width / p.height));
  const cardH = size.h ? Math.min(size.h * 0.62, (size.w * 0.84) / widest) : 0;
  const drumR = cardH * DRUM;
  const bow = cardH * BOW * clamp(size.w / 700, 0.45, 1);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!cardH) return;
    let pos = -1;
    let target = 0;
    let raf = 0;

    const read = () => {
      const r = section.current?.getBoundingClientRect();
      if (!r) return 0;
      return hold(clamp((pinTop() - r.top) / (window.innerHeight * PER), 0, n - 1));
    };

    const draw = () => {
      raf = 0;
      pos = pos < 0 ? target : pos + (target - pos) * EASE;
      if (Math.abs(target - pos) < 0.001) pos = target;
      if (wheel.current) wheel.current.style.transform = `translateZ(${-drumR}px)`;
      for (let i = 0; i < n; i++) {
        const card = cards.current[i];
        if (!card) continue;
        const d = i - pos;
        const deg = d * STEP;
        card.style.transform = `translateX(${bow * (1 - Math.cos(rad(deg)))}px) rotateX(${deg}deg) translateZ(${drumR}px)`;
        card.style.opacity = Math.abs(d) > CULL ? "0" : "1";
        card.style.zIndex = String(Math.round(100 - Math.abs(d) * 10));
      }
      setFront(clamp(Math.round(pos), 0, n - 1));
      if (pos !== target) raf = requestAnimationFrame(draw);
    };

    const onScroll = () => {
      target = read();
      if (!raf) raf = requestAnimationFrame(draw);
    };

    target = read();
    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [cardH, drumR, bow, n]);

  // Previous and Next scroll the page to that photo's stop, so scroll stays the only driver.
  const go = (i: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: top - pinTop() + clamp(i, 0, n - 1) * window.innerHeight * PER, behavior: smooth ? "smooth" : "auto" });
  };

  const current = photos[front];

  return (
    <div ref={section} style={{ height: `calc(100svh - 4rem + ${(n - 1) * PER * 100}svh)` }}>
      <div ref={pin} className="sticky top-16 h-[calc(100svh-4rem)]">
        <div ref={stage} className="absolute inset-x-0 top-0 bottom-[6.5rem] overflow-hidden" style={{ perspective: `${cardH * LENS || 1000}px` }}>
          <div ref={wheel} className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]">
            {cardH > 0 &&
              photos.map((p, i) => {
                const w = cardH * (p.width / p.height);
                const isFront = i === front;
                return (
                  <button
                    key={p.slug}
                    ref={(node) => {
                      cards.current[i] = node;
                    }}
                    type="button"
                    tabIndex={isFront ? 0 : -1}
                    aria-hidden={!isFront}
                    aria-label={`View larger: ${p.title}`}
                    onClick={() => (isFront ? setViewing(i) : go(i))}
                    className="absolute block cursor-zoom-in overflow-hidden bg-graphite shadow-[0_24px_48px_-20px_rgba(0,0,0,0.8)] [backface-visibility:hidden]"
                    style={{ width: w, height: cardH, marginLeft: -w / 2, marginTop: -cardH / 2, opacity: i === 0 ? 1 : 0 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoSrc(p.slug, 1200)}
                      srcSet={photoSrcSet(p)}
                      sizes={`${Math.round(w)}px`}
                      width={p.width}
                      height={p.height}
                      alt={p.alt}
                      loading={i < 2 ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                      className="h-full w-full select-none object-cover"
                    />
                  </button>
                );
              })}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex h-[6.5rem] flex-col justify-end gap-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <p aria-live="polite" className="min-w-0">
            <span className="block font-display text-[1.2rem] font-medium leading-tight text-rice">{current?.title}</span>
            <span className="mt-1 block text-[0.9rem] text-silver">{current?.place}</span>
          </p>
          <div className="flex shrink-0 items-center gap-4">
            <button
              type="button"
              onClick={() => go(front - 1)}
              disabled={front === 0}
              className="min-h-11 px-1 text-[0.95rem] font-medium text-rice transition-colors duration-200 hover:text-chrome-light disabled:text-silver/50"
            >
              Previous
            </button>
            <span aria-hidden className="label text-silver">
              {String(front + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => go(front + 1)}
              disabled={front === n - 1}
              className="min-h-11 px-1 text-[0.95rem] font-medium text-rice transition-colors duration-200 hover:text-chrome-light disabled:text-silver/50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Lightbox photos={photos} index={viewing} onClose={() => setViewing(null)} onIndex={setViewing} />
    </div>
  );
}
