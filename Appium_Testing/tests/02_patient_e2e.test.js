const PatientDashboardPage = require('../pages/PatientDashboardPage');

async function runPatientSuite(driverHelper) {
  const suiteName = 'Patient Portal E2E Suite';
  const results = [];
  const patientPage = new PatientDashboardPage(driverHelper);

  // Test 1: Patient Dashboard Navigation
  let t1Start = Date.now();
  try {
    console.log('🧪 Executing: Patient Dashboard Navigation E2E...');
    await patientPage.navigateToAppointments();
    results.push({
      suiteName,
      testName: 'Patient Navigation to Appointments',
      role: 'Patient',
      status: 'PASS',
      durationSec: parseFloat(((Date.now() - t1Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: null
    });
  } catch (err) {
    results.push({
      suiteName,
      testName: 'Patient Navigation to Appointments',
      role: 'Patient',
      status: 'FAIL',
      durationSec: parseFloat(((Date.now() - t1Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: err.message
    });
  }

  // Test 2: Billing & Invoice Inspection
  let t2Start = Date.now();
  try {
    console.log('🧪 Executing: Patient Billing & Invoices E2E...');
    await patientPage.navigateToBilling();
    results.push({
      suiteName,
      testName: 'Patient Invoice & Payment Summary Check',
      role: 'Patient',
      status: 'PASS',
      durationSec: parseFloat(((Date.now() - t2Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: null
    });
  } catch (err) {
    results.push({
      suiteName,
      testName: 'Patient Invoice & Payment Summary Check',
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
