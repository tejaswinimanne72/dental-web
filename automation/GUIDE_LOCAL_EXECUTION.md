# 📖 Enterprise Android Appium Framework - Local Execution Guide

## 1. Prerequisites
- Node.js v18+ & npm v9+
- Java Development Kit (JDK 17 or JDK 21)
- Android Studio & Android SDK (API Level 31+)
- Appium Server 2.x (`npm i -g appium` & `appium driver install uiautomator2`)

## 2. Quick Local Execution Commands
```powershell
# Navigate to automation directory
cd "c:\Users\tejas\Downloads\final version 6.o\automation"

# Install Framework Dependencies
npm install

# Execute Master Test Suite (510 Test Cases) & Generate All Reports
npm run test:e2e
```

## 3. Local Report Outputs
Upon execution, reports are saved to `Test Results/`:
- **Excel Reports**: `Test Results/Excel/Automation_Test_Report.xlsx`
- **HTML Interactive Dashboard**: `Test Results/HTML/execution-report.html`
- **JSON Results Data**: `Test Results/JSON/execution-results.json`
- **Markdown Summary**: `Test Results/Summary/summary.md`
