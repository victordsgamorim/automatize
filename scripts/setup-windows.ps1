#Requires -Version 5.1

<#
.SYNOPSIS
    Automatize monorepo - Windows development environment setup script.

.DESCRIPTION
    Installs and configures all tools required to develop and run the Automatize
    monorepo on a Windows machine using Chocolatey as the system package manager.

.NOTES
    Installs: Chocolatey, Git, Node.js (latest), pnpm (latest), turbo (latest)

    How to run (as Administrator):
        Set-ExecutionPolicy Bypass -Scope Process -Force
        .\setup-windows.ps1
#>

Set-ExecutionPolicy Bypass -Scope Process -Force

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host ">> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  [OK] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "  [--] $Message" -ForegroundColor Yellow
}

function Write-Fail {
    param([string]$Message)
    Write-Host "  [!!] $Message" -ForegroundColor Red
}

function Refresh-Path {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path", "User")
}

$totalSteps  = 9
$currentStep = 0
$failures    = @()

function Update-Progress {
    param([string]$Activity, [string]$Status)
    $script:currentStep++
    $pct = [math]::Round(($script:currentStep / $totalSteps) * 100)
    Write-Progress -Activity $Activity -Status "Step $($script:currentStep)/$totalSteps - $Status" -PercentComplete $pct
}

# ---------------------------------------------------------------------------
# STEP 0: Enforce Administrator privileges
# ---------------------------------------------------------------------------

$principal = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
$isAdmin   = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "  ERROR: This script must be run as Administrator." -ForegroundColor Red
    Write-Host ""
    Write-Host "  How to relaunch:" -ForegroundColor White
    Write-Host "    1. Search for 'PowerShell' in the Start menu." -ForegroundColor White
    Write-Host "    2. Right-click 'Windows PowerShell' and choose 'Run as administrator'." -ForegroundColor White
    Write-Host "    3. Re-run: Set-ExecutionPolicy Bypass -Scope Process -Force; .\setup-windows.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  Automatize - Windows Dev Environment Setup" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------------------
# STEP 1: Install / upgrade Chocolatey
# ---------------------------------------------------------------------------

Update-Progress -Activity "Automatize Setup" -Status "Chocolatey"
Write-Step "Step 1/$totalSteps - Chocolatey"

try {
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Warn "Chocolatey already installed - upgrading..."
        choco upgrade chocolatey -y | Out-Null
        Write-Success "Chocolatey upgraded."
    } else {
        Write-Host "  Installing Chocolatey..." -ForegroundColor White
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Write-Success "Chocolatey installed."
    }
} catch {
    Write-Fail "Chocolatey installation failed: $_"
    $failures += "Chocolatey"
}

# ---------------------------------------------------------------------------
# STEP 2: Refresh PATH so choco is available in this session
# ---------------------------------------------------------------------------

Update-Progress -Activity "Automatize Setup" -Status "PATH refresh"
Write-Step "Step 2/$totalSteps - Refreshing PATH"

Refresh-Path
Write-Success "PATH refreshed."

# ---------------------------------------------------------------------------
# STEP 3: Install Git
# ---------------------------------------------------------------------------

Update-Progress -Activity "Automatize Setup" -Status "Git"
Write-Step "Step 3/$totalSteps - Git"

try {
    if (Get-Command git -ErrorAction SilentlyContinue) {
        Write-Warn "Git already installed - upgrading..."
        choco upgrade git -y
    } else {
        Write-Host "  Running: choco install git -y" -ForegroundColor White
        choco install git -y
    }
    Refresh-Path
    Write-Success "Git ready."
} catch {
    Write-Fail "Git installation failed: $_"
    $failures += "Git"
}

# ---------------------------------------------------------------------------
# STEP 4: Configure Git for LF line endings
# ---------------------------------------------------------------------------

Update-Progress -Activity "Automatize Setup" -Status "Git config"
Write-Step "Step 4/$totalSteps - Git configuration (LF line endings)"

try {
    git config --global core.autocrlf false
    git config --global core.eol lf
    Write-Success "core.autocrlf=false and core.eol=lf set globally."
} catch {
    Write-Fail "Git configuration failed: $_"
    $failures += "Git config"
}

# ---------------------------------------------------------------------------
# STEP 5: Install Node.js 20.18.0
# ---------------------------------------------------------------------------

Update-Progress -Activity "Automatize Setup" -Status "Node.js (latest)"
Write-Step "Step 5/$totalSteps - Node.js (latest)"

try {
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $nodeVersion = node --version 2>&1
        Write-Warn "Node.js already installed ($nodeVersion) - upgrading to latest..."
        choco upgrade nodejs -y
    } else {
        Write-Host "  Running: choco install nodejs -y" -ForegroundColor White
        choco install nodejs -y
    }
    Refresh-Path
    Write-Success "Node.js ready."
} catch {
    Write-Fail "Node.js installation failed: $_"
    $failures += "Node.js"
}

