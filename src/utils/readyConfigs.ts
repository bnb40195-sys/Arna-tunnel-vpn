import { ExportableConfigFile, LanguageCode } from '../types/vpn';

const nowIso = '2026-11-18T00:00:00.000Z';

interface PresetMeta {
  flag: string;
  isoCode: string;
  countryAr: string;
  countryEn: string;
  shortTitle: string;
}

const makeCfg = (
  name: string,
  description: string,
  sniHost: string,
  port: number,
  server: string,
  category: 'arab' | 'wifi' | 'social',
  meta: PresetMeta,
  protocol: ExportableConfigFile['protocol'] = 'custom_sni',
  notes = 'جاهز للاتصال الفوري على Arna tunnel',
  isLocked = false
): ExportableConfigFile => ({
  version: '2.0',
  app: 'Arna tunnel',
  name,
  author: 'Arna VIP Team',
  description,
  createdAt: nowIso,
  expiresAt: 'never',
  protocol,
  server,
  port,
  sniHost,
  payloadText:
    port === 80
      ? `GET http://${sniHost}/ HTTP/1.1[crlf]Host: ${sniHost}[crlf]X-Online-Host: ${sniHost}[crlf]Connection: Keep-Alive[crlf][crlf]`
      : `CONNECT [host_port] HTTP/1.1[crlf]Host: ${sniHost}[crlf]X-Online-Host: ${sniHost}[crlf]Connection: Keep-Alive[crlf][crlf]`,
  notes,
  isLocked,
  lockHwid: '',
  blockRoot: false,
  passwordProtected: false,
  category,
  flag: meta.flag,
  isoCode: meta.isoCode,
  countryAr: meta.countryAr,
  countryEn: meta.countryEn,
  shortTitle: meta.shortTitle,
});

