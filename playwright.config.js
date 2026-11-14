import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: { channel: "chrome", headless: true, baseURL: "http://127.0.0.1:5175" },
  webServer: {
    command: "node scripts/test-server.mjs",
    url: "http://127.0.0.1:5175",
    reuseExistingServer: false,
  },
  workers: 1,
  reporter: "list",
});
