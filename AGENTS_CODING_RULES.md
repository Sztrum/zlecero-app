# AGENTS_CODING_RULES.md

## Version
v2.2.0

## Scope
Portable coding/style/implementation standards for React, TypeScript, and frontend application work.

## Purpose
This file contains reusable frontend coding/style/implementation rules. AI-agent execution/workflow/response rules are defined in `AGENTS.md`. Project-specific paths, selected libraries, scripts, and product contracts must stay in `AGENTS_PROJECT_RULES.md`.

## Required Document Read Order
Read documents in this exact order before implementation:
1. `AGENTS.md`
2. `AGENTS_CODING_RULES.md`
3. `AGENTS_PROJECT_RULES.md`
4. all relevant module-level `AGENTS.md` files in scope

## Architecture And Feature Boundaries
- Prefer feature-oriented architecture for product code: shared infrastructure belongs in global shared folders, while business/UI flows belong in feature folders.
- Keep import direction predictable: shared code may be consumed by features and app routes; features must not import from app routes; shared code must not import from features or app routes.
- Avoid cross-feature imports. Compose multiple features at route/app level instead of coupling feature internals to each other.
- Prefer colocating components, hooks, state, tests, schemas, and utilities close to the feature or component that owns them.
- Promote code to a shared folder only after at least two real consumers exist or a stable design-system/infrastructure boundary is clear.
- Avoid barrel files for feature exports unless the project has an explicit rule allowing them; prefer direct imports to keep dependency graphs and tree shaking predictable.
- Keep changes small, scoped, and aligned with the existing folder structure.
- When migrating behavior from a legacy source to a new canonical source, do not preserve compatibility fallbacks to the legacy path unless the user explicitly requests transitional support.

## TypeScript And Data Contracts
- Use TypeScript strict mode and keep type errors as release blockers.
- Define explicit request, response, form, and route-param types close to their owning feature/API declaration.
- Validate runtime data at trust boundaries such as API responses, route params, environment variables, and persisted browser state.
- Prefer schema-based validation for forms and external data when the project already uses a schema library.
- Avoid `any`; if a boundary is genuinely unknown, narrow from `unknown` as close as possible to the boundary.
- Keep DTO/type names explicit and responsibility-driven.
- Keep identifier types consistent across API contracts, route params, cache keys, and UI state.
- Do not cast to silence type errors; fix the underlying type or add a narrow, documented boundary conversion.

## React Components And Hooks
- Keep components small and single-purpose; extract UI units instead of adding nested render functions inside large components.
- Limit prop counts. Split components or use composition with `children`/slots when a component accumulates unrelated props.
- Keep state as close as possible to where it is used; lift state only when multiple components genuinely need it.
- Prefer composition over global context for avoiding prop drilling unless the data is low-velocity and broadly needed.
- Use React Context for low-velocity app state such as theme, authenticated user, or static configuration; avoid it for frequently changing data unless selector-based patterns are in place.
- Use `useState` for simple local state and `useReducer` for coordinated local state transitions.
- Use lazy state initializers for expensive initial values.
- Keep hooks pure and predictable; do not hide side effects in helpers named like ordinary data mappers.
- Name custom hooks with `use...` and keep hook ownership aligned with the closest feature/shared scope.
- Do not memoize by default. Use `useMemo`, `useCallback`, and `React.memo` only for measured performance needs, referential stability required by child APIs, or expensive calculations.

## Components, Styling, And Accessibility
- Build shared UI primitives in the project component library and wrap third-party primitives before using them broadly.
- Prefer battle-tested headless or accessible component libraries for dialogs, menus, popovers, tabs, tooltips, and similar interaction-heavy UI.
- Keep styling consistent with the selected project styling system and the existing visual style of the project; before adding or changing UI, inspect nearby screens/components and match their layout density, spacing rhythm, typography scale, color usage, border radius, shadows, interaction states, and overall tone unless the user explicitly asks for a new direction.
- Prefer zero-runtime styling for performance-sensitive UI when it fits the project stack.
- When UI styling starts repeating, extract it into project UI primitives, component variants, shared class composition helpers, or colocated component styles instead of duplicating long one-off class lists across route/page code.
- Ensure interactive elements are semantic, keyboard-accessible, and expose visible focus states.
- Use buttons for actions and links for navigation.
- Keep user-facing text readable, concise, and placed in the appropriate localization/config layer when the project has one.
- Avoid hardcoded repeated UI copy, magic colors, spacing values, and one-off component variants when a design-system token or shared variant exists.
- Add Storybook stories for reusable shared components when Storybook is configured or introduced.

