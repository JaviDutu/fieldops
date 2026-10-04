import Link from "next/link";
import {
  ArrowRight,
  CloudRain,
  Leaf,
  Radar,
  Sparkles,
  Sprout,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: CloudRain,
    title: "Weather that drives action",
    body: "Open-Meteo forecasts folded into clear irrigation and timing cues—not another chart to decode.",
  },
  {
    icon: Radar,
    title: "Signals in one feed",
    body: "Soil moisture, ET₀, and satellite NDVI distilled into a prioritised list for today.",
  },
  {
    icon: Sprout,
    title: "Built for small farms",
    body: "Field-level decisions without enterprise dashboards. Add a location and start in minutes.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.72_0.12_145/0.35),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 top-40 size-[420px] rounded-full bg-emerald-100/40 blur-3xl animate-pulse"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-20 size-[360px] rounded-full bg-amber-100/30 blur-3xl animate-pulse [animation-delay:1.2s]"
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#245b3b] text-sm font-extrabold text-white shadow-sm">
            GAIA
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">GAIA</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "sm" }), "bg-[#245b3b] hover:bg-[#1e4d32]")}
          >
            Open today&apos;s feed
            <ArrowRight className="size-4" />
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-4 sm:px-8 sm:pt-10">
        <section className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide"
          >
            <Sparkles className="mr-1.5 size-3 text-emerald-700" />
            Climate Hack-tion MVP
          </Badge>

          <h1 className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-balance text-4xl font-semibold tracking-tight text-foreground duration-700 sm:text-5xl md:text-6xl md:leading-[1.05]">
            Know what to do on your fields{" "}
            <span className="text-[#245b3b]">before the day gets away</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-pretty text-lg leading-relaxed text-muted-foreground duration-700 [animation-delay:120ms]">
            DEMETER turns weather, soil, and satellite signals into a short, ranked action list—so
            small farmers spend less time interpreting data and more time protecting their crops.
          </p>

          <div className="mt-10 flex animate-in fade-in slide-in-from-bottom-4 fill-mode-both flex-col items-center justify-center gap-3 duration-700 [animation-delay:240ms] sm:flex-row">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-xl bg-[#245b3b] px-6 hover:bg-[#1e4d32]"
              )}
            >
              Go to field dashboard
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#how-it-works"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 rounded-xl px-6")}
            >
              See how it works
            </a>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-4 border-y py-8 animate-in fade-in duration-1000 [animation-delay:400ms] sm:gap-8">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Weather
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">Live</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Signals
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">3+</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Setup
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-foreground">&lt; 2 min</dd>
            </div>
          </dl>
        </section>

        <section
          id="how-it-works"
          className="mt-20 scroll-mt-24 animate-in fade-in slide-in-from-bottom-6 duration-1000 [animation-delay:500ms]"
        >
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#245b3b]">
                How it works
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                One feed. Clear next steps.
              </h2>
            </div>
            <Leaf className="hidden size-8 text-emerald-700/60 sm:block" aria-hidden />
          </div>

          <ul className="grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <li
                key={feature.title}
                className="group rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200/80 hover:shadow-md animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${600 + index * 120}ms` }}
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 transition-colors group-hover:bg-emerald-100">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 overflow-hidden rounded-3xl border bg-gradient-to-br from-[#245b3b] to-[#1a4229] px-8 py-12 text-white shadow-lg animate-in fade-in zoom-in-95 duration-1000 [animation-delay:700ms] sm:px-12">
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-100/90">
                Ready when you are
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Your demo farm is waiting on the GAIA dashboard.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-emerald-50/85">
                Pick a field, review today&apos;s recommendations, and add your own location with
                the built-in geocoder.
              </p>
            </div>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 shrink-0 rounded-xl bg-white text-[#245b3b] hover:bg-emerald-50"
              )}
            >
              Launch dashboard
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t py-8 text-center text-xs text-muted-foreground">
        GAIA · Climate Hack-tion · MVP demo
      </footer>
    </div>
  );
}
