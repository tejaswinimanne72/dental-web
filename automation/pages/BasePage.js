class BasePage {
  constructor(driverHelper) {
    this.dh = driverHelper;
  }

  async waitForElement(selector, timeoutMs = 10000) {
    if (!this.dh || !this.dh.driver) return null;
    return await this.dh.findElement(selector, timeoutMs);
  }

  async clickElement(selector) {
    if (!this.dh || !this.dh.driver) return;
    await this.dh.click(selector);
  }

  async enterText(selector, text) {
    if (!this.dh || !this.dh.driver) return;
    await this.dh.typeText(selector, text);
  }

  async isElementDisplayed(selector) {
    if (!this.dh || !this.dh.driver) return false;
    return await this.dh.isDisplayed(selector);
  }
}

module.exports = BasePage;
