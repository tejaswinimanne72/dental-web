Set WshShell = CreateObject("WScript.Shell")

' 1. Start MySQL Server
WshShell.Run """C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe"" --defaults-file=""C:\Users\tejas\Downloads\final version 6.o\my.ini"" --standalone", 0, False

WScript.Sleep 3000

' 2. Start Backend Server
WshShell.Run "cmd /c ""cd /d C:\Users\tejas\Downloads\final version 6.o\Backend && node server.js""", 0, False

WScript.Sleep 2000

' 3. Start Frontend Dev Server
WshShell.Run "cmd /c ""cd /d C:\Users\tejas\Downloads\final version 6.o\Frontend && npm run dev""", 0, False

WScript.Sleep 3000

' 4. Open Web App in Browser
WshShell.Run "cmd /c start http://localhost:5173/login", 0, False
