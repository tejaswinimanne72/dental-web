# 📖 Live Deployment Selenium Framework - Local Execution Guide

## 1. Environment Setup & Configuration
Set the live target deployment URL using the `BASE_URL` environment variable:

```powershell
# Set BASE_URL environment variable
$env:BASE_URL="https://<github-username>.github.io/<repository-name>/"

# Navigate to web_automation directory
cd "c:\Users\tejas\Downloads\final version 6.o\web_automation"

# Install dependencies
npm install
```

## 2. Running Live E2E Tests
```powershell
# Execute 470 Live Web Selenium E2E Test Cases & Generate Reports
npm run test:live
```

## 3. Viewing Generated Reports
Reports are written to `Test Results/`:
- **Excel Report**: `Test Results/Excel/Automation_Test_Report.xlsx`
- **Passed Cases**: `Test Results/Excel/Passed_Test_Cases.xlsx`
- **Summary Excel**: `Test Results/Excel/Summary_Report.xlsx`
- **Markdown Summary**: `Test Results/Summary/summary.md`
