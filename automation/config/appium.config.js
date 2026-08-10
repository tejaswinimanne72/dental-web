const path = require('path');

const APK_PATH = process.env.APK_PATH || path.resolve(__dirname, '../../dental_clinic_app.apk');

module.exports = {
  server: {
    host: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
    path: '/'
  },
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
    'appium:platformVersion': process.env.ANDROID_VERSION || '12.0',
    'appium:app': APK_PATH,
    'appium:appPackage': 'com.dentalclinic.ai',
    'appium:appActivity': '.MainActivity',
    'appium:newCommandTimeout': 300,
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:ensureWebviewsHavePages': true,
    'appium:nativeWebScreenshot': true,
    'appium:disableWindowAnimation': true
  },
  execution: {
    parallelThreads: parseInt(process.env.PARALLEL_THREADS || '2', 10),
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '1', 10),
    screenshotOnFailure: true,
    passThresholdPercentage: 95
  },
  reports: {
    outputDir: path.resolve(__dirname, '../reports'),
    screenshotsDir: path.resolve(__dirname, '../screenshots'),
    logsDir: path.resolve(__dirname, '../logs'),
    historyDir: path.resolve(__dirname, '../reports/history')
  }
};
