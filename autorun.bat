@echo off
title Naissance
echo [Naissance HGIS] Auto-run is starting ..
:main
npm start
timeout /t 30
echo [Naissance HGIS] Crashed! Restarting ..
goto main
