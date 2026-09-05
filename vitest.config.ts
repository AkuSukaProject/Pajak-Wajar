import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Vitest tidak memuat .env.local sendiri seperti Next.js.
    setupFiles: ['tests/setup-env.ts']
  }
});
