import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  CheckCircle2,
  XCircle,
  Globe,
  HelpCircle,
  Plus,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldCheck,
  X,
  ExternalLink,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import { ConnectionState, LanguageCode, ThemeAccent, VpnServer } from '../../types/vpn';
import { THEMES } from '../../utils/theme';

interface ServerAnalyzerProps {
  language: LanguageCode;
  themeAccent: ThemeAccent;
  servers: VpnServer[];
  onAddServer: (server: Omit<VpnServer, 'id'>) => void;
  onUpdateServerPing?: (serverId: string, ping: number) => void;
  connectionState: ConnectionState;
  onToggleConnect: () => void;
  isOnline: boolean;
  onRequestInternet: (reasonAr: string, reasonEn: string) => void;
  onBack: () => void;
  onOpenHelp?: (topic?: string) => void;
}

interface AnalyzerSiteItem {
  id: string;
  name: string;
  url: string;
  buildUrl?: (target: string) => string;
  descAr: string;
  descEn: string;
  tags: string[];
}

interface LiveProbeResult {
  host: string;
  port: number;
  online: boolean;
  latencyMs: number | null;
  resolvedIp: string | null;
  tcpConnected: boolean;
  tcpBanner: string | null;
  tlsConnected: boolean;
  tlsProtocol: string | null;
  cipherName: string | null;
  httpStatus: number | null;
  cdnProvider: string;
  error?: string;
}

const SERVER_ANALYZER_SITES: AnalyzerSiteItem[] = [
  {
    id: 'checkhost',
    name: 'Check-Host.net',
    url: 'https://check-host.net',
    buildUrl: (target) =>
      target
        ? `https://check-host.net/check-tcp?host=${encodeURIComponent(target)}`
        : 'https://check-host.net',
    descAr: 'فحص شامل لحالة السيرفر والمنافذ (TCP / Ping / HTTP) من عدة دول عالمية للتأكد هل السيرفر شغال أم لا.',
    descEn: 'Multi-location TCP, Ping, and HTTP check to verify if any server is online worldwide.',
    tags: ['TCP', 'Ping', 'HTTP'],
  },
  {
    id: 'pingpe',
    name: 'Ping.pe',
    url: 'https://ping.pe',
    buildUrl: (target) =>
      target ? `https://ping.pe/${encodeURIComponent(target.split(':')[0])}` : 'https://ping.pe',
    descAr: 'اختبار استقرار الاتصال والبينغ وفحص المنافذ المباشرة عبر أكثر من 30 عقدة عالمية.',
    descEn: 'Live ping, packet loss, and port reachability across 30+ global nodes.',
    tags: ['Ping', 'Port', 'Route'],
  },
  {
    id: 'yougetsignal',
    name: 'YouGetSignal Port Checker',
    url: 'https://www.yougetsignal.com/tools/open-ports/',
    descAr: 'تحليل المنافذ المفتوحة (22، 80، 443، 8080، 1194) والتأكد من أن المنفذ يستقبل الاتصالات.',
    descEn: 'Quickly verify whether open ports (22, 80, 443, 8080) accept inbound connections.',
    tags: ['Open Ports', 'SSH', 'VPN'],
  },
  {
    id: 'dnschecker',
    name: 'DNSChecker.org',
    url: 'https://dnschecker.org',
    buildUrl: (target) =>
      target
        ? `https://dnschecker.org/#A/${encodeURIComponent(target.split(':')[0])}`
        : 'https://dnschecker.org',
    descAr: 'فحص عناوين IP وسجلات DNS الخاصة بالسيرفر والنطاق من عشرات الخوادم حول العالم.',
    descEn: 'Check DNS propagation and server IP records across global resolvers.',
    tags: ['DNS', 'IP Lookup'],
  },
  {
    id: 'sslshopper',
    name: 'SSL Shopper Checker',
    url: 'https://www.sslshopper.com/ssl-checker.html',
    descAr: 'تحليل شهادة TLS/SSL وتوافق الـ SNI للسيرفرات العاملة عبر المنفذ 443 وV2Ray.',
    descEn: 'Inspect SSL/TLS certificates and SNI validity on port 443 and V2Ray hosts.',
    tags: ['SSL/TLS', 'SNI'],
  },
  {
    id: 'bgphe',
    name: 'BGP.he.net',
    url: 'https://bgp.he.net',
    buildUrl: (target) =>
      target
        ? `https://bgp.he.net/ip/${encodeURIComponent(target.split(':')[0])}`
        : 'https://bgp.he.net',
    descAr: 'تحليل مزود الاستضافة (ASN) والمسارات الشبكية وملكية عنوان IP السيرفر.',
    descEn: 'Analyze hosting ASN, network routing, and ownership of server IP addresses.',
    tags: ['ASN', 'IP Info'],
  },
  {
    id: 'mxtoolbox',
    name: 'MXToolbox SuperTool',
    url: 'https://mxtoolbox.com/SuperTool.aspx',
    descAr: 'أداة تحليل شاملة لفحص سمعة السيرفر، القوائم السوداء، واستجابة الشبكة.',
    descEn: 'Comprehensive server diagnostics for blacklist checks, DNS, and network response.',
    tags: ['Diagnostics', 'DNS'],
  },
  {
    id: 'cfradar',
    name: 'Cloudflare Radar',
    url: 'https://radar.cloudflare.com',
    descAr: 'مراقبة حالة الإنترنت ومسارات CDN وموثوقية التوجيه العالمية.',
    descEn: 'Monitor global internet routing, CDN reliability, and edge telemetry.',
    tags: ['CDN', 'Routing'],
  },
];

