"use client";

import { useEffect, useRef, useState } from "react";
import type { Milestone } from "@/lib/content";

// Experience as a pinned horizontal timeline on wide screens: the section
// pins, the track slides sideways as you scroll, and each milestone draws
// its stem as it reaches the reading line. Phones and reduced-motion
// visitors get the same content as a plain vertical timeline.

export default function Timeline({ items }: { items: Milestone[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 960px) and (min-height: 620px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPinned(wide.matches && !reduce.matches);
    update();
    wide.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const lis = Array.from(track.querySelectorAll<HTMLLIElement>("li[data-on]"));

    if (!pinned) {
      section.style.height = "";
      track.style.transform = "";
      lis.forEach((li) => (li.dataset.on = "true"));
      return;
    }

    let distance = 0;
    let raf = 0;

    const measure = () => {
      distance = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.height = `${distance + window.innerHeight}px`;
    };

    const frame = () => {
      raf = 0;
      const top = section.getBoundingClientRect().top;
      const progress = distance ? Math.min(1, Math.max(0, -top / distance)) : 0;
      track.style.transform = `translate3d(${-progress * distance}px,0,0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      const line = window.innerWidth * 0.78;
      for (const li of lis) {
        const left = li.getBoundingClientRect().left;
        li.dataset.on = left < line ? "true" : "false";
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      measure();
      frame();
    };

    measure();
    frame();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [pinned]);

  return (
    <section
      ref={sectionRef}
      id="experience"
      aria-labelledby="experience-title"
      data-pinned={pinned}
      className="group/tl on-dark relative bg-graphite text-rice"
    >
      <div className="group-data-[pinned=true]/tl:sticky group-data-[pinned=true]/tl:top-0 group-data-[pinned=true]/tl:flex group-data-[pinned=true]/tl:h-screen group-data-[pinned=true]/tl:flex-col group-data-[pinned=true]/tl:overflow-hidden">
        <div className="page pt-24 sm:pt-32 group-data-[pinned=true]/tl:pt-28">
          <div className="grid gap-5 lg:grid-cols-12 lg:gap-x-12">
            <h2
              id="experience-title"
              className="font-display text-[2.6rem] font-medium leading-[1.05] tracking-[-0.015em] sm:text-[3.25rem] lg:col-span-4"
            >
              Experience
            </h2>
            <p className="max-w-[34rem] text-[1.0625rem] leading-relaxed text-silver lg:col-span-7 lg:col-start-6 lg:pt-3">
              Five-plus years full-time, promoted twice at Accenture, now
              building AI features at Capital One.
            </p>
          </div>
        </div>

        <div className="relative flex-1 group-data-[pinned=true]/tl:flex group-data-[pinned=true]/tl:items-center">
          <ol
            ref={trackRef}
            className="page relative mt-14 pb-24 will-change-transform lg:grid lg:grid-cols-3 lg:gap-x-12 lg:gap-y-12 group-data-[pinned=true]/tl:m-0 group-data-[pinned=true]/tl:flex group-data-[pinned=true]/tl:w-max group-data-[pinned=true]/tl:max-w-none group-data-[pinned=true]/tl:pb-0 group-data-[pinned=true]/tl:pr-[30vw]"
          >
            {/* Baseline the stems grow from (wide screens). */}
            <span
              aria-hidden
              className="absolute left-0 right-0 top-[7.75rem] hidden h-px bg-graphite-rule group-data-[pinned=true]/tl:block"
            />
            {items.map((m, i) => (
              <li
                key={`${m.year}-${m.org}-${m.title}`}
                data-on="true"
                className="group/item relative border-l border-graphite-rule pb-12 pl-7 last:pb-0 group-data-[pinned=true]/tl:w-[22rem] group-data-[pinned=true]/tl:shrink-0 group-data-[pinned=true]/tl:border-l-0 group-data-[pinned=true]/tl:pb-0 group-data-[pinned=true]/tl:pl-0 group-data-[pinned=true]/tl:pr-12"
              >
                <span
                  aria-hidden
                  className="absolute -left-[4px] top-3 h-[7px] w-[7px] rounded-full bg-chrome-light group-data-[pinned=true]/tl:left-0 group-data-[pinned=true]/tl:top-[calc(7.75rem-3px)]"
                />
                <p className="font-display text-[2.6rem] font-medium leading-none tracking-[-0.02em] text-rice transition-colors duration-500 group-data-[pinned=true]/tl:text-[4.5rem] group-data-[on=false]/item:text-[#64686D]">
                  {m.year}
                </p>
                <span
                  aria-hidden
                  className="mt-4 hidden h-16 w-px origin-top chrome-v transition-transform duration-700 ease-out group-data-[pinned=true]/tl:ml-[3px] group-data-[pinned=true]/tl:mt-[3.25rem] group-data-[pinned=true]/tl:block group-data-[on=false]/item:scale-y-0"
                />
                <div className="mt-4 transition-[opacity,transform] duration-700 ease-out group-data-[on=false]/item:translate-y-3 group-data-[on=false]/item:opacity-0">
                  <h3 className="text-[1.15rem] font-bold leading-snug">{m.title}</h3>
                  <p className="mt-1 text-[0.95rem] text-chrome-light">{m.org}</p>
                  <p className="mt-3 max-w-[19rem] text-[1rem] leading-relaxed text-silver">{m.detail}</p>
                </div>
                {i === items.length - 1 && <span className="sr-only">Current role.</span>}
              </li>
            ))}
            <li
              data-on="true"
              className="group/item relative pl-7 pt-4 group-data-[pinned=true]/tl:w-[24rem] group-data-[pinned=true]/tl:shrink-0 group-data-[pinned=true]/tl:pl-0 group-data-[pinned=true]/tl:pt-0"
            >
              <p className="font-display text-[2.6rem] font-medium leading-none tracking-[-0.02em] text-chrome-light group-data-[pinned=true]/tl:text-[4.5rem]">
                Now
              </p>
              <div className="mt-4 transition-[opacity,transform] duration-700 ease-out group-data-[pinned=true]/tl:mt-[8.25rem] group-data-[on=false]/item:translate-y-3 group-data-[on=false]/item:opacity-0">
                <h3 className="text-[1.15rem] font-bold leading-snug">Building with AI</h3>
                <p className="mt-3 max-w-[19rem] text-[1rem] leading-relaxed text-silver">
                  Shipping AI features, tinkering on side projects, and taking photos in between.
                </p>
                <a
                  href="#contact"
                  className="link mt-4 inline-block text-[1.0625rem] decoration-chrome-light hover:text-chrome-light"
                >
                  Say hi
                </a>
              </div>
            </li>
          </ol>
        </div>

        <div aria-hidden className="page hidden pb-10 group-data-[pinned=true]/tl:block">
          <div className="h-px w-full bg-graphite-rule">
            <div ref={barRef} className="h-px w-full origin-left scale-x-0 chrome" />
          </div>
        </div>
      </div>
    </section>
  );
}
