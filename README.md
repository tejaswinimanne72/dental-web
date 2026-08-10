# 🦷 Dental Clinic AI - Full-Stack Healthcare Platform & Automation Suite

[![Live Web Application](https://img.shields.io/badge/Web%20App-Online-brightgreen)](http://localhost:5173)
[![API Server](https://img.shields.io/badge/Backend%20API-Port%204000-blue)](http://localhost:4000)
[![Appium E2E Automation](https://img.shields.io/badge/Appium%20E2E-510%20Test%20Cases-purple)](./automation)
[![Selenium Web E2E](https://img.shields.io/badge/Selenium%20Web-470%20Test%20Cases-teal)](./web_automation)
[![DevSecOps Audit](https://img.shields.io/badge/DevSecOps-Audit%20Report-orange)](./Vulnerability%20Test%20Results)

---

## 📌 Executive Summary

**Dental Clinic AI** is an enterprise full-stack dental healthcare management application featuring role-based portals for **Patients**, **Doctors**, and **Clinic Administrators**. It is packaged with:
- **Web App**: React 18 + Vite + Tailwind CSS + Lucide Icons
- **Backend API**: Node.js + Express.js + JWT Authentication + Server-Sent Events (SSE)
- **Database Engine**: MySQL 8.4 with 32 relational schemas & stored procedures
- **Mobile Native App**: Capacitor Android hybrid application (`dental_clinic_app.apk`)
- **Automated E2E Testing Frameworks**: Appium Android Automation (510 Test Cases) & Selenium Live Web Automation (470 Test Cases) with Excel, HTML, and Markdown reporting
- **DevSecOps Audit & Security Review**: SAST/DAST vulnerability scanning, load benchmarking (k6, JMeter, Artillery), and GitHub Pages reporting

---

## 📂 Project Architecture & Directory Map

```
c:\Users\tejas\Downloads\final version 6.o\
├── .github/
│   └── workflows/
│       ├── android-e2e.yml            # 21-Stage Appium Android Mobile CI/CD Pipeline
│       ├── deploy-and-test.yml        # 13-Stage GitHub Pages & Selenium Live E2E Pipeline
│       ├── deploy-reports.yml         # GitHub Pages Live Report Deployment
│       └── security-review.yml        # DevSecOps SAST/DAST Security Audit Pipeline
├── Backend/                           # Express.js REST API Server & MySQL Pool (Port 4000)
├── Frontend/                          # React + Vite Web Application & Capacitor Android Project (Port 5173)
├── automation/                        # Enterprise Appium Android E2E Framework (510 Test Cases)
├── web_automation/                    # Enterprise Selenium Live Web E2E Framework (470 Test Cases)
├── Vulnerability Test Results/        # DevSecOps Audit Reports, SAST/DAST Reviews & Load Benchmarks
├── dental_clinic_app.apk              # Compiled Android Application Package
├── dental_clinic_pushed.sql           # Database SQL Backup Schema (32 Tables)
├── START_APP.bat                      # 1-Click Master Application Launcher
└── START_SILENT.vbs                   # Silent Background Service Launcher
```

---

## 🚀 Quick Start Guide

### 1. Launch All Local Services (1-Click)
Run `START_APP.bat` to launch MySQL Server, Backend Node.js API, and Frontend Vite Web Server automatically:

```cmd
.\START_APP.bat
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:4000](http://localhost:4000)

### 2. Default Test Credentials

| Portal Role | Username / Email | Password | Allowed Features |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `tejaswini@clinic.com` *(or `teju@12345`)* | `tejaswini123` *(or `123`)* | Revenue Analytics, User Directory, Financial Overrides, KPI Reports |
| **🩺 Doctor** | `dr.tejaswini@smilecare.com` | `123456` | Active Patient Queue, Treatment Charting, Digital Prescriptions |
| **🧑‍⚕️ Patient**| `tejaswini.patient@gmail.com` | `123456` | Appointment Booking, Billing Invoices, Medical History |

---

## 🧪 Automated Testing & Reporting Suite

### 📱 1. Mobile Appium E2E Automation Suite (`automation/`)
- **Total Test Cases**: **510 Executable Test Cases** across 20 domain categories
- **Reporters**: 7-Sheet Excel Report (`Automation_Test_Report.xlsx`), Interactive HTML Report (`execution-report.html`), and Markdown Summary (`summary.md`).
- **Execution**:
  ```powershell
  cd automation
  npm run test:e2e
  ```

### 🌐 2. Web Selenium E2E Live Automation Suite (`web_automation/`)
- **Total Test Cases**: **470 Executable Test Cases** across 14 web categories
- **Execution Target**: Configurable via `BASE_URL` (defaults to GitHub Pages deployment)
- **Execution**:
  ```powershell
  cd web_automation
  npm run test:live
  ```

### 🛡️ 3. DevSecOps Security Audit & Load Benchmarks (`Vulnerability Test Results/`)
- **Static Analysis (SAST)**: Mapped to OWASP Top 10 & CWE Top 25 vulnerabilities.
- **Load Testing Benchmarks**: 100 Virtual Users for 60 seconds (Throughput: **979.45 req/sec**, **100% Success Rate**, 0 Errors).
- **Scripts Included**: `k6-load-test.js`, `artillery-load-test.yml`, `jmeter-test-plan.jmx`.

---

## ⚙️ CI/CD Workflow Pipelines (.github/workflows/)

1. **`android-e2e.yml`**: 21-stage Android Emulator & Appium testing pipeline.
2. **`deploy-and-test.yml`**: 13-stage GitHub Pages build, deployment, and live Selenium verification.
3. **`security-review.yml`**: DevSecOps scanner executing Semgrep, Trivy, Gitleaks, and k6 load benchmarks.
4. **`deploy-reports.yml`**: GitHub Pages publisher for test results and historical execution trends.

---

## 📄 License & Academic Attribution
Created for Dental Clinic AI Management Platform. All rights reserved.
