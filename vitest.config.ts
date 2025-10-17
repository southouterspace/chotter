import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/types/**',
        '**/test/**',
        '**/tests/**',
      ],
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@chotter/database': path.resolve(__dirname, './packages/database/src'),
      '@chotter/ui': path.resolve(__dirname, './packages/ui/src'),
      '@chotter/utils': path.resolve(__dirname, './packages/utils/src'),
    },
  },
});
