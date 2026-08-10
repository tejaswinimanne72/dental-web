# 📖 Enterprise Android Appium Framework - Troubleshooting Guide

## 1. Issue: Appium Server Connection Failure
- **Symptom**: `ECONNREFUSED 127.0.0.1:4723`
- **Resolution**: Verify Appium server is running using `npx appium --port 4723`. Ensure UiAutomator2 driver is installed via `npx appium driver install uiautomator2`.

## 2. Issue: Android Emulator Timeout on CI/CD
- **Symptom**: `adb server failed to start` or emulator boot timeout.
- **Resolution**: GitHub Actions runner uses `macos-13` runner to enable hardware virtualization (KVM) acceleration for Android Emulators.

## 3. Issue: GitHub Pages Deployment Permission
- **Symptom**: 403 error during `peaceiris/actions-gh-pages` deployment.
- **Resolution**: In GitHub Repository Settings -> Actions -> General -> Workflow Permissions, set permissions to **Read and write permissions**.
