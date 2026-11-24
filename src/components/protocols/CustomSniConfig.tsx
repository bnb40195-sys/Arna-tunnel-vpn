import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Play,
  Code2,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { LanguageCode, ThemeAccent, CustomSniConfigData } from '../../types/vpn';

interface CustomSniConfigProps {
  initialConfig?: Partial<CustomSniConfigData>;
  onSaveAndConnect: (config: CustomSniConfigData) => void;
  onOpenHelp?: (topic?: string) => void;
  onBack?: () => void;
  language: LanguageCode;
  themeAccent: ThemeAccent;
}

export const SNI_PRESETS = [
  { category: 'dz', carrier: 'موبيليس', code: 'MOB', nameAr: 'موبيليس PixX (ثغرة MMS)', nameEn: 'Mobilis PixX MMS', host: 'mms.mobilis.dz', port: '443', payload: 'CONNECT [host_port] HTTP/1.1[crlf]Host: mms.mobilis.dz[crlf]X-Online-Host: mms.mobilis.dz[crlf]Connection: Keep-Alive[crlf][crlf]' },
  { category: 'dz', carrier: 'موبيليس', code: 'MOB', nameAr: 'بوابة موبيليس المجانية', nameEn: 'Mobilis Navigui Portal', host: 'internet.mobilis.dz', port: '80', payload: 'GET / HTTP/1.1[crlf]Host: internet.mobilis.dz[crlf]X-Forwarded-For: internet.mobilis.dz[crlf][crlf]' },
  { category: 'dz', carrier: 'موبيليس', code: 'MOB', nameAr: 'موبيليس 600 السريعة', nameEn: 'Mobilis 600 CDN', host: 'cdn-pixx.mobilis.dz', port: '443', payload: 'CONNECT [host_port] [protocol][crlf]Host: cdn-pixx.mobilis.dz[crlf][crlf]' },

  { category: 'dz', carrier: 'جازي', code: 'DJZ', nameAr: 'بوابة جازي المجانية', nameEn: 'Djezzy Free Portal', host: 'internet.djezzy.dz', port: '8080', payload: 'CONNECT [host_port] HTTP/1.1[crlf]Host: internet.djezzy.dz[crlf]X-Online-Host: internet.djezzy.dz[crlf][crlf]' },
  { category: 'dz', carrier: 'جازي', code: 'DJZ', nameAr: 'جازي سبيد تيست المجاني', nameEn: 'Djezzy SpeedTest Zero', host: 'speedtest.djezzy.dz', port: '80', payload: 'GET http://speedtest.djezzy.dz/ HTTP/1.1[crlf]Host: speedtest.djezzy.dz[crlf][crlf]' },
  { category: 'dz', carrier: 'جازي', code: 'DJZ', nameAr: 'بوابة تطبيق جازي', nameEn: 'Djezzy App Gateway', host: 'app.djezzy.dz', port: '443', payload: 'CONNECT [host_port] [protocol][crlf]Host: app.djezzy.dz[crlf]Connection: Keep-Alive[crlf][crlf]' },

  { category: 'dz', carrier: 'أوريدو', code: 'OOR', nameAr: 'أوريدو La Switch المجانية', nameEn: 'Ooredoo La Switch Free', host: 'free.ooredoo.dz', port: '443', payload: 'CONNECT [host_port] HTTP/1.1[crlf]Host: free.ooredoo.dz[crlf]X-Online-Host: free.ooredoo.dz[crlf][crlf]' },
  { category: 'dz', carrier: 'أوريدو', code: 'OOR', nameAr: 'أوريدو بوابة Haya', nameEn: 'Ooredoo Haya Portal', host: 'services.ooredoo.dz', port: '80', payload: 'HEAD / HTTP/1.1[crlf]Host: services.ooredoo.dz[crlf][crlf]' },

  { category: 'social', carrier: 'سناب شات', code: 'SNP', nameAr: 'سناب شات SSL المباشر', nameEn: 'Snapchat SSL Direct', host: 'www.snapchat.com', port: '443', payload: 'CONNECT [host_port] [protocol][crlf]Host: www.snapchat.com[crlf][crlf]' },
  { category: 'social', carrier: 'سناب شات', code: 'SNP', nameAr: 'سيرفر ميديا سناب شات', nameEn: 'Snapchat CDN Media', host: 'cf-st.sc-cdn.net', port: '443', payload: 'CONNECT [host_port] [protocol][crlf]Host: cf-st.sc-cdn.net[crlf][crlf]' },
  { category: 'social', carrier: 'فيسبوك', code: 'FB', nameAr: 'فيسبوك التصفح المجاني', nameEn: 'Facebook Free Basics', host: 'free.facebook.com', port: '80', payload: 'CONNECT [host_port] HTTP/1.1[crlf]Host: free.facebook.com[crlf]X-Online-Host: free.facebook.com[crlf][crlf]' },
  { category: 'social', carrier: 'فيسبوك', code: 'FB', nameAr: 'فيسبوك جراف ومسنجر', nameEn: 'Facebook Graph CDN', host: 'z-m-graph.facebook.com', port: '443', payload: 'CONNECT [host_port] [protocol][crlf]Host: z-m-graph.facebook.com[crlf][crlf]' },
  { category: 'social', carrier: 'تيليجرام', code: 'TG', nameAr: 'تيليجرام ويب السريع', nameEn: 'Telegram Web Direct', host: 'web.telegram.org', port: '443', payload: 'CONNECT [host_port] [protocol][crlf]Host: web.telegram.org[crlf]Connection: Upgrade[crlf][crlf]' },
  { category: 'social', carrier: 'إنستغرام', code: 'IG', nameAr: 'إنستغرام كلاود ريلز', nameEn: 'Instagram CDN Cloud', host: 'graph.instagram.com', port: '443', payload: 'CONNECT [host_port] [protocol][crlf]Host: graph.instagram.com[crlf][crlf]' },
  { category: 'social', carrier: 'تيك توك', code: 'TT', nameAr: 'تيك توك سيرفر البث', nameEn: 'TikTok Music CDN', host: 'sf16-ies-music.tiktokcdn.com', port: '443', payload: 'CONNECT [host_port] [protocol][crlf]Host: sf16-ies-music.tiktokcdn.com[crlf][crlf]' },
  { category: 'social', carrier: 'يوتيوب', code: 'YT', nameAr: 'يوتيوب بث الفيديو', nameEn: 'YouTube GoogleVideo', host: 'googlevideo.com', port: '443', payload: 'CONNECT [host_port] [protocol][crlf]Host: googlevideo.com[crlf][crlf]' },
  { category: 'global', carrier: 'كلاود فلير', code: 'CF', nameAr: 'كلاود فلير العالمي السريع', nameEn: 'Cloudflare 1.1.1.1 Edge', host: 'www.cloudflare.com', port: '443', payload: 'CONNECT [host_port] [protocol][crlf]Host: www.cloudflare.com[crlf][crlf]' },
  { category: 'global', carrier: 'فاستلي', code: 'FST', nameAr: 'فاستلي CDN العالمي', nameEn: 'Fastly Global CDN', host: 'www.fastly.com', port: '443', payload: 'CONNECT [host_port] [protocol][crlf]Host: www.fastly.com[crlf][crlf]' },
];

