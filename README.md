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

## Get Started

Prerequisites:

- Node 20+
- npm 10+

```bash
cp .env.example .env
npm install
npm run dev
```

The development server runs at [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run check-types
npm run lint
npm test
npm run build
```

## Architecture

Most product code should be added under `src/features/<feature-name>/**`. Shared UI, hooks, libraries, test utilities, types, and helpers belong in their dedicated `src/**` shared folders. Keep route-level feature composition in `src/app/**`.
