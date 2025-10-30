import type { ReactNode } from "react";

type AppShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  primaryAction?: ReactNode;
};

export function AppShell({
  title,
  description,
  primaryAction,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 safe-pt border-b border-black/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Time Record
            </p>
            <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
            {description ? (
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">{description}</p>
            ) : null}
          </div>
          {primaryAction ? (
            <div className="shrink-0">{primaryAction}</div>
          ) : null}
        </div>
      </header>

      <main className="flex-1 bg-slate-50/60">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
