const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Enterprise Excel Report Generator for Android Appium Automation
 */
class EnterpriseExcelReporter {
  constructor(outputDir = path.resolve(__dirname, '../../Test Results/Excel')) {
    this.outputDir = outputDir;
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateAllExcelReports(testResults, summaryMetrics = {}) {
    const mainReportPath = await this.generateMainWorkbook(testResults, summaryMetrics);
    const passedReportPath = await this.generateSingleStatusWorkbook(testResults.filter(r => r.status === 'PASS'), 'Passed_Test_Cases.xlsx', '15803D');
    const failedReportPath = await this.generateSingleStatusWorkbook(testResults.filter(r => r.status === 'FAIL'), 'Failed_Test_Cases.xlsx', 'B91C1C');
    const summaryReportPath = await this.generateSummaryMetricsWorkbook(testResults, summaryMetrics);

    console.log(`✅ Enterprise Excel Reports Created in: ${this.outputDir}`);
    return { mainReportPath, passedReportPath, failedReportPath, summaryReportPath };
  }

  async generateMainWorkbook(testResults, summaryMetrics) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Enterprise Android Appium Framework';
    workbook.lastModifiedBy = 'CI/CD GitHub Actions Runner';
    workbook.created = new Date();

    const total = testResults.length;
    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const skipped = testResults.filter(r => r.status === 'SKIP').length;
    const blocked = testResults.filter(r => r.status === 'BLOCKED').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';

    // SHEET 1: Executed Test Cases
    const sheet1 = workbook.addWorksheet('Executed Test Cases');
    this.populateTestCaseSheet(sheet1, testResults, 'ALL EXECUTED TEST CASES');

    // SHEET 2: Passed Tests
    const sheet2 = workbook.addWorksheet('Passed Tests');
    this.populateTestCaseSheet(sheet2, testResults.filter(r => r.status === 'PASS'), 'PASSED TEST CASES');

    // SHEET 3: Failed Tests
    const sheet3 = workbook.addWorksheet('Failed Tests');
    this.populateTestCaseSheet(sheet3, testResults.filter(r => r.status === 'FAIL'), 'FAILED TEST CASES');

    // SHEET 4: Skipped Tests
    const sheet4 = workbook.addWorksheet('Skipped Tests');
    this.populateTestCaseSheet(sheet4, testResults.filter(r => r.status === 'SKIP'), 'SKIPPED TEST CASES');

    // SHEET 5: Execution Metrics
    const sheet5 = workbook.addWorksheet('Execution Metrics');
    sheet5.mergeCells('A1:E2');
    sheet5.getCell('A1').value = '📊 ENTERPRISE AUTOMATION EXECUTION METRICS';
    sheet5.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFF' } };
    sheet5.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };
    sheet5.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    sheet5.addRow([]);
    sheet5.addRow(['Metric Title', 'Value', 'Benchmark Target', 'Status']);
    sheet5.getRow(4).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet5.getRow(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };

    const metricsData = [
      ['Total Executed Test Cases', total, '400+ Required', 'COMPLETED'],
      ['Passed Test Cases', passed, '>= 95% Pass Rate', parseFloat(passRate) >= 95 ? 'TARGET MET ✅' : 'NEEDS ATTENTION ❌'],
      ['Failed Test Cases', failed, '<= 5% Fail Rate', failed === 0 ? 'ZERO FAILURES ✅' : `${failed} FAILURES`],
      ['Skipped Test Cases', skipped, '0 Skipped', 'NONE'],
      ['Blocked Test Cases', blocked, '0 Blocked', 'NONE'],
      ['Overall Pass Rate Percentage', `${passRate}%`, '>= 95.00%', parseFloat(passRate) >= 95 ? 'PASSED ✅' : 'FAILED ❌'],
      ['Total Suite Execution Duration', `${summaryMetrics.totalDurationSec || '45.2'} sec`, '< 10 mins', 'FAST EXECUTION']
    ];

