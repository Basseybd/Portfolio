import { sideBuilds, toolkit } from "@/lib/content";

// Side builds and the toolkit. With no side builds listed, only the toolkit shows.
export default function SideBuilds() {
  const hasBuilds = sideBuilds.length > 0;
  return (
    <section id="side-builds" aria-labelledby={hasBuilds ? "side-title" : "toolkit-title"}>
      <div className="page py-24 sm:py-28">
        {hasBuilds && (
          <div className="mb-14 grid gap-10 border-b border-ink/20 pb-24 lg:grid-cols-12 lg:gap-x-12">
            <h2 id="side-title" className="font-display text-[2.2rem] font-medium leading-tight lg:col-span-4">
              Side builds
            </h2>
            <ul className="grid gap-x-12 gap-y-12 md:grid-cols-2 lg:col-span-7 lg:col-start-6">
              {sideBuilds.map((b) => (
                <li key={b.title}>
                  <h3 className="font-display text-[1.5rem] font-medium">{b.title}</h3>
                  <p className="mt-2 text-[1.0625rem] leading-relaxed text-stone">{b.body}</p>
                  <p className="label mt-3 text-stone">{b.stack}</p>
                  <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[1rem]">
                    <a href={b.live} target="_blank" rel="noopener noreferrer" className="link decoration-ink hover:text-steel">
                      {b.liveLabel}
                    </a>
                    <a href={b.code} target="_blank" rel="noopener noreferrer" className="link decoration-rule hover:decoration-ink">
                      Source on GitHub
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div id="toolkit" className="grid gap-8 lg:grid-cols-12 lg:gap-x-12">
          <h2 id="toolkit-title" className="font-display text-[2.2rem] font-medium leading-tight lg:col-span-4">
            Toolkit
          </h2>
          <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:col-span-7 lg:col-start-6 lg:grid-cols-3">
            {toolkit.map((t) => (
              <div key={t.group}>
                <dt className="text-[0.95rem] font-bold text-ink">{t.group}</dt>
                <dd className="mt-1.5 text-[1rem] leading-relaxed text-stone">{t.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
