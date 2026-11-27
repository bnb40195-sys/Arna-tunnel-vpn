# Arna tunnel — الإصدار 1.0

تطبيق ويب متكامل وتقدمي (**PWA**) ومشروع أندرويد جاهز لإدارة وفحص أنفاق الاتصال، فحص النطاقات والشهادات (**SNI / TLS / DNS**)، وتوليد وإدارة ملفات الكونفيج بواجهة عربية كاملة.

---

## المميزات الرئيسية

- **البروتوكولات والتهيئة:**
  - **Custom SNI** (كوستوم SNI مع إعدادات مسبقة لشبكات الهاتف وتطبيقات السوشيال)
  - **SSH Tunnel** و **SSL/TLS + SSH**
  - **DNSTT / SlowDNS**
  - **OpenVPN** و **SSL/TLS OVPN**
  - **Hysteria UDP**
  - **V2Ray / Xray** (`VMess`, `VLESS`, `Trojan`, `Shadowsocks`)

- **إدارة وتصدير الكونفيجات (`Config Manager`):**
  - استيراد وإنشاء وتصدير ملفات كونفيج عبر الملفات أو **الحافظة (Clipboard)** بصيغ:
    - **`.an`** (صيغة Arna tunnel القياسية مع التشفير والقفل)
    - `vless://` / `vmess://` / `trojan://`
    - `.ovpn`
    - Xray `.json`

- **أدوات الفحص والتشخيص ومشاركة الشبكة:**
  - **مشاركة VPN (`VPN Share`):** مشاركة اتصال النفق للأجهزة المتصلة عبر نقطة الاتصال أو USB مع حفظ الإعدادات وتصدير التوجيه.
  - **فحص الهوست (`Host Checker`):** استعلام DNS حقيقي (`A / AAAA / CNAME`) ومصافحة `TLS` وفحص ترويسات HTTP ومزود الـ CDN.
  - **فاحص الـ IP المشترك (`Same IP Checker`):** استخراج نطاقات `SAN` والشبكة على نفس الخادم.
  - **اختبار السرعة (`Speed Test`):** قياس فعلي لزمن الاستجابة (`Ping`) وسرعة التحميل والرفع.
  - **مولد البايلود (`Payload Generator`)**، **بصمة الجهاز**، **فحص الأداء**، **الترميز وفك التشفير**، **سجلات الاتصال**، و**متصفح مواقع الكونفيجات**.

- **التخصيص والمظهر:**
  - شريط علوي موحّد (`AppHeader`) عبر جميع الأقسام مع مبدّل ثيمات فوري وزر استيراد/تصدير الكونفيجات والمساعدة.
  - 5 ثيمات كاملة تنعكس على التطبيق بالكامل: الفيروزي المحيطي، السماوي النيوني، الأزرق الياقوتي، الأصفر الذهبي، والأبيض النقي.
  - دعم التثبيت كتطبيق ويب تقدمي (**PWA**).

---

## هيكل المشروع (الويب + الأندرويد)

```text
.
├── app/
│   ├── build.gradle.kts              # إعدادات تطبيق أندرويد واستهلاك كتالوج libs.versions.toml
│   ├── proguard-rules.pro            # قواعد ProGuard
│   └── src/main/
│       ├── AndroidManifest.xml       # الصلاحيات وإعدادات RTL والشاشة الرئيسية
│       ├── java/com/arnatunnel/app/MainActivity.kt
│       └── res/                      # الأيقونة والنصوص والثيم الداكن
├── gradle/
│   ├── libs.versions.toml            # كتالوج إصدارات Gradle (AGP 8.7.3, Kotlin 2.0.21, SDK 35)
│   └── wrapper/gradle-wrapper.properties
├── .github/workflows/
│   └── android-debug-apk.yml         # مسار بناء وإصدار تلقائي على GitHub لإنتاج Debug و Release APK
├── scripts/
│   ├── fix-android-sdk.sh            # سكربت تثبيت وحل مشكلة Android SDK على Linux / macOS / WSL
│   └── fix-android-sdk.ps1           # سكربت تثبيت وحل مشكلة Android SDK على Windows PowerShell
├── build.gradle.kts                  # ملف Gradle الرئيسي
├── settings.gradle.kts               # تعريف المشروع وكتالوج الإصدارات
├── gradle.properties                 # إعدادات الذاكرة و AndroidX
├── local.properties.example          # نموذج مسار Android SDK
├── public/                           # الأيقونات والأصول الثابتة لتطبيق PWA
├── src/                              # كود تطبيق React + TypeScript
├── server.ts                         # خادم Express + أدوات الفحص الشبكي الحقيقية + Vite middleware
├── vite.config.ts                    # إعدادات Vite و VitePWA ودعم مسار الأندرويد النسبي
└── package.json
```

---

## التشغيل محلياً (تطبيق الويب والخادم)

**المتطلبات:** Node.js 18+ و npm.

```bash
# 1. تثبيت الحزم
npm install

# 2. تشغيل بيئة التطوير (Express + Vite على المنفذ 3000)
npm run dev

# 3. التحقق من الأنواع وبناء نسخة الإنتاج
npm run lint
npm run build

# 4. تشغيل نسخة الإنتاج
npm start
```

