$ErrorActionPreference = 'SilentlyContinue'

# Arrêter tous les processus node.exe qui exécutent vite
Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -match "vite" } | ForEach-Object {
    Stop-Process -Id $_.Id -Force
}

# Libérer les ports utilisés
$portsToKill = @(3000, 24678)
foreach ($port in $portsToKill) {
    $processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
    if ($processId) {
        Stop-Process -Id $processId -Force
    }
}

exit 0
