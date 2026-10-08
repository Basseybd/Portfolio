import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import LifeIntro from "@/components/LifeIntro";
import PrintDeck from "@/components/PrintDeck";
import { WorldLink } from "@/components/transition/WorldTransition";
import { life, photos, portrait, site } from "@/lib/content";

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
  const featured = photos.filter((p) => p.featured);
  const mail = `mailto:${site.email}?subject=${encodeURIComponent(life.bookingSubject)}`;
  return (
    <div className="life-page on-dark min-h-svh overflow-x-clip bg-graphite text-rice">
      <header className="page relative z-10 flex h-16 items-center justify-between">
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
      </header>

      <LifeIntro first={featured[0]} credit={life.introCredit} />

      {/* Phones get the photos right after the hello; wide screens put them beside it. */}
      <main
        id="main"
        className="page grid gap-y-14 pb-24 pt-8 sm:pt-12 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:content-center lg:gap-x-12 lg:gap-y-9 lg:pb-20 lg:pt-6"
      >
        <div className="lg:col-span-5 lg:row-start-1 lg:self-end">
          {/* His own face, so the people in the prints aren't mistaken for him. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portrait.srcThumb}
            width={64}
            height={64}
            alt={portrait.title}
            className="mb-7 block h-16 w-16 border border-graphite-rule object-cover lg:h-20 lg:w-20"
          />
          <h1 className="font-display text-[clamp(3.1rem,9vw,5.6rem)] font-medium leading-[0.98] tracking-[-0.025em]">
            {life.hello}
          </h1>
          <div aria-hidden className="chrome mt-8 h-[2px] w-24" />
          <p className="mt-7 max-w-[30rem] text-[1.1875rem] leading-relaxed text-rice">{life.lead}</p>
          <p className="mt-3 max-w-[30rem] text-[1.0625rem] leading-relaxed text-silver">{life.body}</p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:self-center">
          <PrintDeck photos={featured} />
        </div>

        <div className="lg:col-span-5 lg:row-start-2 lg:self-start">
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
      </main>

      <div className="page">
        <div aria-hidden className="h-px bg-graphite-rule" />
      </div>
      <Footer />
    </div>
  );
}
