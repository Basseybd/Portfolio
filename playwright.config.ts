import { defineConfig } from "@playwright/test";

// Browser checks against the production build, at desktop and phone sizes.
// Run with `npm run build && npm run test:e2e`.

const gl = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"];

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3200",
    trace: "retain-on-failure",
    launchOptions: { args: gl },
  },
  projects: [
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1440, height: 900 } } },
    {
      name: "phone",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "npx next start -p 3200",
    url: "http://localhost:3200",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
