$files = git ls-files | Where-Object { $_ -match '\.(py|tsx|ts|css)$' }
$results = foreach ($f in $files) {
    try {
        $lines = (Get-Content $f -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
        [PSCustomObject]@{
            Path = $f
            Lines = $lines
        }
    } catch {}
}
Write-Host "--- DETAILED LINE COUNTS ---"
$results | Sort-Object Lines -Descending | Format-Table -AutoSize

$total = ($results | Measure-Object -Property Lines -Sum).Sum
Write-Host "Total Project Lines: $total"

$backend = ($results | Where-Object { $_.Path -match '^backend/' } | Measure-Object -Property Lines -Sum).Sum
Write-Host "Backend Python Lines: $backend"

$frontend = ($results | Where-Object { $_.Path -match '^frontend/src/' } | Measure-Object -Property Lines -Sum).Sum
Write-Host "Frontend TS/TSX Lines: $frontend"
