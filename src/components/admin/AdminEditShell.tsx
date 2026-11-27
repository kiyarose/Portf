import type { ReactNode } from "react";
import { LanguageProvider } from "../../providers/LanguageProvider";
import { ThemeProvider } from "../../providers/ThemeProvider";
import { ThemeToggle } from "../ThemeToggle";
import { DataAdminApp } from "./DataAdminApp";

export function AdminEditShell({ children }: { children?: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-[#f7f8fc] text-slate-900 dark:bg-[#111827] dark:text-slate-100">
          <header className="mx-auto flex max-w-6xl items-center justify-end px-4 pt-4 sm:px-6">
            <ThemeToggle />
          </header>
          {children ?? <DataAdminApp />}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
