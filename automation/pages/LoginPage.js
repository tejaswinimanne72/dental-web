const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driverHelper) {
    super(driverHelper);
    this.emailInput = 'input[type="email"], #email';
    this.passwordInput = 'input[type="password"], #password';
    this.roleSelect = 'select[name="role"], #role';
    this.loginBtn = 'button[type="submit"], button:has-text("Login")';
  }

  async login(email, password, role = 'Patient') {
    await this.enterText(this.emailInput, email);
    await this.enterText(this.passwordInput, password);
    await this.clickElement(this.loginBtn);
  }
}

module.exports = LoginPage;
