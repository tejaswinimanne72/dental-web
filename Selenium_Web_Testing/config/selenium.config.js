module = module.exports = {
  baseUrl: process.env.BASE_URL || 'http://127.0.0.1:5173/login',
  apiUrl: process.env.API_URL || 'http://127.0.0.1:4000',
  browser: process.env.SELENIUM_BROWSER || 'chrome',
  headless: process.env.HEADLESS !== 'false',
  explicitWaitMs: 10000,
  testCredentials: {
    admin: { email: 'admin@clinic.com', password: 'password123' },
    doctor: { email: 'dr.smith@clinic.com', password: 'password123' },
    patient: { email: 'patient@clinic.com', password: 'password123' }
  }
};
