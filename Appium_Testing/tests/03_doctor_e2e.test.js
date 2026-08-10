const DoctorDashboardPage = require('../pages/DoctorDashboardPage');

async function runDoctorSuite(driverHelper) {
  const suiteName = 'Doctor Portal E2E Suite';
  const results = [];
  const doctorPage = new DoctorDashboardPage(driverHelper);

  // Test 1: Doctor Schedule Management
  let t1Start = Date.now();
  try {
    console.log('🧪 Executing: Doctor Schedule & Patient List E2E...');
    await doctorPage.navigateToPatients();
    results.push({
      suiteName,
      testName: 'Doctor View Active Patient Queue',
      role: 'Doctor',
      status: 'PASS',
      durationSec: parseFloat(((Date.now() - t1Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: null
    });
  } catch (err) {
    results.push({
      suiteName,
      testName: 'Doctor View Active Patient Queue',
      role: 'Doctor',
      status: 'FAIL',
      durationSec: parseFloat(((Date.now() - t1Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: err.message
    });
  }

  return results;
}

module.exports = runDoctorSuite;
