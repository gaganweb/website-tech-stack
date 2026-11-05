import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Website Tech Stack Scanner",
  description:
    "Detect CMS, hosting, analytics, and frameworks powering any website",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  void children;
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col items-center bg-[var(--background)] text-[var(--heading-text)]">
        <header className="w-full max-w-[680px] py-6 px-4 flex items-center justify-center gap-6 border-b border-[var(--card-border)]">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--heading-text)]">
            Website Tech Stack Scanner
          </h1>
          <p className="mt-1 text-sm leading-snug text-[var(--body-text)] max-w-[320px]">
            Detect CMS, hosting, analytics, and frameworks powering any website
          </p>
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>
      </body>
    </html>
  );
}
