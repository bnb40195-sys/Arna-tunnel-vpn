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
│   └── android-debug-apk.yml         # مسار بناء تلقائي على GitHub لإنتاج app-debug.apk
├── scripts/
│   └── fix-android-sdk.sh            # سكربت حل مشكلة إعداد Android SDK وملف local.properties
├── build.gradle.kts                  # ملف Gradle الرئيسي
├── settings.gradle.kts               # تعريف المشروع وكتالوج الإصدارات
├── gradle.properties                 # إعدادات الذاكرة و AndroidX
├── local.properties.example          # نموذج مسار Android SDK
├── public/                           # الأيقونات والأصول الثابتة لتطبيق PWA
├── src/                              # كود تطبيق React + TypeScript
├── server.ts                         # خادم Express + أدوات الفحص الشبكي الحقيقية + Vite middleware
├── vite.config.ts                    # إعدادات Vite و VitePWA
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

اتبع الخطوات التالية لحل المشكلة فوراً:

### 1) الحل السريع التلقائي (Linux / macOS / WSL)
شغّل السكربت المرفق لضبط ملف `local.properties`، وقبول التراخيص، وتثبيت `Android 15 (API 35)` و`Build-Tools 35.0.0`، ونسخ ملفات الويب المبنية إلى التطبيق:

```bash
chmod +x scripts/fix-android-sdk.sh
./scripts/fix-android-sdk.sh
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
   - في تبويب **SDK Tools**: ثبّت **Android SDK Build-Tools 35.0.0** و **Android SDK Platform-Tools**.
3. إذا استخدمت الطرفية، اقبل التراخيص عبر:
   ```bash
   yes | sdkmanager --licenses
   sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
   ```

---

## إنشاء ملف تصحيح الأخطاء (`app-debug.apk`)

> **ملاحظة تقنية:** هذه البيئة السحابية تحتوي على Node.js فقط ولا تضم **Java JDK** أو **Android SDK**، لذلك لا يمكن تصدير ملف `.apk` تنفيذي مباشرة من داخل متصفح المعاينة؛ لكن المشروع أصبح مهيأً بالكامل بجميع ملفات Gradle لبنائه في دقيقة واحدة عبر أي من الطريقتين التاليتين:

### الطريقة الأولى: البناء السحابي التلقائي عبر GitHub Actions (بدون تثبيت أي برامج)
تمت إضافة ملف `.github/workflows/android-debug-apk.yml`. بمجرد رفع المشروع إلى مستودع GitHub وتشغيل الـ Workflow:
1. يقوم تلقائياً ببناء نسخة الويب (`npm run build`) ونسخها إلى `app/src/main/assets/www/`.
2. يثبّت **JDK 17** و **Android SDK 35** و **Gradle 8.9**.
3. ينفّذ `gradle assembleDebug` ويرفع ملف **`app-debug.apk`** الجاهز للتحميل من قسم **Artifacts**.

### الطريقة الثانية: البناء محلياً عبر Android Studio أو الطرفية
```bash
# 1. بناء واجهة الويب ونسخها إلى أصول الأندرويد
npm run build
mkdir -p app/src/main/assets/www
cp -r dist/. app/src/main/assets/www/

# 2. إنشاء ملف تصحيح الأخطاء Debug APK
gradle assembleDebug
```
ستجد الملف النهائي في المسار:
```text
app/build/outputs/apk/debug/app-debug.apk
```
أو افتح المجلد في **Android Studio** واضغط `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
