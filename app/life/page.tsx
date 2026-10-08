import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Footer, { footerLinks } from "@/components/Footer";
import PhotoDrum from "@/components/PhotoDrum";
import PrintDeck from "@/components/PrintDeck";
import { WorldLink } from "@/components/transition/WorldTransition";
import { life, photos, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Life | Bassey Duke",
  description:
    "Photos by Bassey Duke: trips, dinners with friends, and New York after dark, shot on a Fujifilm X100VI.",
  alternates: { canonical: "/life" },
  openGraph: {
    title: "Life | Bassey Duke",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#17181A",
};

export default function LifePage() {
  const favorites = photos.filter((p) => p.featured);
  const lead = favorites.find((p) => p.slug === life.leadPhoto);
  const featured = lead ? [lead, ...favorites.filter((p) => p !== lead)] : favorites;
  const mail = `mailto:${site.email}?subject=${encodeURIComponent(life.bookingSubject)}`;
  return (
    <div className="life-page on-dark min-h-svh overflow-x-clip bg-graphite text-rice">
      <header className="sticky top-0 z-30 bg-graphite">
        <div className="page flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-[1.3rem] font-medium tracking-[-0.01em]">
          {site.name}
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-5 text-[0.95rem] sm:gap-7">
            <li>
              <WorldLink href="/work" world="work" className="text-silver transition-colors duration-200 hover:text-rice">
                Work
              </WorldLink>
            </li>
            <li>
              <Link href="/photos" className="text-silver transition-colors duration-200 hover:text-rice">
                Photos
              </Link>
            </li>
            <li>
              <a
                href={site.photoArchive}
                target="_blank"
                rel="noopener noreferrer"
                className="text-silver transition-colors duration-200 hover:text-rice"
              >
                Instagram
              </a>
            </li>
          </ul>
        </nav>
        </div>
      </header>

      {/* Bio on the left, pinned on wide screens; the favorites roll past on the right as you scroll.
          Phones get the bio first, then the photos. */}
      <main id="main" className="page grid pb-24 pt-8 sm:pt-12 lg:grid-cols-12 lg:gap-x-12 lg:pb-0 lg:pt-0">
        <div className="lg:sticky lg:top-16 lg:col-span-5 lg:flex lg:h-[calc(100svh-4rem)] lg:flex-col lg:justify-center lg:self-start lg:py-16">
          <h1 className="font-display text-[clamp(3.1rem,9vw,5.2rem)] font-medium leading-[0.98] tracking-[-0.025em]">
            {life.hello}
          </h1>
          <div aria-hidden className="chrome mt-7 h-[2px] w-24" />
          <p className="mt-6 max-w-[30rem] text-[1.1875rem] leading-relaxed text-rice">{life.lead}</p>
          <p className="mt-3 max-w-[30rem] text-[1.0625rem] leading-relaxed text-silver">{life.body}</p>
          <div className="mt-8">
          <div className="flex flex-wrap gap-3">
            <Link href="/photos" className="btn-chrome px-6 py-3.5 text-[1rem] font-medium">
              See all {photos.length} photos
            </Link>
            <a
              href={site.photoArchive}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-rice/60 px-6 py-3.5 text-[1rem] font-medium transition-colors duration-200 hover:border-rice hover:bg-rice hover:text-graphite"
            >
              {site.photoArchiveHandle}
            </a>
          </div>
          <p className="mt-10 max-w-[30rem] border-t border-graphite-rule pt-6 text-[0.975rem] leading-relaxed text-silver">
            {life.booking}{" "}
            <a href={mail} className="link whitespace-nowrap text-rice decoration-rice/50 hover:decoration-rice">
              {life.bookingCta}
            </a>
            .
          </p>
          <p className="mt-3 max-w-[30rem] text-[0.975rem] leading-relaxed text-silver">
            {life.otl}{" "}
            <a
              href={life.otlHref}
              target="_blank"
              rel="noopener noreferrer"
              className="link whitespace-nowrap text-rice decoration-rice/50 hover:decoration-rice"
            >
              {life.otlCta}
            </a>
            .
          </p>
          </div>
          {/* Wide, tall-enough screens: the footer lives here, pinned with the bio, so the links
              stay in reach while the photos roll. Phones and short laptops get the footer at the end. */}
          <div className="absolute bottom-7 left-0 hidden items-center gap-x-6 text-[0.9rem] text-silver lg:[@media(min-height:800px)]:flex">
            <p>&copy; {new Date().getFullYear()} Bassey Duke</p>
            <ul className="flex gap-x-6">
              {footerLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-rice">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 lg:col-span-7 lg:mt-0">
          <noscript>
            <style>{`.life-drum{display:none}.life-deck-alt{display:block}`}</style>
          </noscript>
          <div className="life-drum">
            <PhotoDrum photos={featured} />
          </div>
          <div className="life-deck-alt lg:py-24">
            <PrintDeck photos={featured} />
          </div>
        </div>
      </main>

      {/* Shown only where the pinned row above isn't, so it never appears twice. */}
      <div className="lg:[@media(min-height:800px)]:hidden">
        <div className="page">
          <div aria-hidden className="h-px bg-graphite-rule" />
        </div>
        <Footer />
      </div>
    </div>
  );
}
