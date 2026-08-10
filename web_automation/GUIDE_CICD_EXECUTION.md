# 📖 Live Deployment Selenium Framework - CI/CD Pipeline Guide

## 1. 13-Stage CI/CD Pipeline Execution Order
1. **Stage 1**: Repository Checkout (`actions/checkout@v4`)
2. **Stage 2**: Install Node.js & Dependencies (`npm install`)
3. **Stage 3**: Build Web Application (`npm run build`)
4. **Stage 4**: Static Analysis & Linting (`npm run lint`)
5. **Stage 5**: Deploy to GitHub Pages (`peaceiris/actions-gh-pages@v3`)
6. **Stage 6**: Wait for Deployment Propagation (`sleep 20`)
7. **Stage 7**: Deployment Verification (HTTP status check on `BASE_URL`)
8. **Stage 8**: Execute Live Selenium E2E Tests (470 Test Cases against `BASE_URL`)
9. **Stage 9**: Generate Interactive HTML Reports
10. **Stage 10**: Generate 6-Sheet Excel Reports (`Automation_Test_Report.xlsx`)
11. **Stage 11**: Upload Artifacts (30-day retention)
12. **Stage 12**: Publish GitHub Action Step Summary (`$GITHUB_STEP_SUMMARY`)
13. **Stage 13**: Store Historical Execution Results (`reports/history/build-XXX`)
