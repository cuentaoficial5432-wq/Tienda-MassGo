@echo off
title MassGo - Resetear Sesion WhatsApp
echo ============================================
echo  Resetear sesion WhatsApp - MassGo
echo ============================================
echo.
echo  Esto borrara la session actual y te permitira
echo  escanear un nuevo codigo QR en otro dispositivo.
echo.
set /p confirm="Confirmar? (S/N): "
if /i not "%confirm%"=="S" goto :cancel

echo.
echo  [1/4] Borrando archivos QR...
if exist "%~dp0qr.html" del "%~dp0qr.html" && echo    qr.html eliminado
if exist "%~dp0whatsapp_qr.html" del "%~dp0whatsapp_qr.html" && echo    whatsapp_qr.html eliminado

echo.
echo  [2/4] Borrando datos de sesion de WhatsApp...
set SESSION_DIR=%~dp0openwa\data\sessions\massgo-bot
if exist "%SESSION_DIR%" (
    rmdir /s /q "%SESSION_DIR%"
    echo    Carpeta de sesion eliminada
) else (
    echo    No hay datos de sesion
)

echo.
echo  [3/4] Limpiando sesion en OpenWA (si esta corriendo)...
curl.exe -s -o nul -w "    Status: %%{http_code}\n" -X DELETE ^
  -H "x-api-key: dev-admin-key" ^
  "http://localhost:2785/api/sessions/massgo-bot" 2>nul || echo    OpenWA no esta corriendo, se omite

echo.
echo  [4/4] Limpiando webhook...
curl.exe -s -o nul -w "    Status: %%{http_code}\n" -X POST ^
  -H "x-api-key: dev-admin-key" ^
  -H "Content-Type: application/json" ^
  -d "{\"url\":\"http://127.0.0.1:8000/api/whatsapp/webhook\",\"events\":[\"message.received\"]}" ^
  "http://localhost:2785/api/sessions/massgo-bot/webhooks" 2>nul || echo    No se pudo limpiar webhook

echo.
echo ============================================
echo  LISTO. Ahora reinicia OpenWA y se generara
echo  un nuevo codigo QR para escanear.
echo.
echo  1. Doble clic en iniciar_openwa.bat
echo  2. Abre http://localhost:2785/dashboard
echo  3. Ve a Sessions ^> massgo-bot ^> Start
echo  4. Escanea el QR con tu nuevo dispositivo
echo ============================================
pause
goto :eof

:cancel
echo.
echo  Cancelado.
pause