export const READY_MADE_CONFIGS: ExportableConfigFile[] = [
  // ================= ALGERIA (DZA) =================
  makeCfg(
    '🇩🇿 الجزائر: أوريدو مجاني (OOREDOO Free)',
    'كونفيج أوريدو الجزائر المجاني لبعض المناطق وبوابة Ooredoo',
    'free.ooredoo.dz',
    443,
    '185.193.125.4',
    'arab',
    { flag: '🇩🇿', isoCode: 'DZA', countryAr: 'الجزائر', countryEn: 'Algeria', shortTitle: 'OOREDOO Free (Some Areas)' }
  ),
  makeCfg(
    '🇩🇿 الجزائر: أوريدو غير محدود (Ooredoo Unlimited)',
    'كونفيج أوريدو الجزائر بلا حدود بسرعة عالية للستريمنج والتصفح',
    'services.ooredoo.dz',
    443,
    '185.193.125.8',
    'arab',
    { flag: '🇩🇿', isoCode: 'DZA', countryAr: 'الجزائر', countryEn: 'Algeria', shortTitle: 'Ooredoo Unlimited' }
  ),
  makeCfg(
    '🇩🇿 الجزائر: موبيليس PixX السريع',
    'كونفيج مخصص لشبكة موبيليس الجزائر عبر ثغرة MMS وبورت 443',
    'mms.mobilis.dz',
    443,
    '51.15.22.84',
    'arab',
    { flag: '🇩🇿', isoCode: 'DZA', countryAr: 'الجزائر', countryEn: 'Algeria', shortTitle: 'MOBILIS PixX Free' },
    'custom_sni',
    'يعمل حتى مع نفاذ الرصيد الأساسي للشريحة',
    true
  ),
  makeCfg(
    '🇩🇿 الجزائر: جازي Djezzy Speed',
    'تخطي حجب شبكة جازي الجزائر عبر بوابة Djezzy وبورت 8080',
    'internet.djezzy.dz',
    8080,
    '149.202.88.19',
    'arab',
    { flag: '🇩🇿', isoCode: 'DZA', countryAr: 'الجزائر', countryEn: 'Algeria', shortTitle: 'DJEZZY Speed Unlimited' },
    'custom_sni',
    'يفضل تفعيل وضع الطيران ثم إيقافه قبل الاتصال',
    true
  ),

  // ================= EGYPT (EGY) =================
  makeCfg(
    '🇪🇬 مصر: اتصالات كونكت 20 غير محدود',
    'كونفيج باقة Connect 20 Unlimited في مصر بسرعة فائقة',
    'www.etisalat.eg',
    443,
    '197.50.112.20',
    'arab',
    { flag: '🇪🇬', isoCode: 'EGY', countryAr: 'مصر', countryEn: 'Egypt', shortTitle: 'ETISALAT CONNECT20 + UNLIMITED' }
  ),
  makeCfg(
    '🇪🇬 مصر: اتصالات مجاني (Etisalat Free)',
    'اتصال مجاني على خط اتصالات مصر وتخطي فحص الباقات',
    'free.etisalat.eg',
    80,
    '197.50.112.25',
    'arab',
    { flag: '🇪🇬', isoCode: 'EGY', countryAr: 'مصر', countryEn: 'Egypt', shortTitle: 'ETISALAT FREE' }
  ),
  makeCfg(
    '🇪🇬 مصر: وي وفودافون بلا حدود (WE / Vodafone)',
    'كونفيج WE & Etisalat Unlimited لمصر بثبات عالٍ',
    'web.vodafone.com.eg',
    443,
    '197.50.112.40',
    'arab',
    { flag: '🇪🇬', isoCode: 'EGY', countryAr: 'مصر', countryEn: 'Egypt', shortTitle: 'ETISALAT WE UNLIMITED' }
  ),
  makeCfg(
    '🇪🇬 مصر: أورنج مصر (Orange EG)',
    'كونفيج مصري مستقر للمكالمات والألعاب عبر بورت 8080',
    'www.orange.eg',
    8080,
    '197.50.112.88',
    'arab',
    { flag: '🇪🇬', isoCode: 'EGY', countryAr: 'مصر', countryEn: 'Egypt', shortTitle: 'ORANGE EG Free' }
  ),

  // ================= OTHER ARAB COUNTRIES =================
  makeCfg(
    '🇲🇦 المغرب: اتصالات المغرب و إنوي (*6)',
    'كونفيج المغرب لتشغيل باقات النجمة 6 والإنترنت المفتوح',
    'www.inwi.ma',
    443,
    '51.91.102.18',
    'arab',
    { flag: '🇲🇦', isoCode: 'MAR', countryAr: 'المغرب', countryEn: 'Morocco', shortTitle: 'INWI *6 + IAM Unlimited' }
  ),
  makeCfg(
    '🇲🇦 المغرب: أورنج المغرب (Orange MA)',
    'تخطي باقة Orange Maroc بسرعة مستقرة بدون تقطيع',
    'internet.orange.ma',
    80,
    '51.91.102.22',
    'arab',
    { flag: '🇲🇦', isoCode: 'MAR', countryAr: 'المغرب', countryEn: 'Morocco', shortTitle: 'ORANGE MA Zero Free' }
  ),
  makeCfg(
    '🇹🇳 تونس: اتصالات تونس و أوريدو (TT / Ooredoo TN)',
    'نفق مشفر لتخطي القيود على شبكات تونس عبر بورت 443',
    'www.ooredoo.tn',
    443,
    '193.95.66.10',
    'arab',
    { flag: '🇹🇳', isoCode: 'TUN', countryAr: 'تونس', countryEn: 'Tunisia', shortTitle: 'OOREDOO TN + TT Unlimited' }
  ),
  makeCfg(
    '🇸🇦 السعودية: إس تي سي وموبايلي وزين (STC / Mobily)',
    'توجيه سريع للسيرفرات السعودية مع حماية كاملة وبنغ منخفض',
    'www.stc.com.sa',
    443,
    '178.62.204.11',
    'arab',
    { flag: '🇸🇦', isoCode: 'SAU', countryAr: 'السعودية', countryEn: 'Saudi Arabia', shortTitle: 'STC / Mobily Free Turbo' }
  ),
  makeCfg(
    '🇦🇪 الإمارات: اتصالات ودو (Etisalat / du)',
    'كونفيج بوابة الخليج دبي لتشغيل المكالمات المشفرة والويب',
    'www.etisalat.ae',
    443,
    '185.193.64.9',
    'arab',
    { flag: '🇦🇪', isoCode: 'ARE', countryAr: 'الإمارات', countryEn: 'United Arab Emirates', shortTitle: 'ETISALAT / DU Gulf Unlimited' }
  ),
  makeCfg(
    '🇮🇶 العراق: زين العراق وآسياسيل وكورك',
    'كونفيج شبكات العراق (Zain IQ / Asiacell / Korek) بثبات عالٍ',
    'www.asiacell.com',
    443,
    '185.220.101.45',
    'arab',
    { flag: '🇮🇶', isoCode: 'IRQ', countryAr: 'العراق', countryEn: 'Iraq', shortTitle: 'ASIACELL / ZAIN IQ Free' }
  ),
  makeCfg(
    '🇯🇴 الأردن: زين وأورنج وأمنية (Zain JO / Orange)',
    'اتصال مشفر وسريع لشبكات الأردن وبورت 443',
    'www.jo.zain.com',
    443,
    '185.220.101.60',
    'arab',
    { flag: '🇯🇴', isoCode: 'JOR', countryAr: 'الأردن', countryEn: 'Jordan', shortTitle: 'ZAIN JO / ORANGE Unlimited' }
  ),
  makeCfg(
    '🇰🇼 الكويت: زين وأوريدو الكويت (Zain KW)',
    'بوابة سريعة لشبكات الكويت لتجاوز فحص الباقات',
    'www.kw.zain.com',
    443,
    '185.193.64.15',
    'arab',
    { flag: '🇰🇼', isoCode: 'KWT', countryAr: 'الكويت', countryEn: 'Kuwait', shortTitle: 'ZAIN KW / OOREDOO Speed' }
  ),
  makeCfg(
    '🇶🇦 قطر: أوريدو وفودافون قطر (Ooredoo QA)',
    'توجيه TLS سريع لشبكات دولة قطر والمكالمات الآمنة',
    'www.ooredoo.qa',
    443,
    '185.193.64.22',
    'arab',
    { flag: '🇶🇦', isoCode: 'QAT', countryAr: 'قطر', countryEn: 'Qatar', shortTitle: 'OOREDOO QA Direct' }
  ),
  makeCfg(
    '🇴🇲 سلطنة عُمان: عمانتل وأوريدو عُمان',
    'كونفيج عُمان للاتصال المشفر وتخطي قيود التطبيقات',
    'www.omantel.om',
    443,
    '185.193.64.30',
    'arab',
    { flag: '🇴🇲', isoCode: 'OMN', countryAr: 'عُمان', countryEn: 'Oman', shortTitle: 'OMANTEL / OOREDOO Bypass' }
  ),
  makeCfg(
    '🇧🇭 البحرين: بتلكو وزين البحرين (Batelco / Zain)',
    'نفق سريع لمملكة البحرين بضغط بيانات عالٍ',
    'www.batelco.com',
    443,
    '185.193.64.44',
    'arab',
    { flag: '🇧🇭', isoCode: 'BHR', countryAr: 'البحرين', countryEn: 'Bahrain', shortTitle: 'BATELCO / ZAIN BH Fast' }
  ),
  makeCfg(
    '🇱🇧 لبنان: ألفا وتاتش (Alfa / Touch)',
    'تخطي قيود الشبكة في لبنان عبر هوست ألفا وبورت 443',
    'www.alfa.com.lb',
    443,
    '194.36.144.12',
    'arab',
    { flag: '🇱🇧', isoCode: 'LBN', countryAr: 'لبنان', countryEn: 'Lebanon', shortTitle: 'ALFA / TOUCH LB Free' }
  ),
  makeCfg(
    '🇸🇾 سوريا: سيريتل وإم تي إن (Syriatel / MTN SY)',
    'كونفيج لتسريع التصفح وتجاوز الحجب في شبكات سوريا',
    'www.syriatel.sy',
    443,
    '194.36.144.33',
    'arab',
    { flag: '🇸🇾', isoCode: 'SYR', countryAr: 'سوريا', countryEn: 'Syria', shortTitle: 'SYRIATEL / MTN Bypass' }
  ),
  makeCfg(
    '🇵🇸 فلسطين: جوال وأوريدو فلسطين (Jawwal)',
    'نفق مستقر لشبكات فلسطين عبر بورت 443 وبروتوكول SNI',
    'www.jawwal.ps',
    443,
    '194.36.144.50',
    'arab',
    { flag: '🇵🇸', isoCode: 'PSE', countryAr: 'فلسطين', countryEn: 'Palestine', shortTitle: 'JAWWAL / OOREDOO PS' }
  ),
  makeCfg(
    '🇾🇪 اليمن: يمن موبايل وسبأفون (Yemen Mobile)',
    'كونفيج مخصص لتشغيل باقات واتساب والسوشيال في اليمن',
    'www.yemenmobile.com.ye',
    80,
    '178.62.204.77',
    'arab',
    { flag: '🇾🇪', isoCode: 'YEM', countryAr: 'اليمن', countryEn: 'Yemen', shortTitle: 'YEMEN MOBILE Free' }
  ),
  makeCfg(
    '🇱🇾 ليبيا: ليبيانا والمدار (Libyana / Almadar)',
    'تجاوز قيود 4G في ليبيا مع ثبات عالٍ لليوتيوب والألعاب',
    'www.libyana.ly',
    443,
    '51.38.120.88',
    'arab',
    { flag: '🇱🇾', isoCode: 'LBY', countryAr: 'ليبيا', countryEn: 'Libya', shortTitle: 'LIBYANA / ALMADAR 4G' }
  ),
  makeCfg(
    '🇸🇩 السودان: زين وسوداني (Zain SD / Sudani)',
    'نفق مشفر وخفيف للعمل على شبكات السودان الضعيفة',
    'www.sd.zain.com',
    8080,
    '51.89.155.67',
    'arab',
    { flag: '🇸🇩', isoCode: 'SDN', countryAr: 'السودان', countryEn: 'Sudan', shortTitle: 'ZAIN SD / SUDANI Fast' }
  ),
  makeCfg(
    '🇲🇷 موريتانيا: ماتال وموريتل (Mattel / Mauritel)',
    'كونفيج شبكات موريتانيا لتشغيل التطبيقات بدون انقطاع',
    'www.mauritel.mr',
    443,
    '51.38.120.99',
    'arab',
    { flag: '🇲🇷', isoCode: 'MRT', countryAr: 'موريتانيا', countryEn: 'Mauritania', shortTitle: 'MAURITEL / MATTEL MR' }
  ),
  makeCfg(
    '🇸🇴 الصومال وجيبوتي وجزر القمر',
    'كونفيج موحد لشرق إفريقيا العربية بسرعات عالية',
    'www.hormuud.com',
    443,
    '139.180.201.89',
    'arab',
    { flag: '🇸🇴', isoCode: 'SOM', countryAr: 'الصومال / جيبوتي / القمر', countryEn: 'Somalia / Djibouti / Comoros', shortTitle: 'HORMUUD / DJIBOUTI Tel' }
  ),

  // ================= WIFI CONFIGS =================
  makeCfg(
    '📶 واي فاي فايبر توربو (WiFi Fiber Turbo)',
    'أقصى سرعة للواي فاي المنزلي والألياف البصرية مع تشفير كامل',
    'www.cloudflare.com',
    443,
    '172.67.140.22',
    'wifi',
    { flag: '📶', isoCode: 'WFI', countryAr: 'واي فاي فايبر', countryEn: 'WiFi Fiber', shortTitle: 'WiFi Fiber Turbo 443' },
    'v2ray',
    'مثالي لتحميل الملفات الكبيرة ومشاهدة 4K على الواي فاي'
  ),
  makeCfg(
    '☕ واي فاي الشبكات العامة والكافيهات (DNS Bypass)',
    'تجاوز حجب شبكات الفنادق والجامعات والكافيهات عبر منفذ 53',
    'dns.google',
    53,
    '8.8.8.8',
    'wifi',
    { flag: '☕', isoCode: 'WFI', countryAr: 'واي فاي عام', countryEn: 'Public WiFi', shortTitle: 'WiFi Public DNS Bypass' },
    'dnstt',
    'يفتح الإنترنت حتى عند تقييد البروتوكولات على الواي فاي العام'
  ),
  makeCfg(
    '🔓 تخطي صفحة دخول الواي فاي (Captive Portal Free)',
    'الاتصال بشبكات الواي فاي المقيدة بصفحة تسجيل الدخول عبر بورت 80',
    'connectivitycheck.gstatic.com',
    80,
    '198.27.100.45',
    'wifi',
    { flag: '🔓', isoCode: 'WFI', countryAr: 'واي فاي مقيد', countryEn: 'WiFi Captive', shortTitle: 'WiFi Captive Portal Free' },
    'custom_sni',
    'يعبر بوابة التحقق المفتوحة في شبكات الواي فاي'
  ),
  makeCfg(
    '🎮 واي فاي الألعاب وتقليل البنغ (WiFi Gaming QUIC)',
    'توجيه حزم UDP/QUIC للألعاب والمكالمات على شبكة الواي فاي',
    'cdn.discordapp.com',
    8443,
    '51.38.120.88',
    'wifi',
    { flag: '🎮', isoCode: 'WFI', countryAr: 'واي فاي ألعاب', countryEn: 'WiFi Gaming', shortTitle: 'WiFi Gaming Low-Ping' },
    'hysteria',
    'بنغ مستقر ومثالي للألعاب أونلاين على الواي فاي'
  ),

  // ================= SOCIAL MEDIA CONFIGS =================
  makeCfg(
    '👻 سناب شات غير محدود (Snapchat SSL)',
    'كونفيج سناب شات SSL مباشر لتحويل باقة سناب إلى نت مفتوح',
    'www.snapchat.com',
    80,
    '104.26.4.19',
    'social',
    { flag: '👻', isoCode: 'SOC', countryAr: 'التواصل الاجتماعي', countryEn: 'Social Media', shortTitle: 'SNAPCHAT Unlimited SSL' }
  ),
  makeCfg(
    '📘 فيسبوك فري زيرو (Facebook Free Zero)',
    'تشغيل الإنترنت الكامل عبر هوست فيسبوك المجاني بدون رصيد',
    'free.facebook.com',
    80,
    '157.240.22.35',
    'social',
    { flag: '📘', isoCode: 'SOC', countryAr: 'التواصل الاجتماعي', countryEn: 'Social Media', shortTitle: 'FACEBOOK Free Zero' }
  ),
  makeCfg(
    '🎵 تيك توك تيربو (TikTok CDN Fast)',
    'تجاوز باقة تيك توك بسرعة عالية وبث مستقر بدون تقطيع',
    'v16m.tiktokcdn.com',
    443,
    '104.26.4.19',
    'social',
    { flag: '🎵', isoCode: 'SOC', countryAr: 'التواصل الاجتماعي', countryEn: 'Social Media', shortTitle: 'TIKTOK CDN Fast' }
  ),
  makeCfg(
    '✈️ تيليجرام ويب والمكالمات (Telegram Direct)',
    'فتح باقات تيليجرام وتشغيل كل التطبيقات عبر TLS SNI',
    'web.telegram.org',
    443,
    '149.154.167.99',
    'social',
    { flag: '✈️', isoCode: 'SOC', countryAr: 'التواصل الاجتماعي', countryEn: 'Social Media', shortTitle: 'TELEGRAM Web & VoIP' }
  ),
  makeCfg(
    '📸 إنستغرام ريلز كلاود (Instagram Graph Cloud)',
    'تحويل باقة إنستغرام لتصفح شامل وسريع لجميع المواقع',
    'graph.instagram.com',
    443,
    '157.240.22.174',
    'social',
    { flag: '📸', isoCode: 'SOC', countryAr: 'التواصل الاجتماعي', countryEn: 'Social Media', shortTitle: 'INSTAGRAM Reels Unlimited' }
  ),
  makeCfg(
    '💬 واتساب والمكالمات الصوتية (WhatsApp Relay)',
    'استغلال باقة واتساب للاتصال الكامل وفتح المكالمات المحجوبة',
    'web.whatsapp.com',
    443,
    '157.240.22.60',
    'social',
    { flag: '💬', isoCode: 'SOC', countryAr: 'التواصل الاجتماعي', countryEn: 'Social Media', shortTitle: 'WHATSAPP Relay & Calls' }
  ),
  makeCfg(
    '▶️ يوتيوب بث فائق (YouTube Direct Ultra)',
    'تجاوز قيود باقات اليوتيوب لتشغيل الإنترنت بلا حدود',
    'm.youtube.com',
    443,
    '172.217.16.142',
    'social',
    { flag: '▶️', isoCode: 'SOC', countryAr: 'التواصل الاجتماعي', countryEn: 'Social Media', shortTitle: 'YOUTUBE Direct Ultra' }
  ),
  makeCfg(
    '𝕏 منصة إكس / تويتر (X Twitter Bypass)',
    'توجيه سريع لباقات منصة X عبر بورت 443 وتجاوز DPI',
    'api.twitter.com',
    443,
    '104.244.42.66',
    'social',
    { flag: '𝕏', isoCode: 'SOC', countryAr: 'التواصل الاجتماعي', countryEn: 'Social Media', shortTitle: 'X Twitter Bypass' }
  ),
];

