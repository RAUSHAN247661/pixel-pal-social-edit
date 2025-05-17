
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-lg">
            S
          </div>
          <h1 className="text-xl font-bold">Social Media Image Editor</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
