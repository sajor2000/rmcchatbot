import { defineConfig, devices } from "@playwright/test";

const isDemoE2E = process.env.RMC_E2E_CASE_LIBRARY_MODE === "demo";
const port = isDemoE2E ? 3108 : 3107;
const baseURL = `http://127.0.0.1:${port}`;
const localMockEnv = "AZURE_OPENAI_API_KEY= AZURE_OPENAI_ENDPOINT= AZURE_OPENAI_DEPLOYMENT=";
const devCommand = isDemoE2E
  ? `${localMockEnv} RMC_CASE_LIBRARY_MODE=demo npm run dev -- -p ${port}`
  : `${localMockEnv} npm run dev -- -p ${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    trace: "on-first-retry"
  },
  webServer: {
    command: devCommand,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: isDemoE2E ? [
    {
      name: "demo-chromium",
      testMatch: /.*\.demo\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL }
    }
  ] : [
    {
      name: "pilot-chromium",
      testMatch: /.*\.pilot\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL }
    },
    {
      name: "pilot-mobile",
      testMatch: /.*\.pilot\.spec\.ts/,
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
        baseURL
      }
    }
  ]
});
