const { remote } = require('webdriverio');
const config = require('../config/appium.config');

class AppiumDriverHelper {
  constructor() {
    this.driver = null;
  }

  async initDriver() {
    console.log('📱 Checking Appium Server status at http://127.0.0.1:4723...');
    
    // Fast status check
    const isAppiumOnline = await new Promise((resolve) => {
      const http = require('http');
      const req = http.get('http://127.0.0.1:4723/status', { timeout: 2000 }, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
    });

    if (!isAppiumOnline) {
      throw new Error('Appium server is offline at http://127.0.0.1:4723 (Start Appium server when ready for physical device/emulator testing)');
    }

    this.driver = await remote({
      protocol: 'http',
      hostname: config.server.host,
      port: config.server.port,
      path: config.server.path,
      capabilities: config.capabilities
    });

    console.log('✅ Connected to Appium session:', this.driver.sessionId);
    await this.switchToWebViewIfAvailable();
    return this.driver;
  }

  async switchToWebViewIfAvailable() {
    try {
      await this.driver.pause(2000);
      const contexts = await this.driver.getContexts();
      console.log('📱 Available contexts:', contexts);
      
      const webviewContext = contexts.find(c => c.includes('WEBVIEW') || c.includes('com.dentalclinic'));
      if (webviewContext) {
        await this.driver.switchContext(webviewContext);
        console.log(`✅ Switched to WebView context: ${webviewContext}`);
      } else {
        console.log('ℹ️ Running in NATIVE_APP context.');
      }
    } catch (e) {
      console.log('ℹ️ Context check handled:', e.message);
    }
  }

  async findElement(selector, timeoutMs = 10000) {
    const el = await this.driver.$(selector);
    await el.waitForExist({ timeout: timeoutMs });
    return el;
  }

  async click(selector) {
    const el = await this.findElement(selector);
    await el.waitForClickable({ timeout: 5000 });
    await el.click();
  }

  async typeText(selector, text) {
    const el = await this.findElement(selector);
    await el.clearValue();
    await el.setValue(text);
  }

  async getText(selector) {
    const el = await this.findElement(selector);
    return await el.getText();
  }

  async isDisplayed(selector) {
    try {
      const el = await this.driver.$(selector);
      return await el.isDisplayed();
    } catch (_) {
      return false;
    }
  }

  async takeScreenshot(filename = 'screenshot.png') {
    try {
      const b64 = await this.driver.takeScreenshot();
      return b64;
    } catch (e) {
      console.error('Failed to capture screenshot:', e.message);
      return null;
    }
  }

  async quitDriver() {
    if (this.driver) {
      console.log('🔌 Closing Appium session...');
      await this.driver.deleteSession();
      this.driver = null;
    }
  }
}

module.exports = AppiumDriverHelper;
