import ContactForm from "@/components/ContactForm";
import CopyEmail from "@/components/CopyEmail";
import { site } from "@/lib/content";

export default function Contact() {
  return (
    <section aria-labelledby="contact-title" className="brushed border-t border-white/60 text-ink">
      <div id="contact" className="page grid gap-14 py-24 sm:py-32 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-5">
          <h2
            id="contact-title"
            className="font-display text-[2.6rem] font-medium leading-[1.08] tracking-[-0.015em] sm:text-[3.3rem]"
          >
            Say hi.
          </h2>
          <p className="mt-6 max-w-[28rem] text-[1.0625rem] leading-relaxed text-steel">
            Questions, ideas, or want to trade notes on AI or photos? Send a
            message. I usually reply within a couple of days.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href={`mailto:${site.email}`}
              className="link break-all font-display text-[1.45rem] decoration-ink/40 hover:decoration-ink sm:text-[1.75rem]"
            >
              {site.email}
            </a>
            <CopyEmail email={site.email} />
          </div>
          <dl className="mt-8 grid max-w-[22rem] grid-cols-[6.5rem_1fr] gap-y-2 text-[0.95rem]">
            <dt className="text-steel">Based in</dt>
            <dd>{site.location}</dd>
            <dt className="text-steel">LinkedIn</dt>
            <dd>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="link decoration-ink/40 hover:decoration-ink">
                basseyduke
              </a>
            </dd>
            <dt className="text-steel">Instagram</dt>
            <dd>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="link decoration-ink/40 hover:decoration-ink">
                {site.instagramHandle}
              </a>
            </dd>
            <dt className="text-steel">GitHub</dt>
            <dd>
              <a href={site.github} target="_blank" rel="noopener noreferrer" className="link decoration-ink/40 hover:decoration-ink">
                basseybd
              </a>
            </dd>
          </dl>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
