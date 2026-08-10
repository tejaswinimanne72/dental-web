const { By } = require('selenium-webdriver');

class DoctorDashboardPage {
  constructor(driverHelper) {
    this.dh = driverHelper;

    this.doctorHeading = By.css('h1, .doctor-title');
    this.patientListLink = By.css('a[href*="patients"]');
    this.appointmentsLink = By.css('a[href*="appointments"]');
    this.logoutBtn = By.css('button:has-text("Logout"), button:has-text("Sign Out")');
  }

  async verifyDashboard() {
    return await this.dh.isDisplayed(this.doctorHeading);
  }

  async navigateToPatients() {
    await this.dh.click(this.patientListLink);
    await this.dh.driver.sleep(1000);
  }

  async logout() {
    if (await this.dh.isDisplayed(this.logoutBtn)) {
      await this.dh.click(this.logoutBtn);
    }
  }
}

module.exports = DoctorDashboardPage;
