class AdminDashboardPage {
  constructor(driverHelper) {
    this.dh = driverHelper;

    // Selectors
    this.adminTitle = 'h1:has-text("Admin"), .admin-dashboard-title';
    this.userManagementNav = 'a[href*="users"], nav a:has-text("Users")';
    this.kpiAnalyticsCard = '.kpi-card, #analytics-summary';
    this.systemSettingsNav = 'a[href*="settings"], nav a:has-text("Settings")';
    this.logoutBtn = 'button:has-text("Logout"), button:has-text("Sign Out")';
  }

  async verifyAdminDashboardLoaded() {
    return await this.dh.isDisplayed(this.adminTitle);
  }

  async navigateToUsers() {
    await this.dh.click(this.userManagementNav);
    await this.dh.driver.pause(1000);
  }

  async logout() {
    if (await this.dh.isDisplayed(this.logoutBtn)) {
      await this.dh.click(this.logoutBtn);
    }
  }
}

module.exports = AdminDashboardPage;
