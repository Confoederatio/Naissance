@echo off
title Naissance (Binary Builder)
echo [Naissance HGIS] Generating .ico files ..
call electron-icon-maker --input=./gfx/logo.png --output=./gfx/
echo [Naissance HGIS] Binary is being compiled for Windows ..
call npm run build:win -- --config.directories.output="./_dist/windows" > _dist/output_windows.txt
echo [Naissance HGIS] Binary is being compiled for MacOS ..
call npm run build:mac -- --config.directories.output="./_dist/mac" > _dist/output_mac.txt
echo [Naissance HGIS] Binary is being compiled for Linux ..
call npm run build:linux -- --config.directories.output="./_dist/linux" > _dist/output_linux.txt
echo [Naissance HGIS] Binary compilation process finished. Please check _dist/ for logs.
pause