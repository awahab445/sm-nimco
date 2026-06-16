param(
    [string]$DumpFile = "C:\Users\pc\Downloads\ecommerce-20260616-114005.dump"
)

$ErrorActionPreference = "Stop"

# =========================
# 0) CONFIG
# =========================
$repoRoot = "C:\Users\pc\Documents\ecoomerce-app\ecommerce-platform"
$backendEnv = Join-Path $repoRoot "backend\.env"

# Auto-detect PostgreSQL bin path from installed versions
$pgRoot = "C:\Program Files\PostgreSQL"
if (Test-Path $pgRoot) {
    function Get-VersionOrDefault {
        param([string]$Value)
        $parsed = [version]"0.0"
        if ([version]::TryParse($Value, [ref]$parsed)) {
            return $parsed
        }
        return [version]"0.0"
    }

    $candidateBins = Get-ChildItem -Path $pgRoot -Directory | ForEach-Object {
        $binPath = Join-Path $_.FullName "bin"
        $psqlExe = Join-Path $binPath "psql.exe"
        if (Test-Path $psqlExe) {
            [PSCustomObject]@{
                Name = $_.Name
                Bin  = $binPath
                # Try semantic version sort first; fallback stays as 0.0
                Ver  = Get-VersionOrDefault -Value $_.Name
            }
        }
    }

    if ($candidateBins) {
        $selectedBin = $candidateBins | Sort-Object Ver, Name -Descending | Select-Object -First 1
        if (-not ($env:Path -split ';' | Where-Object { $_ -eq $selectedBin.Bin })) {
            $env:Path = "$($selectedBin.Bin);$env:Path"
        }
        Write-Host "Using PostgreSQL tools from: $($selectedBin.Bin)"
    }
}

# Validate required tools
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) { throw "psql not found in PATH." }
if (-not (Get-Command pg_restore -ErrorAction SilentlyContinue)) { throw "pg_restore not found in PATH." }
if (-not (Test-Path $DumpFile)) { throw "Dump file not found: $DumpFile" }

# =========================
# 1) DEFAULT DB SETTINGS (same as restore-to-host.sh)
# =========================
$dbHost = "localhost"
$dbPort = "5432"
$dbUser = "postgres"
$dbName = "ecommerce_platform"
$dbPass = ""

# =========================
# 2) READ DATABASE_URL FROM backend/.env (if present)
# =========================
if (Test-Path $backendEnv) {
    $line = Get-Content $backendEnv | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
    if ($line) {
        $rawUrl = ($line -replace '^DATABASE_URL=', '').Trim().Trim('"').Trim("'")
        if ($rawUrl -like 'postgresql://*') {
            try {
                $uri = [uri]$rawUrl

                $userInfo = $uri.UserInfo
                if ($userInfo) {
                    $parts = $userInfo.Split(":", 2)
                    $dbUser = [System.Uri]::UnescapeDataString($parts[0])
                    if ($parts.Count -gt 1) {
                        $dbPass = [System.Uri]::UnescapeDataString($parts[1])
                    }
                }

                $dbHost = $uri.Host
                $dbPort = if ($uri.Port -gt 0) { "$($uri.Port)" } else { "5432" }
                $dbName = $uri.AbsolutePath.TrimStart("/")
            }
            catch {
                Write-Warning "Could not parse DATABASE_URL, using defaults."
            }
        }
    }
}

Write-Host "Restoring into DB: $dbName on $dbHost`:$dbPort as $dbUser"
if ($dbPass) { $env:PGPASSWORD = $dbPass }

# =========================
# 3) STOP ACTIVE CONNECTIONS
# =========================
psql -h $dbHost -p $dbPort -U $dbUser -d postgres -v ON_ERROR_STOP=1 -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$dbName'
  AND pid <> pg_backend_pid();
"

# =========================
# 4) ENSURE TARGET DB EXISTS
# =========================
$dbExists = psql -h $dbHost -p $dbPort -U $dbUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$dbName';"
if ($dbExists.Trim() -ne "1") {
    createdb -h $dbHost -p $dbPort -U $dbUser $dbName
}

# =========================
# 5) RESTORE DUMP
# =========================
pg_restore `
  -h $dbHost `
  -p $dbPort `
  -U $dbUser `
  -d $dbName `
  --clean `
  --if-exists `
  --no-owner `
  --no-acl `
  $DumpFile

if ($LASTEXITCODE -ne 0) {
    Write-Warning "pg_restore returned non-zero. Some warnings can be normal; review output above."
}

# =========================
# 6) OPTIONAL: RESTORE UPLOADS ARCHIVE
# =========================
$uploadsArchive = ($DumpFile -replace '\.dump$', '-uploads.tar.gz')
if (Test-Path $uploadsArchive) {
    Write-Host "Restoring uploads archive: $uploadsArchive"
    tar -xzf $uploadsArchive -C (Join-Path $repoRoot "backend")
}

# =========================
# 7) PRISMA SYNC
# =========================
Set-Location (Join-Path $repoRoot "backend")
npx prisma db pull --schema prisma/schema.prisma
if ($LASTEXITCODE -ne 0) { throw "prisma db pull failed." }

npx prisma generate
if ($LASTEXITCODE -ne 0) { throw "prisma generate failed." }

Write-Host "DONE: Database restored and Prisma schema/client synced."

