"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Lightbox from "@/components/Lightbox";
import { photoSrc, photoSrcSet, type Photo } from "@/lib/content";
import { setLifeTop } from "@/lib/lifeTop";

// A loose stack of prints on the table. Drag or swipe the top print away to
// see the next one; tap it to view it full screen.

const VISIBLE = 4;
const REST = [
  { x: 0, y: 0, r: 0 },
  { x: -18, y: 12, r: -4 },
  { x: 20, y: 22, r: 3.2 },
  { x: -8, y: 32, r: -1.6 },
];

function Print({ photo, eager, top }: { photo: Photo; eager: boolean; top: boolean }) {
  return (
    <>
      <div data-life-top={top || undefined} className="relative aspect-[2/3] w-full overflow-hidden bg-graphite">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoSrc(photo.slug, 1200)}
          srcSet={photoSrcSet(photo.slug)}
          sizes="(min-width: 1024px) 400px, 82vw"
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover"
        />
      </div>
      <figcaption className="flex items-baseline justify-between gap-4 px-1 pt-4 text-ink">
        <span className="font-display text-[1.05rem] font-medium leading-tight">{photo.title}</span>
        <span className="shrink-0 text-[0.8rem] text-stone">{photo.place}</span>
      </figcaption>
    </>
  );
}

export default function PrintDeck({ photos }: { photos: Photo[] }) {
  const [order, setOrder] = useState(() => photos.map((_, i) => i));
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [fly, setFly] = useState<0 | 1 | -1>(0);
  const [viewing, setViewing] = useState<number | null>(null);
  const drag = useRef<{ x: number; t: number; moved: boolean } | null>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    setLifeTop(photos[order[0]]);
  }, [order, photos]);

  const advance = useCallback(() => setOrder((o) => [...o.slice(1), o[0]]), []);
  const back = useCallback(() => setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]), []);

  const throwTop = useCallback(
    (dir: 1 | -1) => {
      if (fly) return;
      if (reduce.current) {
        advance();
        return;
      }
      setFly(dir);
    },
    [fly, advance],
  );

  const onTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== "transform" || !fly) return;
    advance();
    setFly(0);
    setDx(0);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (fly) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, t: performance.now(), moved: false };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!drag.current) return;
    const d = e.clientX - drag.current.x;
    if (Math.abs(d) > 6) drag.current.moved = true;
    setDx(d);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    const s = drag.current;
    drag.current = null;
    setDragging(false);
    if (!s) return;
    const d = e.clientX - s.x;
    const v = Math.abs(d) / Math.max(1, performance.now() - s.t);
    if (s.moved && (Math.abs(d) > 110 || v > 0.6)) {
      setFly(d > 0 ? 1 : -1);
    } else {
      setDx(0);
      if (!s.moved) setViewing(order[0]);
    }
  };

  const top = photos[order[0]];
  const visible = order.slice(0, VISIBLE);

  return (
    <div>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Favorite photos"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") throwTop(-1);
          if (e.key === "ArrowLeft") back();
          if (e.key === "Enter") setViewing(order[0]);
        }}
        className="relative mx-auto w-full max-w-[25rem] outline-offset-8"
      >
        {/* Spacer that gives the stack its height. Its photo box is exactly where the top
            print rests, and it never moves, so the /life intro lands on it. */}
        <div aria-hidden className="invisible bg-paper p-3 pb-5 sm:p-4 sm:pb-6">
          <div data-life-slot className="aspect-[2/3] w-full" />
          <div className="pt-4 text-[1.05rem] leading-tight">&nbsp;</div>
        </div>

        {visible
          .map((idx, pos) => ({ idx, pos }))
          .reverse()
          .map(({ idx, pos }) => {
            const p = photos[idx];
            const isTop = pos === 0;
            const rest = REST[pos];
            let transform = `translate3d(${rest.x}px, ${rest.y}px, 0) rotate(${rest.r}deg) scale(${1 - pos * 0.02})`;
            let opacity = 1;
            if (isTop && fly) {
              transform = `translate3d(${fly * 130}%, -4%, 0) rotate(${fly * 16}deg)`;
              opacity = 0;
            } else if (isTop && dx) {
              transform = `translate3d(${dx}px, 0, 0) rotate(${dx * 0.045}deg)`;
            }
            return (
              <figure
                key={p.slug}
                aria-hidden={!isTop}
                inert={!isTop}
                onPointerDown={isTop ? onPointerDown : undefined}
                onPointerMove={isTop ? onPointerMove : undefined}
                onPointerUp={isTop ? onPointerUp : undefined}
                onPointerCancel={isTop ? onPointerUp : undefined}
                onTransitionEnd={isTop ? onTransitionEnd : undefined}
                className={`absolute inset-0 bg-paper p-3 pb-5 shadow-[0_22px_40px_-18px_rgba(0,0,0,0.65)] sm:p-4 sm:pb-6 ${
                  isTop ? "cursor-grab touch-pan-y active:cursor-grabbing" : ""
                }`}
                style={{
                  transform,
                  opacity,
                  zIndex: VISIBLE - pos,
                  transition: dragging && isTop ? "none" : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease",
                }}
              >
                <Print photo={p} eager={pos < 2} top={isTop} />
              </figure>
            );
          })}
      </div>

      <div className="mx-auto mt-10 flex max-w-[25rem] items-center justify-between">
        <button
          type="button"
          onClick={back}
          className="px-1 py-2 text-[0.95rem] font-medium text-rice transition-colors duration-200 hover:text-chrome-light"
        >
          Previous
        </button>
        <p aria-live="polite" className="label text-silver">
          <span className="sr-only">
            Showing {top.title}, photo {order[0] + 1} of {photos.length}.
          </span>
          <span aria-hidden>
            {String(order[0] + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </span>
        </p>
        <button
          type="button"
          onClick={() => throwTop(-1)}
          className="px-1 py-2 text-[0.95rem] font-medium text-rice transition-colors duration-200 hover:text-chrome-light"
        >
          Next
        </button>
      </div>
      <p className="mt-3 text-center text-[0.85rem] text-silver">Drag the top print to flip through. Tap it to see it big.</p>

      <Lightbox photos={photos} index={viewing} onClose={() => setViewing(null)} onIndex={setViewing} />
    </div>
  );
}
