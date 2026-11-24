import React, { useState } from 'react';
import { Search, Globe, Server, ArrowLeft, HelpCircle } from 'lucide-react';
import { LanguageCode, ThemeAccent } from '../../types/vpn';

interface SameIPCheckerProps {
  language: LanguageCode;
  themeAccent: ThemeAccent;
  onBack?: () => void;
  onOpenHelp?: (topic?: string) => void;
}

export const SameIPChecker: React.FC<SameIPCheckerProps> = ({ language, onBack, onOpenHelp }) => {
  const isAr = language === 'ar';

  const [domain, setDomain] = useState('www.snapchat.com');
  const [ipAddress, setIpAddress] = useState('-');
  const [domainsFound, setDomainsFound] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheck = async () => {
    const clean = domain.trim();
    if (!clean) return;
    setChecking(true);
    setDomainsFound([]);
    setErrorMsg(null);
    setIpAddress('...');

    try {
      const resp = await fetch(`/api/check-host?host=${encodeURIComponent(clean)}&port=443&method=HEAD`);
      const data = await resp.json();

      if (!data.ok) {
        setIpAddress('-');
        setErrorMsg(data.error || (isAr ? 'تعذر فحص النطاق' : 'Host lookup failed'));
        return;
      }

      const primaryIp = (data.ipv4 && data.ipv4[0]) || (data.ipv6 && data.ipv6[0]) || '-';
      setIpAddress(primaryIp);

      const combined = Array.from(
        new Set<string>([
          ...(Array.isArray(data.sanDomains) ? data.sanDomains : []),
          ...(Array.isArray(data.cnames) ? data.cnames : []),
        ])
      );
      setDomainsFound(combined);
    } catch (err) {
      setIpAddress('-');
      setErrorMsg(err instanceof Error ? err.message : isAr ? 'تعذر الاتصال بالخادم' : 'Network error');
    } finally {
      setChecking(false);
    }
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
            <Server className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold font-mono text-emerald-400">
            {isAr ? 'فاحص النطاقات والشهادة (SAN / IP)' : 'REAL IP & SAN CHECKER'}
          </h2>
        </div>

        {onOpenHelp && (
          <button
            onClick={() => onOpenHelp('diagnostic')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all text-xs font-mono font-bold shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      {/* Top Stat Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 gap-4 text-center font-mono">
        <div className="border-e border-slate-800/80 pe-2">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>{isAr ? 'عنوان IP الحقيقي' : 'Resolved IP'}</span>
          </div>
          <div className="text-sm font-bold text-slate-200 truncate" dir="ltr">{ipAddress}</div>
        </div>

        <div className="ps-2">
          <div className="flex items-center justify-center gap-1.5 text-teal-400 text-xs mb-1">
            <Server className="w-3.5 h-3.5" />
            <span>{isAr ? 'النطاقات في الشهادة' : 'SAN Domains'}</span>
          </div>
          <div className="text-lg font-bold text-emerald-400">{domainsFound.length}</div>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder={isAr ? 'أدخل النطاق (مثال: www.snapchat.com)' : 'Enter domain (e.g., www.snapchat.com)'}
          dir="ltr"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
        />

        <button
          onClick={handleCheck}
          disabled={checking}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-md transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{checking ? (isAr ? 'جاري البحث الحقيقي...' : 'SCANNING...') : isAr ? 'فحص الـ IP والنطاقات المرتبطة' : 'CHECK REAL IP'}</span>
        </button>
      </div>

      {/* Result Window */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 min-h-[220px]">
        {errorMsg ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-rose-400 font-mono text-xs px-4">
            {errorMsg}
          </div>
        ) : domainsFound.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-slate-500 font-mono space-y-2">
            <Server className="w-8 h-8 text-slate-700" />
            <div className="text-xs text-slate-400">
              {isAr ? 'أدخل نطاقاً لاستخراج عنوان الـ IP والنطاقات المشتركة في شهادة TLS' : 'Enter a domain to inspect real TLS SAN domains'}
            </div>
          </div>
        ) : (
          <div className="space-y-2 font-mono">
            <div className="text-[11px] text-emerald-400 uppercase font-bold mb-2">
              {isAr ? `النطاقات المستخرجة من الشهادة الحقيقية (${domainsFound.length})` : `Real Certificate SAN Domains (${domainsFound.length})`}
            </div>
            {domainsFound.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 hover:border-emerald-500/40"
              >
                <span dir="ltr" className="truncate pe-2">{item}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">
                  TLS SAN
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
