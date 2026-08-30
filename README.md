# Zlecero App (frontend)

The authenticated application UI for [Zlecero](https://github.com/Sztrum/Zlecero) — the company dashboard, inquiry queue, offers, customers and orders. Built on the `bulletproof-react` architecture principles.

The Laravel repository is the source of truth for the domain, the API and the public marketing pages. This repository owns no business rules: it renders API contracts and enforces nothing the backend does not already enforce.

---

## Quick start

The frontend needs the backend running. Start it first, from the Laravel repository:

```bash
php artisan serve --host=127.0.0.1 --port=8000
php artisan db:seed --class=DemoDataSeeder   # gives you data to look at
```

Then here:

```bash
npm install
cp .env.example .env
npm run dev
```

Sign in with the seeded owner account: **`demo@zlecero.test`** / **`password`** (there is also `pracownik@zlecero.test` with the `member` role, for checking role-dependent UI).

> **Read the URL Vite prints.** The default port is `3000`, but the Laradock workspace container publishes `3000`, `3001`, `5173` and `8080`, so Vite usually falls through to `3002` or `3003`. Do not assume `localhost:3000`.

---

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_APP_API_URL` | Laravel API base, **including** the `/api/v1` prefix |
| `VITE_APP_ENABLE_API_MOCKING` | `true` runs the app against in-browser MSW mocks instead of the real API |
| `VITE_APP_URL` | Public URL of this app, used for links it generates |

`.env.example` defaults to `http://127.0.0.1:8000/api/v1`, matching the `artisan serve` command above.

Authentication uses a Sanctum bearer token kept in session-scoped browser storage. It is cleared when the tab closes, so a refresh keeps you signed in but a new session does not.

---

## Routes

| Route | What it does |
| --- | --- |
| `/login`, `/auth/register`, `/auth/verify-email` | Authentication |
| `/app` | Dashboard: attention items, deadlines, company stats |
| `/app/inquiries` | **Canonical inquiry workflow.** List plus a drawer opened with `?inquiry=<id>` — messages, files, internal notes, status history, linked offers |
| `/app/offers`, `/app/offers/:id` | Offer list with value/conversion tiles; editor with PDF, send and acceptance |
| `/app/customers`, `/app/customers/:id` | Customer list with duplicate detection; profile with cooperation history |
| `/app/orders`, `/app/orders/:id` | Orders created from accepted offers, production status |
| `/app/company`, `/app/company/users` | Company data and team management |
| `/app/admin` | Platform administration: aggregate counters and alerts |

Inquiries deliberately have **no** detail subpage. The list plus drawer is the one interaction model; link to `/app/inquiries?inquiry=<id>` rather than inventing a detail route.

---

## Architecture

```txt
src/app/**         route composition and the application shell
src/features/**    product features: api/, components/, hooks/, types/
src/components/**  shared UI primitives and layouts
src/lib/**         API client, auth, authorization
src/testing/**     MSW handlers, mock database, test utilities
```

Two rules matter most:

1. **Features do not import each other.** Compose them in `src/app/**`. This is enforced by `import/no-restricted-paths` in `.eslintrc.cjs`. `inquiries` and `offers` are currently exempt because their form components still reach into other features directly; the exemption is documented in the config and should shrink, not grow.
2. **Every screen renders real API data.** No local arrays imitating records, and no actions that only show a "saved" confirmation without calling anything. A surface whose backend contract does not exist yet is reduced to a hand-off, or removed.

Server state belongs to TanStack Query, declared in `src/features/<feature>/api/**` alongside its types and cache keys. Do not mirror server data into global stores.

Shared visual patterns live in `src/components/ui/**` — `data-table`, `badge`, `stat-card`, `search-box`, `drawer`, `dialog`, `form` — and are extracted only once a second real screen needs them.

### Visual direction

Warm cream background `#FAF5ED`, dark brown structural surfaces `#33251D`, brick primary `#9C442D`, white cards, 8px radius, Inter for body text and Plus Jakarta Sans for display. Interface copy is Polish.

---

## Testing

```bash
npm run check-types   # TypeScript, no emit
npm run lint          # ESLint, includes the feature boundary rules
npm test -- --run     # Vitest suite once
npm test              # Vitest watch mode
npm run build         # type check + production build
```

Run all four before pushing.

### Mocked vs real backend

The default suite runs against **MSW** handlers in `src/testing/mocks/**`, which reimplement the API contracts over an in-memory database. Fast, but it only proves the frontend matches its *assumptions* about the API.

```bash
npm run test:real-flow
```

boots a real Laravel instance on a disposable sqlite database, disables MSW and drives the app against it — registration, email verification, login, dashboard, inquiry creation and listing, drawer opening, internal notes, and persistence across a refetch. Run it when you change an API declaration; it is the only check that catches a contract drifting away from the backend.

---

## Scripts

- `npm run dev` — Vite dev server.
- `npm run build` — type check and production build.
- `npm run preview` — serve the production build.
- `npm run storybook` — Storybook on port 6006.
- `npm run test:real-flow` — integration run against a real Laravel instance.

---

## Requirements

- Node.js 20+
- npm 10+
- A running Zlecero backend (or `VITE_APP_ENABLE_API_MOCKING=true`)

Stack: Vite, React, TypeScript, TanStack Query, React Hook Form, Zod, Tailwind CSS, Radix primitives, lucide icons, MSW, Vitest, Storybook.

---

## Known gaps

- **Platform administration is counters only.** Subscriptions, payments, plans, trials, coupons, support and feature flags have no backend and no UI.
- **No global messages, files or product catalog.** Messages and files exist only inside the inquiry drawer; a product catalog has not been decided on for the MVP.
- **Settings are partial.** Company data and users are wired to the API; mailbox, workflow, AI and notification settings are not, and are deliberately absent rather than shown as inert toggles.
