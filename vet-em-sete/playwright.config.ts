import { defineConfig, devices } from "@playwright/test";

/**
 * Teste de ponta a ponta de uma partida (caso de exemplo, sem login).
 * Rodar: npm run build && npm run e2e
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: { baseURL: "http://localhost:3105", trace: "off" },
  projects: [
    { name: "celular", use: { ...devices["Pixel 7"] } },
    { name: "computador", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: { command: "npx next start -p 3105", url: "http://localhost:3105", reuseExistingServer: true, timeout: 60_000 },
});
