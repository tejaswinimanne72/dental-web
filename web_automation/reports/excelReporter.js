const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class WebExcelReporter {
  constructor(outputDir = path.resolve(__dirname, '../../Test Results/Excel')) {
    this.outputDir = outputDir;
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateAllExcelReports(testResults, summaryMetrics = {}) {
    await this.generateMainWorkbook(testResults, summaryMetrics);
    await this.generateSingleStatusWorkbook(testResults.filter(r => r.status === 'PASS'), 'Passed_Test_Cases.xlsx');
    await this.generateSingleStatusWorkbook(testResults.filter(r => r.status === 'FAIL'), 'Failed_Test_Cases.xlsx');
    await this.generateSummaryReportWorkbook(testResults, summaryMetrics);

    console.log(`✅ Web Excel Reports Created in: ${this.outputDir}`);
  }

  async generateMainWorkbook(testResults, summaryMetrics) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Enterprise Selenium Live E2E Framework';
    workbook.created = new Date();

    const total = testResults.length;
    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const skipped = testResults.filter(r => r.status === 'SKIP').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';

    // Sheet 1: Executed Test Cases
    const sheet1 = workbook.addWorksheet('Executed Test Cases');
    sheet1.addRow(['Test ID', 'Module', 'Test Name', 'Status', 'Execution Time (s)', 'Priority']);
    sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

    testResults.forEach(c => {
      const row = sheet1.addRow([c.testId, c.module, c.testName, c.status, c.durationSec || 0.4, c.priority]);
      const statusCell = row.getCell(4);
      if (c.status === 'PASS') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
        statusCell.font = { color: { argb: '15803D' }, bold: true };
      }
    });
    sheet1.columns.forEach(col => col.width = 25);

    // Sheet 2: Passed Tests
    const sheet2 = workbook.addWorksheet('Passed Tests');
    sheet2.addRow(['Test ID', 'Module', 'Test Name', 'Status']);
    testResults.filter(r => r.status === 'PASS').forEach(c => sheet2.addRow([c.testId, c.module, c.testName, c.status]));
    sheet2.columns.forEach(col => col.width = 25);

    // Sheet 3: Failed Tests
    const sheet3 = workbook.addWorksheet('Failed Tests');
    sheet3.addRow(['Test ID', 'Module', 'Test Name', 'Status']);
    testResults.filter(r => r.status === 'FAIL').forEach(c => sheet3.addRow([c.testId, c.module, c.testName, c.status]));
    sheet3.columns.forEach(col => col.width = 25);

    // Sheet 4: Skipped Tests
    const sheet4 = workbook.addWorksheet('Skipped Tests');
    sheet4.addRow(['Test ID', 'Module', 'Test Name', 'Status']);
    testResults.filter(r => r.status === 'SKIP').forEach(c => sheet4.addRow([c.testId, c.module, c.testName, c.status]));
    sheet4.columns.forEach(col => col.width = 25);

    // Sheet 5: Execution Metrics
    const sheet5 = workbook.addWorksheet('Execution Metrics');
    sheet5.addRow(['Metric', 'Value']);
    sheet5.addRow(['Total Tests', total]);
    sheet5.addRow(['Passed', passed]);
    sheet5.addRow(['Failed', failed]);
    sheet5.addRow(['Pass Rate', `${passRate}%`]);
    sheet5.columns.forEach(col => col.width = 25);

    // Sheet 6: Defect Summary
    const sheet6 = workbook.addWorksheet('Defect Summary');
    sheet6.addRow(['Defect ID', 'Test ID', 'Module', 'Failure Reason']);
    sheet6.columns.forEach(col => col.width = 25);

    await workbook.xlsx.writeFile(path.join(this.outputDir, 'Automation_Test_Report.xlsx'));
  }

  async generateSingleStatusWorkbook(cases, filename) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Cases');
    sheet.addRow(['Test ID', 'Module', 'Test Name', 'Status']);
    cases.forEach(c => sheet.addRow([c.testId, c.module, c.testName, c.status]));
    sheet.columns.forEach(col => col.width = 25);
    await workbook.xlsx.writeFile(path.join(this.outputDir, filename));
  }

  async generateSummaryReportWorkbook(testResults, summaryMetrics) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Summary');
    sheet.addRow(['Summary Metric', 'Value']);
    sheet.addRow(['Deployment URL', summaryMetrics.baseUrl || 'https://tejas.github.io/final-version-6.o/']);
    sheet.addRow(['Total Executed', testResults.length]);
    sheet.addRow(['Passed Percentage', `${((testResults.filter(r => r.status === 'PASS').length / testResults.length) * 100).toFixed(2)}%`]);
    sheet.columns.forEach(col => col.width = 30);
    await workbook.xlsx.writeFile(path.join(this.outputDir, 'Summary_Report.xlsx'));
  }
}

module.exports = WebExcelReporter;
