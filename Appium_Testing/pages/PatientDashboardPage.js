class PatientDashboardPage {
  constructor(driverHelper) {
    this.dh = driverHelper;

    // Selectors
    this.welcomeHeading = 'h1, h2, .patient-welcome';
    this.bookAppointmentBtn = 'button:has-text("Book Appointment"), a[href*="book"]';
    this.appointmentsNav = 'a[href*="appointments"], nav a:has-text("Appointments")';
    this.billingNav = 'a[href*="billing"], nav a:has-text("Billing")';
    this.profileNav = 'a[href*="profile"], nav a:has-text("Profile")';
    this.notificationsBtn = 'button[aria-label="Notifications"], .notification-bell';
    this.logoutBtn = 'button:has-text("Logout"), button:has-text("Sign Out")';
  }

  async verifyDashboardLoaded() {
    return await this.dh.isDisplayed(this.welcomeHeading);
  }

  async navigateToAppointments() {
    await this.dh.click(this.appointmentsNav);
    await this.dh.driver.pause(1000);
  }

  async navigateToBilling() {
    await this.dh.click(this.billingNav);
    await this.dh.driver.pause(1000);
  }

  async logout() {
    if (await this.dh.isDisplayed(this.logoutBtn)) {
      await this.dh.click(this.logoutBtn);
    }
  }
}

module.exports = PatientDashboardPage;
