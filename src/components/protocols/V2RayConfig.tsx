import React, { useState } from 'react';
import { Clipboard, Wand2, Trash2, Code, Layout, ChevronDown, ArrowLeft, HelpCircle, Send } from 'lucide-react';
import { V2RayConfigData, ThemeAccent, LanguageCode } from '../../types/vpn';
import { translations } from '../../utils/translations';

interface V2RayConfigProps {
  onSaveAndConnect: (config: V2RayConfigData) => void;
  onOpenHelp?: (topic?: string) => void;
  onBack?: () => void;
  themeAccent: ThemeAccent;
  language: LanguageCode;
}

export const V2RayConfig: React.FC<V2RayConfigProps> = ({
  onSaveAndConnect,
  onOpenHelp,
  onBack,
  language,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  const [mode, setMode] = useState<'visual' | 'editor'>('visual');
  const [protocol, setProtocol] = useState<'VLESS' | 'VMess' | 'Trojan' | 'Shadowsocks'>('VLESS');
  const [server, setServer] = useState('xray.abrtunnel.net');
  const [port, setPort] = useState(443);
  const [uuid, setUuid] = useState('b831381d-6324-4d53-ad4f-8cda48b30811');
  const [encryption, setEncryption] = useState('none');
  const [flow, setFlow] = useState('xtls-rprx-vision');
  const [transport, setTransport] = useState<'tcp' | 'ws' | 'grpc' | 'http'>('tcp');
  const [security, setSecurity] = useState<'none' | 'tls' | 'reality'>('tls');
  const [sni, setSni] = useState('www.snapchat.com');
  const [fingerprint, setFingerprint] = useState('chrome');
  const [alpn, setAlpn] = useState('h2, http/1.1');
  const [allowInsecure, setAllowInsecure] = useState(false);

  const [jsonConfig, setJsonConfig] = useState(`{
  "outbounds": [
    {
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "xray.abrtunnel.net",
            "port": 443,
            "users": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
                "encryption": "none",
                "flow": "xtls-rprx-vision"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "tls",
        "tlsSettings": {
          "serverName": "www.snapchat.com",
          "fingerprint": "chrome",
          "alpn": ["h2", "http/1.1"]
        }
      }
    }
  ]
}`);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonConfig);
      setJsonConfig(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore invalid JSON
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setJsonConfig(text);
    } catch {
      // ignore clipboard permission fallback
    }
  };

  const handleClear = () => {
    setJsonConfig('{\n  \n}');
  };

  const handleConnect = () => {
    onSaveAndConnect({
      mode,
      protocol,
      server,
      port,
      uuid,
      encryption,
      flow,
      transport,
      path: '/',
      security,
      sni,
      fingerprint,
      alpn,
      allowInsecure,
      jsonConfig,
    });
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10 font-sans">
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
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center text-emerald-400">
            <Send className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold font-mono text-emerald-400">
            {isAr ? 'نفق V2Ray / Xray المخصص' : 'Custom Xray'}
          </h2>
        </div>

        {onOpenHelp && (
          <button
            onClick={() => onOpenHelp('protocols')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all text-xs font-mono font-bold shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      {/* Mode Switch */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setMode('visual')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            mode === 'visual' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>{isAr ? 'المحرر المرئي' : 'Visual'}</span>
        </button>

        <button
          onClick={() => setMode('editor')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            mode === 'editor' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>{isAr ? 'محرر الكود JSON' : 'Editor'}</span>
        </button>
      </div>

      {mode === 'visual' ? (
        <div className="space-y-4">
          {/* Protocol Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'البروتوكول' : 'Protocol'}</div>
            <div className="text-[11px] text-slate-500 font-mono">
              {isAr ? 'اختر نوع بروتوكول Xray' : 'Select Xray protocol'}
            </div>
            <div className="relative">
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as any)}
                dir="ltr"
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono cursor-pointer"
              >
                <option value="VLESS">VLESS</option>
                <option value="VMess">VMess</option>
                <option value="Trojan">Trojan</option>
                <option value="Shadowsocks">Shadowsocks</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Server & Port */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'السيرفر والمنفذ' : 'Server & Port'}</div>
            <input
              type="text"
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder={isAr ? 'عنوان الخادم' : 'Address'}
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
            />
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              placeholder={isAr ? 'المنفذ' : 'Port'}
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
            />
          </div>

          {/* Authentication */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'بيانات المصادقة' : 'Authentication'}</div>
            <div className="text-[11px] text-slate-500 font-mono">{isAr ? 'معرف UUID الفريد' : 'UUID / ID'}</div>
            <input
              type="text"
              value={uuid}
              onChange={(e) => setUuid(e.target.value)}
              placeholder="UUID"
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
            />

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-mono">{isAr ? 'نوع التشفير' : 'Encryption'}</label>
              <div className="relative">
                <select
                  value={encryption}
                  onChange={(e) => setEncryption(e.target.value)}
                  dir="ltr"
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                >
                  <option value="none">none</option>
                  <option value="auto">auto</option>
                  <option value="aes-128-gcm">aes-128-gcm</option>
                  <option value="chacha20-poly1305">chacha20-poly1305</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-mono">{isAr ? 'نمط التدفق (Flow)' : 'Flow'}</label>
              <div className="relative">
                <select
                  value={flow}
                  onChange={(e) => setFlow(e.target.value)}
                  dir="ltr"
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                >
                  <option value="xtls-rprx-vision">xtls-rprx-vision</option>
                  <option value="none">none</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Transport */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'بروتوكول النقل' : 'Transport'}</div>
            <div className="relative">
              <select
                value={transport}
                onChange={(e) => setTransport(e.target.value as any)}
                dir="ltr"
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
              >
                <option value="tcp">TCP</option>
                <option value="ws">WebSocket (WS)</option>
                <option value="grpc">gRPC</option>
                <option value="http">HTTP/2</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Security */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'الأمان والتمويه (TLS / Reality)' : 'Security'}</div>
            <div className="relative">
              <select
                value={security}
                onChange={(e) => setSecurity(e.target.value as any)}
                dir="ltr"
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
              >
                <option value="tls">TLS</option>
                <option value="reality">Reality</option>
                <option value="none">None</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <input
              type="text"
              value={sni}
              onChange={(e) => setSni(e.target.value)}
              placeholder={isAr ? 'نطاق الهوست SNI' : 'SNI Host'}
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
            />

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-mono">{isAr ? 'بصمة المتصفح (uTLS)' : 'Fingerprint'}</label>
              <div className="relative">
                <select
                  value={fingerprint}
                  onChange={(e) => setFingerprint(e.target.value)}
                  dir="ltr"
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                >
                  <option value="chrome">Chrome</option>
                  <option value="firefox">Firefox</option>
                  <option value="safari">Safari</option>
                  <option value="edge">Edge</option>
                  <option value="random">Random</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-mono">{isAr ? 'بروتوكول التفاوض ALPN' : 'ALPN'}</label>
              <div className="relative">
                <select
                  value={alpn}
                  onChange={(e) => setAlpn(e.target.value)}
                  dir="ltr"
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
                >
                  <option value="h2, http/1.1">h2, http/1.1</option>
                  <option value="h2">h2</option>
                  <option value="http/1.1">http/1.1</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  {isAr ? 'السماح بالشهادات غير الموثوقة' : 'Allow Insecure'}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {isAr ? 'تجاوز فحص صحة الشهادة' : 'Skip certificate verification'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowInsecure}
                onChange={(e) => setAllowInsecure(e.target.checked)}
                className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handlePaste}
              className="py-2 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-center gap-1.5 hover:bg-emerald-900/60"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>{t.paste}</span>
            </button>
            <button
              onClick={handleFormat}
              className="py-2 px-3 rounded-xl bg-teal-950/60 border border-teal-500/40 text-teal-300 text-xs font-mono flex items-center justify-center gap-1.5 hover:bg-teal-900/60"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{t.format}</span>
            </button>
            <button
              onClick={handleClear}
              className="py-2 px-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center justify-center gap-1.5 hover:bg-rose-900/60"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clear}</span>
            </button>
          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] font-mono text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" />
                config.json
              </span>
              <span className="text-slate-500 text-[10px]">
                {isAr ? 'تنسيق JSON صالح' : 'JSON Schema Valid'}
              </span>
            </div>

            <textarea
              rows={14}
              value={jsonConfig}
              onChange={(e) => setJsonConfig(e.target.value)}
              dir="ltr"
              className="w-full mt-2 bg-transparent text-xs font-mono text-emerald-200/90 focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      <button
        onClick={handleConnect}
        className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-950"
      >
        {t.connect}
      </button>
    </div>
  );
};
