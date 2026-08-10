const https = require('https');
const http = require('http');
const config = require('../config/selenium.config');

async function verifyDeployment(targetUrl = config.baseUrl) {
  console.log(`🔍 Stage 7: Verifying Live Deployment Availability at: ${targetUrl}`);

  return new Promise((resolve, reject) => {
    const client = targetUrl.startsWith('https') ? https : http;
    
    const req = client.get(targetUrl, { timeout: 10000 }, (res) => {
      console.log(`📡 Deployment Response Code: HTTP ${res.statusCode}`);
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log('✅ Live GitHub Pages Deployment Verified Successfully!');
        resolve(true);
      } else {
        console.warn(`⚠️ Live URL returned HTTP ${res.statusCode}.`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.warn(`⚠️ Live Deployment URL connection check: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      console.warn('⚠️ Deployment URL verification timed out (10s limit).');
      resolve(false);
    });
  });
}

if (require.main === module) {
  verifyDeployment().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = verifyDeployment;
