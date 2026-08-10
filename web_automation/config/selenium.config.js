const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://tejas.github.io/final-version-6.o/';

module.exports = {
  baseUrl: BASE_URL,
  browser: process.env.SELENIUM_BROWSER || 'chrome',
  headless: process.env.HEADLESS !== 'false',
  explicitWaitMs: 10000,
  testCredentials: {
    admin: { email: 'admin@clinic.com', password: 'password123' },
    doctor: { email: 'dr.smith@clinic.com', password: 'password123' },
    patient: { email: 'patient@clinic.com', password: 'password123' }
  },
  reports: {
    outputDir: path.resolve(__dirname, '../../Test Results'),
    excelDir: path.resolve(__dirname, '../../Test Results/Excel'),
    htmlDir: path.resolve(__dirname, '../../Test Results/HTML'),
    jsonDir: path.resolve(__dirname, '../../Test Results/JSON'),
    summaryDir: path.resolve(__dirname, '../../Test Results/Summary'),
    screenshotsDir: path.resolve(__dirname, '../screenshots'),
    logsDir: path.resolve(__dirname, '../logs')
  }
};
