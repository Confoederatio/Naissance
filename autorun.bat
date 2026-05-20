@echo off
title Naissance
echo [Naissance HGIS] Ensuring dependencies are up-to-date.
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/en/download
    pause
    exit /b
)
call npm install
echo [Naissance HGIS] Auto-run is starting ..

:main
taskkill /F /IM "electron.exe" /T >nul 2>&1 # [WIP] - Temporary solution until it can be fixed in code
npm start
echo [Naissance HGIS] Depending on your system, this may take a while.
timeout /t 30
echo [Naissance HGIS] Crashed! Restarting ..
goto main