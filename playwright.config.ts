import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables (APP_URL, APP_USER, APP_PASSWORD) from .env,
// or from the file named in ENV_FILE. Never commit .env files.
dotenv.config({
  path: process.env.ENV_FILE || '.env'
});

export default defineConfig({
  testDir: './tests',
  timeout: 300000,            // per test
  expect: {
    timeout: 10000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,   // fail CI if a test.only is left in
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html']],

  use: {
    trace: 'on-first-retry',
    navigationTimeout: 20000,
    actionTimeout: 10000,
    screenshot: 'off',
    video: 'off'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Add firefox / webkit / mobile projects here when needed.
  ],
});