export const getLocalizedPresetDisplay = (cfg: ExportableConfigFile, lang: LanguageCode) => {
  if (lang === 'ar') return { name: cfg.name, description: cfg.description };
  const map: Record<string, { name: string; description: string }> = {
    'free.ooredoo.dz': { name: '🇩🇿 Algeria: OOREDOO Free (Some Areas)', description: 'Free Ooredoo Algeria gateway for supported areas' },
    'services.ooredoo.dz': { name: '🇩🇿 Algeria: Ooredoo Unlimited', description: 'High-speed Ooredoo Algeria unlimited tunnel' },
    'mms.mobilis.dz': { name: '🇩🇿 Algeria: Mobilis PixX Fast', description: 'Mobilis DZ custom SNI via MMS host on port 443' },
    'internet.djezzy.dz': { name: '🇩🇿 Algeria: Djezzy Speed', description: 'Djezzy DZ bypass tunnel on port 8080' },
    'www.etisalat.eg': { name: '🇪🇬 Egypt: ETISALAT CONNECT20 + UNLIMITED', description: 'High-speed Etisalat Egypt Connect20 unlimited profile' },
    'free.etisalat.eg': { name: '🇪🇬 Egypt: ETISALAT FREE', description: 'Zero-rated Etisalat Egypt tunnel on port 80' },
    'web.vodafone.com.eg': { name: '🇪🇬 Egypt: ETISALAT WE UNLIMITED', description: 'Stable WE & Vodafone Egypt unlimited bundle tunnel' },
    'www.orange.eg': { name: '🇪🇬 Egypt: Orange & Etisalat EG', description: 'Stable Egypt port 8080 tunnel' },
    'www.inwi.ma': { name: '🇲🇦 Morocco: IAM & Inwi Fast', description: 'Morocco social/star bundle bypass via 443' },
    'internet.orange.ma': { name: '🇲🇦 Morocco: Orange MA Zero', description: 'Stable Orange Morocco zero-rated tunnel' },
    'www.ooredoo.tn': { name: '🇹🇳 Tunisia: TT & Ooredoo TN', description: 'Encrypted Tunisia carrier DPI bypass' },
    'www.stc.com.sa': { name: '🇸🇦 Saudi: STC / Mobily / Zain', description: 'Low-ping Saudi gateway encryption' },
    'www.etisalat.ae': { name: '🇦🇪 UAE: Etisalat & du Gulf', description: 'Gulf gateway secure VoIP & web tunnel' },
    'www.asiacell.com': { name: '🇮🇶 Iraq: Zain / Asiacell / Korek', description: 'Stable encrypted tunnel for Iraq networks' },
    'www.jo.zain.com': { name: '🇯🇴 Jordan: Zain / Orange / Umniah', description: 'Fast Jordan encrypted port 443 tunnel' },
    'www.kw.zain.com': { name: '🇰🇼 Kuwait: Zain & Ooredoo KW', description: 'High-speed Kuwait bypass profile' },
    'www.ooredoo.qa': { name: '🇶🇦 Qatar: Ooredoo & Vodafone QA', description: 'Qatar TLS fast encrypted tunnel' },
    'www.omantel.om': { name: '🇴🇲 Oman: Omantel & Ooredoo OM', description: 'Oman encrypted gateway config' },
    'www.batelco.com': { name: '🇧🇭 Bahrain: Batelco & Zain BH', description: 'High-compression Bahrain tunnel' },
    'www.alfa.com.lb': { name: '🇱🇧 Lebanon: Alfa & Touch', description: 'Lebanon network bypass over port 443' },
    'www.syriatel.sy': { name: '🇸🇾 Syria: Syriatel & MTN SY', description: 'Syria anti-block accelerated tunnel' },
    'www.jawwal.ps': { name: '🇵🇸 Palestine: Jawwal & Ooredoo', description: 'Stable Palestine SNI tunnel' },
    'www.yemenmobile.com.ye': { name: '🇾🇪 Yemen: Yemen Mobile & Sabafon', description: 'Yemen carrier bundle tunnel on port 80' },
    'www.libyana.ly': { name: '🇱🇾 Libya: Libyana & Almadar', description: 'Libya 4G bypass for video & gaming' },
    'www.sd.zain.com': { name: '🇸🇩 Sudan: Zain & Sudani', description: 'Lightweight tunnel tuned for Sudan links' },
    'www.mauritel.mr': { name: '🇲🇷 Mauritania: Mattel & Mauritel', description: 'Reliable Mauritania tunnel config' },
    'www.hormuud.com': { name: '🇸🇴 Somalia / Djibouti / Comoros', description: 'Fast East Arab networks unified config' },
    'www.cloudflare.com': { name: '📶 WiFi Fiber Turbo (443)', description: 'Maximum speed encrypted tunnel for home Fiber WiFi' },
    'dns.google': { name: '☕ Public WiFi DNS Bypass (53)', description: 'Bypass café, hotel & campus WiFi firewalls' },
    'connectivitycheck.gstatic.com': { name: '🔓 WiFi Captive Portal Free (80)', description: 'Cross restricted WiFi login portals on port 80' },
    'cdn.discordapp.com': { name: '🎮 WiFi Gaming Low Ping (QUIC)', description: 'UDP/QUIC low-latency gaming & calls over WiFi' },
    'www.snapchat.com': { name: '👻 Snapchat SSL Unlimited', description: 'Direct Snapchat SSL bypass on port 80/443' },
    'free.facebook.com': { name: '📘 Facebook Free Zero', description: 'Full internet access via Facebook zero host' },
    'v16m.tiktokcdn.com': { name: '🎵 TikTok CDN Fast', description: 'High-speed TikTok CDN bypass profile' },
    'web.telegram.org': { name: '✈️ Telegram Web & Calls', description: 'Unlock Telegram bundles & encrypted VoIP' },
    'graph.instagram.com': { name: '📸 Instagram Reels Cloud', description: 'Convert Instagram social quota into full internet' },
    'web.whatsapp.com': { name: '💬 WhatsApp Relay & Calls', description: 'Route encrypted web & voice calls via WhatsApp host' },
    'm.youtube.com': { name: '▶️ YouTube Direct Ultra', description: 'Bypass YouTube streaming caps seamlessly' },
    'api.twitter.com': { name: '𝕏 X (Twitter) Bypass', description: 'Fast TLS 443 DPI bypass for X social bundles' },
  };
  return map[cfg.sniHost] || { name: cfg.name, description: cfg.description };
};
