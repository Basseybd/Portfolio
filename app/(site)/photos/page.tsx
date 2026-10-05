import type { Metadata } from "next";
import PhotoArchive from "@/components/PhotoArchive";
import { photos, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Photos | Bassey Duke",
  description:
    "Travel, nights out, portraits, and New York, shot on a Fujifilm X100VI by Bassey Duke.",
  openGraph: {
    title: "Photos | Bassey Duke",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export default function PhotosPage() {
  return (
    <div className="page pb-28 pt-12 sm:pt-16">
      <header className="grid gap-6 lg:grid-cols-12 lg:gap-x-12">
        <h1 className="font-display text-[clamp(3.4rem,9vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.025em] lg:col-span-6">
          Photos
        </h1>
        <div className="lg:col-span-5 lg:col-start-8 lg:pt-5">
          <p className="text-[1.125rem] leading-relaxed text-ink">
            Favorites from trips, long dinners, and nights out with friends.
            All shot on a Fujifilm X100VI.
          </p>
          <p className="mt-3 text-[1.0625rem] text-stone">
            More on Instagram at{" "}
            <a href={site.photoArchive} target="_blank" rel="noopener noreferrer" className="link decoration-ink hover:text-steel">
              {site.photoArchiveHandle}
            </a>
            .
          </p>
        </div>
      </header>
      <div aria-hidden className="chrome mt-12 h-[2px] w-full" />
      <PhotoArchive photos={photos} />
    </div>
  );
}
