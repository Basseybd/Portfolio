import GlyphPortrait from "@/components/GlyphPortrait";
import { portrait, site } from "@/lib/content";

export default function Hero() {
  return (
    <section id="top" aria-labelledby="hero-name" className="page pb-20 pt-10 sm:pt-14 lg:pb-28 lg:pt-16">
      <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-6">
          <h1
            id="hero-name"
            className="font-display text-[clamp(4rem,10.5vw,7.5rem)] font-medium leading-[0.92] tracking-[-0.025em]"
          >
            Bassey
            <br />
            Duke
          </h1>
          <div aria-hidden className="chrome mt-9 h-[3px] w-full max-w-[34rem]" />

          <p className="mt-9 max-w-[19ch] font-display text-[clamp(1.7rem,3.9vw,2.4rem)] leading-[1.22]">
            I build AI features people actually use, and the systems that keep
            them running.
          </p>

          <p className="mt-6 max-w-[31rem] text-[1.0625rem] leading-relaxed text-stone">
            Senior software engineer at Capital One and a photographer on the
            side, based in New York.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="btn-chrome px-6 py-3.5 text-[1rem] font-medium"
            >
              Get in touch
            </a>
            <a
              href={site.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-ink/80 px-6 py-3.5 text-[1rem] font-medium transition-colors duration-200 hover:bg-ink hover:text-paper"
            >
              View résumé
            </a>
          </div>
        </div>

        <div className="lg:col-span-6">
          <GlyphPortrait src={portrait.srcSmall} alt={portrait.alt} />
        </div>
      </div>
    </section>
  );
}
