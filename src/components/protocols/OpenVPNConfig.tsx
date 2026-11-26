import React, { useState } from 'react';
import { Shield, Globe, FolderOpen, ArrowLeft, HelpCircle } from 'lucide-react';
import { OpenVPNConfigData, ThemeAccent, LanguageCode } from '../../types/vpn';
import { translations } from '../../utils/translations';

interface OpenVPNConfigProps {
  isSslMode: boolean;
  onSaveAndConnect: (config: OpenVPNConfigData) => void;
  onOpenHelp?: (topic?: string) => void;
  onBack?: () => void;
  themeAccent: ThemeAccent;
  language: LanguageCode;
}

export const OpenVPNConfig: React.FC<OpenVPNConfigProps> = ({
  isSslMode,
  onSaveAndConnect,
  onOpenHelp,
  onBack,
  language,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  const [profileName, setProfileName] = useState('arna_vpn_fast.ovpn');
  const [remoteOverride, setRemoteOverride] = useState(false);
  const [remoteHost, setRemoteHost] = useState('149.202.88.19:1194');
  const [authCredentials, setAuthCredentials] = useState(true);
  const [username, setUsername] = useState('arna_client');
  const [password, setPassword] = useState('secure_tunnel_pass');
  const [sni, setSni] = useState(isSslMode);
  const [sniHost, setSniHost] = useState('www.snapchat.com');
  const [httpProxy, setHttpProxy] = useState(false);
  const [proxyHost, setProxyHost] = useState('104.21.55.2:8080');
  const [payload, setPayload] = useState(false);
  const [payloadText, setPayloadText] = useState('CONNECT [host_port] [protocol][crlf]Host: [host][crlf][crlf]');

  const handleConnect = () => {
    onSaveAndConnect({
      profileName,
      ovpnContent: '# Arna OpenVPN Profile Data\nclient\ndev tun\nproto tcp\nremote 149.202.88.19 1194\nresolv-retry infinite\nnobind\npersist-key\npersist-tun\nauth-user-pass\n',
      remoteOverride,
      remoteHost,
      remotePort: 1194,
      authCredentials,
      username,
      password,
      httpProxy,
      proxyHost,
      proxyPort: 8080,
      payload,
      payloadText,
      sniEnabled: isSslMode ? sni : false,
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
            <Shield className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold font-mono text-emerald-400">
            {isAr ? (isSslMode ? 'نفق OpenVPN عبر SSL/TLS' : 'نفق OpenVPN المخصص') : isSslMode ? 'Custom SSL/TLS OVPN' : 'Custom OpenVPN'}
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

      {/* OVPN Profile Card */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'ملف تعريف OVPN' : 'OVPN Profile'}</div>
        <div className="text-[11px] text-slate-500 font-mono">
          {isAr ? 'اختر ملف تكوين .ovpn من جهازك' : 'Select your .ovpn configuration file'}
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 gap-2">
          <div className="flex items-center gap-2 truncate">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-mono text-slate-300 truncate">
              {profileName || (isAr ? 'لم يتم اختيار ملف' : 'No file selected')}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setProfileName('germany_premium.ovpn')}
              className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 flex items-center gap-1"
            >
              <Globe className="w-3 h-3" />
              <span>{t.online}</span>
            </button>
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.ovpn,.conf';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) setProfileName(file.name);
                };
                input.click();
              }}
              className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1"
            >
              <FolderOpen className="w-3 h-3" />
              <span>{t.browse}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Remote Override */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-emerald-400 font-bold">
              {isAr ? 'تخصيص عنوان السيرفر' : 'Remote Override'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {isAr ? 'استبدال عنوان ومنفذ السيرفر في ملف .ovpn' : 'Override remote host & port from .ovpn'}
            </div>
          </div>
          <input
            type="checkbox"
            checked={remoteOverride}
            onChange={(e) => setRemoteOverride(e.target.checked)}
            className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
          />
        </div>
        {remoteOverride && (
          <input
            type="text"
            value={remoteHost}
            onChange={(e) => setRemoteHost(e.target.value)}
            placeholder="host:port"
            dir="ltr"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
          />
        )}
      </div>

      {/* Auth Credentials */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-emerald-400 font-bold">
              {isAr ? 'بيانات الدخول' : 'Auth Credentials'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {isAr ? 'إدخال اسم المستخدم وكلمة المرور تلقائياً' : 'Inject username & password'}
            </div>
          </div>
          <input
            type="checkbox"
            checked={authCredentials}
            onChange={(e) => setAuthCredentials(e.target.checked)}
            className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
          />
        </div>
        {authCredentials && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isAr ? 'اسم المستخدم' : 'Username'}
              dir="ltr"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isAr ? 'كلمة المرور' : 'Password'}
              dir="ltr"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
            />
          </div>
        )}
      </div>

      {/* SNI */}
      {isSslMode && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'نطاق الهوست (SNI)' : 'SNI'}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                {isAr ? 'نفق TLS مشفر مع تحديد اسم السيرفر' : 'TLS tunnel with Server Name Indication'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={sni}
              onChange={(e) => setSni(e.target.checked)}
              className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
            />
          </div>
          {sni && (
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
            <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'بروكسي HTTP' : 'HTTP Proxy'}</div>
            <div className="text-[11px] text-slate-500 font-mono">
              {isAr ? 'تمرير الاتصال عبر خادم بروكسي' : 'Route through proxy server'}
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

      {/* Payload */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'البايلود' : 'Payload'}</div>
            <div className="text-[11px] text-slate-500 font-mono">
              {isAr ? 'حقن ترويسة HTTP' : 'HTTP injection payload'}
            </div>
          </div>
          <input
            type="checkbox"
            checked={payload}
            onChange={(e) => setPayload(e.target.checked)}
            className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
          />
        </div>
        {payload && (
          <textarea
            rows={2}
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
