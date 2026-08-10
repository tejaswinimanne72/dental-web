# 📖 Enterprise Android Appium Framework - CI/CD Pipeline Guide

## 1. Overview
The enterprise CI/CD pipeline is defined in `.github/workflows/android-e2e.yml` and executes 21 automated stages on every push, pull request, or scheduled cron trigger.

## 2. Pipeline Execution Order (21 Stages)
1. **Stage 1**: Checkout Repository
2. **Stage 2**: Setup Java JDK 17
3. **Stage 3**: Setup Android SDK
4. **Stage 4**: Install Android Dependencies
5. **Stage 5**: Build Android APK (`./gradlew assembleDebug`)
6. **Stage 6**: Start Android Emulator (API 31 x86_64)
7. **Stage 7**: Verify Emulator Readiness (`adb wait-for-device`)
8. **Stage 8**: Install APK (`adb install -r dental_clinic_app.apk`)
9. **Stage 9**: Start Appium Server (`npx appium --port 4723`)
10. **Stage 10**: Verify Appium Health (`curl http://127.0.0.1:4723/status`)
11. **Stage 11**: Execute 500+ Appium E2E Test Cases (`npm run test:e2e`)
12. **Stage 12**: Capture Failure & Visual Screenshots
13. **Stage 13**: Capture Device & Appium System Logs (`adb logcat`)
14. **Stage 14**: Generate Excel Reports (7-Sheet Workbook)
15. **Stage 15**: Generate Interactive HTML Reports
16. **Stage 16**: Generate JSON Results Payload
17. **Stage 17**: Generate Markdown Action Summary
18. **Stage 18**: Upload Build Artifacts (30-Day Retention)
19. **Stage 19**: Deploy Reports to GitHub Pages
20. **Stage 20**: Archive Historical Execution Trends (`reports/history/build-XXX`)
21. **Stage 21**: Publish GitHub Action Summary (`$GITHUB_STEP_SUMMARY`)
