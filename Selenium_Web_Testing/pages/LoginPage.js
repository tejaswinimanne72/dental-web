const { By } = require('selenium-webdriver');

class LoginPage {
  constructor(driverHelper) {
    this.dh = driverHelper;

    // Locators
    this.emailInput = By.css('input[type="email"], #email, input[name="email"]');
    this.passwordInput = By.css('input[type="password"], #password, input[name="password"]');
    this.roleSelect = By.css('select[name="role"], #role, select');
    this.loginBtn = By.css('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
  }

  async login(email, password, role = 'Patient') {
    console.log(`🔑 Selenium Flow: Logging in as [${role}] (${email})...`);
    await this.dh.typeText(this.emailInput, email);
    await this.dh.typeText(this.passwordInput, password);

    if (await this.dh.isDisplayed(this.roleSelect)) {
      const selectEl = await this.dh.findElement(this.roleSelect);
      await selectEl.sendKeys(role);
    }

    await this.dh.click(this.loginBtn);
    await this.dh.driver.sleep(1500);
  }
}

module.exports = LoginPage;
