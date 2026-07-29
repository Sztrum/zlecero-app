# AGENTS_PROJECT_RULES.md

## Version
v2.8.0

## Scope
Repository-specific rules for the Zlecero React application project initialized from the `bulletproof-react` approach.

## Purpose
This file contains project-specific paths, architecture boundaries, selected frontend conventions, verification commands, and module contracts. Portable agent workflow rules are defined in `AGENTS.md`; portable coding/style rules are defined in `AGENTS_CODING_RULES.md`.

## Required Document Read Order
Read documents in this exact order before implementation:
1. `AGENTS.md`
2. `AGENTS_CODING_RULES.md`
3. `AGENTS_PROJECT_RULES.md`
4. all relevant module-level `AGENTS.md` files in scope

## Project Identity And Product Scope
- This repository is intended to become the Zlecero React frontend application.
- Base new frontend architecture on the principles from `https://github.com/alan2207/bulletproof-react`, especially feature-oriented structure, clean import boundaries, explicit API declarations, server-state separation, and strict verification.
- Treat `bulletproof-react` as an architectural guide, not a blind boilerplate copy. Preserve the principles while adapting names, modules, routes, UI, and API contracts to Zlecero.
- The preferred initial app flavor is Vite + React + TypeScript unless the user explicitly chooses another framework such as Next.js.
- This repository owns only the client-facing dashboard UI and admin dashboard UI after the React project is scaffolded here.
- Do not implement SEO/public marketing pages such as the landing page in this repository; keep those pages in the Laravel Zlecero repository unless the user explicitly changes the product split.
- The Laravel project is the canonical backend and API source of truth for persistence, domain behavior, auth endpoints, queues, mail, integrations, and SEO/public server-rendered pages.
- Keep API contracts explicit so the React app integrates with the Laravel API without depending on Laravel internals.

## Expected Repository Map
- Main application source: `src/**`.
- Application shell and route composition: `src/app/**`.
- Route definitions/pages: `src/app/routes/**`.
- Shared static assets: `src/assets/**`.
- Shared reusable components and UI primitives: `src/components/**`.
- Global configuration and typed environment access: `src/config/**`.
- Feature modules: `src/features/**`.
- Shared hooks: `src/hooks/**`.
- Preconfigured libraries and providers: `src/lib/**`.
- Global state stores for cross-app UI/application state: `src/stores/**`.
- Test utilities and MSW setup for frontend tests: `src/testing/**`.
- Shared types: `src/types/**`.
- Shared utilities: `src/utils/**`.
- Public/static files: `public/**`.
- Project docs: `docs/**`.
- Module-level `AGENTS.md` files do not exist at the moment; create one when a touched feature or shared area gains non-trivial custom conventions.

## Feature Module Contract
- Put product-specific flows under `src/features/<feature-name>/**`.
- Feature folders may contain only the subfolders they actually need, commonly:
  - `api/**` for request declarations, schemas, fetchers, query/mutation hooks, and cache keys.
  - `assets/**` for feature-owned static assets.
  - `components/**` for feature-scoped UI.
  - `hooks/**` for feature-scoped hooks.
  - `stores/**` for feature-scoped client/application state.
  - `types/**` for feature-specific TypeScript types.
  - `utils/**` for feature-specific helpers.
- Do not import directly from one feature into another feature. Compose features from `src/app/**` route/shell code.
- If shared behavior is needed by multiple features, move it to the correct shared folder only after confirming the abstraction is stable.
- Avoid feature barrel exports; import concrete files directly unless a local module-level rule explicitly permits a barrel.

## Application And Routing Rules
- Keep route-level composition in `src/app/**`; app routes may import from features and shared folders.
- Use route-level lazy loading for non-critical screens.
- Keep route paths and route builders centralized in config, such as `src/config/paths.ts`, when introduced.
- Protect authenticated/admin routes through shared route guards/components from `src/lib/**` or `src/components/**`, not inline checks in every route.
- Add route/feature error boundaries where failures can be isolated.
- Keep SEO and document metadata in route-level code or a shared metadata helper when the project stack supports it.

## API And Integration Rules
- Use one configured API client in `src/lib/**`, such as `src/lib/api-client.ts`.
- For the MVP Laravel integration, authenticate API requests with the Sanctum Bearer token returned by Laravel and keep that token in session-scoped browser storage; do not use long-lived local storage tokens or switch to cookie/session auth until that architecture is explicitly approved and documented.
- Prefer cookie-based authenticated requests with `withCredentials` when the backend supports secure cookie sessions.
- Centralize auth redirect, 401 handling, common notifications, and shared response unwrapping in the API client or shared API helpers.
- Define API declarations in the owning feature under `src/features/<feature>/api/**` unless the endpoint is truly shared across features.
- Every API declaration should include request/response types or schemas, the fetcher function, and a TanStack Query mutation/query hook when server cache is involved.
- Keep server response shape assumptions explicit and validated at runtime where risk is meaningful.
- Use MSW in `src/testing/**` for frontend tests and short-lived prototyping only; do not maintain a separate mock backend server in this repository when Laravel can provide the API.

## State, Forms, Auth, And Authorization
- Use TanStack Query as the default server-state/cache layer when the project is scaffolded from the Vite `bulletproof-react` app.
- Use React Hook Form with schema validation for non-trivial forms when the project stack includes it.
- Use small Zustand stores or React context for cross-app UI/application state; do not store server cache data in global stores.
- Keep authenticated user handling in a shared auth library such as `src/lib/auth.tsx` once auth exists.
- Keep RBAC/PBAC logic in shared authorization helpers/components, such as `src/lib/authorization.tsx`, and call those helpers from features.
- Do not persist sensitive long-lived tokens in browser storage without explicit user approval and documented risk.
- For MVP tenant features, React routes may show or hide actions by role for UX, but Laravel API authorization and company scoping remain authoritative; frontend API declarations must use company-scoped endpoints and avoid passing arbitrary company IDs unless an administrator scope is explicitly introduced.

