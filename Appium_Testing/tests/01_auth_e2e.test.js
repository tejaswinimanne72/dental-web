const LoginPage = require('../pages/LoginPage');
const config = require('../config/appium.config');

async function runAuthSuite(driverHelper) {
  const suiteName = 'Authentication E2E Suite';
  const results = [];
  const loginPage = new LoginPage(driverHelper);

  // Test 1: Patient Login Verification
  let t1Start = Date.now();
  try {
    console.log('🧪 Executing: Patient Authentication Flow...');
    await loginPage.login(config.testCredentials.patient.email, config.testCredentials.patient.password, 'Patient');
    results.push({
      suiteName,
      testName: 'Patient Login & Session Creation',
      role: 'Patient',
      status: 'PASS',
      durationSec: parseFloat(((Date.now() - t1Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: null
    });
  } catch (err) {
    results.push({
      suiteName,
      testName: 'Patient Login & Session Creation',
      role: 'Patient',
      status: 'FAIL',
      durationSec: parseFloat(((Date.now() - t1Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: err.message
    });
  }

  // Test 2: Doctor Login Verification
  let t2Start = Date.now();
  try {
    console.log('🧪 Executing: Doctor Authentication Flow...');
    await loginPage.login(config.testCredentials.doctor.email, config.testCredentials.doctor.password, 'Doctor');
    results.push({
      suiteName,
      testName: 'Doctor Login & Role Authorization',
      role: 'Doctor',
      status: 'PASS',
      durationSec: parseFloat(((Date.now() - t2Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: null
    });
  } catch (err) {
    results.push({
      suiteName,
      testName: 'Doctor Login & Role Authorization',
      role: 'Doctor',
      status: 'FAIL',
      durationSec: parseFloat(((Date.now() - t2Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: err.message
    });
  }

  // Test 3: Admin Login Verification
  let t3Start = Date.now();
  try {
    console.log('🧪 Executing: Admin Authentication Flow...');
    await loginPage.login(config.testCredentials.admin.email, config.testCredentials.admin.password, 'Admin');
    results.push({
      suiteName,
      testName: 'Admin Secure Login & Access Control',
      role: 'Admin',
      status: 'PASS',
      durationSec: parseFloat(((Date.now() - t3Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: null
    });
  } catch (err) {
    results.push({
      suiteName,
      testName: 'Admin Secure Login & Access Control',
      role: 'Admin',
      status: 'FAIL',
      durationSec: parseFloat(((Date.now() - t3Start) / 1000).toFixed(2)),
      timestamp: new Date().toISOString(),
      errorMsg: err.message
    });
  }

  return results;
}

module.exports = runAuthSuite;
