const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Excel Analysis Report Generator for Selenium Web Automation
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
    workbook.creator = 'Selenium Web E2E Automation Framework';
    workbook.lastModifiedBy = 'Dental Clinic Selenium Runner';
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
    titleCell.value = '🌐 DENTAL CLINIC WEB APP - SELENIUM E2E TEST EXECUTION & ANALYSIS REPORT';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F766E' } }; // Teal theme
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Metadata Block
    summarySheet.addRow([]);
    summarySheet.addRow(['Execution Timestamp:', new Date().toLocaleString()]);
    summarySheet.addRow(['Target Application:', 'Dental Clinic AI Web App (React + Vite + Node.js)']);
    summarySheet.addRow(['Base URL:', 'http://localhost:5173']);
    summarySheet.addRow(['Automation Tool:', 'Selenium WebDriver (Node.js) + ExcelJS']);

    summarySheet.getRow(4).font = { bold: true };
    summarySheet.getRow(5).font = { bold: true };
    summarySheet.getRow(6).font = { bold: true };
    summarySheet.getRow(7).font = { bold: true };

    summarySheet.addRow([]);

    // KPI Header Banner
    summarySheet.mergeCells('A9:G9');
    const kpiHeader = summarySheet.getCell('A9');
    kpiHeader.value = '📊 WEB E2E TEST EXECUTION METRICS';
    kpiHeader.font = { size: 12, bold: true, color: { argb: 'FFFFFF' } };
    kpiHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0D9488' } };
    kpiHeader.alignment = { vertical: 'middle', horizontal: 'left' };

    const total = testResults.length;
    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const skipped = testResults.filter(r => r.status === 'SKIP').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%';
    const totalDuration = testResults.reduce((acc, r) => acc + (r.durationSec || 0), 0).toFixed(2) + 's';

    // Metrics Table
    summarySheet.addRow(['Metric Indicator', 'Value', 'Performance Benchmark']);
    summarySheet.getRow(10).font = { bold: true, color: { argb: 'FFFFFF' } };
    summarySheet.getRow(10).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };

    const metricsData = [
      ['Total Web E2E Test Cases', total, '100% Executed'],
      ['Passed Tests', passed, passed === total ? 'ALL PASSED ✅' : `${passed}/${total} Passed`],
      ['Failed Tests', failed, failed === 0 ? 'NO FAILURES ✅' : `${failed} FAILED ❌`],
      ['Skipped Tests', skipped, '0 Skipped'],
      ['Pass Rate Percentage', passRate, parseFloat(passRate) >= 90 ? 'EXCELLENT' : 'NEEDS REVIEW'],
      ['Total Web Suite Execution Time', totalDuration, 'Complete E2E Run']
    ];

    metricsData.forEach(row => {
      const addedRow = summarySheet.addRow(row);
      if (row[0] === 'Passed Tests') addedRow.getCell(2).font = { color: { argb: '15803D' }, bold: true };
      if (row[0] === 'Failed Tests' && failed > 0) addedRow.getCell(2).font = { color: { argb: 'B91C1C' }, bold: true };
      if (row[0] === 'Pass Rate Percentage') addedRow.getCell(2).font = { bold: true };
    });

    summarySheet.getColumn(1).width = 32;
    summarySheet.getColumn(2).width = 28;
    summarySheet.getColumn(3).width = 35;

    // ==========================================
    // SHEET 2: DETAILED TEST RESULTS
    // ==========================================
    const detailSheet = workbook.addWorksheet('Detailed E2E Results', {
      views: [{ showGridLines: true }]
    });

    const headers = [
      'Test ID',
      'Test Suite Name',
      'Test Case Name',
      'Web Role / Feature',
      'Status',
      'Duration (sec)',
      'Timestamp',
      'Execution Log / Details'
    ];

    const headerRow = detailSheet.addRow(headers);
    headerRow.eachCell(cell => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '111827' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'CBD5E1' } },
        bottom: { style: 'medium', color: { argb: '0D9488' } }
      };
    });

    testResults.forEach((res, idx) => {
      const row = detailSheet.addRow([
        `TC-WEB-${String(idx + 1).padStart(3, '0')}`,
        res.suiteName || 'Selenium E2E Suite',
        res.testName,
        res.role || 'Web App',
        res.status,
        res.durationSec || 0,
        res.timestamp || new Date().toISOString(),
        res.errorMsg || 'Executed successfully without errors.'
      ]);

      const statusCell = row.getCell(5);
      statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
      statusCell.font = { bold: true };
      if (res.status === 'PASS') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
        statusCell.font = { color: { argb: '15803D' }, bold: true };
      } else if (res.status === 'FAIL') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        statusCell.font = { color: { argb: 'B91C1C' }, bold: true };
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

    detailSheet.columns.forEach((col) => {
      let maxLen = 14;
      col.eachCell({ includeEmpty: true }, cell => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > maxLen) maxLen = len;
      });
      col.width = Math.min(maxLen + 4, 52);
    });

    // ==========================================
    // SHEET 3: SUITE PERFORMANCE ANALYSIS
    // ==========================================
    const analysisSheet = workbook.addWorksheet('Suite Performance', {
      views: [{ showGridLines: true }]
    });

    analysisSheet.addRow(['Selenium Test Suite', 'Total Tests', 'Passed', 'Failed', 'Avg Duration (s)', 'Success Rate']);
    analysisSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    analysisSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };

    const suiteGroups = {};
    testResults.forEach(r => {
      const suite = r.suiteName || 'General Web Suite';
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

    analysisSheet.columns.forEach(col => col.width = 28);

    // Save File
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `Selenium_Web_E2E_Test_Report_${timestampStr}.xlsx`;
    const filePath = path.join(this.reportDir, filename);
    await workbook.xlsx.writeFile(filePath);

    console.log(`\n✅ Selenium Excel Analysis Report Generated Successfully!`);
    console.log(`📄 Path: ${filePath}`);
    return filePath;
  }
}

module.exports = ExcelReporter;
