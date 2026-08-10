class DoctorDashboardPage {
  constructor(driverHelper) {
    this.dh = driverHelper;

    // Selectors
    this.dashboardHeading = 'h1:has-text("Doctor"), .doctor-header';
    this.todayAppointmentsCard = '.appointments-card, #today-appointments';
    this.patientsNav = 'a[href*="patients"], nav a:has-text("Patients")';
    this.scheduleNav = 'a[href*="schedule"], nav a:has-text("Schedule")';
    this.prescriptionsBtn = 'button:has-text("Prescription"), a[href*="prescriptions"]';
    this.logoutBtn = 'button:has-text("Logout"), button:has-text("Sign Out")';
  }

  async verifyDoctorDashboardLoaded() {
    return await this.dh.isDisplayed(this.dashboardHeading);
  }

  async navigateToPatients() {
    await this.dh.click(this.patientsNav);
    await this.dh.driver.pause(1000);
  }

  async logout() {
    if (await this.dh.isDisplayed(this.logoutBtn)) {
      await this.dh.click(this.logoutBtn);
    }
  }
}

module.exports = DoctorDashboardPage;
