"use client";

import { useEffect, useRef } from "react";
import { photoSrc, photoSrcSet, type Photo } from "@/lib/content";

type Props = {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
};

// Full-screen viewer: arrow keys, swipe, Escape, and click outside to close.
export default function Lightbox({ photos, index, onClose, onIndex }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (index !== null && !dlg.open) dlg.showModal();
    if (index === null && dlg.open) dlg.close();
  }, [index]);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    const handle = () => onClose();
    dlg.addEventListener("close", handle);
    return () => dlg.removeEventListener("close", handle);
  }, [onClose]);

  const step = (delta: number) => {
    if (index === null || photos.length < 2) return;
    onIndex((index + delta + photos.length) % photos.length);
  };

  const current = index === null ? null : photos[index];
  const next = index === null || photos.length < 2 ? null : photos[(index + 1) % photos.length];

  return (
    <dialog
      ref={ref}
      aria-label="Photo viewer"
      className="on-dark m-0 h-[100dvh] max-h-none w-screen max-w-none bg-graphite p-0 text-rice backdrop:bg-graphite/95"
      style={{ overscrollBehavior: "contain" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {current && index !== null && (
        <div className="flex h-full flex-col">
          <div className="page flex h-16 shrink-0 items-center justify-between">
            <span className="label text-silver">
              {index + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="px-2 py-2 text-[0.95rem] font-medium text-rice transition-colors duration-200 hover:text-chrome-light"
              autoFocus
            >
              Close
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-24"
            onClick={(e) => {
              if (e.target === e.currentTarget) ref.current?.close();
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.slug}
              src={photoSrc(current.slug, 1200)}
              srcSet={photoSrcSet(current)}
              sizes="100vw"
              width={current.width}
              height={current.height}
              alt={current.alt}
              className="block max-h-full w-auto max-w-full object-contain"
            />
            {next && (
              // Warm the cache for the next photo.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoSrc(next.slug, 1200)} alt="" aria-hidden className="hidden" />
            )}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="absolute left-3 top-1/2 hidden -translate-y-1/2 px-3 py-3 text-[0.95rem] text-silver transition-colors duration-200 hover:text-rice sm:block"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="absolute right-3 top-1/2 hidden -translate-y-1/2 px-3 py-3 text-[0.95rem] text-silver transition-colors duration-200 hover:text-rice sm:block"
                >
                  Next
                </button>
              </>
            )}
          </div>

          <div className="page flex shrink-0 flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5">
            <span className="font-display text-[1.15rem] font-medium">{current.title}</span>
            <span className="flex gap-5 text-[0.9rem] text-silver">
              <span>{current.place}</span>
              <span className="label">{current.settings}</span>
            </span>
          </div>
        </div>
      )}
    </dialog>
  );
}