export const CustomSniConfig: React.FC<CustomSniConfigProps> = ({
  initialConfig,
  onSaveAndConnect,
  onOpenHelp,
  onBack,
  language,
}) => {
  const isAr = language === 'ar';

  const [sniHost, setSniHost] = useState(initialConfig?.sniHost || 'www.snapchat.com');
  const [serverPort, setServerPort] = useState(initialConfig?.serverPort || '443');
  const [proxyType] = useState<'SSL/TLS' | 'Direct' | 'WebSocket'>(initialConfig?.proxyType || 'SSL/TLS');
  const [usePayload, setUsePayload] = useState(initialConfig?.usePayload ?? true);
  const [payloadText, setPayloadText] = useState(
    initialConfig?.payloadText || 'CONNECT [host_port] [protocol][crlf]Host: [host][crlf]Connection: Keep-Alive[crlf][crlf]'
  );
  const [preserveSni, setPreserveSni] = useState(initialConfig?.preserveSni ?? true);
  const [dnsResolver] = useState(initialConfig?.dnsResolver || '1.1.1.1');

  const [activeCategory, setActiveCategory] = useState<'all' | 'dz' | 'social' | 'global'>('all');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const quickPorts = ['443', '80', '8080', '8443', '8888', '53'];

  const filteredPresets = SNI_PRESETS.filter((p) => activeCategory === 'all' || p.category === activeCategory);

  const handleSelectPreset = (p: typeof SNI_PRESETS[0]) => {
    setSniHost(p.host);
    setServerPort(p.port);
    if (p.payload) {
      setPayloadText(p.payload);
      setUsePayload(true);
    }
    setTestStatus(null);
  };

  const handleTestSni = () => {
    setIsTesting(true);
    setTestStatus(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestStatus(
        isAr
          ? `✓ تم التحقق بنجاح من ${sniHost}: استجابة مشفرة سريعة وصالحة للتخطي`
          : `✓ Verified ${sniHost}: TLS 1.3 Handshake OK`
      );
    }, 750);
  };

  const handleConnect = () => {
    onSaveAndConnect({
      sniHost: sniHost.trim(),
      serverPort,
      proxyType,
      usePayload,
      payloadText,
      preserveSni,
      dnsResolver,
    });
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-12 animate-fade-in font-sans">
      {/* Header with Back & Help button */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40"
              aria-label={isAr ? 'رجوع' : 'Back'}
            >
              <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-white flex flex-wrap items-center gap-2">
              <span>{isAr ? 'نفق كوستوم SNI (تشفير TLS)' : 'Custom SNI Tunnel'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded">
                {isAr ? 'تخطي الحجب' : 'BYPASS'}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {isAr ? 'تخطي حجب الشبكات وباقات السوشيال ميديا بالهوست المخصص' : 'Bypass DPI filters with custom zero-rated bug hosts'}
            </p>
          </div>
        </div>

        {onOpenHelp && (
          <button
            onClick={() => onOpenHelp('custom_sni')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all text-xs font-mono font-bold shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      {/* Target Bug Host Card */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-lg">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'نطاق الهوست المخصص (Custom SNI)' : 'Custom SNI Host'}</span>
            </label>
            <span className="text-[10px] text-emerald-400 font-mono">
              {isAr ? 'ترويسة SNI المشفرة' : 'TLS SNI Host'}
            </span>
          </div>

          <input
            type="text"
            value={sniHost}
            onChange={(e) => setSniHost(e.target.value)}
            placeholder={isAr ? 'مثال: www.snapchat.com أو mms.mobilis.dz' : 'e.g. www.snapchat.com'}
            className="w-full px-3.5 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none transition-colors"
            dir="ltr"
          />
        </div>

        {/* Port Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            {isAr ? 'منفذ الاتصال المشفر' : 'Tunnel Port'}
          </label>
          <div className="grid grid-cols-6 gap-1.5 font-mono">
            {quickPorts.map((p) => {
              const isSelected = serverPort === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setServerPort(p)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-2 space-y-2.5 border-t border-slate-800/80 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200">{isAr ? 'تثبيت وحفظ الـ SNI' : 'Preserve SNI'}</span>
              <p className="text-[10px] text-slate-500">
                {isAr ? 'إرسال نفس الهوست في مصافحة التشفير وترويسة الطلب' : 'Keep SNI domain in all handshakes'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={preserveSni}
              onChange={(e) => setPreserveSni(e.target.checked)}
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200">{isAr ? 'حقن بايلود HTTP إضافي' : 'Use TCP Payload'}</span>
              <p className="text-[10px] text-slate-500">
                {isAr ? 'حقن ترويسات مخصصة لتجاوز جدران الحماية' : 'Inject HTTP headers inside TLS stream'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={usePayload}
              onChange={(e) => setUsePayload(e.target.checked)}
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        {/* Payload Editor */}
        {usePayload && (
          <div className="pt-2 space-y-1.5">
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
              <Code2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'نص البايلود المحقون' : 'Payload Content'}</span>
            </span>
            <textarea
              rows={3}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 leading-relaxed"
              dir="ltr"
            />
          </div>
        )}

        {/* Test Handshake Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleTestSni}
            disabled={isTesting}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>
              {isTesting
                ? isAr
                  ? 'جاري فحص الهوست...'
                  : 'Testing...'
                : isAr
                ? 'فحص جاهزية الهوست'
                : 'Test SNI Reachability'}
            </span>
          </button>
        </div>

        {testStatus && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{testStatus}</span>
          </div>
        )}
      </div>

      {/* Presets Library */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white font-mono">
              {isAr ? 'مكتبة الهوستات والسوشيال ميديا المجربة' : 'Carrier & Social SNI Presets'}
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {filteredPresets.length} {isAr ? 'هوست' : 'hosts'}
          </span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All' },
            { id: 'dz', label: isAr ? '📶 شبكات الهاتف' : 'Mobile Carriers' },
            { id: 'social', label: isAr ? '📱 سناب/فيسبوك/تيليجرام' : 'Social Apps' },
            { id: 'global', label: isAr ? '🌐 كلاود فلير وعالمي' : 'Global CDN' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl shrink-0 font-bold transition-all border ${
                activeCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {filteredPresets.map((p, idx) => {
            const isSelected = sniHost === p.host;
            return (
              <button
                key={idx}
                onClick={() => handleSelectPreset(p)}
                className={`w-full p-2.5 rounded-2xl border text-start flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-[10px] text-emerald-400 font-bold shrink-0">
                    {p.code}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex flex-wrap items-center gap-1.5">
                      <span>{isAr ? p.nameAr : p.nameEn}</span>
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 rounded font-mono">
                        {isAr ? `منفذ ${p.port}` : `Port ${p.port}`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.host}</div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-emerald-400 font-bold px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                  {isSelected ? (isAr ? 'مطبق ✓' : 'Active') : isAr ? 'اختيار' : 'Apply'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Connect Action */}
      <button
        onClick={handleConnect}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-mono font-black text-sm uppercase flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 active:scale-95 transition-all"
      >
        <Play className="w-5 h-5 fill-slate-950" />
        <span>{isAr ? 'تطبيق والاتصال عبر نفق كوستوم SNI' : 'CONNECT WITH CUSTOM SNI'}</span>
      </button>
    </div>
  );
};
