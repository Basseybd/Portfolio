import { services } from "@/lib/content";

export default function Services() {
  return (
    <section id="focus" aria-labelledby="focus-title" className="bg-paper">
      <div className="page py-24 sm:py-32">
        <div className="grid gap-5 lg:grid-cols-12 lg:gap-x-12">
          <h2
            id="focus-title"
            className="font-display text-[2.6rem] font-medium leading-[1.05] tracking-[-0.015em] sm:text-[3.25rem] lg:col-span-5"
          >
            What I work on
          </h2>
          <p className="max-w-[32rem] text-[1.0625rem] leading-relaxed text-stone lg:col-span-6 lg:col-start-7 lg:pt-4">
            The work I like most: AI in a real product, not a demo.
          </p>
        </div>

        <div className="mt-16 lg:grid lg:grid-cols-12 lg:gap-x-12">
          <dl className="grid gap-x-12 gap-y-12 md:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {services.map((s) => (
              <div key={s.title}>
                <div aria-hidden className="chrome h-[2px] w-full" />
                <dt className="mt-5 font-display text-[1.5rem] font-medium leading-snug">{s.title}</dt>
                <dd className="mt-3 text-[1.0625rem] leading-relaxed text-stone">{s.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
