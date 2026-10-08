import type { Photo } from "@/lib/content";

// The print on top of the /life stack, shared with the intro so the
// full-bleed photo always matches the print it lands in.
let top: Photo | null = null;
const subs = new Set<() => void>();

export function setLifeTop(p: Photo) {
  if (top?.slug === p.slug) return;
  top = p;
  subs.forEach((f) => f());
}

export const getLifeTop = () => top;

export function subscribeLifeTop(f: () => void) {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}
