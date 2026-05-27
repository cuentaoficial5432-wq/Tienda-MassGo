@echo off
title MassGo - Todo
cd /d "%~dp0"
echo ============================================
echo  Iniciando MassGo (Backend + OpenWA)
echo ============================================
echo.

:: Iniciar backend en una ventana nueva
echo  [1/3] Iniciando Backend...
start "MassGo - Backend" /min cmd /c "%~dp0iniciar_backend.bat"

:: Iniciar OpenWA en otra ventana nueva
echo  [2/3] Iniciando OpenWA...
start "MassGo - OpenWA" /min cmd /c "%~dp0iniciar_openwa.bat"

echo.
echo  [3/3] Esperando conexion WhatsApp...
echo.
echo  Backend:  http://localhost:8000/tienda/
echo  Admin:    http://localhost:8000/admin/dashboard.html
echo  OpenWA:   http://localhost:2785
echo.
call "%~dp0esperar_conexion.bat"
