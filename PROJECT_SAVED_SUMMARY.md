# 💾 Dental Clinic AI - Full Project Backup & Reference Guide

All files, code, database tables, credentials, and Android app build files are saved and backed up.

---

### 📁 Key Saved Files & Paths

| Item | Saved File Location | Description |
| :--- | :--- | :--- |
| **🚀 1-Click Master Launcher** | [START_APP.bat](file:///c:/Users/tejas/Downloads/final%20version%206.o/START_APP.bat) | Starts MySQL + Backend + Frontend in 1 click |
| **🛡️ Silent Background Launcher** | [START_SILENT.vbs](file:///c:/Users/tejas/Downloads/final%20version%206.o/START_SILENT.vbs) | Starts all 3 services silently in background |
| **📱 Android App (.APK)** | [dental_clinic_app.apk](file:///c:/Users/tejas/Downloads/final%20version%206.o/dental_clinic_app.apk) | Compiled Android App (4.3 MB) ready for phone |
| **🗄️ Fresh Database Backup** | [dental_clinic_pushed.sql](file:///c:/Users/tejas/Downloads/final%20version%206.o/dental_clinic_pushed.sql) | Complete SQL Database Dump (32 Tables) |
| **⚙️ Backend Environment** | [Backend/.env](file:///c:/Users/tejas/Downloads/final%20version%206.o/Backend/.env) | Database & JWT secret configurations |

---

### 🔑 Saved Account Credentials

- **👑 Admin Account:**  
  - Email: `tejaswini@clinic.com`  
  - Password: `tejaswini123`

- **🩺 Doctor Account:**  
  - Email: `dr.tejaswini@smilecare.com` *(or `rajesh.kumar@smilecare.com`)*  
  - Password: `123456`

- **🧑‍⚕️ Patient Account:**  
  - Email: `tejaswini.patient@gmail.com`  
  - Password: `123456`

- **🗄️ MySQL Database Credentials:**  
  - Host: `127.0.0.1` | Port: `3306`  
  - User: `dental_user` | Password: `dental123`  
  - Database: `dental_clinic`

---

### 🛠️ How to Make Changes in the Future

#### 1. Modify Web App UI / Components:
- Edit files inside `Frontend/src/`
- Changes reflect live immediately on `http://localhost:5173`

#### 2. Re-Build Android App after making changes:
Run this single command in PowerShell:
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; cd "C:\Users\tejas\Downloads\final version 6.o\Frontend"; npm run build; npx cap sync android; cd android; .\gradlew.bat assembleDebug; Copy-Item "app\build\outputs\apk\debug\app-debug.apk" "..\..\dental_clinic_app.apk" -Force
```

#### 3. Export New Database Backup after making data changes:
Run this command in Command Prompt:
```cmd
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe" -u root -h 127.0.0.1 -P 3306 dental_clinic > "C:\Users\tejas\Downloads\final version 6.o\dental_clinic_pushed.sql"
```
