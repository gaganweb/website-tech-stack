import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

const sans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Website Tech Stack",
  description:
    "Detect CMS, hosting, analytics, and frameworks powering any website",
};

// Runs before paint so the saved theme applies without a flash.
const THEME_INIT = `try{var t=localStorage.getItem("theme");if(t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: THEME_INIT adds the "dark" class before React hydrates.
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-full font-sans flex flex-col items-center bg-[var(--background)] text-[var(--heading-text)]">
        <header className="w-full max-w-5xl py-6 px-4 flex items-center justify-between gap-6 border-b border-[var(--card-border)]">
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tighter text-[var(--heading-text)]">
              Website Tech Stack
            </h1>
            <p className="mt-1 font-mono text-xs sm:text-sm leading-snug text-[var(--body-text)] lg:whitespace-nowrap">
              Detect CMS, hosting, analytics, and frameworks powering any website
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>
        <main className="w-full max-w-5xl px-4 py-10 flex flex-col items-center gap-6 flex-1">
          {children}
        </main>
        <footer className="w-full max-w-5xl px-4 py-6 border-t border-[var(--card-border)] text-center text-sm text-slate-500 dark:text-slate-400">
          Designed &amp; Developed by{" "}
          <a
            href="https://gagandutta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-700 dark:text-slate-300 underline-offset-4 hover:underline hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Gagan Dutta
          </a>
        </footer>
      </body>
    </html>
  );
}
