const AdminDashboardPage = require('../pages/AdminDashboardPage');

async function runAdminSuite(driverHelper) {
  const suiteName = 'Admin Analytics & Management E2E Suite';
  const results = [];
  const adminPage = new AdminDashboardPage(driverHelper);

  // Test 1: Admin User Management E2E
  let t1Start = Date.now();
  try {
    console.log('🧪 Executing: Admin User Management E2E...');
    await adminPage.navigateToUsers();
    results.push({
      suiteName,
      testName: 'Admin Staff & User Account Audit',
      role: 'Admin',
      status: 'PASS',
      durationSec: parseFloat(((Date.now() - t1Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: null
    });
  } catch (err) {
    results.push({
      suiteName,
      testName: 'Admin Staff & User Account Audit',
      role: 'Admin',
      status: 'FAIL',
      durationSec: parseFloat(((Date.now() - t1Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: err.message
    });
  }

  return results;
}

module.exports = runAdminSuite;
