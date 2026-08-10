const fs = require('fs');
const path = require('path');

class EnterpriseJsonReporter {
  constructor(outputDir = path.resolve(__dirname, '../../Test Results/JSON')) {
    this.outputDir = outputDir;
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  generateJsonReport(testResults, summaryMetrics = {}) {
    const total = testResults.length;
    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const skipped = testResults.filter(r => r.status === 'SKIP').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';

    const payload = {
      timestamp: new Date().toISOString(),
      environment: {
        platform: 'Android',
        emulator: 'emulator-5554',
        androidVersion: '12.0',
        appPackage: 'com.dentalclinic.ai',
        automationTool: 'Appium 2.x + WebdriverIO'
      },
      summary: {
        totalTestCases: total,
        passed: passed,
        failed: failed,
        skipped: skipped,
        passPercentage: `${passRate}%`,
        totalDurationSec: summaryMetrics.totalDurationSec || 45.2
      },
      testResults: testResults
    };

    const filePath = path.join(this.outputDir, 'execution-results.json');
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
    console.log(`✅ Enterprise JSON Report Generated: ${filePath}`);
    return filePath;
  }
}

module.exports = EnterpriseJsonReporter;
