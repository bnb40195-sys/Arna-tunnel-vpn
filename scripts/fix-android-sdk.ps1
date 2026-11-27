$ErrorActionPreference = "Stop"

Write-Host "=== Arna tunnel: Windows Android SDK Setup & Troubleshooter ===" -ForegroundColor Cyan

$RootDir = Split-Path -Parent $PSScriptRoot
$SdkDir = $env:ANDROID_SDK_ROOT
if (-not $SdkDir) { $SdkDir = $env:ANDROID_HOME }

if (-not $SdkDir -or -not (Test-Path $SdkDir)) {
    $candidates = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "$env:USERPROFILE\AppData\Local\Android\Sdk",
        "C:\Android\Sdk"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) {
            $SdkDir = $c
            break
        }
    }
}

if (-not $SdkDir -or -not (Test-Path $SdkDir)) {
    $DefaultSdk = "$env:LOCALAPPDATA\Android\Sdk"
    Write-Host "[i] Android SDK not found. Downloading Command-Line Tools to $DefaultSdk ..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "$DefaultSdk\cmdline-tools" | Out-Null
    $ZipPath = Join-Path $env:TEMP "android-cmdline-tools.zip"
    $ExtractDir = Join-Path $env:TEMP "android-cmdline-extract"
    Invoke-WebRequest -Uri "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip" -OutFile $ZipPath
    if (Test-Path $ExtractDir) { Remove-Item -Recurse -Force $ExtractDir }
    Expand-Archive -Path $ZipPath -DestinationPath $ExtractDir -Force
    if (Test-Path "$DefaultSdk\cmdline-tools\latest") { Remove-Item -Recurse -Force "$DefaultSdk\cmdline-tools\latest" }
    Move-Item -Path "$ExtractDir\cmdline-tools" -Destination "$DefaultSdk\cmdline-tools\latest"
    Remove-Item -Force $ZipPath
    Remove-Item -Recurse -Force $ExtractDir
    $SdkDir = $DefaultSdk
}

Write-Host "[+] Using Android SDK: $SdkDir" -ForegroundColor Green
$env:ANDROID_HOME = $SdkDir
$env:ANDROID_SDK_ROOT = $SdkDir

$PropPath = $SdkDir -replace "\\", "/"
Set-Content -Path (Join-Path $RootDir "local.properties") -Value "sdk.dir=$PropPath" -Encoding ASCII
Write-Host "[+] Wrote local.properties (sdk.dir=$PropPath)" -ForegroundColor Green

$SdkManager = Join-Path $SdkDir "cmdline-tools\latest\bin\sdkmanager.bat"
if (Test-Path $SdkManager) {
    Write-Host "[+] Accepting SDK licenses & installing Android 15 (API 35) + Build-Tools 35.0.0..." -ForegroundColor Cyan
    1..20 | ForEach-Object { "y" } | & $SdkManager "--sdk_root=$SdkDir" "--licenses" | Out-Null
    & $SdkManager "--sdk_root=$SdkDir" "cmdline-tools;latest" "platform-tools" "platforms;android-35" "build-tools;35.0.0"
} else {
    Write-Host "[!] sdkmanager.bat not found. Install 'Android SDK Command-line Tools (latest)' in Android Studio SDK Manager." -ForegroundColor Yellow
}

if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "[+] Building Android web assets..." -ForegroundColor Cyan
    Push-Location $RootDir
    $env:ANDROID_BUILD = "true"
    npm run build
    $WwwDir = Join-Path $RootDir "app\src\main\assets\www"
    if (Test-Path $WwwDir) { Remove-Item -Recurse -Force $WwwDir }
    New-Item -ItemType Directory -Force -Path $WwwDir | Out-Null
    Copy-Item -Path (Join-Path $RootDir "dist\*") -Destination $WwwDir -Recurse -Force
    Pop-Location
    Write-Host "[+] Synced dist/ to app/src/main/assets/www/" -ForegroundColor Green
}

Write-Host "[+] Setup complete! Run 'gradle assembleDebug assembleRelease' or open in Android Studio." -ForegroundColor Green
