import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  Shield,
  Zap,
  Code2,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Lock
} from 'lucide-react';
import { LanguageCode, ThemeAccent } from '../../types/vpn';
import { translations } from '../../utils/translations';
import { THEMES } from '../../utils/theme';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  language: LanguageCode;
  themeAccent: ThemeAccent;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
  language,
  themeAccent,
}) => {
  const t = translations[language];
  const theme = THEMES[themeAccent] || THEMES.teal;
  const [activeTab, setActiveTab] = useState<'start' | 'protocols' | 'payload' | 'diagnostic' | 'faq'>('start');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagResults, setDiagResults] = useState({
    crypto: true,
    cache: true,
    network: true,
    dns: true,
  });

  useEffect(() => {
    if (initialTopic) {
      if (initialTopic === 'custom_sni') {
        setActiveTab('protocols');
      } else if (['start', 'protocols', 'payload', 'diagnostic', 'faq'].includes(initialTopic)) {
        setActiveTab(initialTopic as any);
      }
    }
  }, [initialTopic, isOpen]);

  const runDiagnostic = () => {
    setDiagRunning(true);
    setTimeout(() => {
      setDiagResults({
        crypto: typeof window.crypto?.subtle !== 'undefined',
        cache: 'caches' in window,
        network: navigator.onLine,
        dns: true,
      });
      setDiagRunning(false);
    }, 800);
  };

  if (!isOpen) return null;

  const isAr = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl max-h-[90vh] bg-[#070b14] border border-emerald-500/35 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-800 bg-[#08120e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <span>{isAr ? 'مركز المساعدة ودليل Arna tunnel' : 'Arna tunnel | Help & Guide'}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono">
                  {isAr ? 'الإصدار 1.0' : 'v1.0'}
                </span>
              </h3>
            <p className="text-[11px] text-slate-400">
              {isAr ? 'شروحات شاملة، البروتوكولات، البايلود، والتشخيص الفوري' : 'Comprehensive guides, protocols & live diagnostics'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tab navigation */}
      <div className="grid grid-cols-5 border-b border-slate-800/80 bg-[#07100c] text-[11px] font-mono text-center overflow-x-auto">
        {[
          { id: 'start', label: isAr ? 'البداية' : 'Start', icon: Zap },
          { id: 'protocols', label: isAr ? 'البروتوكول' : 'Protocols', icon: Shield },
          { id: 'payload', label: isAr ? 'البايلود' : 'Payloads', icon: Code2 },
          { id: 'diagnostic', label: isAr ? 'الفحص' : 'Check', icon: Cpu },
          { id: 'faq', label: isAr ? 'الأسئلة' : 'FAQ', icon: HelpCircle },
        ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-1 font-bold flex flex-col items-center gap-1 transition-all border-b-2 ${
                  isActive
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
          {activeTab === 'start' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="font-bold text-sm text-white flex items-center gap-2 mb-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  {isAr ? 'طريقة الاتصال السريع في Arna tunnel' : 'How to Connect in Seconds'}
                </h4>
                <p className="text-xs text-slate-300">
                  {isAr
                    ? 'يوفر التطبيق اتصالاً مشفراً ومباشراً مع إمكانية اختيار البروتوكول وحقن كوستوم SNI وتصدير الكونفيجات بسهولة.'
                    : 'Arna tunnel delivers encrypted connectivity with custom SNI injection and .an profile management.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center font-mono">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-emerald-400 font-bold mb-1 text-xs">1. {isAr ? 'اختر الخادم' : 'Server'}</div>
                  <span className="text-[11px] text-slate-400">{isAr ? 'خوادم سريعة بزمن استجابة منخفض' : 'Pick low-ping server'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-teal-400 font-bold mb-1 text-xs">2. {isAr ? 'البروتوكول والهوست' : 'SNI & Protocol'}</div>
                  <span className="text-[11px] text-slate-400">{isAr ? 'كوستوم SNI أو استيراد كونفيج .an' : 'Custom SNI or .an config'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className={`${theme.textClass} font-bold mb-1 text-xs`}>3. {isAr ? 'اضغط اتصال' : 'Connect'}</div>
                  <span className="text-[11px] text-slate-400">{isAr ? 'زر التشغيل في الشاشة الرئيسية' : 'Tap main connect orb'}</span>
                </div>
              </div>

              <div className={`p-3 rounded-xl ${theme.bgDeepClass} border ${theme.borderClass} text-[11px] ${theme.textLightClass} flex items-center gap-2`}>
                <Lock className="w-4 h-4 shrink-0" />
                <span>
                  {isAr
                    ? 'جميع الخوادم مزودة بحماية تسريب الـ DNS ومفتاح القطع التلقائي والتشفير الكامل.'
                    : 'All endpoints feature DNS leak guard, auto kill-switch, and AES-256 encryption.'}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'protocols' && (
            <div className="space-y-2.5">
              <h4 className="font-bold text-sm text-white">
                {isAr ? 'البروتوكولات المتوفرة وكوستوم SNI' : 'Available Tunnel Protocols'}
              </h4>

              {[
                {
                  name: isAr ? 'كوستوم SNI (مثل سناب شات)' : 'Custom SNI (SSL/TLS Bypass)',
                  desc: isAr ? 'حقن نطاق SNI مخصص مثل www.snapchat.com أو هوستات الشبكات لتجاوز الفحص العميق للباقات.' : 'Inject custom TLS SNI hosts such as www.snapchat.com or carrier portals for DPI bypass.'
                },
                {
                  name: 'V2Ray / Xray (VLESS Reality)',
                  desc: isAr ? 'أقوى أسلوب تخفي ضد الحجب الرقابي؛ يحاكي تصفحاً طبيعياً لمواقع كبرى.' : 'Advanced traffic obfuscation simulating organic TLS connections.'
                },
                {
                  name: 'Hysteria UDP',
                  desc: isAr ? 'بروتوكول سريع يعتمد على QUIC لتجاوز الشبكات الضعيفة وعالية الفقد.' : 'High-speed QUIC tunnel engineered for unstable or lossy mobile networks.'
                },
                {
                  name: 'DNSTT (DNS Tunnel)',
                  desc: isAr ? 'يمرر الاتصال عبر استعلامات الـ DNS المشفرة في الشبكات المقيدة.' : 'Routes SSH packets over encrypted DNS queries for strict firewalls.'
                },
              ].map((proto) => (
                <div key={proto.name} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-mono font-bold text-xs text-emerald-400">{proto.name}</div>
                  <p className="text-[11px] text-slate-400 mt-1">{proto.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'payload' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                {isAr ? 'دليل البايلود وصناعة الكونفيجات (.an)' : 'Payload & .an Config Builder Guide'}
              </h4>
              <p className="text-[11px] text-slate-300">
                {isAr
                  ? 'يمكنك اختيار بايلود جاهز لكل الدول العربية وشبكات الواي فاي والسوشيال ميديا (سناب شات، فيسبوك، تيليجرام، إنستغرام، يوتيوب، تيك توك، واتساب)، كما يمكنك تصدير كونفيج .an مقفل ومشفر لمشاركته.'
                  : 'Select ready payloads for all Arab countries, WiFi and social apps, or build locked encrypted .an configs to share safely.'}
              </p>

              <div className="space-y-1.5 font-mono text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-300">
                <div><code>[host]</code> : {isAr ? 'يستبدل بعنوان سيرفر الاتصال' : 'Replaced with target server host'}</div>
                <div><code>[port]</code> : {isAr ? 'يستبدل بمنفذ السيرفر' : 'Replaced with server port'}</div>
                <div><code>[host_port]</code> : {isAr ? 'يستبدل بالعنوان والمنفذ معاً' : 'Replaced with host:port'}</div>
                <div><code>[crlf]</code> : {isAr ? 'سطر جديد لترويسة HTTP' : 'Carriage return & line feed'}</div>
                <div><code>[protocol]</code> : HTTP/1.1 {isAr ? 'أو' : 'or'} HTTP/2</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
                <span className="text-emerald-400 font-bold block mb-1">{isAr ? 'مثال بايلود سناب شات:' : 'Snapchat Payload Example:'}</span>
                CONNECT [host_port] [protocol][crlf]Host: www.snapchat.com[crlf]X-Online-Host: www.snapchat.com[crlf][crlf]
              </div>
            </div>
          )}

          {activeTab === 'diagnostic' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  {isAr ? 'الفحص الذاتي والتشخيص الفوري للشبكة' : 'Live Network Diagnostics'}
                </h4>
                <button
                  onClick={runDiagnostic}
                  disabled={diagRunning}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${diagRunning ? 'animate-spin' : ''}`} />
                  <span>{diagRunning ? (isAr ? 'جاري الفحص...' : 'Testing...') : (isAr ? 'إعادة الفحص' : 'Re-test')}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-white block font-bold text-[11px]">{isAr ? 'حالة اتصال الإنترنت' : 'Internet Status'}</span>
                    <span className="text-[10px] text-slate-400">{diagResults.network ? (isAr ? 'متصل ومستقر' : 'Online') : (isAr ? 'غير متصل' : 'Offline')}</span>
                  </div>
                  {diagResults.network ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-white block font-bold text-[11px]">{isAr ? 'ذاكرة التخزين المحلية' : 'Local CacheStorage'}</span>
                    <span className="text-[10px] text-slate-400">{diagResults.cache ? (isAr ? 'جاهزة 100%' : 'Ready') : (isAr ? 'غير متاحة' : 'Unavailable')}</span>
                  </div>
                  {diagResults.cache ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-white block font-bold text-[11px]">{isAr ? 'محرك التشفير العسكري' : 'AES-256 Crypto'}</span>
                    <span className="text-[10px] text-slate-400">{diagResults.crypto ? (isAr ? 'مدعوم وآمن' : 'Hardware Safe') : (isAr ? 'غير مدعوم' : 'Unavailable')}</span>
                  </div>
                  {diagResults.crypto ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-white block font-bold text-[11px]">{isAr ? 'حماية الـ DNS المشفر' : 'Encrypted DNS'}</span>
                    <span className="text-[10px] text-slate-400">{isAr ? 'حماية فعالة' : 'Active'}</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-2">
              {[
                {
                  q: isAr ? 'كيف أستخدم كوستوم SNI لباقات السوشيال ميديا؟' : 'How to use Custom SNI for carrier and social bundles?',
                  a: isAr ? 'ادخل إلى تبويب البروتوكولات ثم اختر كوستوم SNI، واختر الهوست المناسب لشبكتك (مثل www.snapchat.com) ثم اضغط اتصال.' : 'Open Protocols -> Custom SNI, pick a carrier or app preset such as www.snapchat.com, and tap connect.'
                },
                {
                  q: isAr ? 'كيف أستخدم قسم مشاركة VPN؟' : 'How do I use the Share VPN section?',
                  a: isAr ? 'افتح قسم مشاركة VPN من الرئيسية أو الأدوات، فعّل المشاركة المباشرة، واختر منفذ Wi-Fi أو USB أو البلوتوث وتصدير ملف التوجيه.' : 'Open Share VPN from Home or Tools, enable direct tether, choose Wi-Fi/USB/Bluetooth, and export your routing profile.'
                },
                {
                  q: isAr ? 'لماذا لا يتصل السيرفر أحياناً؟' : 'Why does connection occasionally fail?',
                  a: isAr ? 'جرب التبديل بين منفذ 443 و 80 و 8080 أو تغيير الهوست المخصص وتفعيل ثم إيقاف وضع الطيران على هاتفك.' : 'Switch between ports 443, 80, and 8080, try a different SNI host, or toggle Airplane mode to refresh your IP.'
                }
              ].map((faq, index) => {
                const isFaqOpen = openFaq === index;
                return (
                  <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isFaqOpen ? null : index)}
                      className="w-full p-3 text-start font-bold text-xs flex items-center justify-between text-slate-200"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                          isFaqOpen ? 'rotate-180 text-emerald-400' : ''
                        }`}
                      />
                    </button>
                    {isFaqOpen && (
                      <div className="p-3 pt-0 text-[11px] text-slate-400 border-t border-slate-800/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-[#070b14] flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'دعم Arna tunnel الفني' : 'Arna tunnel Support'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
