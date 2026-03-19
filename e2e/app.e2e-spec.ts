import { Builder, By, until } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

describe('E2E Tests', () => {
  let driver: any;

  beforeAll(async () => {
    const options = new chrome.Options().addArguments('--headless', '--no-sandbox');
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test('should load the dashboard', async () => {
    await driver.get('http://localhost:4200');
    await driver.wait(until.elementLocated(By.css('app-dashboard')), 10000);
    const title = await driver.findElement(By.css('h1')).getText();
    expect(title).toContain('Web Quality Test Suite');
  });

  test('should display test suites', async () => {
    const cards = await driver.findElements(By.css('.suite-card'));
    expect(cards.length).toBeGreaterThan(0);
  });

  test('should have run buttons', async () => {
    const buttons = await driver.findElements(By.css('button[color="primary"]'));
    expect(buttons.length).toBeGreaterThan(0);
  });
});
