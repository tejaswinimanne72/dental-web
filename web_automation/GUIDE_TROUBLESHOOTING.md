# 📖 Live Deployment Selenium Framework - Troubleshooting Guide

## 1. Issue: Live URL Verification Returns HTTP 404
- **Cause**: GitHub Pages has not finished publishing the `gh-pages` branch upon initial push.
- **Resolution**: Pipeline Stage 6 automatically waits 20 seconds for deployment synchronization. Ensure GitHub Repository Settings -> Pages is configured to source from **`gh-pages` / `(root)`**.

## 2. Issue: Selenium Tests Run Against Localhost
- **Constraint Enforcement**: Framework strictly forbids localhost URLs in `web_automation/config/selenium.config.js`. Ensure `BASE_URL` is configured to your GitHub Pages URL `https://<github-username>.github.io/<repository-name>/`.
