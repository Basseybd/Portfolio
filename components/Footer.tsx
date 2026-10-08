import { site } from "@/lib/content";

// Shared with the pinned bio on /life, so the links stay reachable on wide screens.
export const footerLinks = [
  { href: site.linkedin, label: "LinkedIn" },
  { href: site.github, label: "GitHub" },
  { href: site.instagram, label: "Instagram" },
  { href: site.resume, label: "Résumé" },
];

export default function Footer() {
  const links = footerLinks;
  return (
    <footer className="on-dark bg-graphite text-silver">
      <div className="page flex flex-wrap items-center justify-between gap-4 py-8 text-[0.9rem]">
        <p>&copy; {new Date().getFullYear()} Bassey Duke</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-rice">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