---

## حل مشكلة إعداد حزمة تطوير البرامج لنظام أندرويد (Android SDK)

إذا واجهت أخطاء عند فتح المشروع أو بنائه مثل:
- `SDK location not found` أو `Define a valid SDK location with an ANDROID_HOME environment variable`
- `Failed to find target with hash string 'android-35'`
- `You have not accepted the license agreements of the following SDK components`
- `Unsupported class file major version` / نقص **JDK 17**

اتبع الخطوات التالية لحل المشكلة تلقائياً:

### 1) الحل السريع التلقائي
يقوم السكربت باكتشاف Android SDK (أو تحميل **Android Command-Line Tools** تلقائياً إذا لم تكن مثبتة)، وضبط ملف `local.properties`، وقبول التراخيص، وتثبيت `Android 15 (API 35)` و`Build-Tools 35.0.0`، وبناء أصول الأندرويد:

- **Linux / macOS / WSL:**
```bash
chmod +x scripts/fix-android-sdk.sh
./scripts/fix-android-sdk.sh
```

- **Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/fix-android-sdk.ps1
```

### 2) الحل اليدوي لملف `local.properties`
انسخ الملف `local.properties.example` إلى `local.properties` وضع مسار حزمة Android SDK الخاصة بجهازك:

- **Windows:**
  ```properties
  sdk.dir=C:/Users/اسم_المستخدم/AppData/Local/Android/Sdk
  ```
- **Linux:**
  ```properties
  sdk.dir=/home/اسم_المستخدم/Android/Sdk
  ```
- **macOS:**
  ```properties
  sdk.dir=/Users/اسم_المستخدم/Library/Android/sdk
  ```

### 3) التحقق من الحزم داخل Android Studio
1. تأكد من تثبيت **Java JDK 17** (في Android Studio: `Settings > Build Tools > Gradle > Gradle JDK = jbr-17`).
2. افتح `Tools > SDK Manager`:
   - في تبويب **SDK Platforms**: ثبّت **Android 15.0 (API Level 35)**.
   - في تبويب **SDK Tools**: ثبّت **Android SDK Command-line Tools (latest)** و **Android SDK Build-Tools 35.0.0** و **Android SDK Platform-Tools**.
3. إذا استخدمت الطرفية، اقبل التراخيص عبر:
   ```bash
   yes | sdkmanager --licenses
   sdkmanager "cmdline-tools;latest" "platform-tools" "platforms;android-35" "build-tools;35.0.0"
   ```

---

## إنشاء ملفات APK وإصدارها (`Debug` و `Release`)

> **ملاحظة تقنية:** بيئة المعاينة السحابية تحتوي على Node.js فقط ولا تضم **Java JDK** أو **Android SDK**، لكن المشروع مهيأ بالكامل لبناء وتوقيع ملفات APK تلقائياً عبر GitHub Actions أو محلياً:

### الطريقة الأولى: البناء والإصدار التلقائي عبر GitHub Actions
تم إصلاح ملف `.github/workflows/android-debug-apk.yml` بالكامل ليقوم بما يلي:
1. تثبيت حزم الويب وبناء حزمة الأندرويد بمسار نسبي (`ANDROID_BUILD=true npm run build`) ونسخها إلى `app/src/main/assets/www/`.
2. إعداد **JDK 17** و **Android SDK 35** وكتابة `local.properties` و **Gradle 8.9**.
3. بناء **`Arna-tunnel-debug.apk`** (`assembleDebug`) وبناء **`Arna-tunnel-release.apk`** الموقّع (`assembleRelease`) مع التحقق عبر `apksigner`.
4. رفع الملفين في قسم **Artifacts**، وعند دفع وسم إصدار مثل `v1.0.0` (أو تشغيل `workflow_dispatch` مع تحديد `release_tag`) يتم نشر **GitHub Release** رسمي مرفق به ملفا الـ APK مباشرة.

*(اختيارياً: لتوقيع نسخة Release بمفتاحك الدائم، أضف الأسرار `ANDROID_KEYSTORE_BASE64` و `ANDROID_KEYSTORE_PASSWORD` و `ANDROID_KEY_ALIAS` و `ANDROID_KEY_PASSWORD` في إعدادات مستودع GitHub، وإلا سيقوم الـ Workflow بإنشاء مفتاح توقيع صالح تلقائياً.)*

### الطريقة الثانية: البناء محلياً عبر Android Studio أو الطرفية
```bash
# 1. بناء واجهة الويب بمسار أندرويد ونسخها إلى أصول التطبيق
ANDROID_BUILD=true npm run build
rm -rf app/src/main/assets/www && mkdir -p app/src/main/assets/www
cp -r dist/. app/src/main/assets/www/

# 2. إنشاء ملف التصحيح Debug APK وملف Release APK
gradle assembleDebug assembleRelease
```
ستجد الملفات النهائية في:
```text
app/build/outputs/apk/debug/app-debug.apk
app/build/outputs/apk/release/
```
أو افتح المجلد في **Android Studio** واضغط `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

