import { defineConfig, devices } from "@playwright/test";
export default defineConfig({ testDir: "./tests/e2e", fullyParallel: false, workers: 1,
  expect: { timeout: 15000 },
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }, { name: "mobile", use: { ...devices["Pixel 7"] } }],
  webServer: { command: "npm run dev", url: "http://localhost:3000/login", reuseExistingServer: !process.env.CI, timeout: 120000 },
});
