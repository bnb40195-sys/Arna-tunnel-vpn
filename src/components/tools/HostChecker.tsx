import React, { useState } from 'react';
import { Play, ChevronDown, ArrowLeft, HelpCircle, Search } from 'lucide-react';
import { LanguageCode, ThemeAccent } from '../../types/vpn';

interface HostCheckerProps {
  language: LanguageCode;
  themeAccent: ThemeAccent;
  onBack?: () => void;
  onOpenHelp?: (topic?: string) => void;
}

export const HostChecker: React.FC<HostCheckerProps> = ({ language, onBack, onOpenHelp }) => {
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'headers' | 'sni' | 'ip' | 'cdn'>('headers');
  const [url, setUrl] = useState('www.snapchat.com');
  const [method, setMethod] = useState('GET');
  const [usePort, setUsePort] = useState(false);
  const [portInput, setPortInput] = useState('443');
  const [checking, setChecking] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  const handleCheck = async () => {
    const cleanHost = url.trim();
    if (!cleanHost) return;
    setChecking(true);
    setOutput(isAr ? `جاري فحص النطاق الحقيقي ${cleanHost}...` : `Probing live host ${cleanHost}...`);

    const portNum = usePort ? Math.max(1, Math.min(65535, parseInt(portInput, 10) || 443)) : 443;

    try {
      const resp = await fetch(
        `/api/check-host?host=${encodeURIComponent(cleanHost)}&port=${portNum}&method=${encodeURIComponent(method)}`
      );
      const data = await resp.json();

      if (!data.ok) {
        setOutput(
          isAr
            ? `فشل الفحص الحقيقي للنطاق ${cleanHost}:\nالسبب: ${data.error || 'غير قابل للوصول'}`
            : `Live probe failed for ${cleanHost}:\nReason: ${data.error || 'Unreachable'}`
        );
        return;
      }

      if (activeTab === 'headers') {
        const hdrLines = Object.entries(data.http?.headers || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n');
        setOutput(
          isAr
            ? `نتيجة الفحص الحقيقي (${data.host}):\nالحالة HTTP: ${data.http?.status ?? 'غير متاح'} ${data.http?.statusText || ''}\nزمن استجابة HTTP: ${data.http?.latencyMs ?? '-'} مللي ثانية\nمزود الشبكة: ${data.http?.cdnProvider}\nالترويسات المستلمة:\n${hdrLines || 'لا توجد ترويسات إضافية'}`
            : `Live HTTP Result (${data.host}):\nStatus: ${data.http?.status ?? 'N/A'} ${data.http?.statusText || ''}\nHTTP Latency: ${data.http?.latencyMs ?? '-'} ms\nEdge/Server: ${data.http?.cdnProvider}\nHeaders:\n${hdrLines || 'None'}`
        );
      } else if (activeTab === 'sni') {
        const tls = data.tls;
        if (!tls?.connected) {
          setOutput(
            isAr
              ? `فشلت مصافحة TLS على المنفذ ${data.port}:\n${tls?.error || 'تعذر الاتصال'}`
              : `TLS Handshake failed on port ${data.port}:\n${tls?.error || 'Connection failed'}`
          );
        } else {
          setOutput(
            isAr
              ? `نجحت مصافحة TLS الحقيقية على المنفذ ${data.port}!\nنطاق SNI: ${data.host}\nالبروتوكول: ${tls.protocol || '-'}\nالتشفير: ${tls.cipherName || '-'}\nALPN: ${tls.alpnProtocol || '-'}\nزمن المصافحة: ${tls.latencyMs} مللي ثانية\nالشهادة (CN): ${tls.subjectCn || '-'}\nالمُصدر: ${tls.issuer || '-'}\nتنتهي في: ${tls.validTo || '-'}`
              : `Real TLS Handshake Succeeded (Port ${data.port})!\nSNI: ${data.host}\nProtocol: ${tls.protocol || '-'}\nCipher: ${tls.cipherName || '-'}\nALPN: ${tls.alpnProtocol || '-'}\nHandshake RTT: ${tls.latencyMs} ms\nCert CN: ${tls.subjectCn || '-'}\nIssuer: ${tls.issuer || '-'}\nExpires: ${tls.validTo || '-'}`
          );
        }
      } else if (activeTab === 'ip') {
        setOutput(
          isAr
            ? `سجلات DNS الحقيقية للنطاق ${data.host}:\nزمن DNS: ${data.dnsMs} مللي ثانية\nعناوين IPv4:\n${(data.ipv4 || []).join('\n') || 'لا يوجد'}\n\nعناوين IPv6:\n${(data.ipv6 || []).join('\n') || 'لا يوجد'}\n\nسجلات CNAME:\n${(data.cnames || []).join('\n') || 'لا يوجد'}`
            : `Real DNS Records for ${data.host} (${data.dnsMs} ms):\nIPv4:\n${(data.ipv4 || []).join('\n') || 'None'}\n\nIPv6:\n${(data.ipv6 || []).join('\n') || 'None'}\n\nCNAME:\n${(data.cnames || []).join('\n') || 'None'}`
        );
      } else {
        setOutput(
          isAr
            ? `تحليل الشبكة و الـ CDN الحقيقي:\nالنطاق: ${data.host}\nأول IP مستضاف: ${(data.ipv4 || [])[0] || (data.ipv6 || [])[0] || '-'}\nالمزود المكتشف: ${data.http?.cdnProvider}\nاستجابة HTTP: ${data.http?.status ?? 'غير متاح'}\nمصافحة TLS: ${data.tls?.connected ? `ناجحة (${data.tls.latencyMs}ms)` : 'غير متصلة'}\nدعم WebSocket/CDN المحتمل: ${data.http?.websocketCapable ? 'نعم' : 'غير مؤكد'}`
            : `Real CDN & Edge Detection:\nHost: ${data.host}\nPrimary IP: ${(data.ipv4 || [])[0] || (data.ipv6 || [])[0] || '-'}\nDetected Provider: ${data.http?.cdnProvider}\nHTTP Status: ${data.http?.status ?? 'N/A'}\nTLS Probe: ${data.tls?.connected ? `OK (${data.tls.latencyMs}ms)` : 'Failed'}\nWebSocket/CDN Capable: ${data.http?.websocketCapable ? 'YES' : 'Unconfirmed'}`
        );
      }
    } catch (err) {
      setOutput(
        isAr
          ? `خطأ أثناء الفحص الحقيقي: ${err instanceof Error ? err.message : 'تحقق من اتصال الإنترنت'}`
          : `Probe error: ${err instanceof Error ? err.message : 'Check connection'}`
      );
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
            <Search className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold font-mono text-emerald-400">
            {isAr ? 'فاحص الهوست والـ SNI الحقيقي' : 'LIVE HOST & SNI CHECKER'}
          </h2>
        </div>

        {onOpenHelp && (
          <button
            onClick={() => onOpenHelp('payload')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all text-xs font-mono font-bold shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
        {(['headers', 'sni', 'ip', 'cdn'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === tab
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'headers'
              ? isAr
                ? 'الترويسات'
                : 'Headers'
              : tab === 'sni'
              ? 'SNI'
              : tab === 'ip'
              ? isAr
                ? 'فحص IP'
                : 'IP Lookup'
              : 'CDN'}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="www.snapchat.com"
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="relative w-28">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              dir="ltr"
              className="w-full appearance-none px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono cursor-pointer"
            >
              <option>GET</option>
              <option>HEAD</option>
              <option>OPTIONS</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Custom port toggle */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-mono text-slate-400">
            {isAr ? 'تحديد منفذ TLS مخصص (Port)' : 'Custom TLS Port'}
          </span>
          <input
            type="checkbox"
            checked={usePort}
            onChange={(e) => setUsePort(e.target.checked)}
            className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
          />
        </div>
        {usePort && (
          <input
            type="number"
            value={portInput}
            onChange={(e) => setPortInput(e.target.value)}
            placeholder="443"
            dir="ltr"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
          />
        )}

        <button
          onClick={handleCheck}
          disabled={checking}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all shadow-md"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{checking ? (isAr ? 'جاري الفحص الحقيقي...' : 'PROBING...') : isAr ? 'فحص حقيقي الآن' : 'CHECK LIVE'}</span>
        </button>
      </div>

      {/* Output */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[10px] font-mono text-slate-400">{isAr ? 'نتيجة الفحص المباشر' : 'live output'}</span>
          <div className="w-8" />
        </div>

        <div className="p-4 font-mono text-xs min-h-[160px] text-emerald-300 whitespace-pre-wrap leading-relaxed" dir="auto">
          {output ? (
            output
          ) : (
            <div className="flex flex-col items-center justify-center h-28 text-slate-600">
              <span className="text-sm mb-1">$ _</span>
              <span className="text-[11px]">
                {isAr ? 'أدخل النطاق واضغط للفحص الحقيقي عبر DNS/TLS/HTTP' : 'Enter a domain and press CHECK LIVE'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
