import { LanguageCode } from '../types/vpn';

export interface Translations {
  appName: string;
  appTagline: string;
  connect: string;
  disconnect: string;
  connecting: string;
  connected: string;
  disconnected: string;
  tapToConnect: string;
  remainingTime: string;
  addTime: string;
  upload: string;
  download: string;
  configuration: string;
  server: string;
  noConfigs: string;
  noServers: string;
  
  // ABR Tunnel Configuration
  logTab: string;
  homeTab: string;
  selectPort: string;
  selectServer: string;
  customSetup: string;
  connectionMode: string;
  customSni: string;
  useTcpPayload: string;
  useRealmHost: string;
  preserveSni: string;
  startBtn: string;
  stopBtn: string;
  
  // Drawer & Protocols
  connectionType: string;
  quickConnect: string;
  openvpn: string;
  sshCustom: string;
  sslSshCustom: string;
  sslOvpnCustom: string;
  dnsttCustom: string;
  hysteriaCustom: string;
  v2rayXray: string;
  netVaultTunnel: string;
  
  // Tools
  tools: string;
  shareNet: string;
  logs: string;
  updateConfig: string;
  moreTools: string;
  speedTest: string;
  hostChecker: string;
  sameIpChecker: string;
  payloadGenerator: string;
  deviceFingerprint: string;
  systemDiagnostics: string;
  encoderDecoder: string;
  clearConfig: string;
  
  // Net Vault (خزنة النت الحقيقية واللامحدودة)
  netVaultTitle: string;
  netVaultSubtitle: string;
  vaultBalance: string;
  vaultCapacity: string;
  stashDataBtn: string;
  vaultVpnMode: string;
  vaultVpnDesc: string;
  multiplierSavings: string;
  lifetimeSaved: string;
  cachedWebsites: string;
  stashingInProgress: string;
  stashSuccess: string;
  insufficientVault: string;
  harvestOnWifi: string;
  harvestOnMobile: string;
  stashSourceWifi: string;
  stashSourceMobile: string;
  stashSourceBoth: string;
  unlimitedStorage: string;
  realCacheInspector: string;
  
  // Settings & Help
  settings: string;
  language: string;
  appearance: string;
  darkMode: string;
  themeAccent: string;
  appStyleToggle: string;
  timeReminder: string;
  bgAnimation: string;
  dataWaves: string;
  help: string;
  helpAndSupport: string;
  faq: string;
  privacy: string;
  telegram: string;
  rateUs: string;
  
  // Common Actions
  close: string;
  save: string;
  reset: string;
  format: string;
  clear: string;
  paste: string;
  copy: string;
  copied: string;
  start: string;
  stop: string;
  check: string;
  generatePayload: string;
  browse: string;
  online: string;
}