## Components, Styling, And Design System
- Build reusable UI primitives in `src/components/ui/**`.
- Wrap third-party UI primitives before widespread app usage so project styling and accessibility behavior stay consistent.
- Prefer Radix/headless primitives, lucide icons, Tailwind utilities, and class composition helpers if the project is initialized from the Vite `bulletproof-react` stack.
- Preserve the current Zlecero reference visual direction unless the user explicitly asks for a redesign: warm cream background `#FAF5ED`, dark brown structural surfaces `#33251D`, brick primary `#9C442D`, white product/dashboard cards, 8px default radius, restrained brown-tinted shadows, Inter body typography, Plus Jakarta Sans display typography, compact navigation, and dashboard-like product preview patterns.
- Keep layout components in `src/components/layouts/**` or a similarly explicit shared location.
- Dashboard application views must use the shared dashboard layout as the centering and width authority. Keep dashboard content centered in the available post-sidebar workspace with a full-width responsive container, and avoid route-level left-pinned `max-w-*` wrappers that waste horizontal space unless a deliberately narrow reading/form surface is required.
- Dashboard modal, drawer, and expandable workflow surfaces must use shared animated UI primitives for open/close transitions and should add short content transition states for tab or panel changes. Avoid hand-built fixed overlays that appear or disappear abruptly.
- Add Storybook stories for shared UI primitives when Storybook is present or introduced.
- Keep feature-specific components inside the owning feature unless they become stable reusable primitives.

## Tooling And Configuration
- Use TypeScript strict mode.
- Configure `@/*` as the source alias for `src/*`.
- Enforce file and folder kebab-case with ESLint/check-file rules where tooling is available.
- Enforce import boundaries with ESLint `import/no-restricted-paths` once feature folders exist.
- Keep ESLint, Prettier, TypeScript, and Vite config aligned; do not add conflicting formatters or lint layers.
- Use npm as the repository package manager. Keep `package-lock.json` as the canonical lockfile and do not introduce `yarn.lock` or `pnpm-lock.yaml` unless the user explicitly changes the package manager.
- Do not introduce a dependency already solved by the selected stack without checking existing libraries first.

## Verification Checklist
- After dependency or lockfile changes, run install using the project package manager before verification.
- For TypeScript or source changes, run type checking: `npm run check-types`.
- For lint-sensitive source changes, run linting: `npm run lint`.
- For frontend source changes, run tests: `npm test -- --run` with a focused target when available; otherwise run the full test script when feasible.
- For real Laravel flow verification, use a dedicated Vitest config/setup that does not import the MSW server or `src/testing/test-utils`, set `VITE_APP_ENABLE_API_MOCKING=false`, and point `VITE_APP_API_URL` at a Laravel instance backed by a disposable database.
- For production-affecting frontend changes, run the production build: `npm run build`.
- For shared UI component changes with Storybook configured, run or build Storybook when practical.
- If verification cannot be run because dependencies are not installed, a service is unavailable, or setup is incomplete, report the blocker and exact remediation.

## Project Initialization Workflow
- Because this directory currently begins as a frontend project shell, initialize project source from the Vite React TypeScript `bulletproof-react` app only after user confirmation of the selected stack.
- When initializing from `bulletproof-react`, copy/adapt the scaffold intentionally instead of preserving sample domain names such as discussions, teams, or demo users unless they are needed as temporary examples.
- Remove sample business features before first production-facing implementation unless the user explicitly wants demo flows kept.
- Keep AGENTS docs in place during scaffold copy and do not overwrite them blindly.
- After initialization, verify package scripts, aliases, ESLint import boundaries, and build/test commands before starting feature work.

## Documentation Workflow
- Keep `AGENTS.md`, `AGENTS_CODING_RULES.md`, `AGENTS_PROJECT_RULES.md`, and module-level `AGENTS.md` files synchronized with architecture and workflow decisions.
- During MVP implementation, update the Laravel repository file `docs/mvp-execution-log.md` as the canonical cross-repository work log for stages, ClickUp task mapping, implementation progress, architectural/product questions, problems, verification, and PR/merge status.
- If the user says `zapamietaj to na przyszlosc`, treat it as a mandatory documentation update in the relevant AGENTS document.
- If the user says `dopisz/zmien w AGENTS.md`, update the relevant AGENTS docs in scope, not only the root file when the rule belongs elsewhere.
- If a touched feature or shared area gains non-trivial custom conventions and has no local `AGENTS.md`, create one there and register it in this file.
- If verified documentation drift is detected during any task, fix it in the same task.

## Rule Ownership Separation
- Agent workflow, collaboration, git, verification reuse, and response format rules: `AGENTS.md`.
- Portable React/TypeScript coding/style/implementation rules: `AGENTS_CODING_RULES.md`.
- Repository-specific React app paths, selected stack, verification commands, product scope, and project contracts: `AGENTS_PROJECT_RULES.md`.
- Shared implementation contracts: local `AGENTS.md` files under shared areas such as `src/components/**`, `src/lib/**`, or `src/testing/**` when introduced.
- Feature-specific functionality/contracts: feature-level `AGENTS.md` files under `src/features/<feature-name>/**` when introduced.