function extractHostAndPort(rawInput: string, fallbackPort: number): { host: string; port: number } {
  const trimmed = rawInput.trim();
  if (!trimmed) return { host: '', port: fallbackPort };

  if (trimmed.startsWith('vless://') || trimmed.startsWith('trojan://')) {
    try {
      const u = new URL(trimmed);
      return { host: u.hostname, port: Number(u.port) || fallbackPort };
    } catch {
      // fall through
    }
  }

  if (trimmed.startsWith('vmess://')) {
    try {
      const parsed = JSON.parse(decodeURIComponent(escape(atob(trimmed.replace('vmess://', '')))));
      if (parsed?.add) {
        return { host: String(parsed.add), port: Number(parsed.port) || fallbackPort };
      }
    } catch {
      // fall through
    }
  }

  const cleaned = trimmed.replace(/^https?:\/\//i, '').split('/')[0];
  const lastColon = cleaned.lastIndexOf(':');
  if (lastColon > 0 && !cleaned.includes(']')) {
    const maybePort = parseInt(cleaned.slice(lastColon + 1), 10);
    if (!Number.isNaN(maybePort) && maybePort > 0 && maybePort <= 65535) {
      return { host: cleaned.slice(0, lastColon), port: maybePort };
    }
  }
  return { host: cleaned, port: fallbackPort };
}

export const ServerAnalyzer: React.FC<ServerAnalyzerProps> = ({
  language,
  themeAccent,
  servers,
  onAddServer,
  onUpdateServerPing,
  connectionState,
  onToggleConnect,
  isOnline,
  onRequestInternet,
  onBack,
  onOpenHelp,
}) => {
  const isAr = language === 'ar';
  const theme = THEMES[themeAccent] || THEMES.teal;
  const isVpnConnected = connectionState === 'connected';
  const isVpnConnecting = connectionState === 'connecting';

  const [activeTab, setActiveTab] = useState<'live' | 'sites'>('live');
  const [targetInput, setTargetInput] = useState(servers[0]?.ip || '185.220.101.45:443');
  const [portInput, setPortInput] = useState('443');
  const [isCheckingSingle, setIsCheckingSingle] = useState(false);
  const [singleResult, setSingleResult] = useState<LiveProbeResult | null>(null);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Batch check state for all app servers
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [serverStatuses, setServerStatuses] = useState<
    Record<string, { checking?: boolean; online?: boolean; latencyMs?: number | null; error?: string }>
  >({});

  // In-app browser overlay for analyzer sites
  const [activeSite, setActiveSite] = useState<AnalyzerSiteItem | null>(null);
  const [activeSiteUrl, setActiveSiteUrl] = useState('');
  const [liteMode, setLiteMode] = useState(true);
  const [browserMode, setBrowserMode] = useState<'proxy' | 'direct'>('proxy');
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoadingFrame, setIsLoadingFrame] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const probeHost = async (rawHost: string, rawPort: number): Promise<LiveProbeResult> => {
    const resp = await fetch(
      `/api/check-host?host=${encodeURIComponent(rawHost)}&port=${rawPort}&method=HEAD`
    );
    const data = await resp.json();

    if (!data.ok) {
      return {
        host: rawHost,
        port: rawPort,
        online: false,
        latencyMs: null,
        resolvedIp: null,
        tcpConnected: false,
        tcpBanner: null,
        tlsConnected: false,
        tlsProtocol: null,
        cipherName: null,
        httpStatus: null,
        cdnProvider: '-',
        error: data.error || (isAr ? 'تعذر الوصول إلى السيرفر' : 'Host unreachable'),
      };
    }

    const tcpConnected = Boolean(data.tcp?.connected);
    const tlsConnected = Boolean(data.tls?.connected);
    const online = tcpConnected || tlsConnected;
    const latency =
      tlsConnected && typeof data.tls?.latencyMs === 'number'
        ? data.tls.latencyMs
        : tcpConnected && typeof data.tcp?.latencyMs === 'number'
        ? data.tcp.latencyMs
        : data.http?.latencyMs ?? null;

    return {
      host: data.host || rawHost,
      port: data.port || rawPort,
      online,
      latencyMs: latency,
      resolvedIp: (data.ipv4 && data.ipv4[0]) || (data.ipv6 && data.ipv6[0]) || null,
      tcpConnected,
      tcpBanner: data.tcp?.banner || null,
      tlsConnected,
      tlsProtocol: data.tls?.protocol || null,
      cipherName: data.tls?.cipherName || null,
      httpStatus: data.http?.status ?? null,
      cdnProvider: data.http?.cdnProvider || 'Direct',
      error: !online ? data.tcp?.error || data.tls?.error || (isAr ? 'المنفذ مغلق أو انتهت المهلة' : 'Port closed or timed out') : undefined,
    };
  };

  const handleCheckSingle = async () => {
    const fallbackPort = Math.max(1, Math.min(65535, parseInt(portInput, 10) || 443));
    const { host, port } = extractHostAndPort(targetInput, fallbackPort);
    if (!host) return;

    setPortInput(String(port));
    setIsCheckingSingle(true);
    setAddedFeedback(false);
    setSingleResult(null);

    try {
      const res = await probeHost(host, port);
      setSingleResult(res);
    } catch (err) {
      setSingleResult({
        host,
        port,
        online: false,
        latencyMs: null,
        resolvedIp: null,
        tcpConnected: false,
        tcpBanner: null,
        tlsConnected: false,
        tlsProtocol: null,
        cipherName: null,
        httpStatus: null,
        cdnProvider: '-',
        error: err instanceof Error ? err.message : isAr ? 'فشل فحص الشبكة' : 'Network check failed',
      });
    } finally {
      setIsCheckingSingle(false);
    }
  };

  const handleCheckOneAppServer = async (srv: VpnServer) => {
    const { host, port } = extractHostAndPort(srv.ip, 443);
    setServerStatuses((prev) => ({ ...prev, [srv.id]: { checking: true } }));
    try {
      const res = await probeHost(host, port);
      setServerStatuses((prev) => ({
        ...prev,
        [srv.id]: {
          checking: false,
          online: res.online,
          latencyMs: res.latencyMs,
          error: res.error,
        },
      }));
      if (res.online && typeof res.latencyMs === 'number' && onUpdateServerPing) {
        onUpdateServerPing(srv.id, res.latencyMs);
      }
    } catch {
      setServerStatuses((prev) => ({
        ...prev,
        [srv.id]: { checking: false, online: false, error: isAr ? 'خطأ اتصال' : 'Error' },
      }));
    }
  };

  const handleCheckAllAppServers = async () => {
    setIsCheckingAll(true);
    for (const srv of servers) {
      await handleCheckOneAppServer(srv);
    }
    setIsCheckingAll(false);
  };

  const handleSaveCheckedServer = () => {
    if (!singleResult) return;
    onAddServer({
      name: `${singleResult.host} #${singleResult.port}`,
      country: singleResult.cdnProvider && singleResult.cdnProvider !== 'Direct / Unknown Edge'
        ? singleResult.cdnProvider
        : isAr ? 'سيرفر مفحوص' : 'Verified Server',
      city: singleResult.resolvedIp || singleResult.host,
      countryCode: 'CUSTOM',
      flag: singleResult.online ? '🟢' : '🌐',
      ip: `${singleResult.host}:${singleResult.port}`,
      ping: singleResult.latencyMs ?? 45,
      load: 15,
      type: singleResult.tlsConnected ? 'TLS / SNI' : `TCP :${singleResult.port}`,
      speed: 'Custom Checked',
      isCustom: true,
    });
    setAddedFeedback(true);
  };

  const openAnalyzerSite = (site: AnalyzerSiteItem) => {
    if (!isOnline && !isVpnConnected) {
      onRequestInternet(
        `فتح موقع "${site.name}" يتطلب اتصالاً بالإنترنت أو تفعيل VPN التطبيق.`,
        `Opening "${site.name}" requires internet access or active VPN.`
      );
      return;
    }
    const { host, port } = extractHostAndPort(targetInput, parseInt(portInput, 10) || 443);
    const targetParam = host ? `${host}:${port}` : '';
    const finalUrl = site.buildUrl ? site.buildUrl(targetParam) : site.url;
    setActiveSite(site);
    setActiveSiteUrl(finalUrl);
    setBrowserMode('proxy');
    setIsLoadingFrame(true);
    setIframeKey((k) => k + 1);
  };

  const iframeSrc = activeSite
    ? browserMode === 'proxy'
      ? `/api/web-proxy?url=${encodeURIComponent(activeSiteUrl)}&lite=${liteMode ? '1' : '0'}&vpn=${isVpnConnected ? '1' : '0'}`
      : activeSiteUrl
    : '';

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10 font-sans animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-all"
            aria-label={isAr ? 'رجوع' : 'Back'}
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          <div>
            <h2 className={`text-sm font-bold font-mono ${theme.textClass} flex items-center gap-2`}>
              <Activity className="w-4 h-4" />
              <span>{isAr ? 'محلل السيرفرات (هل شغال أم لا)' : 'Server Status & Sites Analyzer'}</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {isAr
                ? 'فحص فوري لعمل السيرفرات والمنافذ + مواقع التحليل العالمية'
                : 'Live TCP/TLS server check + global analysis websites'}
            </p>
          </div>
        </div>

        {onOpenHelp && (
          <button
            type="button"
            onClick={() => onOpenHelp('diagnostic')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${theme.bgSoftClass} border ${theme.borderClass} ${theme.textLightClass} transition-all text-xs font-mono font-bold shrink-0`}
          >
            <HelpCircle className={`w-4 h-4 ${theme.textClass}`} />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      {/* Mode Switch Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('live')}
          className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'live'
              ? `${theme.solidBgClass} ${theme.solidTextClass} shadow-sm`
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{isAr ? 'فحص السيرفرات المباشر' : 'Live Server Check'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sites')}
          className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'sites'
              ? `${theme.solidBgClass} ${theme.solidTextClass} shadow-sm`
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isAr ? `مواقع التحليل (${SERVER_ANALYZER_SITES.length})` : `Analyzer Sites (${SERVER_ANALYZER_SITES.length})`}</span>
        </button>
      </div>

      {/* Target Server Input Card (Shared across Live Check & Analyzer Sites) */}
      <div className="p-4 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold font-mono ${theme.textClass} flex items-center gap-1.5`}>
            <Search className="w-3.5 h-3.5" />
            <span>{isAr ? 'أدخل السيرفر أو IP أو رابط vless:// للفحص:' : 'Target Server IP, Domain, or URI:'}</span>
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <input
            type="text"
            dir="ltr"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            placeholder="185.220.101.45:443"
            className="col-span-3 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-slate-600"
          />
          <input
            type="number"
            dir="ltr"
            value={portInput}
            onChange={(e) => setPortInput(e.target.value)}
            placeholder="443"
            className="col-span-1 px-2.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono text-center focus:outline-none focus:border-slate-600"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap text-[10px] font-mono">
          {['443', '80', '22', '8080', '1194'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPortInput(p)}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                portInput === p
                  ? `${theme.bgSoftClass} ${theme.borderActiveClass} ${theme.textLightClass}`
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Port {p}
            </button>
          ))}
        </div>

        {activeTab === 'live' && (
          <button
            type="button"
            onClick={handleCheckSingle}
            disabled={isCheckingSingle || !targetInput.trim()}
            className={`w-full py-3 rounded-xl ${theme.buttonClass} disabled:opacity-50 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all`}
          >
            {isCheckingSingle ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
            <span>
              {isCheckingSingle
                ? (isAr ? 'جاري فحص السيرفر الآن...' : 'Checking server...')
                : (isAr ? 'فحص الآن — هل السيرفر شغال؟' : 'Check Now — Is Server Working?')}
            </span>
          </button>
        )}
      </div>

      {/* TAB 1: LIVE SERVER PROBE & APP SERVERS BATCH TEST */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          {singleResult && (
            <div
              className={`p-4 rounded-2xl border space-y-3 animate-fade-in ${
                singleResult.online
                  ? `${theme.bgDeepClass} ${theme.borderActiveClass}`
                  : 'bg-rose-950/30 border-rose-500/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {singleResult.online ? (
                    <CheckCircle2 className={`w-5 h-5 ${theme.textClass} shrink-0`} />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-extrabold text-white font-mono">
                      {singleResult.online
                        ? (isAr ? 'السيرفر شغال ويستجيب ✓' : 'Server is ONLINE ✓')
                        : (isAr ? 'السيرفر متوقف أو المنفذ مغلق ✕' : 'Server OFFLINE / Closed ✕')}
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono" dir="ltr">
                      {singleResult.host}:{singleResult.port}
                      {singleResult.resolvedIp ? ` (${singleResult.resolvedIp})` : ''}
                    </div>
                  </div>
                </div>

                {typeof singleResult.latencyMs === 'number' && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${theme.solidBgClass} ${theme.solidTextClass}`}>
                    {singleResult.latencyMs} ms
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-400">{isAr ? 'اتصال TCP:' : 'TCP Port:'}</div>
                  <div className={singleResult.tcpConnected ? `${theme.textLightClass} font-bold` : 'text-rose-300 font-bold'}>
                    {singleResult.tcpConnected ? (isAr ? 'مفتوح وشغال' : 'OPEN') : (isAr ? 'مغلق' : 'CLOSED')}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-400">{isAr ? 'تشفير TLS/SSL:' : 'TLS / SSL:'}</div>
                  <div className={singleResult.tlsConnected ? `${theme.textLightClass} font-bold` : 'text-slate-300'}>
                    {singleResult.tlsConnected
                      ? `${singleResult.tlsProtocol || 'TLS'} ✓`
                      : (isAr ? 'غير مفعل' : 'None')}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-400">{isAr ? 'المزود / CDN:' : 'Provider:'}</div>
                  <div className="text-slate-200 truncate">{singleResult.cdnProvider}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-400">{isAr ? 'حالة HTTP:' : 'HTTP:'}</div>
                  <div className="text-slate-200">{singleResult.httpStatus ?? '-'}</div>
                </div>
              </div>

              {singleResult.tcpBanner && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 break-all" dir="ltr">
                  Banner: {singleResult.tcpBanner}
                </div>
              )}

              {singleResult.error && !singleResult.online && (
                <div className="text-[11px] font-mono text-rose-300">
                  {isAr ? `السبب: ${singleResult.error}` : `Reason: ${singleResult.error}`}
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveCheckedServer}
                disabled={addedFeedback}
                className={`w-full py-2.5 rounded-xl border font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  addedFeedback
                    ? `${theme.bgSoftClass} ${theme.borderActiveClass} ${theme.textLightClass}`
                    : `${theme.solidBgClass} ${theme.solidHoverClass} ${theme.solidTextClass} border-transparent`
                }`}
              >
                {addedFeedback ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>
                  {addedFeedback
                    ? (isAr ? 'تمت إضافة السيرفر لقائمة التطبيق ✓' : 'Added to App Servers ✓')
                    : (isAr ? 'إضافة هذا السيرفر إلى سيرفرات التطبيق' : 'Add to App Servers')}
                </span>
              </button>
            </div>
          )}

          {/* Batch check for App Servers */}
          <div className="p-4 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Server className={`w-4 h-4 ${theme.textClass}`} />
                <span className="text-xs font-bold text-white font-mono">
                  {isAr ? `فحص سيرفرات التطبيق (${servers.length})` : `App Servers Health (${servers.length})`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckAllAppServers}
                disabled={isCheckingAll}
                className={`px-3 py-1.5 rounded-xl ${theme.solidBgClass} ${theme.solidHoverClass} ${theme.solidTextClass} text-[11px] font-mono font-bold flex items-center gap-1.5 active:scale-95 transition-all`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingAll ? 'animate-spin' : ''}`} />
                <span>{isCheckingAll ? (isAr ? 'جاري الفحص...' : 'Checking...') : (isAr ? 'فحص الكل' : 'Check All')}</span>
              </button>
            </div>

            <div className="space-y-2">
              {servers.map((srv) => {
                const st = serverStatuses[srv.id];
                return (
                  <div
                    key={srv.id}
                    className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{srv.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{srv.name}</span>
                          {srv.isCustom && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${theme.bgSoftClass} ${theme.textLightClass} font-mono`}>
                              {isAr ? 'مخصص' : 'Custom'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate" dir="ltr">
                          {srv.ip}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {st?.online === true && (
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${theme.bgSoftClass} ${theme.textLightClass}`}>
                          {isAr ? `شغال · ${st.latencyMs ?? srv.ping}ms` : `ON · ${st.latencyMs ?? srv.ping}ms`}
                        </span>
                      )}
                      {st?.online === false && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          {isAr ? 'متوقف' : 'OFF'}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCheckOneAppServer(srv)}
                        disabled={st?.checking}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-[10px] font-mono font-bold text-slate-200"
                      >
                        {st?.checking ? '...' : (isAr ? 'فحص' : 'Test')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXTERNAL SERVER ANALYZER SITES (IN-APP VIEWER) */}
      {activeTab === 'sites' && (
        <div className="space-y-3">
          {SERVER_ANALYZER_SITES.map((site) => (
            <div
              key={site.id}
              className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 hover:border-slate-700 space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {site.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className={`text-sm font-extrabold font-mono ${theme.textClass}`} dir="ltr">
                  {site.name}
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr ? site.descAr : site.descEn}
              </p>

              <button
                type="button"
                onClick={() => openAnalyzerSite(site)}
                className={`w-full py-2.5 px-4 rounded-xl ${theme.solidBgClass} ${theme.solidHoverClass} ${theme.solidTextClass} font-bold text-xs flex items-center justify-center gap-2 shadow active:scale-95 transition-all`}
              >
                <Globe className="w-4 h-4" />
                <span>{isAr ? 'تحليل السيرفر عبر الموقع داخل التطبيق' : 'Analyze Server in App'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* IN-APP ANALYZER SITE OVERLAY */}
      {activeSite && (
        <div className="fixed inset-0 z-50 bg-[#070b14] flex flex-col animate-fade-in max-w-md mx-auto border-x border-slate-800 shadow-2xl">
          <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSite(null);
                    setIsLoadingFrame(false);
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:scale-95 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <div className={`text-xs font-extrabold font-mono ${theme.textClass} truncate`} dir="ltr">
                    {activeSite.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate" dir="ltr">
                    {activeSiteUrl}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onToggleConnect}
                  disabled={isVpnConnecting}
                  className={`px-2.5 py-1.5 rounded-xl border font-mono text-[10px] font-bold flex items-center gap-1 ${
                    isVpnConnected
                      ? `${theme.solidBgClass} ${theme.solidTextClass} ${theme.borderActiveClass}`
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  {isVpnConnected ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                  <span>{isVpnConnected ? 'VPN ✓' : 'VPN'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeSiteUrl);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 1800);
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                >
                  {copiedUrl ? <Check className={`w-4 h-4 ${theme.textClass}`} /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoadingFrame(true);
                    setIframeKey((k) => k + 1);
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingFrame ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setBrowserMode('proxy');
                    setIsLoadingFrame(true);
                    setIframeKey((k) => k + 1);
                  }}
                  className={`px-2.5 py-1 rounded-lg border font-bold ${
                    browserMode === 'proxy'
                      ? `${theme.solidBgClass} ${theme.solidTextClass} ${theme.borderActiveClass}`
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {isAr ? 'عرض مدمج' : 'In-App'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBrowserMode('direct');
                    setIsLoadingFrame(true);
                    setIframeKey((k) => k + 1);
                  }}
                  className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 ${
                    browserMode === 'direct'
                      ? `${theme.solidBgClass} ${theme.solidTextClass} ${theme.borderActiveClass}`
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{isAr ? 'مباشر' : 'Direct'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLiteMode((p) => !p);
                  setBrowserMode('proxy');
                  setIsLoadingFrame(true);
                  setIframeKey((k) => k + 1);
                }}
                className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 ${
                  liteMode
                    ? `${theme.bgSoftClass} ${theme.borderActiveClass} ${theme.textLightClass}`
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{liteMode ? (isAr ? 'وضع خفيف' : 'Lite Mode') : (isAr ? 'كامل' : 'Full')}</span>
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-white overflow-hidden">
            {isLoadingFrame && (
              <div className="absolute inset-0 z-10 bg-[#070b14]/90 flex flex-col items-center justify-center gap-3 text-slate-300 pointer-events-none">
                <RefreshCw className={`w-8 h-8 ${theme.textClass} animate-spin`} />
                <div className="text-xs font-mono font-bold">
                  {isAr ? `جاري فتح ${activeSite.name}...` : `Loading ${activeSite.name}...`}
                </div>
              </div>
            )}
            <iframe
              key={iframeKey}
              src={iframeSrc}
              title={activeSite.name}
              onLoad={() => setIsLoadingFrame(false)}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-forms allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
};
