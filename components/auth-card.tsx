"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  kicker: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthCard({ kicker, title, subtitle, children }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.72_0.12_145/0.35),transparent)]"
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#245b3b] text-sm font-extrabold text-white shadow-sm">
            GAIA
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">GAIA</span>
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-4 sm:px-8 sm:pt-10">
        <section className="mx-auto w-full max-w-md text-center">
          <Badge
            variant="secondary"
            className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide"
          >
            <Sparkles className="mr-1.5 size-3 text-emerald-700" />
            {kicker}
          </Badge>

          <h1 className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-balance text-3xl font-semibold tracking-tight text-foreground duration-700 sm:text-4xl">
            {title}
          </h1>

          <p className="mx-auto mt-3 max-w-sm animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-pretty text-sm leading-relaxed text-muted-foreground duration-700 [animation-delay:120ms]">
            {subtitle}
          </p>

          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 fill-mode-both rounded-2xl border bg-card/80 p-6 text-left shadow-sm backdrop-blur-sm duration-700 [animation-delay:200ms] sm:p-8">
            {children}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t py-8 text-center text-xs text-muted-foreground">
        GAIA · Climate Hack-tion · MVP demo
      </footer>
    </div>
  );
}
