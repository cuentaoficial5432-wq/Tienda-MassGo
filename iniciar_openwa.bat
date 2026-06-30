@echo off
cd /d "%~dp0openwa"
set PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
npm run start:dev
pause
