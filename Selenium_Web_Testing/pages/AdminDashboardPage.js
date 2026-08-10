const { By } = require('selenium-webdriver');

class AdminDashboardPage {
  constructor(driverHelper) {
    this.dh = driverHelper;

    this.adminHeading = By.css('h1, .admin-title');
    this.usersLink = By.css('a[href*="users"]');
    this.kpisLink = By.css('a[href*="kpi"], a[href*="analytics"]');
    this.logoutBtn = By.css('button:has-text("Logout"), button:has-text("Sign Out")');
  }

  async verifyDashboard() {
    return await this.dh.isDisplayed(this.adminHeading);
  }

  async navigateToUsers() {
    await this.dh.click(this.usersLink);
    await this.dh.driver.sleep(1000);
  }

  async logout() {
    if (await this.dh.isDisplayed(this.logoutBtn)) {
      await this.dh.click(this.logoutBtn);
    }
  }
}

module.exports = AdminDashboardPage;
