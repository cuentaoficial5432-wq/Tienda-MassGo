@echo off
title MassGo - Esperar Conexion WhatsApp
cd /d "%~dp0"
powershell -NoLogo -ExecutionPolicy Bypass -File "%~dp0esperar_conexion.ps1"
if %errorlevel% neq 0 pause
