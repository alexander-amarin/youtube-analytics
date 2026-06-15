# Coding Conventions

These conventions apply to the entire `youtube-analytics-dashboard` codebase. They are intentionally lightweight and should be revisited as the project grows.

## Component exports

- **React components: named exports**, not default exports — except `app/` route files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, etc.), which **must** use default exports because Next.js requires it.
- One primary component per file. Co-locate small, file-private helpers in the same file; promote shared helpers to `lib/`.
- Mark client components with `"use client"` only when they need interactivity, state, or browser APIs. Default to Server Components.

## Rendering (Server vs Client)

- **Prefer Server Components** for pages and layouts. Only add `"use client"` when the component needs interactivity, state, effects, or browser APIs.
- **All chart components must be client components** (`"use client"`). Recharts relies on browser layout APIs and will break under SSR otherwise — render charts in a leaf client component and keep the surrounding page/layout a Server Component.

## Naming

- **Component files:** `PascalCase.tsx` (e.g. `VideoCard.tsx`), matching the exported component name.
- **Non-component files** (utilities, services, hooks): `camelCase.ts` (e.g. `formatDuration.ts`, `youtubeClient.ts`). Hooks start with `use` (e.g. `useChannelStats.ts`).
- **Types/interfaces:** `PascalCase`. Prefer `type` aliases for unions/shapes; reserve `interface` for extensible object contracts. No `I`-prefix.
- **Constants:** `UPPER_SNAKE_CASE` for true module-level constants; `camelCase` for everything else.
- **Folders:** lowercase, plural where they hold a collection (`components`, `services`, `types`).

## Folder responsibility

- **`app/`** — routing, layouts, pages, route handlers. UI composition only; no business logic or direct external API calls here.
- **`components/`** — reusable, presentational React components. No data fetching of their own beyond props; keep them dumb where possible.
- **`lib/`** — framework-agnostic utilities, helpers, and shared client singletons (e.g. a Prisma client, formatters, validators). Pure and easily testable.
- **`services/`** — integrations with external systems and the YouTube API / data-access layer. This is where network calls, auth flows, and side effects live, exposed as typed functions consumed by `app/` and `components/`.
- **`types/`** — shared TypeScript types and interfaces used across more than one module. Local, single-use types stay next to their usage.

## Imports

- Use the `@/*` path alias for cross-folder imports (e.g. `@/lib/youtubeClient`), relative paths only within the same folder.
- Order: external packages → `@/` internal modules → relative imports.
