import ThemeToggle from "@/components/ThemeToggle";
import UpgradeSimulationPanel from "@/components/UpgradeSimulationPanel";
import Scanner from "@/components/Scanner";

export const instant = false;

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-[var(--background)] text-[var(--heading-text)]">
      <header className="w-full max-w-4xl py-6 px-4 flex items-center justify-center gap-6 border-b border-[var(--card-border)]">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--heading-text)]">
          Website Tech Stack Scanner
        </h1>
        <p className="mt-1 text-sm leading-snug text-[var(--body-text)] max-w-[320px]">
          Detect CMS, hosting, analytics, and frameworks powering any website
        </p>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <UpgradeSimulationPanel />
        </div>
      </header>

      <main className="w-full max-w-3xl px-4 py-10 flex flex-col items-center gap-6 flex-1">
        <Scanner />
      </main>
    </div>
  );
}
