# Zlecero App

React frontend application shell based on the `bulletproof-react` architecture principles. The canonical backend and API live in the Laravel project.

## Stack

- Vite
- React
- TypeScript
- TanStack Query
- React Hook Form
- MSW
- Vitest
- Storybook
- Tailwind CSS

## Local Setup

Prerequisites:

- Node 20+
- npm 10+

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env
```

Default local environment values:

```env
VITE_APP_API_URL=https://api.zlecero.local
VITE_APP_ENABLE_API_MOCKING=false
```

Use `VITE_APP_API_URL` to point the frontend to the Laravel API. Set
`VITE_APP_ENABLE_API_MOCKING=true` only when you want to run the app against the
MSW browser mocks instead of the backend API.

Start the development server:

```bash
npm run dev
```

The development server runs at [http://localhost:3000](http://localhost:3000).

## Verification

Run the main local checks before committing frontend changes:

```bash
npm run check-types
npm run lint
npm test -- --run
npm run build
```

## Useful Scripts

- `npm run dev` - start the local Vite development server.
- `npm run check-types` - run TypeScript type checking without emitting files.
- `npm run lint` - lint the source files.
- `npm test` - start Vitest in watch mode.
- `npm test -- --run` - run the test suite once.
- `npm run build` - run TypeScript and create the production build.
- `npm run preview` - serve the production build locally after `npm run build`.
- `npm run storybook` - start Storybook on port 6006.

## Architecture

Most product code should be added under `src/features/<feature-name>/**`. Shared UI, hooks, libraries, test utilities, types, and helpers belong in their dedicated `src/**` shared folders. Keep route-level feature composition in `src/app/**`.
