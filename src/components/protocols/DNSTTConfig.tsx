import React, { useState } from 'react';
import { DNSTTConfigData, ThemeAccent, LanguageCode } from '../../types/vpn';
import { translations } from '../../utils/translations';
import { ChevronDown, ArrowLeft, HelpCircle, Radio } from 'lucide-react';

interface DNSTTConfigProps {
  onSaveAndConnect: (config: DNSTTConfigData) => void;
  onOpenHelp?: (topic?: string) => void;
  onBack?: () => void;
  themeAccent: ThemeAccent;
  language: LanguageCode;
}

export const DNSTTConfig: React.FC<DNSTTConfigProps> = ({
  onSaveAndConnect,
  onOpenHelp,
  onBack,
  language,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  const [serverString, setServerString] = useState('dnstt.abrtunnel.net:22@abr_dns:secret99');
  const [dnsResolver, setDnsResolver] = useState('Cloudflare DNS (UDP) - 1.1.1.1');
  const [nameserver, setNameserver] = useState('dns.abrtunnel.net');
  const [publicKey, setPublicKey] = useState('c64d28e4695b2d718915ae52723c34f20bf803b30');

  const handleConnect = () => {
    onSaveAndConnect({
      server: serverString,
      port: 22,
      username: serverString.split('@')[1]?.split(':')[0] || 'abr_dns',
      password: serverString.split('@')[1]?.split(':')[1] || 'secret99',
      dnsResolver,
      dnsResolverCustom: '',
      nameserver,
      publicKey,
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
            <Radio className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold font-mono text-emerald-400">
            {isAr ? 'نفق DNSTT عبر DNS' : 'Custom DNSTT'}
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

      {/* SSH Server */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'خادم SSH' : 'SSH Server'}</div>
        <div className="text-[11px] text-slate-500 font-mono">
          {isAr ? 'الصيغة: host:port@username:password' : 'Format: host:port@username:password'}
        </div>
        <input
          type="text"
          value={serverString}
          onChange={(e) => setServerString(e.target.value)}
          placeholder="host:port@user:pass"
          dir="ltr"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* DNS Resolver */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'محلل النطاقات (DNS Resolver)' : 'DNS Resolver'}</div>
        <div className="text-[11px] text-slate-500 font-mono">
          {isAr ? 'المسار المستخدم لتمرير نفق DNSTT' : 'Transport used by the DNSTT tunnel'}
        </div>
        <div className="relative">
          <select
            value={dnsResolver}
            onChange={(e) => setDnsResolver(e.target.value)}
            dir="ltr"
            className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono cursor-pointer focus:border-emerald-500 focus:outline-none"
          >
            <option>Cloudflare DNS (UDP) - 1.1.1.1</option>
            <option>Google DNS (UDP) - 8.8.8.8</option>
            <option>Quad9 DNS (UDP) - 9.9.9.9</option>
            <option>AdGuard DNS (UDP) - 94.140.14.14</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* DNSTT Nameserver */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'خادم الأسماء (Nameserver)' : 'DNSTT Nameserver'}</div>
        <div className="text-[11px] text-slate-500 font-mono">
          {isAr ? 'النطاق المرتبط بخادم DNSTT' : 'Domain that points to the DNSTT server'}
        </div>
        <input
          type="text"
          value={nameserver}
          onChange={(e) => setNameserver(e.target.value)}
          placeholder="dns.example.com"
          dir="ltr"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* DNSTT Public Key */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'المفتاح العام (Public Key)' : 'DNSTT Public Key'}</div>
        <div className="text-[11px] text-slate-500 font-mono">
          {isAr ? 'مفتاح الخادم بصيغة Hex' : 'Server public key (hex)'}
        </div>
        <input
          type="text"
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
          placeholder="0123456789abcdef..."
          dir="ltr"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
        />
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
