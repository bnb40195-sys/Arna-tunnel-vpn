#!/usr/bin/env bash
set -euo pipefail

echo "=== Arna tunnel: Android SDK Setup & Troubleshooter ==="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OS_NAME="$(uname -s)"
SDK_DIR="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"

# 1. Read existing local.properties if env vars are unset
if [ -z "$SDK_DIR" ] && [ -f "$ROOT_DIR/local.properties" ]; then
  PROP_SDK="$(grep -E '^sdk\.dir=' "$ROOT_DIR/local.properties" | head -n1 | cut -d'=' -f2- | sed 's#\\\\#/#g')"
  if [ -n "$PROP_SDK" ] && [ -d "$PROP_SDK" ]; then
    SDK_DIR="$PROP_SDK"
  fi
fi

# 2. Search standard Android SDK install locations (Linux / macOS / WSL / Termux)
if [ -z "$SDK_DIR" ]; then
  for candidate in \
    "$HOME/Android/Sdk" \
    "$HOME/Library/Android/sdk" \
    "/usr/local/lib/android/sdk" \
    "/opt/android-sdk" \
    "/data/data/com.termux/files/home/android-sdk" \
    /mnt/c/Users/*/AppData/Local/Android/Sdk; do
    if [ -d "$candidate" ]; then
      SDK_DIR="$candidate"
      break
    fi
  done
fi

# 3. Auto-bootstrap Android Command-Line Tools if SDK directory is missing
if [ -z "$SDK_DIR" ] || [ ! -d "$SDK_DIR" ]; then
  DEFAULT_SDK="$HOME/Android/Sdk"
  if [ "$OS_NAME" = "Darwin" ]; then
    DEFAULT_SDK="$HOME/Library/Android/sdk"
  fi
  echo "[i] Android SDK not found. Installing Android Command-Line Tools into: $DEFAULT_SDK"
  mkdir -p "$DEFAULT_SDK/cmdline-tools"

  TOOLS_URL=""
  if [ "$OS_NAME" = "Darwin" ]; then
    TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip"
  elif [ "$OS_NAME" = "Linux" ]; then
    TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
  fi

  if [ -n "$TOOLS_URL" ] && command -v curl >/dev/null 2>&1 && command -v unzip >/dev/null 2>&1; then
    TMP_ZIP="$(mktemp /tmp/android-cmdline-tools-XXXXXX.zip)"
    TMP_EXTRACT="$(mktemp -d /tmp/android-cmdline-extract-XXXXXX)"
    curl -fsSL "$TOOLS_URL" -o "$TMP_ZIP"
    unzip -q "$TMP_ZIP" -d "$TMP_EXTRACT"
    rm -rf "$DEFAULT_SDK/cmdline-tools/latest"
    mv "$TMP_EXTRACT/cmdline-tools" "$DEFAULT_SDK/cmdline-tools/latest"
    rm -rf "$TMP_ZIP" "$TMP_EXTRACT"
    SDK_DIR="$DEFAULT_SDK"
    echo "[+] Installed Android Command-Line Tools at: $SDK_DIR/cmdline-tools/latest"
  else
    echo "[!] Could not auto-download Android Command-Line Tools (requires curl, unzip, and Linux/macOS)."
    echo "    Install Android Studio or Command-Line Tools manually, then copy local.properties.example to local.properties."
    exit 1
  fi
fi

echo "[+] Using Android SDK at: $SDK_DIR"
export ANDROID_HOME="$SDK_DIR"
export ANDROID_SDK_ROOT="$SDK_DIR"

# Write local.properties (convert WSL /mnt/c/... path to Windows C:/... if inside WSL)
SDK_PROP_VAL="$SDK_DIR"
if [[ "$SDK_DIR" =~ ^/mnt/([a-zA-Z])/(.*)$ ]]; then
  DRIVE="${BASH_REMATCH[1]^^}"
  REST="${BASH_REMATCH[2]}"
  SDK_PROP_VAL="${DRIVE}:/${REST}"
fi
printf "sdk.dir=%s\n" "$SDK_PROP_VAL" > "$ROOT_DIR/local.properties"
echo "[+] Wrote $ROOT_DIR/local.properties (sdk.dir=$SDK_PROP_VAL)"

# 4. Locate Java JDK 17+ (including Android Studio embedded JBR)
if ! command -v java >/dev/null 2>&1; then
  for jbr in \
    "/opt/android-studio/jbr" \
    "$HOME/android-studio/jbr" \
    "/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
    "/usr/lib/jvm/java-17-openjdk-amd64" \
    "/usr/lib/jvm/temurin-17-jdk-amd64"; do
    if [ -x "$jbr/bin/java" ]; then
      export JAVA_HOME="$jbr"
      export PATH="$JAVA_HOME/bin:$PATH"
      break
    fi
  done
fi

if ! command -v java >/dev/null 2>&1; then
  echo "[!] Java JDK 17+ is not installed or not in PATH."
  echo "    Install OpenJDK/Temurin 17 and export JAVA_HOME, then re-run this script."
  exit 1
fi
echo "[+] Java found: $(java -version 2>&1 | head -n1)"

# 5. Locate sdkmanager & install API 35 packages + accept licenses
SDKMANAGER=""
for sm in \
  "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" \
  "$SDK_DIR/cmdline-tools/bin/sdkmanager" \
  "$SDK_DIR/tools/bin/sdkmanager"; do
  if [ -x "$sm" ]; then
    SDKMANAGER="$sm"
    break
  fi
done
if [ -z "$SDKMANAGER" ] && command -v sdkmanager >/dev/null 2>&1; then
  SDKMANAGER="$(command -v sdkmanager)"
fi

if [ -n "$SDKMANAGER" ]; then
  echo "[+] Accepting Android SDK licenses and installing API 35 & Build-Tools 35.0.0..."
  yes | "$SDKMANAGER" --sdk_root="$SDK_DIR" --licenses >/dev/null || true
  "$SDKMANAGER" --sdk_root="$SDK_DIR" \
    "cmdline-tools;latest" \
    "platform-tools" \
    "platforms;android-35" \
    "build-tools;35.0.0"
else
  echo "[!] sdkmanager not found inside $SDK_DIR."
  echo "    In Android Studio: Tools -> SDK Manager -> SDK Tools -> install 'Android SDK Command-line Tools (latest)' and API 35."
fi

# 6. Build Android web assets
echo "[+] Building Android web bundle and syncing assets..."
cd "$ROOT_DIR"
if [ -f package.json ] && command -v npm >/dev/null 2>&1; then
  ANDROID_BUILD=true npm run build
  rm -rf "$ROOT_DIR/app/src/main/assets/www"
  mkdir -p "$ROOT_DIR/app/src/main/assets/www"
  cp -r "$ROOT_DIR/dist/." "$ROOT_DIR/app/src/main/assets/www/"
  echo "[+] Copied dist/ into app/src/main/assets/www/"
fi

# 7. Generate Gradle Wrapper if gradle CLI is available and gradlew is missing
if [ ! -f "$ROOT_DIR/gradlew" ] && command -v gradle >/dev/null 2>&1; then
  echo "[+] Generating Gradle Wrapper (8.9)..."
  gradle wrapper --gradle-version 8.9
fi

echo "[+] Setup complete! Next step to generate APK files:"
if [ -x "$ROOT_DIR/gradlew" ]; then
  echo "    ./gradlew assembleDebug assembleRelease"
else
  echo "    gradle assembleDebug assembleRelease"
fi
