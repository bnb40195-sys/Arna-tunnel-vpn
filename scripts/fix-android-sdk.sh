#!/usr/bin/env bash
set -euo pipefail

echo "=== Arna tunnel: Android SDK Setup & Troubleshooter ==="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SDK_DIR="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"

if [ -z "$SDK_DIR" ]; then
  for candidate in \
    "$HOME/Android/Sdk" \
    "$HOME/Library/Android/sdk" \
    "/usr/local/lib/android/sdk" \
    "/opt/android-sdk" \
    "/data/data/com.termux/files/home/android-sdk"; do
    if [ -d "$candidate" ]; then
      SDK_DIR="$candidate"
      break
    fi
  done
fi

if [ -z "$SDK_DIR" ] || [ ! -d "$SDK_DIR" ]; then
  echo "[!] Android SDK directory not found automatically."
  echo "    Please install Android Studio or Android Command Line Tools, then set ANDROID_HOME:"
  echo "      export ANDROID_HOME=\$HOME/Android/Sdk"
  echo "    Or copy local.properties.example to local.properties and set sdk.dir=..."
  exit 1
fi

echo "[+] Found Android SDK at: $SDK_DIR"
printf "sdk.dir=%s\n" "$SDK_DIR" > "$ROOT_DIR/local.properties"
echo "[+] Wrote $ROOT_DIR/local.properties"

if ! command -v java >/dev/null 2>&1; then
  echo "[!] Java JDK 17+ is not installed or not in PATH."
  echo "    Install Temurin/OpenJDK 17 and export JAVA_HOME."
  exit 1
fi

SDKMANAGER=""
if [ -x "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" ]; then
  SDKMANAGER="$SDK_DIR/cmdline-tools/latest/bin/sdkmanager"
elif command -v sdkmanager >/dev/null 2>&1; then
  SDKMANAGER="$(command -v sdkmanager)"
fi

if [ -n "$SDKMANAGER" ]; then
  echo "[+] Accepting Android SDK licenses and verifying API 35 packages..."
  yes | "$SDKMANAGER" --sdk_root="$SDK_DIR" --licenses >/dev/null || true
  "$SDKMANAGER" --sdk_root="$SDK_DIR" \
    "platform-tools" \
    "platforms;android-35" \
    "build-tools;35.0.0"
else
  echo "[i] sdkmanager CLI not found inside cmdline-tools/latest/bin."
  echo "    Open the project in Android Studio -> SDK Manager -> Install Android 15 (API 35)."
fi

echo "[+] Building web bundle and syncing Android assets..."
cd "$ROOT_DIR"
if [ -f package.json ] && command -v npm >/dev/null 2>&1; then
  npm run build
  mkdir -p "$ROOT_DIR/app/src/main/assets/www"
  cp -r "$ROOT_DIR/dist/." "$ROOT_DIR/app/src/main/assets/www/"
  echo "[+] Copied dist/ into app/src/main/assets/www/"
fi

echo "[+] Setup complete! Next step to generate app-debug.apk:"
echo "    gradle assembleDebug   (or open project in Android Studio -> Build > Build APK(s))"
