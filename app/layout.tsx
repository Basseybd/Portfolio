import type React from "react";
import type { Metadata, Viewport } from "next";
import "@fontsource/shippori-mincho/latin-400.css";
import "@fontsource/shippori-mincho/latin-500.css";
import "@fontsource/zen-kaku-gothic-new/latin-400.css";
import "@fontsource/zen-kaku-gothic-new/latin-500.css";
import "@fontsource/zen-kaku-gothic-new/latin-700.css";
import "@fontsource/fragment-mono/400.css";
import "@fontsource/saira-extra-condensed/latin-800.css";
import "./globals.css";
import { WorldTransitionProvider } from "@/components/transition/WorldTransition";
import { site } from "@/lib/content";

const title = "Bassey Duke | AI-focused Senior Software Engineer";
const description =
  "Senior software engineer in New York building AI features and production systems with TypeScript, React, Node.js, and AWS. Photographer on the side.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title,
    description,
    url: site.url,
    siteName: "Bassey Duke",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Bassey Duke, senior software engineer and photographer in New York" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export const viewport: Viewport = {
  themeColor: "#E3E4E2",
};

// Runs before first paint. Marks the first page load of a session so the home
// page can play its intro, and only then.
const introScript = `(function(){var d=document.documentElement;try{if(!sessionStorage.getItem("bd-intro")){d.setAttribute("data-intro","");sessionStorage.setItem("bd-intro","1")}}catch(e){d.setAttribute("data-intro","")}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:text-ink focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <WorldTransitionProvider>{children}</WorldTransitionProvider>
      </body>
    </html>
  );
}
