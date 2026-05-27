param(
    [string]$Session = "massgo-bot",
    [string]$ApiUrl = "http://localhost:2785/api",
    [string]$ApiKey = "dev-admin-key"
)

$headers = @{ "x-api-key" = $ApiKey }
$startTime = Get-Date

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Esperando conexion WhatsApp..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Wait for OpenWA to be ready
Write-Host " [1/3] Esperando a que OpenWA arranque..." -ForegroundColor Yellow
$elapsed = 0
do {
    try {
        $r = Invoke-RestMethod -Uri "$ApiUrl/sessions" -Headers $headers -Method Get -TimeoutSec 3
        break
    } catch {
        $elapsed += 2
        if ($elapsed -ge 60) {
            $m = [math]::Floor($elapsed/60)
            $s = $elapsed % 60
            Write-Host "    Esperando... ${m}m ${s}s" -ForegroundColor Gray
        } else {
            Write-Host "    Esperando... ${elapsed}s" -ForegroundColor Gray
        }
        Start-Sleep -Seconds 2
    }
} while ($true)
Write-Host "    OpenWA listo! ($($elapsed)s)" -ForegroundColor Green

# 2. Look up session ID by name, then start
Write-Host ""
Write-Host " [2/3] Iniciando sesion..." -ForegroundColor Yellow
try {
    $sessions = Invoke-RestMethod -Uri "$ApiUrl/sessions" -Headers $headers -Method Get -TimeoutSec 5
    $sessionData = $sessions | Where-Object { $_.name -eq $Session }
    if (-not $sessionData) {
        Write-Host "    Sesion '$Session' no encontrada, creando..." -ForegroundColor Yellow
        $newSession = @{ name = $Session; config = @{ autoReconnect = $true } } | ConvertTo-Json
        $created = Invoke-RestMethod -Uri "$ApiUrl/sessions" -Headers $headers -Method Post -Body $newSession -ContentType "application/json" -TimeoutSec 10
        $sessionId = $created.id
    } else {
        $sessionId = $sessionData.id
    }
    $r = Invoke-RestMethod -Uri "$ApiUrl/sessions/$sessionId/start" -Headers $headers -Method Post -TimeoutSec 15
    Write-Host "    Estado: $($r.status)" -ForegroundColor Green
} catch {
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Wait for connection with progress
Write-Host ""
Write-Host " [3/3] Conectando a WhatsApp..." -ForegroundColor Yellow
Write-Host ""
Write-Host ("  {0,-10} | {1}" -f "Tiempo", "Estado") -ForegroundColor Cyan
Write-Host ("  " + "-"*45) -ForegroundColor Cyan
$elapsed = 0
do {
    Start-Sleep -Seconds 3
    $elapsed += 3
    $ts = if ($elapsed -ge 60) { 
        $m = [math]::Floor($elapsed/60)
        $s = $elapsed % 60
        "${m}m${s}s".PadRight(7)
    } else { 
        "${elapsed}s".PadRight(7)
    }
    
    try {
        $r = Invoke-RestMethod -Uri "$ApiUrl/sessions/$sessionId" -Headers $headers -Method Get -TimeoutSec 5
        $st = $r.status
        
        if ($st -eq 'ready') {
            Write-Host ("  {0} | CONECTADO! {1}" -f $ts, $r.phone) -ForegroundColor Green
            Write-Host ""
            Write-Host "============================================" -ForegroundColor Green
            Write-Host "  WhatsApp conectado exitosamente!" -ForegroundColor Green
            Write-Host "  Telefono: $($r.phone)" -ForegroundColor White
            Write-Host "  PushName: $($r.pushName)" -ForegroundColor White
            Write-Host "  Tiempo total: ${elapsed}s" -ForegroundColor White
            Write-Host "============================================" -ForegroundColor Green
            pause
            exit 0
        } elseif ($st -eq 'qr') {
            Write-Host ("  {0} | ESCANEA QR" -f $ts) -ForegroundColor Magenta
            Write-Host ""
            Write-Host "============================================" -ForegroundColor Magenta
            Write-Host "  Se necesita escanear QR." -ForegroundColor Yellow
            Write-Host "  Abre http://localhost:2785/dashboard" -ForegroundColor White
            Write-Host "  Ve a Sessions > massgo-bot y escanea el QR" -ForegroundColor White
            Write-Host "============================================" -ForegroundColor Magenta
            pause
            exit 0
        } elseif ($st -eq 'failed') {
            Write-Host ("  {0} | FALLO LA CONEXION" -f $ts) -ForegroundColor Red
            pause
            exit 1
        } else {
            Write-Host ("  {0} | {1}" -f $ts, $st) -ForegroundColor Gray
        }
    } catch {
        Write-Host ("  {0} | Error: {1}" -f $ts, $_.Exception.Message) -ForegroundColor Red
    }
    
    # Every 60 seconds, ask if they want to continue
    if ($elapsed -ge 60 -and ($elapsed % 30) -eq 0) {
        Write-Host ""
        $resp = Read-Host "Lleva ${elapsed}s. Seguir esperando? (S/N)"
        if ($resp -ne 'S' -and $resp -ne 's') { exit 0 }
        Write-Host ""
    }
} while ($true)
