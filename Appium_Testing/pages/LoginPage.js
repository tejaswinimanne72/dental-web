class LoginPage {
  constructor(driverHelper) {
    this.dh = driverHelper;
    
    // Selectors
    this.emailInput = 'input[type="email"], #email, input[name="email"]';
    this.passwordInput = 'input[type="password"], #password, input[name="password"]';
    this.roleSelect = 'select[name="role"], #role, select';
    this.loginButton = 'button[type="submit"], button:has-text("Sign In"), button:has-text("Login")';
    this.errorMessage = '.text-red-500, .error-message, [role="alert"]';
  }

  async login(email, password, role = 'Patient') {
    console.log(`🔑 Appium Flow: Logging in as [${role}] (${email})...`);
    await this.dh.typeText(this.emailInput, email);
    await this.dh.typeText(this.passwordInput, password);
    
    // Select role if present
    if (await this.dh.isDisplayed(this.roleSelect)) {
      const selectEl = await this.dh.findElement(this.roleSelect);
      await selectEl.selectByAttribute('value', role.toLowerCase());
    }

    await this.dh.click(this.loginButton);
    await this.dh.driver.pause(2000); // Allow navigation
  }

  async getErrorMessage() {
    if (await this.dh.isDisplayed(this.errorMessage)) {
      return await this.dh.getText(this.errorMessage);
    }
    return null;
  }
}

module.exports = LoginPage;
