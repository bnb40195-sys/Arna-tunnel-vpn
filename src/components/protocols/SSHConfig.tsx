import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, Terminal } from 'lucide-react';
import { SSHConfigData, ThemeAccent, LanguageCode } from '../../types/vpn';
import { translations } from '../../utils/translations';

interface SSHConfigProps {
  isSslMode: boolean;
  onSaveAndConnect: (config: SSHConfigData) => void;
  onOpenHelp?: (topic?: string) => void;
  onBack?: () => void;
  themeAccent: ThemeAccent;
  language: LanguageCode;
}

export const SSHConfig: React.FC<SSHConfigProps> = ({
  isSslMode,
  onSaveAndConnect,
  onOpenHelp,
  onBack,
  language,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  const [serverString, setServerString] = useState('ssh.arnatunnel.net:22@arna_user:arna_pass123');
  const [httpProxy, setHttpProxy] = useState(false);
  const [proxyHost, setProxyHost] = useState('104.16.123.96:8080');
  const [customPayload, setCustomPayload] = useState(false);
  const [payloadText, setPayloadText] = useState('GET / HTTP/1.1[crlf]Host: [host][crlf]Upgrade: websocket[crlf]Connection: Upgrade[crlf][crlf]');
  const [sniEnabled, setSniEnabled] = useState(isSslMode);
  const [sniHost, setSniHost] = useState('www.snapchat.com');

  const handleConnect = () => {
    onSaveAndConnect({
      server: serverString,
      username: serverString.split('@')[1]?.split(':')[0] || 'arna_user',
      password: serverString.split('@')[1]?.split(':')[1] || 'arna_pass',
      port: 22,
      httpProxy,
      proxyHost,
      proxyPort: 8080,
      customPayload,
      payloadText,
      sniEnabled: isSslMode ? sniEnabled : false,
      sniHost,
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
            <Terminal className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold font-mono text-emerald-400">
            {isAr ? (isSslMode ? 'نفق SSH عبر SSL/TLS' : 'نفق SSH مخصص') : isSslMode ? 'Custom SSL/TLS SSH' : 'Custom SSH'}
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

      {/* SSH Server Box */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="text-xs font-mono text-emerald-400 font-bold">
          {isAr ? 'خادم SSH' : 'SSH Server'}
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          {isAr ? 'الصيغة: host:port@username:password' : 'Format: host:port@username:password'}
        </div>
        <input
          type="text"
          value={serverString}
          onChange={(e) => setServerString(e.target.value)}
          placeholder="host:port@user:pass"
          dir="ltr"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* SNI */}
      {isSslMode && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-emerald-400 font-bold">
                {isAr ? 'نطاق الهوست (SNI)' : 'SNI'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {isAr ? 'نفق TLS مشفر مع تحديد اسم السيرفر' : 'TLS tunnel with Server Name Indication'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={sniEnabled}
              onChange={(e) => setSniEnabled(e.target.checked)}
              className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
            />
          </div>
          {sniEnabled && (
            <input
              type="text"
              value={sniHost}
              onChange={(e) => setSniHost(e.target.value)}
              placeholder={isAr ? 'مثال: www.snapchat.com' : 'e.g. www.snapchat.com'}
              dir="ltr"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
            />
          )}
        </div>
      )}

      {/* HTTP Proxy */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-emerald-400 font-bold">
              {isAr ? 'بروكسي HTTP' : 'HTTP Proxy'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {isAr ? 'اختياري: تمرير الاتصال عبر خادم بروكسي' : 'Optional: Route through proxy server'}
            </div>
          </div>
          <input
            type="checkbox"
            checked={httpProxy}
            onChange={(e) => setHttpProxy(e.target.checked)}
            className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
          />
        </div>
        {httpProxy && (
          <input
            type="text"
            value={proxyHost}
            onChange={(e) => setProxyHost(e.target.value)}
            placeholder="proxy_host:proxy_port"
            dir="ltr"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
          />
        )}
      </div>

      {/* Custom Payload */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-emerald-400 font-bold">
              {isAr ? 'بايلود مخصص' : 'Custom Payload'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {isAr ? 'اختياري: حقن ترويسة HTTP' : 'Optional: HTTP injection payload'}
            </div>
          </div>
          <input
            type="checkbox"
            checked={customPayload}
            onChange={(e) => setCustomPayload(e.target.checked)}
            className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
          />
        </div>
        {customPayload && (
          <textarea
            rows={3}
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            dir="ltr"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
          />
        )}
      </div>

      <button
        onClick={handleConnect}
        className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-950"
      >
        {t.connect}
      </button>
    </div>
  );
};
