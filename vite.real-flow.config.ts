/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: './',
  plugins: [react(), viteTsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testing/setup-real-flow-tests.ts',
    include: ['src/testing/real-flow/**/*.test.tsx'],
    testTimeout: 60000,
    hookTimeout: 60000,
    exclude: ['**/node_modules/**'],
  },
});
