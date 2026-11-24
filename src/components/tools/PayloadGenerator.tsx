import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  Play,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { LanguageCode, ThemeAccent } from '../../types/vpn';

interface PayloadGeneratorProps {
  language: LanguageCode;
  themeAccent: ThemeAccent;
  onApplyPayload?: (payload: string, sniHost?: string) => void;
  onOpenHelp?: (topic?: string) => void;
  onBack?: () => void;
}

export const ARAB_PAYLOAD_PRESETS = [
  // الجزائر - موبيليس
  {
    category: 'dz',
    carrier: 'موبيليس (Mobilis)',
    name: 'موبيليس باقة PixX ثغرة الـ MMS',
    host: 'mms.mobilis.dz',
    method: 'CONNECT',
    port: '443',
    payload: 'CONNECT [host_port] HTTP/1.1[crlf]Host: mms.mobilis.dz[crlf]X-Online-Host: mms.mobilis.dz[crlf]X-Forward-Host: mms.mobilis.dz[crlf]Connection: Keep-Alive[crlf][crlf]',
    desc: 'ثغرة مجربة لخطوط موبيليس باقة PixX و Navigui'
  },
  {
    category: 'dz',
    carrier: 'موبيليس (Mobilis)',
    name: 'موبيليس بوابة الإنترنت 600',
    host: 'internet.mobilis.dz',
    method: 'GET',
    port: '80',
    payload: 'GET http://internet.mobilis.dz/ HTTP/1.1[crlf]Host: internet.mobilis.dz[crlf]X-Online-Host: internet.mobilis.dz[crlf]Connection: Keep-Alive[crlf][crlf]CONNECT [host_port] HTTP/1.1[crlf][crlf]',
    desc: 'حقن أمامي Front Inject للاتصال مع انعدام الرصيد'
  },
  
  // الجزائر - جازي
  {
    category: 'dz',
    carrier: 'جازي (Djezzy)',
    name: 'جازي إنترنت سبيد تيست المجاني',
    host: 'speedtest.djezzy.dz',
    method: 'CONNECT',
    port: '8080',
    payload: 'CONNECT [host_port] HTTP/1.1[crlf]Host: speedtest.djezzy.dz[crlf]X-Online-Host: speedtest.djezzy.dz[crlf]X-Forwarded-For: speedtest.djezzy.dz[crlf]Connection: Keep-Alive[crlf][crlf]',
    desc: 'استغلال استثناء قياس السرعة المجاني في شبكة جازي'
  },
  {
    category: 'dz',
    carrier: 'جازي (Djezzy)',
    name: 'جازي باقة Djezzy Special & Hadra',
    host: 'internet.djezzy.dz',
    method: 'CONNECT',
    port: '443',
    payload: 'CONNECT [host_port] [protocol][crlf]Host: internet.djezzy.dz[crlf]X-Online-Host: internet.djezzy.dz[crlf][crlf]',
    desc: 'تخطي حجب باقات المكالمات والنت اليومي'
  },

  // الجزائر - أوريدو
  {
    category: 'dz',
    carrier: 'أوريدو (Ooredoo)',
    name: 'أوريدو La Switch وسيرفسات Haya',
    host: 'free.ooredoo.dz',
    method: 'CONNECT',
    port: '443',
    payload: 'CONNECT [host_port] HTTP/1.1[crlf]Host: free.ooredoo.dz[crlf]X-Online-Host: free.ooredoo.dz[crlf]Connection: Keep-Alive[crlf][crlf]',
    desc: 'ثغرة مجربة لشبكة أوريدو 4G/3G بدون رصيد'
  },

  // سناب شات
  {
    category: 'social',
    carrier: 'سناب شات (Snapchat)',
    name: 'سناب شات باقة السوشيال ميديا المباشرة',
    host: 'www.snapchat.com',
    method: 'CONNECT',
    port: '443',
    payload: 'CONNECT [host_port] [protocol][crlf]Host: www.snapchat.com[crlf]X-Online-Host: www.snapchat.com[crlf]Connection: Keep-Alive[crlf][crlf]',
    desc: 'تحويل باقة سناب شات فقط إلى إنترنت شامل لكافة المواقع'
  },
  {
    category: 'social',
    carrier: 'سناب شات (Snapchat)',
    name: 'سناب شات ميديا وسيرفرات CDN',
    host: 'cf-st.sc-cdn.net',
    method: 'CONNECT',
    port: '443',
    payload: 'CONNECT [host_port] [protocol][crlf]Host: cf-st.sc-cdn.net[crlf]Connection: Keep-Alive[crlf][crlf]',
    desc: 'سيرفرات كاش ستوري وسنابات لتسريع التحميل'
  },

  // فيسبوك
  {
    category: 'social',
    carrier: 'فيسبوك (Facebook)',
    name: 'فيسبوك فري بيزكس Free Basics',
    host: 'free.facebook.com',
    method: 'CONNECT',
    port: '80',
    payload: 'CONNECT [host_port] HTTP/1.1[crlf]Host: free.facebook.com[crlf]X-Online-Host: free.facebook.com[crlf]X-Forwarded-Host: free.facebook.com[crlf]Connection: Keep-Alive[crlf][crlf]',
    desc: 'استغلال تصريح التصفح المجاني لفيسبوك'
  },
  {
    category: 'social',
    carrier: 'فيسبوك (Facebook)',
    name: 'فيسبوك جراف ومسنجر Z-M-Graph',
    host: 'z-m-graph.facebook.com',
    method: 'CONNECT',
    port: '443',
    payload: 'CONNECT [host_port] [protocol][crlf]Host: z-m-graph.facebook.com[crlf]X-Online-Host: z-m-graph.facebook.com[crlf][crlf]',
    desc: 'تجاوز حجب مكالمات الماسنجر والاتصال'
  },

  // تيليجرام
  {
    category: 'social',
    carrier: 'تيليجرام (Telegram)',
    name: 'تيليجرام ويب وقنوات الفيديو',
    host: 'web.telegram.org',
    method: 'CONNECT',
    port: '443',
    payload: 'CONNECT [host_port] [protocol][crlf]Host: web.telegram.org[crlf]X-Online-Host: web.telegram.org[crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf][crlf]',
    desc: 'حقن WebSocket لتنزيل الملفات بسرعة خارقة'
  },

  // إنستغرام
  {
    category: 'social',
    carrier: 'إنستغرام (Instagram)',
    name: 'إنستغرام كلاود جراف وريلز',
    host: 'graph.instagram.com',
    method: 'CONNECT',
    port: '443',
    payload: 'CONNECT [host_port] [protocol][crlf]Host: graph.instagram.com[crlf]X-Online-Host: graph.instagram.com[crlf]Connection: Keep-Alive[crlf][crlf]',
    desc: 'تشغيل الريلز والتصفح عبر باقات إنستغرام فقط'
  },

  // يوتيوب
  {
    category: 'social',
    carrier: 'يوتيوب (YouTube)',
    name: 'يوتيوب باقة الفيديو وبث GoogleVideo',
    host: 'googlevideo.com',
    method: 'CONNECT',
    port: '443',
    payload: 'CONNECT [host_port] [protocol][crlf]Host: googlevideo.com[crlf]X-Online-Host: googlevideo.com[crlf]Connection: Keep-Alive[crlf][crlf]',
    desc: 'تخطي حجب واستهلاك باقات يوتيوب غير المحدودة'
  },

  // تيك توك
  {
    category: 'social',
    carrier: 'تيك توك (TikTok)',
    name: 'تيك توك سيدي إن TikTok Music CDN',
    host: 'sf16-ies-music.tiktokcdn.com',
    method: 'CONNECT',
    port: '443',
    payload: 'CONNECT [host_port] [protocol][crlf]Host: sf16-ies-music.tiktokcdn.com[crlf]X-Online-Host: sf16-ies-music.tiktokcdn.com[crlf]Connection: Keep-Alive[crlf][crlf]',
    desc: 'سيرفرات كاش تيك توك المفتوحة لتجاوز الحجب'
  },

  // واتساب
  {
    category: 'social',
    carrier: 'واتساب (WhatsApp)',
    name: 'واتساب ميديا ومكالمات الـ VoIP',
    host: 'c.whatsapp.net',
    method: 'CONNECT',
    port: '443',
    payload: 'CONNECT [host_port] [protocol][crlf]Host: c.whatsapp.net[crlf]X-Online-Host: c.whatsapp.net[crlf]Connection: Keep-Alive[crlf][crlf]',
    desc: 'تشغيل المكالمات الصوتية وفك حجب واتساب'
  },

  // كلاود فلير
  {
    category: 'global',
    carrier: 'كلاود فلير (Cloudflare)',
    name: 'كلاود فلير CDN العالمي فائق السرعة',
    host: 'www.cloudflare.com',
    method: 'CONNECT',
    port: '443',
    payload: 'CONNECT [host_port] [protocol][crlf]Host: www.cloudflare.com[crlf]X-Online-Host: www.cloudflare.com[crlf]Connection: Keep-Alive[crlf][crlf]',
    desc: 'أكثر هوست مستقر عالمياً بـ 0ms تأخير'
  }
];