export const translations: Record<LanguageCode, Translations> = {
  ar: {
    appName: 'Arna tunnel',
    appTagline: 'بروتوكول الأنفاق المتقدم وخزنة الإنترنت اللامحدودة الحقيقية',
    connect: 'اتصال',
    disconnect: 'قطع الاتصال',
    connecting: 'جاري الاتصال...',
    connected: 'متصل بنجاح',
    disconnected: 'غير متصل',
    tapToConnect: 'انقر للاتصال السريع',
    remainingTime: 'الوقت المتبقي',
    addTime: '+ وقت إضافي',
    upload: 'رفع (Upload)',
    download: 'تحميل (Download)',
    configuration: 'ملف التكوين (Config)',
    server: 'السيرفر المختار',
    noConfigs: 'بدون إعدادات مسبقة',
    noServers: 'السيرفر التلقائي',
    
    // ABR Tunnel Settings
    logTab: 'السجل (LOG)',
    homeTab: 'الرئيسية (HOME)',
    selectPort: 'تحديد المنفذ (SELECT PORT)',
    selectServer: 'تحديد السيرفر (SELECT SERVER)',
    customSetup: 'إعداد مخصص (CUSTOM SETUP)',
    connectionMode: 'نمط الاتصال (CONNECTION MODE)',
    customSni: 'الهوست والـ SNI المخصص (CUSTOM SNI)',
    useTcpPayload: 'استخدام بايلود TCP (Use TCP Payload)',
    useRealmHost: 'استخدام هوست Realm (Use Realm Host v2)',
    preserveSni: 'تثبيت وحفظ الـ SNI (Preserve SNI)',
    startBtn: 'ابدأ الاتصال (START)',
    stopBtn: 'إيقاف الاتصال (STOP)',

    connectionType: 'نوع الاتصال والبروتوكول',
    quickConnect: 'نمط Arna tunnel السريع',
    openvpn: 'أوبن في بي إن (OpenVPN)',
    sshCustom: 'نفق SSH مخصص',
    sslSshCustom: 'نفق SSL/TLS SSH',
    sslOvpnCustom: 'نفق SSL/TLS OVPN',
    dnsttCustom: 'نفق DNSTT للـ DNS',
    hysteriaCustom: 'نفق هستيريا (Hysteria UDP)',
    v2rayXray: 'في تو راي (V2Ray / Xray)',
    netVaultTunnel: 'نفق خزنة النت الحقيقية (تخزين غير محدود)',
    
    tools: 'أدوات الشبكة والتشخيص',
    shareNet: 'مشاركة الإنترنت',
    logs: 'سجل الاتصال (Logs)',
    updateConfig: 'تحديث الإعدادات',
    moreTools: 'المزيد من الأدوات',
    speedTest: 'قياس سرعة النت',
    hostChecker: 'فاحص الهوست (Host Checker)',
    sameIpChecker: 'فاحص المواقع على نفس الـ IP',
    payloadGenerator: 'مولد البايلود (Payload Generator)',
    deviceFingerprint: 'بصمة الجهاز ومعلومات الهوية',
    systemDiagnostics: 'تشخيص النظام والموارد',
    encoderDecoder: 'تشفير وفك التشفير (Base64/Hex/URL)',
    clearConfig: 'مسح الإعدادات المخصصة',
    
    netVaultTitle: 'خزنة النت الحقيقية 100% (تخزين غير محدود)',
    netVaultSubtitle: 'خزّن الإنترنت من الواي فاي ومن بيانات الهاتف 4G/5G بدون حدود، وأعد تشغيله كـ VPN أوفلاين حقيقي!',
    vaultBalance: 'الرصيد الحقيقي المخزن في الخزنة',
    vaultCapacity: 'السعة القصوى للخزنة (غير محدودة ∞)',
    stashDataBtn: 'تخزين حزم نت حقيقية الآن',
    vaultVpnMode: 'تشغيل الـ VPN بنظام الخزنة الأوفلاين',
    vaultVpnDesc: 'تصفح المواقع باستخدام الحزم المخزنة محلياً في ذاكرة التخزين الحقيقية مع ضغط 4x وحماية رصيد الشريحة بنسبة 100%.',
    multiplierSavings: 'معدل الضغط والتوفير',
    lifetimeSaved: 'إجمالي الرصيد الحقيقي الموفر',
    cachedWebsites: 'الملفات والمواقع المخزنة أوفلاين فعلياً',
    stashingInProgress: 'جاري استقطاع وضغط وتخزين الحزم الحقيقية في CacheStorage...',
    stashSuccess: 'تم تخزين البيانات بنجاح 100% في الذاكرة المحلية المشفرة!',
    insufficientVault: 'رصيد الخزنة منخفض، يرجى تخزين نت جديد.',
    harvestOnWifi: 'تخزين تلقائي عند الاتصال بالواي فاي (WiFi)',
    harvestOnMobile: 'تخزين من بيانات الهاتف الخلوي (4G/5G)',
    stashSourceWifi: 'شبكة الواي فاي فقط',
    stashSourceMobile: 'بيانات الهاتف (الشريحة)',
    stashSourceBoth: 'تخزين مزدوج ذكي (كلاهما)',
    unlimitedStorage: 'سعة تخزين غير محدودة (Unlimited Storage ∞)',
    realCacheInspector: 'فاحص الحزم الحقيقية المخزنة على الذاكرة',
    
    settings: 'الإعدادات واللغة',
    language: 'لغة التطبيق (Language)',
    appearance: 'المظهر والسمة',
    darkMode: 'الوضع الليلي (Dark Cyber)',
    themeAccent: 'ثيم ولون التطبيق',
    appStyleToggle: 'نمط واجهة Arna tunnel العصري',
    timeReminder: 'تنبيه انتهاء الوقت',
    bgAnimation: 'حركة خلفية الشبكة',
    dataWaves: 'أمواج حركة البيانات',
    help: 'مساعدة',
    helpAndSupport: 'المساعدة ودليل الاستخدام',
    faq: 'الأسئلة الشائعة وحل المشاكل',
    privacy: 'سياسة الخصوصية والأمان',
    telegram: 'قناة التيليجرام',
    rateUs: 'تقييم التطبيق',
    
    close: 'إغلاق',
    save: 'حفظ',
    reset: 'إعادة ضبط',
    format: 'تنسيق',
    clear: 'مسح',
    paste: 'لصق',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    start: 'بدء الفحص',
    stop: 'إيقاف',
    check: 'فحص',
    generatePayload: 'توليد البايلود',
    browse: 'استعراض',
    online: 'أونلاين',
  },
  en: {
    appName: 'Arna tunnel',
    appTagline: 'Advanced Tunneling Client & 100% Real Unlimited Net Vault',
    connect: 'CONNECT',
    disconnect: 'DISCONNECT',
    connecting: 'CONNECTING...',
    connected: 'CONNECTED',
    disconnected: 'DISCONNECTED',
    tapToConnect: 'TAP TO CONNECT',
    remainingTime: 'REMAINING TIME',
    addTime: '+ TIME',
    upload: 'UPLOAD',
    download: 'DOWNLOAD',
    configuration: 'CONFIGURATION',
    server: 'SERVER',
    noConfigs: 'No configs',
    noServers: 'Auto Best Server',
    
    // ABR Tunnel Mode
    logTab: 'LOG',
    homeTab: 'HOME',
    selectPort: 'SELECT PORT',
    selectServer: 'SELECT SERVER',
    customSetup: 'CUSTOM SETUP',
    connectionMode: 'CONNECTION MODE',
    customSni: 'CUSTOM SNI',
    useTcpPayload: 'Use TCP Payload',
    useRealmHost: 'Use Realm Host (v2)',
    preserveSni: 'Preserve SNI',
    startBtn: 'START',
    stopBtn: 'STOP',

    connectionType: 'CONNECTION TYPE',
    quickConnect: 'Arna Turbo Tunnel Mode',
    openvpn: 'OpenVPN Custom',
    sshCustom: 'SSH Custom',
    sslSshCustom: 'SSL/TLS SSH Custom',
    sslOvpnCustom: 'SSL/TLS OVPN Custom',
    dnsttCustom: 'DNSTT Custom',
    hysteriaCustom: 'Hysteria Custom',
    v2rayXray: 'V2Ray / Xray Custom',
    netVaultTunnel: 'Real Net Vault Tunnel (Unlimited)',
    
    tools: 'TOOLS',
    shareNet: 'Share Net',
    logs: 'Connection Logs',
    updateConfig: 'Update Config',
    moreTools: 'More Tools',
    speedTest: 'Speed Test',
    hostChecker: 'Host Checker',
    sameIpChecker: 'Same IP Checker',
    payloadGenerator: 'Payload Generator',
    deviceFingerprint: 'Device Fingerprint',
    systemDiagnostics: 'System Diagnostics',
    encoderDecoder: 'Encoder / Decoder',
    clearConfig: 'Clear Custom Config',
    
    netVaultTitle: '100% Real Unlimited Net Vault',
    netVaultSubtitle: 'Bank real internet data from WiFi AND Mobile 4G/5G without limits, and replay as a zero-quota offline VPN!',
    vaultBalance: 'Real Banked Internet Balance',
    vaultCapacity: 'Storage Capacity (Unlimited ∞)',
    stashDataBtn: 'Stash Real Data Packets Now',
    vaultVpnMode: 'Route VPN via Banked Net',
    vaultVpnDesc: 'Serves traffic from local real CacheStorage with 4x data compression, protecting your carrier balance 100%.',
    multiplierSavings: 'Compression Multiplier',
    lifetimeSaved: 'Lifetime Data Saved',
    cachedWebsites: 'Actually Stored Real Offline Resources',
    stashingInProgress: 'Harvesting & caching packet tokens into CacheStorage...',
    stashSuccess: 'Internet quota successfully banked 100% in encrypted vault!',
    insufficientVault: 'Vault quota low, please stash more data.',
    harvestOnWifi: 'Auto-stash on unmetered WiFi',
    harvestOnMobile: 'Stash via Mobile Data (4G/5G)',
    stashSourceWifi: 'WiFi Only',
    stashSourceMobile: 'Mobile Data Only',
    stashSourceBoth: 'Dual Smart Source (Both)',
    unlimitedStorage: 'Unlimited Storage Capacity (∞)',
    realCacheInspector: 'Real Cached Resources Inspector',
    
    settings: 'SETTINGS',
    language: 'Language',
    appearance: 'APPEARANCE',
    darkMode: 'Dark Mode',
    themeAccent: 'App Theme & Accent Color',
    appStyleToggle: 'Arna Modern Interface Style',
    timeReminder: 'Time Reminder',
    bgAnimation: 'Background Animation',
    dataWaves: 'Data Waves',
    help: 'HELP',
    helpAndSupport: 'Help & Knowledge Base',
    faq: 'FAQ & Troubleshooting',
    privacy: 'Privacy & Security',
    telegram: 'Telegram Community',
    rateUs: 'Rate Us',
    
    close: 'CLOSE',
    save: 'SAVE',
    reset: 'RESET',
    format: 'Format',
    clear: 'Clear',
    paste: 'Paste',
    copy: 'Copy',
    copied: 'Copied!',
    start: 'START TEST',
    stop: 'STOP',
    check: 'CHECK',
    generatePayload: 'GENERATE PAYLOAD',
    browse: 'Browse',
    online: 'Online',
  },
  fr: {
    appName: 'Arna tunnel',
    appTagline: 'Tunneling Réseau Avancé & Coffre de Données Réel 100%',
    connect: 'CONNEXION',
    disconnect: 'DÉCONNECTER',
    connecting: 'CONNEXION EN COURS...',
    connected: 'CONNECTÉ',
    disconnected: 'DÉCONNECTÉ',
    tapToConnect: 'APPUYER POUR CONNECTER',
    remainingTime: 'TEMPS RESTANT',
    addTime: '+ TEMPS',
    upload: 'ENVOI',
    download: 'TÉLÉCHARGEMENT',
    configuration: 'CONFIGURATION',
    server: 'SERVEUR',
    noConfigs: 'Aucune config',
    noServers: 'Serveur automatique',
    
    logTab: 'JOURNAL',
    homeTab: 'ACCUEIL',
    selectPort: 'SÉLECTIONNER PORT',
    selectServer: 'SÉLECTIONNER SERVEUR',
    customSetup: 'CONFIGURATION PERSO',
    connectionMode: 'MODE DE CONNEXION',
    customSni: 'SNI PERSONNALISÉ',
    useTcpPayload: 'Utiliser Payload TCP',
    useRealmHost: 'Utiliser Realm Host (v2)',
    preserveSni: 'Préserver SNI',
    startBtn: 'DÉMARRER',
    stopBtn: 'ARRÊTER',

    connectionType: 'TYPE DE CONNEXION',
    quickConnect: 'Mode Arna Tunnel Turbo',
    openvpn: 'OpenVPN Personnalisé',
    sshCustom: 'SSH Personnalisé',
    sslSshCustom: 'SSL/TLS SSH Personnalisé',
    sslOvpnCustom: 'SSL/TLS OVPN Personnalisé',
    dnsttCustom: 'DNSTT DNS Personnalisé',
    hysteriaCustom: 'Hysteria UDP Personnalisé',
    v2rayXray: 'V2Ray / Xray Personnalisé',
    netVaultTunnel: 'Tunnel Coffre Internet Réel',
    
    tools: 'OUTILS',
    shareNet: 'Partager le Réseau',
    logs: 'Journaux de Connexion',
    updateConfig: 'Mettre à Jour la Config',
    moreTools: 'Plus d\'Outils',
    speedTest: 'Test de Vitesse',
    hostChecker: 'Vérificateur d\'Hôte',
    sameIpChecker: 'Vérificateur Même IP',
    payloadGenerator: 'Générateur de Payload',
    deviceFingerprint: 'Empreinte de l\'Appareil',
    systemDiagnostics: 'Diagnostics Système',
    encoderDecoder: 'Encodeur / Décodeur',
    clearConfig: 'Effacer la Config',
    
    netVaultTitle: 'Coffre-Fort Internet Réel 100% Illimité',
    netVaultSubtitle: 'Stockez des données Internet réelles sur WiFi et données mobiles 4G/5G sans limite!',
    vaultBalance: 'Solde Internet Réel Stocké',
    vaultCapacity: 'Capacité Illimitée (∞)',
    stashDataBtn: 'Stocker des Données Réelles',
    vaultVpnMode: 'Activer le VPN via Données Stockées',
    vaultVpnDesc: 'Achemine le trafic via des paquets réels avec compression 4x pour économiser le forfait.',
    multiplierSavings: 'Multiplicateur de Compression',
    lifetimeSaved: 'Total Économisé à Vie',
    cachedWebsites: 'Ressources Réelles en Cache',
    stashingInProgress: 'Stockage réel en cours dans CacheStorage...',
    stashSuccess: 'Données stockées à 100% dans le coffre chiffré!',
    insufficientVault: 'Solde du coffre insuffisant.',
    harvestOnWifi: 'Stockage auto sur WiFi',
    harvestOnMobile: 'Stockage sur Données Mobiles (4G/5G)',
    stashSourceWifi: 'WiFi Uniquement',
    stashSourceMobile: 'Données Mobiles Uniquement',
    stashSourceBoth: 'Double Source Intelligente',
    unlimitedStorage: 'Stockage Illimité (∞)',
    realCacheInspector: 'Inspecteur de Cache Réel',
    
    settings: 'PARAMÈTRES',
    language: 'Langue',
    appearance: 'APPARENCE',
    darkMode: 'Mode Sombre',
    themeAccent: 'Thème de l\'application',
    appStyleToggle: 'Style de l\'Interface Arna',
    timeReminder: 'Rappel de Temps',
    bgAnimation: 'Animation de Fond',
    dataWaves: 'Ondes de Données',
    help: 'AIDE',
    helpAndSupport: 'Aide & Documentation',
    faq: 'FAQ & Dépannage',
    privacy: 'Confidentialité',
    telegram: 'Canal Telegram',
    rateUs: 'Évaluer l\'Application',
    
    close: 'FERMER',
    save: 'ENREGISTRER',
    reset: 'RÉINITIALISER',
    format: 'Formater',
    clear: 'Effacer',
    paste: 'Coller',
    copy: 'Copier',
    copied: 'Copié!',
    start: 'LANCER LE TEST',
    stop: 'ARRÊTER',
    check: 'VÉRIFIER',
    generatePayload: 'GÉNÉRER PAYLOAD',
    browse: 'Parcourir',
    online: 'En ligne',
  },
  es: {
    appName: 'Arna tunnel',
    appTagline: 'Túnel Avanzado y Bóveda Real 100% Ilimitada',
    connect: 'CONECTAR',
    disconnect: 'DESCONECTAR',
    connecting: 'CONECTANDO...',
    connected: 'CONECTADO',
    disconnected: 'DESCONECTADO',
    tapToConnect: 'TOCA PARA CONECTAR',
    remainingTime: 'TIEMPO RESTANTE',
    addTime: '+ TIEMPO',
    upload: 'SUBIDA',
    download: 'DESCARGA',
    configuration: 'CONFIGURACIÓN',
    server: 'SERVIDOR',
    noConfigs: 'Sin configuraciones',
    noServers: 'Servidor Óptimo Automático',
    
    logTab: 'REGISTRO',
    homeTab: 'INICIO',
    selectPort: 'SELECCIONAR PUERTO',
    selectServer: 'SELECCIONAR SERVIDOR',
    customSetup: 'CONFIGURACIÓN PERSONALIZADA',
    connectionMode: 'MODO DE CONEXIÓN',
    customSni: 'SNI PERSONALIZADO',
    useTcpPayload: 'Usar Payload TCP',
    useRealmHost: 'Usar Realm Host (v2)',
    preserveSni: 'Preservar SNI',
    startBtn: 'INICIAR',
    stopBtn: 'DETENER',

    connectionType: 'TIPO DE CONEXIÓN',
    quickConnect: 'Modo Arna Tunnel Turbo',
    openvpn: 'OpenVPN Personalizado',
    sshCustom: 'SSH Personalizado',
    sslSshCustom: 'SSL/TLS SSH Personalizado',
    sslOvpnCustom: 'SSL/TLS OVPN Personalizado',
    dnsttCustom: 'DNSTT DNS Personalizado',
    hysteriaCustom: 'Hysteria UDP Personalizado',
    v2rayXray: 'V2Ray / Xray Personalizado',
    netVaultTunnel: 'Túnel Bóveda Real Ilimitada',
    
    tools: 'HERRAMIENTAS',
    shareNet: 'Compartir Red',
    logs: 'Registros de Conexión',
    updateConfig: 'Actualizar Configuración',
    moreTools: 'Más Herramientas',
    speedTest: 'Test de Velocidad',
    hostChecker: 'Verificador de Host',
    sameIpChecker: 'Verificador de Misma IP',
    payloadGenerator: 'Generador de Payload',
    deviceFingerprint: 'Huella del Dispositivo',
    systemDiagnostics: 'Diagnóstico del Sistema',
    encoderDecoder: 'Codificador / Decodificador',
    clearConfig: 'Borrar Configuración',
    
    netVaultTitle: 'Bóveda Real 100% de Internet Ilimitado',
    netVaultSubtitle: '¡Guarda datos reales desde WiFi y Datos Móviles 4G/5G sin límite!',
    vaultBalance: 'Saldo Real Almacenado',
    vaultCapacity: 'Capacidad Ilimitada (∞)',
    stashDataBtn: 'Almacenar Paquetes Reales Ahora',
    vaultVpnMode: 'Enrutar VPN vía Datos Almacenados',
    vaultVpnDesc: 'Enruta el tráfico con compresión 4x protegiendo el saldo móvil al 100%.',
    multiplierSavings: 'Multiplicador de Ahorro',
    lifetimeSaved: 'Total de Datos Ahorrados',
    cachedWebsites: 'Recursos Reales Almacenados',
    stashingInProgress: 'Guardando paquetes reales en CacheStorage...',
    stashSuccess: '¡Datos guardados con éxito al 100% en la bóveda!',
    insufficientVault: 'Saldo insuficiente en la bóveda.',
    harvestOnWifi: 'Almacenamiento auto en WiFi',
    harvestOnMobile: 'Almacenar en Datos Móviles (4G/5G)',
    stashSourceWifi: 'Solo WiFi',
    stashSourceMobile: 'Solo Datos Móviles',
    stashSourceBoth: 'Fuente Inteligente Dual',
    unlimitedStorage: 'Almacenamiento Ilimitado (∞)',
    realCacheInspector: 'Inspector de Caché Real',
    
    settings: 'AJUSTES',
    language: 'Idioma',
    appearance: 'APARIENCIA',
    darkMode: 'Modo Oscuro',
    themeAccent: 'Tema de la Aplicación',
    appStyleToggle: 'Estilo de Interfaz Arna',
    timeReminder: 'Recordatorio de Tiempo',
    bgAnimation: 'Animación de Fondo',
    dataWaves: 'Ondas de Datos',
    help: 'AYUDA',
    helpAndSupport: 'Ayuda y Soporte',
    faq: 'Preguntas Frecuentes',
    privacy: 'Privacidad y Seguridad',
    telegram: 'Comunidad en Telegram',
    rateUs: 'Calificar Aplicación',
    
    close: 'CERRAR',
    save: 'GUARDAR',
    reset: 'REINICIAR',
    format: 'Formatear',
    clear: 'Limpiar',
    paste: 'Pegar',
    copy: 'Copiar',
    copied: '¡Copiado!',
    start: 'INICIAR TEST',
    stop: 'DETENER',
    check: 'VERIFICAR',
    generatePayload: 'GENERAR PAYLOAD',
    browse: 'Examinar',
    online: 'En línea',
  }
};