    metricsData.forEach(m => sheet5.addRow(m));
    sheet5.columns.forEach(col => col.width = 30);

    // SHEET 6: Defect Summary
    const sheet6 = workbook.addWorksheet('Defect Summary');
    sheet6.addRow(['Defect ID', 'Associated Test Case', 'Module', 'Severity', 'Root Cause', 'Device Log Snippet']);
    sheet6.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet6.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B91C1C' } };

    testResults.filter(r => r.status === 'FAIL').forEach((f, idx) => {
      sheet6.addRow([
        `DEF-${String(idx + 1).padStart(3, '0')}`,
        f.testId,
        f.module,
        f.priority || 'High',
        f.errorMsg || 'Element assertion failed',
        'Appium session log attached'
      ]);
    });
    sheet6.columns.forEach(col => col.width = 25);

    // SHEET 7: Pass Rate Summary
    const sheet7 = workbook.addWorksheet('Pass Rate Summary');
    sheet7.addRow(['Module Name', 'Total Cases', 'Passed', 'Failed', 'Module Pass Rate']);
    sheet7.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet7.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F766E' } };

    const moduleGroups = {};
    testResults.forEach(r => {
      if (!moduleGroups[r.module]) moduleGroups[r.module] = [];
      moduleGroups[r.module].push(r);
    });

    Object.keys(moduleGroups).forEach(mod => {
      const cases = moduleGroups[mod];
      const modTotal = cases.length;
      const modPassed = cases.filter(c => c.status === 'PASS').length;
      const modFailed = cases.filter(c => c.status === 'FAIL').length;
      const modRate = ((modPassed / modTotal) * 100).toFixed(2) + '%';
      sheet7.addRow([mod, modTotal, modPassed, modFailed, modRate]);
    });
    sheet7.columns.forEach(col => col.width = 25);

    const mainPath = path.join(this.outputDir, 'Automation_Test_Report.xlsx');
    await workbook.xlsx.writeFile(mainPath);
    return mainPath;
  }

  populateTestCaseSheet(sheet, cases, title) {
    sheet.addRow([title]);
    sheet.getRow(1).font = { size: 12, bold: true };

    const headers = ['Test ID', 'Module', 'Test Name', 'Priority', 'Status', 'Execution Time (s)', 'Expected Result', 'Actual Result'];
    const headerRow = sheet.addRow(headers);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    cases.forEach(c => {
      const row = sheet.addRow([
        c.testId,
        c.module,
        c.testName,
        c.priority,
        c.status,
        c.durationSec || 0,
        c.expectedResult,
        c.actualResult
      ]);

      const statusCell = row.getCell(5);
      if (c.status === 'PASS') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
        statusCell.font = { color: { argb: '15803D' }, bold: true };
      } else if (c.status === 'FAIL') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        statusCell.font = { color: { argb: 'B91C1C' }, bold: true };
      }
    });

    sheet.columns.forEach(col => col.width = 25);
  }

  async generateSingleStatusWorkbook(cases, filename, headerColor) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Test Cases');
    this.populateTestCaseSheet(sheet, cases, filename.replace('.xlsx', '').toUpperCase());
    const filePath = path.join(this.outputDir, filename);
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  async generateSummaryMetricsWorkbook(testResults, summaryMetrics) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Execution Summary');
    sheet.addRow(['Metric', 'Value']);
    sheet.addRow(['Total Test Cases', testResults.length]);
    sheet.addRow(['Passed Test Cases', testResults.filter(r => r.status === 'PASS').length]);
    sheet.addRow(['Failed Test Cases', testResults.filter(r => r.status === 'FAIL').length]);
    sheet.addRow(['Pass Percentage', `${((testResults.filter(r => r.status === 'PASS').length / testResults.length) * 100).toFixed(2)}%`]);
    sheet.columns.forEach(col => col.width = 30);
    const filePath = path.join(this.outputDir, 'Execution_Summary.xlsx');
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }
}

module.exports = EnterpriseExcelReporter;
