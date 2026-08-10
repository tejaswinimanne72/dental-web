const path = require('path');

const APK_PATH = path.resolve(__dirname, '../../dental_clinic_app.apk');

module.exports = {
  server: {
    host: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723', 10),
    path: '/'
  },
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
    'appium:app': process.env.APK_PATH || APK_PATH,
    'appium:appPackage': 'com.dentalclinic.ai',
    'appium:appActivity': '.MainActivity',
    'appium:newCommandTimeout': 300,
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:ensureWebviewsHavePages': true,
    'appium:nativeWebScreenshot': true
  },
  testCredentials: {
    admin: { email: 'admin@clinic.com', password: 'password123' },
    doctor: { email: 'dr.smith@clinic.com', password: 'password123' },
    patient: { email: 'patient@clinic.com', password: 'password123' }
  }
};
