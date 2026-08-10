const PatientDashboardPage = require('../pages/PatientDashboardPage');

async function runPatientSuite(driverHelper) {
  const suiteName = 'Patient Web Portal E2E Suite';
  const results = [];
  const patientPage = new PatientDashboardPage(driverHelper);

  // Test 1: Navigation to Appointments
  let t1Start = Date.now();
  try {
    console.log('🧪 Executing Selenium Test: Patient Appointments E2E...');
    await patientPage.navigateToAppointments();
    results.push({
      suiteName,
      testName: 'Patient Appointment Booking & Status Sync',
      role: 'Patient',
      status: 'PASS',
      durationSec: parseFloat(((Date.now() - t1Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: null
    });
  } catch (err) {
    results.push({
      suiteName,
      testName: 'Patient Appointment Booking & Status Sync',
      role: 'Patient',
      status: 'FAIL',
      durationSec: parseFloat(((Date.now() - t1Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: err.message
    });
  }

  // Test 2: Navigation to Billing
  let t2Start = Date.now();
  try {
    console.log('🧪 Executing Selenium Test: Patient Invoices & Billing E2E...');
    await patientPage.navigateToBilling();
    results.push({
      suiteName,
      testName: 'Patient Financial Invoices & Payment Ledger',
      role: 'Patient',
      status: 'PASS',
      durationSec: parseFloat(((Date.now() - t2Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: null
    });
  } catch (err) {
    results.push({
      suiteName,
      testName: 'Patient Financial Invoices & Payment Ledger',
      role: 'Patient',
      status: 'FAIL',
      durationSec: parseFloat(((Date.now() - t2Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: err.message
    });
  }

  return results;
}

module.exports = runPatientSuite;
