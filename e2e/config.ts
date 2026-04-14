/**
 * E2E Test Configuration
 * Customize the target URL and browser options for Selenium WebDriver tests.
 */
export const e2eConfig = {
  baseUrl: process.env['E2E_BASE_URL'] || 'http://localhost:4200',
  browser: process.env['E2E_BROWSER'] || 'chrome',
  headless: process.env['E2E_HEADLESS'] !== 'false',
  timeout: 30_000,
};
