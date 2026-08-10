const { By } = require('selenium-webdriver');

class PatientDashboardPage {
  constructor(driverHelper) {
    this.dh = driverHelper;

    this.heading = By.css('h1, h2, .patient-heading');
    this.bookAppointmentBtn = By.css('a[href*="book"], button:has-text("Book Appointment")');
    this.appointmentsLink = By.css('a[href*="appointments"]');
    this.billingLink = By.css('a[href*="billing"]');
    this.logoutBtn = By.css('button:has-text("Logout"), button:has-text("Sign Out")');
  }

  async verifyDashboard() {
    return await this.dh.isDisplayed(this.heading);
  }

  async navigateToAppointments() {
    await this.dh.click(this.appointmentsLink);
    await this.dh.driver.sleep(1000);
  }

  async navigateToBilling() {
    await this.dh.click(this.billingLink);
    await this.dh.driver.sleep(1000);
  }

  async logout() {
    if (await this.dh.isDisplayed(this.logoutBtn)) {
      await this.dh.click(this.logoutBtn);
    }
  }
}

module.exports = PatientDashboardPage;