export const PayloadGenerator: React.FC<PayloadGeneratorProps> = ({
  language,
  onApplyPayload,
  onOpenHelp,
  onBack,
}) => {
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'preview'>('presets');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'dz' | 'social' | 'global'>('all');
  
  // Custom builder states
  const [bugHost, setBugHost] = useState('www.snapchat.com');
  const [payloadType, setPayloadType] = useState('Normal');
  const [httpMethod, setHttpMethod] = useState('CONNECT');
  const [httpProtocol, setHttpProtocol] = useState('HTTP/1.1 (recommended)');
  const [hostFormat, setHostFormat] = useState(true);
  const [splitMode, setSplitMode] = useState('None');
  const [customHeaders, setCustomHeaders] = useState([
    { name: 'X-Online-Host', value: '[host]' },
    { name: 'Connection', value: 'Keep-Alive' },
    { name: 'User-Agent', value: 'ABR-Tunnel/4.0' }
  ]);
  const [generatedPayload, setGeneratedPayload] = useState(
    'CONNECT [host_port] HTTP/1.1[crlf]Host: www.snapchat.com[crlf]X-Online-Host: www.snapchat.com[crlf]Connection: Keep-Alive[crlf][crlf]'
  );
  const [copied, setCopied] = useState(false);
  const [appliedToast, setAppliedToast] = useState(false);

  const filteredPresets = ARAB_PAYLOAD_PRESETS.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const handleSelectPreset = (p: typeof ARAB_PAYLOAD_PRESETS[0]) => {
    setBugHost(p.host);
    setHttpMethod(p.method);
    setGeneratedPayload(p.payload);
    setActiveTab('preview');
  };

  const handleGenerate = () => {
    let proto = httpProtocol.includes('HTTP/2') ? 'HTTP/2' : 'HTTP/1.1';
    let target = hostFormat ? '[host]' : '[host_port]';
    let p = '';

    if (payloadType === 'Normal') {
      p = `${httpMethod} ${target} ${proto}[crlf]Host: ${bugHost || target}[crlf]`;
    } else if (payloadType === 'Front Inject') {
      p = `GET http://${bugHost}/ ${proto}[crlf]Host: ${bugHost}[crlf][crlf]${httpMethod} ${target} ${proto}[crlf]Host: ${bugHost}[crlf]`;
    } else if (payloadType === 'Back Inject') {
      p = `${httpMethod} ${target} ${proto}[crlf]Host: ${bugHost}[crlf][crlf]GET http://${bugHost}/ ${proto}[crlf]`;
    } else if (payloadType === 'Dual SNI') {
      p = `${httpMethod} ${target} ${proto}[crlf]Host: ${bugHost}[crlf]X-Online-Host: ${bugHost}[crlf]X-Forward-For: 127.0.0.1[crlf]`;
    } else if (payloadType === 'WebSocket') {
      p = `${httpMethod} / ${proto}[crlf]Host: ${bugHost}[crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf]X-Forwarded-Host: ${target}[crlf]`;
    } else {
      p = `${httpMethod} ${target} ${proto}[crlf]Host: ${bugHost || target}[crlf]`;
    }

    customHeaders.forEach((h) => {
      if (h.name && h.value) {
        p += `${h.name}: ${h.value}[crlf]`;
      }
    });

    if (splitMode !== 'None') {
      p += `[split: ${splitMode}]`;
    }

    p += '[crlf]';
    setGeneratedPayload(p);
    setActiveTab('preview');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApplyPayload) {
      onApplyPayload(generatedPayload, bugHost);
      setAppliedToast(true);
      setTimeout(() => setAppliedToast(false), 2500);
    }
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-12 animate-fade-in font-sans">
      {/* Header */}
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
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <span>{isAr ? 'مولد البايلود وباقات الدول العربية' : 'Payload Generator & Presets'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded">
                {isAr ? 'مميز' : 'VIP'}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {isAr ? 'بايلود جاهز للشبكات والسوشيال ميديا' : 'Carrier & social media payloads'}
            </p>
          </div>
        </div>

        {onOpenHelp && (
          <button
            onClick={() => onOpenHelp('payload')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all text-xs font-mono font-bold"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-center">
        {[
          { id: 'presets', label: isAr ? 'القوالب الجاهزة' : 'Carriers & Apps', icon: Sparkles },
          { id: 'custom', label: isAr ? 'بناء يدوي مخصص' : 'Custom Builder', icon: Code2 },
          { id: 'preview', label: isAr ? 'معاينة وحقن' : 'Preview & Inject', icon: Play },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ARAB & SOCIAL PRESETS */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          {/* Sub Categories */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
            {[
              { id: 'all', label: isAr ? 'الكل' : 'All' },
              { id: 'dz', label: isAr ? '📶 شبكات الهاتف' : 'Carriers' },
              { id: 'social', label: isAr ? '📱 سناب/فيسبوك/تيك توك/يوتيوب' : 'Social Apps' },
              { id: 'global', label: isAr ? '🌐 كلاود فلير' : 'Cloudflare' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl shrink-0 font-bold transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {filteredPresets.map((p, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{p.name}</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-1.5 py-0.2 rounded font-mono">
                      {p.method} {p.port}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{p.carrier}</span>
                </div>

                <p className="text-[11px] text-slate-400">{p.desc}</p>

                <div className="p-2 rounded-xl bg-slate-950 text-[10px] font-mono text-emerald-400/90 truncate border border-slate-850">
                  {p.payload}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 font-mono text-xs">
                  <button
                    onClick={() => handleSelectPreset(p)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold transition-all"
                  >
                    {isAr ? 'معاينة وتعديل' : 'Edit'}
                  </button>

                  <button
                    onClick={() => {
                      if (onApplyPayload) {
                        onApplyPayload(p.payload, p.host);
                        setAppliedToast(true);
                        setTimeout(() => setAppliedToast(false), 2500);
                      }
                    }}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>{isAr ? 'حقن فوري بالنفق' : 'Inject Now'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM BUILDER */}
      {activeTab === 'custom' && (
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-200 block mb-1">
              {isAr ? 'نطاق الهوست المجاني (Bug Host / SNI)' : 'Target Bug Host'}
            </label>
            <input
              type="text"
              value={bugHost}
              onChange={(e) => setBugHost(e.target.value)}
              placeholder="e.g. www.snapchat.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">{isAr ? 'طريقة الطلب (Method)' : 'Method'}</label>
              <select
                value={httpMethod}
                onChange={(e) => setHttpMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
              >
                <option value="CONNECT">CONNECT</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="HEAD">HEAD</option>
                <option value="OPTIONS">OPTIONS</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">{isAr ? 'نوع الحقن' : 'Inject Type'}</label>
              <select
                value={payloadType}
                onChange={(e) => setPayloadType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
              >
                <option value="Normal">{isAr ? 'عادي (Normal)' : 'Normal'}</option>
                <option value="Front Inject">{isAr ? 'حقن أمامي (Front Inject)' : 'Front Inject'}</option>
                <option value="Back Inject">{isAr ? 'حقن خلفي (Back Inject)' : 'Back Inject'}</option>
                <option value="Dual SNI">{isAr ? 'مزدوج (Dual SNI)' : 'Dual SNI'}</option>
                <option value="WebSocket">{isAr ? 'ويب سوكيت (WebSocket CDN)' : 'WebSocket CDN'}</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase shadow-md flex items-center justify-center gap-2"
          >
            <Code2 className="w-4 h-4" />
            <span>{isAr ? 'توليد كود البايلود' : 'BUILD PAYLOAD'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: PREVIEW & INJECT */}
      {activeTab === 'preview' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-slate-950 border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {isAr ? 'معاينة البايلود الجاهز للحقن:' : 'Generated Payload Code:'}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-mono text-emerald-300 hover:text-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
              </button>
            </div>

            <pre className="p-3 rounded-2xl bg-slate-900/90 text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-x-auto min-h-[140px] border border-slate-800">
              {generatedPayload}
            </pre>
          </div>

          {onApplyPayload && (
            <button
              onClick={handleApply}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-mono font-black text-xs uppercase flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{isAr ? 'حقن البايلود في النفق وتطبيقه الآن' : 'INJECT INTO ACTIVE TUNNEL'}</span>
            </button>
          )}

          {appliedToast && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isAr ? '✓ تم حقن البايلود والهوست بنجاح في نفق Arna tunnel!' : '✓ Payload injected successfully!'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
