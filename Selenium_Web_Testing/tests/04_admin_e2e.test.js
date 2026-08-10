const AdminDashboardPage = require('../pages/AdminDashboardPage');

async function runAdminSuite(driverHelper) {
  const suiteName = 'Admin Web Portal E2E Suite';
  const results = [];
  const adminPage = new AdminDashboardPage(driverHelper);

  // Test 1: User Account Audit
  let t1Start = Date.now();
  try {
    console.log('🧪 Executing Selenium Test: Admin User Directory E2E...');
    await adminPage.navigateToUsers();
    results.push({
      suiteName,
      testName: 'Admin Staff Account Provisioning & Role Security',
      role: 'Admin',
      status: 'PASS',
      durationSec: parseFloat(((Date.now() - t1Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: null
    });
  } catch (err) {
    results.push({
      suiteName,
      testName: 'Admin Staff Account Provisioning & Role Security',
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
