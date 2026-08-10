const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Excel Analysis Report Generator for Appium Mobile Automation
 */
class ExcelReporter {
  constructor(reportDir = path.resolve(__dirname, '../reports')) {
    this.reportDir = reportDir;
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async generateReport(testResults, executionSummary = {}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Appium E2E Mobile Automation Framework';
    workbook.lastModifiedBy = 'Dental Clinic Appium Runner';
    workbook.created = new Date();

    // ==========================================
    // SHEET 1: EXECUTIVE SUMMARY DASHBOARD
    // ==========================================
    const summarySheet = workbook.addWorksheet('Executive Summary', {
      views: [{ showGridLines: true }]
    });

    // Title Banner
    summarySheet.mergeCells('A1:G2');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = '📱 DENTAL CLINIC MOBILE APP - APPIUM E2E TEST EXECUTION & ANALYSIS REPORT';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Metadata Table
    summarySheet.addRow([]);
    summarySheet.addRow(['Execution Date:', new Date().toLocaleString()]);
    summarySheet.addRow(['Target Platform:', 'Android (Capacitor Hybrid Mobile App)']);
    summarySheet.addRow(['App Package:', 'com.dentalclinic.ai']);
    summarySheet.addRow(['Test Runner:', 'Appium + WebdriverIO + Node.js']);

    summarySheet.getRow(4).font = { bold: true };
    summarySheet.getRow(5).font = { bold: true };
    summarySheet.getRow(6).font = { bold: true };
    summarySheet.getRow(7).font = { bold: true };

    summarySheet.addRow([]);

    // KPI Metrics Section Header
    summarySheet.mergeCells('A9:G9');
    const kpiHeader = summarySheet.getCell('A9');
    kpiHeader.value = '📊 TEST EXECUTION SUMMARY METRICS';
    kpiHeader.font = { size: 12, bold: true, color: { argb: 'FFFFFF' } };
    kpiHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
    kpiHeader.alignment = { vertical: 'middle', horizontal: 'left' };

    const total = testResults.length;
    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const skipped = testResults.filter(r => r.status === 'SKIP').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%';
    const totalDuration = testResults.reduce((acc, r) => acc + (r.durationSec || 0), 0).toFixed(2) + 's';

    // Metric Cards Rows
    summarySheet.addRow(['Metric', 'Value', 'Status / Indicator']);
    summarySheet.getRow(10).font = { bold: true, color: { argb: 'FFFFFF' } };
    summarySheet.getRow(10).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '475569' } };

    const metricsData = [
      ['Total Test Cases Run', total, '100% Executed'],
      ['Passed Tests', passed, passed === total ? 'ALL PASSED ✅' : `${passed}/${total} Passed`],
      ['Failed Tests', failed, failed === 0 ? 'NO FAILURES ✅' : `${failed} REQUIRES ATTENTION ❌`],
      ['Skipped Tests', skipped, '0 Skipped'],
      ['Pass Percentage', passRate, parseFloat(passRate) >= 90 ? 'EXCELLENT' : 'NEEDS REVIEW'],
      ['Total Execution Time', totalDuration, 'Full E2E Suite Completed']
    ];

    metricsData.forEach(row => {
      const addedRow = summarySheet.addRow(row);
      if (row[0] === 'Passed Tests') addedRow.getCell(2).font = { color: { argb: '166534' }, bold: true };
      if (row[0] === 'Failed Tests' && failed > 0) addedRow.getCell(2).font = { color: { argb: '991B1B' }, bold: true };
      if (row[0] === 'Pass Percentage') addedRow.getCell(2).font = { bold: true };
    });

    // Adjust Summary Column Widths
    summarySheet.getColumn(1).width = 28;
    summarySheet.getColumn(2).width = 30;
    summarySheet.getColumn(3).width = 35;
    summarySheet.getColumn(4).width = 15;
    summarySheet.getColumn(5).width = 15;

    // ==========================================
    // SHEET 2: DETAILED TEST RESULTS
    // ==========================================
    const detailSheet = workbook.addWorksheet('Detailed E2E Results', {
      views: [{ showGridLines: true }]
    });

    // Table Header
    const headers = [
      'Test ID',
      'Test Suite Name',
      'Test Case Name',
      'User Role / Module',
      'Status',
      'Duration (sec)',
      'Timestamp',
      'Error Details / Execution Logs'
    ];

    const headerRow = detailSheet.addRow(headers);
    headerRow.eachCell(cell => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'CBD5E1' } },
        bottom: { style: 'medium', color: { argb: '0284C7' } }
      };
    });

    // Data Rows
    testResults.forEach((res, idx) => {
      const row = detailSheet.addRow([
        `TC-MOB-${String(idx + 1).padStart(3, '0')}`,
        res.suiteName || 'Appium E2E Suite',
        res.testName,
        res.role || 'General',
        res.status,
        res.durationSec || 0,
        res.timestamp || new Date().toISOString(),
        res.errorMsg || 'Executed successfully without errors.'
      ]);

      // Style Status Cell
      const statusCell = row.getCell(5);
      statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
      statusCell.font = { bold: true };
      if (res.status === 'PASS') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
        statusCell.font = { color: { argb: '166534' }, bold: true };
      } else if (res.status === 'FAIL') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        statusCell.font = { color: { argb: '991B1B' }, bold: true };
      }

      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        };
      });
    });

    // Auto-fit Column Widths
    detailSheet.columns.forEach((col, i) => {
      let maxLen = 12;
      col.eachCell({ includeEmpty: true }, cell => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > maxLen) maxLen = len;
      });
      col.width = Math.min(maxLen + 4, 50);
    });

    // ==========================================
    // SHEET 3: SUITE PERFORMANCE ANALYSIS
    // ==========================================
    const analysisSheet = workbook.addWorksheet('Suite Performance', {
      views: [{ showGridLines: true }]
    });

    analysisSheet.addRow(['Appium Test Suite', 'Total Tests', 'Passed', 'Failed', 'Avg Duration (s)', 'Success Rate']);
    analysisSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    analysisSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };

    // Group results by suite
    const suiteGroups = {};
    testResults.forEach(r => {
      const suite = r.suiteName || 'General Suite';
      if (!suiteGroups[suite]) suiteGroups[suite] = [];
      suiteGroups[suite].push(r);
    });

    Object.keys(suiteGroups).forEach(suiteName => {
      const tests = suiteGroups[suiteName];
      const suiteTotal = tests.length;
      const suitePassed = tests.filter(t => t.status === 'PASS').length;
      const suiteFailed = tests.filter(t => t.status === 'FAIL').length;
      const avgDur = (tests.reduce((a, b) => a + (b.durationSec || 0), 0) / suiteTotal).toFixed(2);
      const rate = ((suitePassed / suiteTotal) * 100).toFixed(1) + '%';

      analysisSheet.addRow([suiteName, suiteTotal, suitePassed, suiteFailed, `${avgDur}s`, rate]);
    });

    analysisSheet.columns.forEach(col => col.width = 25);

    // Save Workbook to File
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `Appium_E2E_Test_Report_${timestampStr}.xlsx`;
    const filePath = path.join(this.reportDir, filename);
    await workbook.xlsx.writeFile(filePath);

    console.log(`\n✅ Excel Analysis Report Generated Successfully!`);
    console.log(`📄 Path: ${filePath}`);
    return filePath;
  }
}

module.exports = ExcelReporter;
