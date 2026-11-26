/**
 * Playwright Configuration
 */
import { defineConfig, devices } from '@playwright/test';

// Si PLAYWRIGHT_BASE_URL está seteada (p.ej. contenedor Docker en :3000),
// se testea contra ese server y no se levanta `npm run dev`.
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  // Run tests in parallel
  fullyParallel: true,

  // Setup and teardown
  workers: process.env.CI ? 1 : undefined,

  reporter: [['list'], ['html']],

  use: {
    baseURL: externalBaseURL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  webServer: externalBaseURL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },

  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'pixel-7',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'iphone-12',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'narrow-320',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 320, height: 568 },
      },
    },
  ],
});