## API Layer And Server State
- Use a single configured API client instance for HTTP/GraphQL calls.
- Define API declarations instead of ad-hoc calls inside components.
- Each API declaration should colocate the request/response types or schemas, fetcher function, and query/mutation hook when using a server-state library.
- Treat server cache as server state. Prefer TanStack Query, SWR, Apollo, or the project-selected server-state tool instead of storing fetched server data in generic global stores.
- Keep query keys explicit, stable, and colocated with the owning API declaration.
- Handle API errors centrally through client interceptors or shared error handlers, while allowing feature-specific messaging where needed.
- Do not let UI components depend on raw transport details such as Axios response wrappers.

## State Management
- Separate component state, application state, server cache state, form state, and URL state.
- Start with local component state; introduce global stores only for state that is genuinely shared across distant parts of the app.
- Keep global stores small and domain-specific; avoid one monolithic application store.
- Use form libraries for non-trivial forms and keep validation schemas close to form definitions.
- Keep URL state in the router/search-param layer when state must be shareable, bookmarkable, or browser-navigation-aware.
- Do not duplicate the same state across URL params, server cache, global stores, and component state unless there is a documented synchronization strategy.

## Routing, Errors, And Security
- Prefer route-level code splitting for non-critical screens.
- Place error boundaries around route or feature areas where failures can be contained without blanking the entire app.
- Track production errors through the project-selected monitoring tool when configured.
- Treat authentication as a server-backed security concern; client-side checks improve UX but must not be treated as authorization guarantees.
- Prefer secure cookie-based auth flows for browser clients when the backend supports them.
- Do not store long-lived sensitive tokens in `localStorage` unless explicitly approved with a documented risk tradeoff.
- Sanitize any user-generated HTML before rendering.
- Implement RBAC/PBAC checks through shared authorization helpers/components rather than scattered inline role checks.

## Testing
- Test behavior from the user perspective with Testing Library rather than implementation details.
- Prefer integration tests for feature flows and route-level behavior; use unit tests for shared utilities, primitives, and complex isolated logic.
- Use MSW or the project-selected HTTP mocking layer for API-dependent tests instead of mocking low-level fetch/Axios in each test.
- Add focused regression tests with every bug fix when the behavior is testable in the workspace.
- Add or update E2E tests for critical journeys when routing, auth, payments, onboarding, or destructive actions change.
- Keep test utilities and mocks in the project testing area or close to their owning feature.

## Performance
- Keep route chunks meaningful; avoid excessive component-level lazy loading that increases request overhead without measurable benefit.
- Avoid large top-level providers or global state updates that re-render most of the app.
- Optimize images with modern formats, responsive sizes, and lazy loading where appropriate.
- Prefetch route data intentionally for high-confidence navigation paths, not as a blanket default.
- Watch bundle impact when adding dependencies; prefer existing libraries already present in the project.
- Keep Web Vitals and production build output in mind for user-facing changes.

## File, Import, And Naming Conventions
- Use kebab-case for TypeScript/React file and folder names unless the framework requires another convention.
- Use PascalCase for React component identifiers and camelCase for functions, variables, hooks, and object properties.
- Use absolute imports through the project alias, typically `@/*` for `src/*`, instead of deep relative paths.
- Keep import order deterministic: built-ins/external packages first, then internal aliases, then relative imports.
- Avoid import cycles; treat them as architectural defects.
- Keep generated files and framework-required filenames aligned with the tool that owns them.

## Documentation And Upkeep
- When a user asks to change a project-wide standard/pattern, update all usages across the codebase so the standard is applied consistently.
- Every `AGENTS*.md` file must contain an explicit version marker.
- Versioning format for AGENTS docs is Semantic Versioning.
- On every change to a given `AGENTS*.md` file, increment that file version.
- For routine/small updates, increment `PATCH`.
- For backward-compatible rule additions/expansions, increment `MINOR` and reset patch.
- For major/structural rule-set changes or incompatible policy shifts, increment `MAJOR` and reset minor/patch.
- Each `AGENTS*.md` file is versioned independently.
- Keep docs synchronized with behavior changes in the same task.
- At start/end of work iterations, quickly verify docs still match current behavior.
- Keep selectors and usages synchronized across templates/scripts/styles.
- Keep Markdown documentation in English unless repository policy states otherwise.