# ---------------------------------------------------------------------------
# STEP 6: Refresh PATH so node/npm are available
# ---------------------------------------------------------------------------

Update-Progress -Activity "Automatize Setup" -Status "PATH refresh (post-Node)"
Write-Step "Step 6/$totalSteps - Refreshing PATH (post-Node.js)"

Refresh-Path
Write-Success "PATH refreshed."

# ---------------------------------------------------------------------------
# STEP 7: Install pnpm 8.15.0
# ---------------------------------------------------------------------------

Update-Progress -Activity "Automatize Setup" -Status "pnpm (latest)"
Write-Step "Step 7/$totalSteps - pnpm (latest)"

try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        $pnpmVersion = pnpm --version 2>&1
        Write-Warn "pnpm already installed ($pnpmVersion) - updating to latest..."
    } else {
        Write-Host "  Running: npm install -g pnpm@latest" -ForegroundColor White
    }
    npm install -g pnpm@latest
    Refresh-Path
    Write-Success "pnpm ready."
} catch {
    Write-Fail "pnpm installation failed: $_"
    $failures += "pnpm"
}

# ---------------------------------------------------------------------------
# STEP 8: Install Turbo globally
# ---------------------------------------------------------------------------

Update-Progress -Activity "Automatize Setup" -Status "turbo"
Write-Step "Step 8/$totalSteps - Turbo (global)"

try {
    if (Get-Command turbo -ErrorAction SilentlyContinue) {
        $turboVersion = turbo --version 2>&1
        Write-Warn "Turbo already installed ($turboVersion) - updating to latest..."
    } else {
        Write-Host "  Running: npm install -g turbo" -ForegroundColor White
    }
    npm install -g turbo
    Refresh-Path
    Write-Success "Turbo ready."
} catch {
    Write-Fail "Turbo installation failed: $_"
    $failures += "turbo"
}

# ---------------------------------------------------------------------------
# STEP 9: Final PATH refresh + validation
# ---------------------------------------------------------------------------

Update-Progress -Activity "Automatize Setup" -Status "Validation"
Write-Step "Step 9/$totalSteps - Final PATH refresh and validation"

Refresh-Path

$tools = @(
    @{ Cmd = "node";  Label = "Node.js"; VersionArg = "--version" },
    @{ Cmd = "npm";   Label = "npm";     VersionArg = "--version" },
    @{ Cmd = "pnpm";  Label = "pnpm";    VersionArg = "--version" },
    @{ Cmd = "git";   Label = "Git";     VersionArg = "--version" },
    @{ Cmd = "turbo"; Label = "Turbo";   VersionArg = "--version" }
)

Write-Host ""
Write-Host "  Validation results:" -ForegroundColor White
Write-Host "  -------------------" -ForegroundColor White

foreach ($tool in $tools) {
    $cmdObj = Get-Command $tool.Cmd -ErrorAction SilentlyContinue
    if ($cmdObj) {
        try {
            $version = & $tool.Cmd $tool.VersionArg 2>&1 | Select-Object -First 1
            Write-Host ("  [+] {0,-10} {1}" -f $tool.Label, $version) -ForegroundColor Green
        } catch {
            Write-Host ("  [+] {0,-10} (version check failed, but command found)" -f $tool.Label) -ForegroundColor Yellow
        }
    } else {
        Write-Host ("  [x] {0,-10} NOT FOUND" -f $tool.Label) -ForegroundColor Red
        $failures += $tool.Label
    }
}

Write-Progress -Activity "Automatize Setup" -Completed

# ---------------------------------------------------------------------------
# Summary banner
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan

if ($failures.Count -gt 0) {
    $uniqueFailures = $failures | Select-Object -Unique
    Write-Host "  Setup completed with errors." -ForegroundColor Red
    Write-Host ""
    Write-Host "  The following steps failed:" -ForegroundColor Red
    foreach ($f in $uniqueFailures) {
        Write-Host "    - $f" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "  Please review the output above, fix the issues, and re-run the script." -ForegroundColor Yellow
    Write-Host "=======================================================" -ForegroundColor Cyan
    Write-Host ""
    exit 1
} else {
    Write-Host "  All tools installed and verified successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor White
    Write-Host "    1. Open a NEW terminal (to pick up PATH changes system-wide)" -ForegroundColor White
    Write-Host "    2. Navigate to your project root" -ForegroundColor White
    Write-Host "    3. Copy and fill in your environment variables:" -ForegroundColor White
    Write-Host "         cp .env.example .env  (edit with your Supabase credentials)" -ForegroundColor White
    Write-Host "    4. Install dependencies:   pnpm install" -ForegroundColor White
    Write-Host "    5. Start the dev server:   pnpm dev" -ForegroundColor White
    Write-Host ""
    Write-Host "  Happy coding!" -ForegroundColor Green
    Write-Host "=======================================================" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}
