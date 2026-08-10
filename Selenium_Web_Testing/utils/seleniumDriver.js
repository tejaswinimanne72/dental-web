const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('../config/selenium.config');

class SeleniumDriverHelper {
  constructor() {
    this.driver = null;
  }

  async initDriver() {
    console.log(`🌐 Initializing Selenium Chrome WebDriver (Headless: ${config.headless})...`);

    // Fast check if web app server is active
    const isAppRunning = await new Promise((resolve) => {
      const http = require('http');
      const req = http.get(config.baseUrl, { timeout: 3000 }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
    });

    if (!isAppRunning) {
      throw new Error(`Web Application is not reachable at ${config.baseUrl}. Please verify 'npm run dev' is running.`);
    }

    const options = new chrome.Options();
    if (config.headless) {
      options.addArguments('--headless=new');
    }
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');

    // Check if Chrome binary or environment driver is ready
    const fs = require('fs');
    const hasChrome = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe') || 
                      fs.existsSync('C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe') ||
                      process.env.CHROME_PATH;

    if (!hasChrome) {
      throw new Error('Chrome browser binary not detected at standard system paths. (Install Chrome browser for live visual/headless WebDriver automation)');
    }

    try {
      this.driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    } catch (e) {
      throw new Error(`Selenium Chrome driver check: ${e.message}`);
    }

    console.log('✅ Selenium WebDriver session established successfully.');
    await this.driver.get(config.baseUrl);
    return this.driver;
  }

  async findElement(by, timeoutMs = 10000) {
    const el = await this.driver.wait(until.elementLocated(by), timeoutMs);
    await this.driver.wait(until.elementIsVisible(el), timeoutMs);
    return el;
  }

  async click(by) {
    const el = await this.findElement(by);
    await el.click();
  }

  async typeText(by, text) {
    const el = await this.findElement(by);
    await el.clear();
    await el.sendKeys(text);
  }

  async getText(by) {
    const el = await this.findElement(by);
    return await el.getText();
  }

  async isDisplayed(by) {
    try {
      const el = await this.driver.findElement(by);
      return await el.isDisplayed();
    } catch (_) {
      return false;
    }
  }

  async quitDriver() {
    if (this.driver) {
      console.log('🔌 Closing Selenium WebDriver session...');
      await this.driver.quit();
      this.driver = null;
    }
  }
}

module.exports = SeleniumDriverHelper;
