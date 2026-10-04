# FieldOps design system

This document captures how styling is split in the repo so you can extend the product without breaking shadcn or the field dashboard.

## Stack

| Layer | Technology | Where |
| --- | --- | --- |
| Utility CSS | Tailwind CSS v4 | `app/globals.css` |
| Component primitives | shadcn **base-nova** (`@base-ui/react`) | `components/ui/*` |
| Class merging | `cn` from the `cn` package | `lib/utils.ts` |
| Motion | `tw-animate-css` (`animate-in`, `fade-in`, etc.) | imported in `app/globals.css` |
| Icons | `lucide-react` | components and pages |

**Config:** `components.json` (style: `base-nova`, CSS entry: `app/globals.css`).

**PostCSS:** `postcss.config.mjs` must use `@tailwindcss/postcss` — required for `@import "tailwindcss"` and shadcn tokens.

## Brand colors (shared)

Use these names across marketing and product UI:

| Token | Hex | Usage |
| --- | --- | --- |
| Field green | `#245b3b` | Primary brand, logo mark, CTA buttons on landing |
| Field green hover | `#1e4d32` | Primary hover |
| Field green soft | `#edf4ee` | Soft highlights (also `--field-green-soft` on dashboard) |
| Page background | `#f4f4ef` | Dashboard shell (`--field-bg`) |
| Ink | `#1b241d` | Headlines on dashboard (`--field-ink`) |
| Muted text | `#697169` | Secondary copy (`--field-muted`) |
| Border | `#e2e4de` | Cards and dividers (`--field-line`) |
| Warning | `#a86d1f` | Medium priority / dry soil |
| Danger | `#9d4539` | High priority / inspect NDVI |

shadcn semantic tokens in `:root` (`--primary`, `--background`, etc.) in `app/globals.css` are tuned to the same green family for new UI built with Tailwind + shadcn.

## Two UI surfaces

### 1. Marketing / shadcn pages (`/`, modals, future flows)

- **Routes:** `app/page.tsx` (landing), shared layout in `app/layout.tsx`.
- **Styling:** Tailwind utility classes + shadcn components (`Button`, `Badge`, `Dialog`, …).
- **Patterns:**
  - Kicker: `text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#245b3b]`
  - Cards: `rounded-2xl border bg-card/80 shadow-sm`
  - Primary actions: `buttonVariants()` from `@/components/ui/button`, or `bg-[#245b3b] hover:bg-[#1e4d32]`
  - Entrance motion: `animate-in fade-in slide-in-from-bottom-4 duration-700` (optionally `fill-mode-both` and `[animation-delay:…]`)
- **Links as buttons:** Base UI Button does not use Radix `asChild`. Compose with `Link` + `cn(buttonVariants({ … }), "…")`.

### 2. Field dashboard (`/field`)

- **Route:** `app/field/page.tsx`
- **Styles:** Scoped under `.fieldDashboard` in `app/field-dashboard.css` (legacy class names: `.appShell`, `.actionRow`, `.kicker`, etc.).
- **Why separate:** Preserves the original MVP layout and CSS while the rest of the app adopts shadcn.
- **Navbar:** `components/navbar.tsx` uses dashboard classes; wrap page in `<div className="fieldDashboard">`.

When adding dashboard features, prefer existing classes in `field-dashboard.css`. When adding new cross-app UI (settings, auth, wizards), prefer shadcn + Tailwind on `/` or new routes.

## Location picker (shadcn reference)

`components/locationpicker.tsx` is the reference for shadcn patterns in this project:

- `Dialog`, `Button`, `Input`, `Badge`, `Separator`
- Emerald accent: `bg-emerald-50`, `border-emerald-200`, `text-emerald-700`
- Spacing: `rounded-xl`, `px-6 py-5`, kicker `tracking-[0.15em]`

## Adding shadcn components

From the project root:

```bash
npx shadcn@latest add <component>
```

Ensure `components.json` points at `app/globals.css`. After adding components, run `npm run build` to verify Tailwind and imports.

## Typography

- **Font:** Inter via `next/font/google` on `<html className={inter.variable}>`.
- **Dashboard:** Inter stack declared in `.fieldDashboard`.
- **Dashboard kickers:** 11px, weight 800, letter-spacing `0.12em`, color field green.

## File checklist

| File | Role |
| --- | --- |
| `app/globals.css` | Tailwind + shadcn theme + animations |
| `app/field-dashboard.css` | Dashboard-only legacy layout |
| `postcss.config.mjs` | Tailwind PostCSS plugin |
| `components.json` | shadcn CLI config |
| `docs/STYLE.md` | This guide |
