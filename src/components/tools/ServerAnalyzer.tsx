import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Activity,
  CheckCircle2,
  XCircle,
  Globe,
  HelpCircle,
  Plus,
  RefreshCw,
  RotateCw,
  Search,
  Server,
  Shield,
  ShieldCheck,
  X,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Gauge,
  Play,
  ChevronDown,
  Lock
} from 'lucide-react';
import { ConnectionState, LanguageCode, ThemeAccent, VpnServer } from '../../types/vpn';
import { THEMES } from '../../utils/theme';

export type AnalyzerSectionTab = 'servers' | 'host_sni' | 'ip_san' | 'speed' | 'sites';

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
  initialTab?: AnalyzerSectionTab;
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
    descAr: 'فحص شامل لحالة السيرفر والمنافذ (TCP / Ping / HTTP) من عدة دول عالمية.',
    descEn: 'Multi-location TCP, Ping, and HTTP diagnostics across global nodes.',
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
    descAr: 'تحليل المنافذ المفتوحة (22، 80، 443، 8080، 1194) والتأكد من استقبال الاتصالات.',
    descEn: 'Verify whether open ports (22, 80, 443, 8080) accept inbound connections.',
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
  initialTab = 'servers',
}) => {
  const isAr = language === 'ar';
  const theme = THEMES[themeAccent] || THEMES.teal;
  const isVpnConnected = connectionState === 'connected';
  const isVpnConnecting = connectionState === 'connecting';

  const [activeTab, setActiveTab] = useState<AnalyzerSectionTab>(initialTab);
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // ---------------- TAB 1: SERVER PROBE STATE ----------------
  const [targetInput, setTargetInput] = useState(servers[0]?.ip || '185.220.101.45:443');
  const [portInput, setPortInput] = useState('443');
  const [isCheckingSingle, setIsCheckingSingle] = useState(false);
  const [singleResult, setSingleResult] = useState<LiveProbeResult | null>(null);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [serverStatuses, setServerStatuses] = useState<
    Record<string, { checking?: boolean; online?: boolean; latencyMs?: number | null; error?: string }>
  >({});

  // ---------------- TAB 2: SNI & HOST CHECKER STATE ----------------
  const [hostSubTab, setHostSubTab] = useState<'sni' | 'headers' | 'cdn'>('sni');
  const [hostUrl, setHostUrl] = useState('www.snapchat.com');
  const [hostMethod, setHostMethod] = useState('GET');
  const [useCustomHostPort, setUseCustomHostPort] = useState(false);
  const [hostPortInput, setHostPortInput] = useState('443');
  const [checkingHost, setCheckingHost] = useState(false);
  const [hostOutput, setHostOutput] = useState<string | null>(null);

  // ---------------- TAB 3: IP & SAN CHECKER STATE ----------------
  const [ipDomain, setIpDomain] = useState('www.snapchat.com');
  const [resolvedPrimaryIp, setResolvedPrimaryIp] = useState('-');
  const [dnsLatencyMs, setDnsLatencyMs] = useState<number | null>(null);
  const [ipv4List, setIpv4List] = useState<string[]>([]);
  const [ipv6List, setIpv6List] = useState<string[]>([]);
  const [cnameList, setCnameList] = useState<string[]>([]);
  const [sanDomainsFound, setSanDomainsFound] = useState<string[]>([]);
  const [checkingIp, setCheckingIp] = useState(false);
  const [ipErrorMsg, setIpErrorMsg] = useState<string | null>(null);

  // ---------------- TAB 4: INTERNET SPEED TEST STATE ----------------
  const [testingSpeed, setTestingSpeed] = useState(false);
  const [downloadMbps, setDownloadMbps] = useState(0);
  const [uploadMbps, setUploadMbps] = useState(0);
  const [speedPing, setSpeedPing] = useState(0);
  const [speedJitter, setSpeedJitter] = useState(0);
  const [speedStatusText, setSpeedStatusText] = useState(
    isAr ? 'جاهز لبدء قياس سرعة الإنترنت الحقيقي' : 'Ready for live speed test'
  );

  // ---------------- TAB 5: ANALYZER WEBSITES VIEWER STATE ----------------
  const [activeSite, setActiveSite] = useState<AnalyzerSiteItem | null>(null);
  const [activeSiteUrl, setActiveSiteUrl] = useState('');
  const [liteMode, setLiteMode] = useState(true);
  const [browserMode, setBrowserMode] = useState<'proxy' | 'direct'>('proxy');
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoadingFrame, setIsLoadingFrame] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // ---------------- HANDLERS: SERVERS ----------------
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
      country:
        singleResult.cdnProvider && singleResult.cdnProvider !== 'Direct / Unknown Edge'
          ? singleResult.cdnProvider
          : isAr
          ? 'سيرفر مفحوص'
          : 'Verified Server',
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

  // ---------------- HANDLER: SNI & HOST CHECKER ----------------
  const handleCheckHostSni = async () => {
    const cleanHost = hostUrl.trim();
    if (!cleanHost) return;
    setCheckingHost(true);
    setHostOutput(isAr ? `جاري فحص النطاق الحقيقي ${cleanHost}...` : `Probing live host ${cleanHost}...`);

    const portNum = useCustomHostPort ? Math.max(1, Math.min(65535, parseInt(hostPortInput, 10) || 443)) : 443;

    try {
      const resp = await fetch(
        `/api/check-host?host=${encodeURIComponent(cleanHost)}&port=${portNum}&method=${encodeURIComponent(hostMethod)}`
      );
      const data = await resp.json();

      if (!data.ok) {
        setHostOutput(
          isAr
            ? `فشل الفحص الحقيقي للنطاق ${cleanHost}:\nالسبب: ${data.error || 'غير قابل للوصول'}`
            : `Live probe failed for ${cleanHost}:\nReason: ${data.error || 'Unreachable'}`
        );
        return;
      }

      if (hostSubTab === 'sni') {
        const tls = data.tls;
        if (!tls?.connected) {
          setHostOutput(
            isAr
              ? `فشلت مصافحة TLS/SNI على المنفذ ${data.port}:\n${tls?.error || 'تعذر الاتصال'}`
              : `TLS/SNI Handshake failed on port ${data.port}:\n${tls?.error || 'Connection failed'}`
          );
        } else {
          setHostOutput(
            isAr
              ? `نجحت مصافحة SNI / TLS الحقيقية على المنفذ ${data.port}!\nنطاق SNI: ${data.host}\nالبروتوكول: ${tls.protocol || '-'}\nالتشفير: ${tls.cipherName || '-'}\nALPN: ${tls.alpnProtocol || '-'}\nزمن المصافحة: ${tls.latencyMs} مللي ثانية\nالشهادة (CN): ${tls.subjectCn || '-'}\nالمُصدر: ${tls.issuer || '-'}\nتنتهي في: ${tls.validTo || '-'}`
              : `Real SNI / TLS Handshake Succeeded (Port ${data.port})!\nSNI: ${data.host}\nProtocol: ${tls.protocol || '-'}\nCipher: ${tls.cipherName || '-'}\nALPN: ${tls.alpnProtocol || '-'}\nHandshake RTT: ${tls.latencyMs} ms\nCert CN: ${tls.subjectCn || '-'}\nIssuer: ${tls.issuer || '-'}\nExpires: ${tls.validTo || '-'}`
          );
        }
      } else if (hostSubTab === 'headers') {
        const hdrLines = Object.entries(data.http?.headers || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n');
        setHostOutput(
          isAr
            ? `نتيجة الترويسات الحقيقية (${data.host}):\nالحالة HTTP: ${data.http?.status ?? 'غير متاح'} ${data.http?.statusText || ''}\nزمن استجابة HTTP: ${data.http?.latencyMs ?? '-'} مللي ثانية\nمزود الشبكة: ${data.http?.cdnProvider}\nالترويسات المستلمة:\n${hdrLines || 'لا توجد ترويسات إضافية'}`
            : `Live HTTP Result (${data.host}):\nStatus: ${data.http?.status ?? 'N/A'} ${data.http?.statusText || ''}\nHTTP Latency: ${data.http?.latencyMs ?? '-'} ms\nEdge/Server: ${data.http?.cdnProvider}\nHeaders:\n${hdrLines || 'None'}`
        );
      } else {
        setHostOutput(
          isAr
            ? `تحليل الشبكة و الـ CDN الحقيقي:\nالنطاق: ${data.host}\nأول IP مستضاف: ${(data.ipv4 || [])[0] || (data.ipv6 || [])[0] || '-'}\nالمزود المكتشف: ${data.http?.cdnProvider}\nاستجابة HTTP: ${data.http?.status ?? 'غير متاح'}\nمصافحة TLS: ${data.tls?.connected ? `ناجحة (${data.tls.latencyMs}ms)` : 'غير متصلة'}\nدعم WebSocket / CDN: ${data.http?.websocketCapable ? 'نعم' : 'غير مؤكد'}`
            : `Real CDN & Edge Detection:\nHost: ${data.host}\nPrimary IP: ${(data.ipv4 || [])[0] || (data.ipv6 || [])[0] || '-'}\nDetected Provider: ${data.http?.cdnProvider}\nHTTP Status: ${data.http?.status ?? 'N/A'}\nTLS Probe: ${data.tls?.connected ? `OK (${data.tls.latencyMs}ms)` : 'Failed'}\nWebSocket/CDN Capable: ${data.http?.websocketCapable ? 'YES' : 'Unconfirmed'}`
        );
      }
    } catch (err) {
      setHostOutput(
        isAr
          ? `خطأ أثناء الفحص الحقيقي: ${err instanceof Error ? err.message : 'تحقق من اتصال الإنترنت'}`
          : `Probe error: ${err instanceof Error ? err.message : 'Check connection'}`
      );
    } finally {
      setCheckingHost(false);
    }
  };

  // ---------------- HANDLER: IP & SAN CHECKER ----------------
  const handleCheckIpAndSan = async () => {
    const clean = ipDomain.trim();
    if (!clean) return;
    setCheckingIp(true);
    setSanDomainsFound([]);
    setIpv4List([]);
    setIpv6List([]);
    setCnameList([]);
    setIpErrorMsg(null);
    setDnsLatencyMs(null);
    setResolvedPrimaryIp('...');

    try {
      const resp = await fetch(`/api/check-host?host=${encodeURIComponent(clean)}&port=443&method=HEAD`);
      const data = await resp.json();

      if (!data.ok) {
        setResolvedPrimaryIp('-');
        setIpErrorMsg(data.error || (isAr ? 'تعذر فحص النطاق أو عنوان IP' : 'Lookup failed'));
        return;
      }

      const v4 = Array.isArray(data.ipv4) ? data.ipv4 : [];
      const v6 = Array.isArray(data.ipv6) ? data.ipv6 : [];
      const cnames = Array.isArray(data.cnames) ? data.cnames : [];
      const primaryIp = v4[0] || v6[0] || '-';

      setResolvedPrimaryIp(primaryIp);
      setDnsLatencyMs(typeof data.dnsMs === 'number' ? data.dnsMs : null);
      setIpv4List(v4);
      setIpv6List(v6);
      setCnameList(cnames);

      const combined = Array.from(
        new Set<string>([
          ...(Array.isArray(data.sanDomains) ? data.sanDomains : []),
          ...cnames,
        ])
      );
      setSanDomainsFound(combined);
    } catch (err) {
      setResolvedPrimaryIp('-');
      setIpErrorMsg(err instanceof Error ? err.message : isAr ? 'تعذر الاتصال بالخادم' : 'Network error');
    } finally {
      setCheckingIp(false);
    }
  };

  // ---------------- HANDLER: LIVE SPEED TEST ----------------
  const startSpeedTest = async () => {
    setTestingSpeed(true);
    setDownloadMbps(0);
    setUploadMbps(0);
    setSpeedPing(0);
    setSpeedJitter(0);

    try {
      setSpeedStatusText(isAr ? 'جاري قياس البينغ والتذبذب الحقيقي...' : 'Measuring real latency & jitter...');
      const pings: number[] = [];
      for (let i = 0; i < 4; i++) {
        const t0 = performance.now();
        await fetch(`/api/speed-ping?i=${i}&ts=${Date.now()}`, { cache: 'no-store' });
        pings.push(performance.now() - t0);
      }
      const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
      const jitterVal =
        pings.slice(1).reduce((acc, val, idx) => acc + Math.abs(val - pings[idx]), 0) /
        Math.max(1, pings.length - 1);
      setSpeedPing(Math.round(avgPing));
      setSpeedJitter(Math.round(jitterVal));

      setSpeedStatusText(isAr ? 'جاري قياس سرعة التحميل الفعلية...' : 'Measuring real download throughput...');
      const downBytes = 2 * 1024 * 1024;
      const dStart = performance.now();
      const dResp = await fetch(`/api/speed-payload?bytes=${downBytes}&ts=${Date.now()}`, { cache: 'no-store' });
      const dBuf = await dResp.arrayBuffer();
      const dSec = Math.max(0.01, (performance.now() - dStart) / 1000);
      const downMbpsReal = (dBuf.byteLength * 8) / (dSec * 1_000_000);
      setDownloadMbps(Number(downMbpsReal.toFixed(2)));

      setSpeedStatusText(isAr ? 'جاري قياس سرعة الرفع الفعلية...' : 'Measuring real upload throughput...');
      const upBytes = 1024 * 1024;
      const upPayload = new Uint8Array(upBytes);
      const uStart = performance.now();
      await fetch(`/api/speed-upload?ts=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: upPayload,
      });
      const uSec = Math.max(0.01, (performance.now() - uStart) / 1000);
      const upMbpsReal = (upBytes * 8) / (uSec * 1_000_000);
      setUploadMbps(Number(upMbpsReal.toFixed(2)));

      setSpeedStatusText(isAr ? 'اكتمل القياس الحقيقي بنجاح' : 'Live speed test completed');
    } catch (err) {
      setSpeedStatusText(
        isAr
          ? `تعذر القياس: ${err instanceof Error ? err.message : 'تحقق من الشبكة'}`
          : `Test failed: ${err instanceof Error ? err.message : 'Check network'}`
      );
    } finally {
      setTestingSpeed(false);
    }
  };

  // ---------------- HANDLER: ANALYZER SITES ----------------
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

  const tabsConfig: { id: AnalyzerSectionTab; labelAr: string; labelEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'servers', labelAr: 'السيرفرات', labelEn: 'Servers', icon: Server },
    { id: 'host_sni', labelAr: 'SNI والهوستات', labelEn: 'SNI & Hosts', icon: Lock },
    { id: 'ip_san', labelAr: 'فحص IP', labelEn: 'IP Lookup', icon: Search },
    { id: 'speed', labelAr: 'سرعة الإنترنت', labelEn: 'Speed Test', icon: Gauge },
    { id: 'sites', labelAr: 'مواقع الفحص', labelEn: 'Sites', icon: Globe },
  ];

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
              <span>{isAr ? 'مركز فحص السيرفرات و SNI و IP والسرعة' : 'Servers, SNI, IP & Speed Lab'}</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {isAr
                ? 'فحص السيرفرات والهوستات و SNI و IP وسرعة الإنترنت ومواقع التحليل في مكان واحد'
                : 'Unified diagnostics for Servers, SNI/Hosts, IP/SAN, Speed Test & Sites'}
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

      {/* Unified 5-Tab Bar */}
      <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-mono">
        {tabsConfig.map((tb) => {
          const Icon = tb.icon;
          const isActive = activeTab === tb.id;
          return (
            <button
              key={tb.id}
              type="button"
              onClick={() => setActiveTab(tb.id)}
              className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? `${theme.solidBgClass} ${theme.solidTextClass} shadow-sm`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-full">{isAr ? tb.labelAr : tb.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: SERVERS CHECK & BATCH APP SERVERS HEALTH                        */}
      {/* ===================================================================== */}
      {activeTab === 'servers' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3">
            <span className={`text-xs font-bold font-mono ${theme.textClass} flex items-center gap-1.5`}>
              <Server className="w-3.5 h-3.5" />
              <span>{isAr ? 'أدخل السيرفر أو IP أو رابط vless:// للفحص:' : 'Target Server IP, Host, or URI:'}</span>
            </span>

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
                  ? (isAr ? 'جاري فحص استجابة السيرفر...' : 'Probing Server...')
                  : (isAr ? 'فحص استجابة السيرفر الآن' : 'Check Server Status Now')}
              </span>
            </button>
          </div>

          {singleResult && (
            <div
              className={`p-4 rounded-2xl border space-y-3 animate-fade-in ${
                singleResult.online
                  ? `${theme.bgDeepClass} ${theme.borderActiveClass}`
                  : 'bg-slate-900/95 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {singleResult.online ? (
                    <CheckCircle2 className={`w-5 h-5 ${theme.textClass} shrink-0`} />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-extrabold text-white font-mono">
                      {singleResult.online
                        ? (isAr ? 'السيرفر متاح ويستجيب ✓' : 'Server is Reachable ✓')
                        : (isAr ? 'السيرفر غير مستجيب أو المنفذ مغلق ✕' : 'Unreachable / Port Closed ✕')}
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
                  <div className={singleResult.tcpConnected ? `${theme.textLightClass} font-bold` : 'text-slate-400 font-bold'}>
                    {singleResult.tcpConnected ? (isAr ? 'مفتوح ومتصل' : 'OPEN') : (isAr ? 'مغلق' : 'CLOSED')}
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
                <div className="text-[11px] font-mono text-slate-300">
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
                          {isAr ? `متاح · ${st.latencyMs ?? srv.ping}ms` : `ON · ${st.latencyMs ?? srv.ping}ms`}
                        </span>
                      )}
                      {st?.online === false && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {isAr ? 'مغلق' : 'OFF'}
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

      {/* ===================================================================== */}
      {/* TAB 2: SNI & HOST CHECKER (TLS SNI, HEADERS, CDN)                     */}
      {/* ===================================================================== */}
      {activeTab === 'host_sni' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            {([
              { id: 'sni', ar: 'فحص SNI', en: 'SNI / TLS' },
              { id: 'headers', ar: 'الترويسات', en: 'Headers' },
              { id: 'cdn', ar: 'CDN / WS', en: 'CDN / WS' },
            ] as const).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setHostSubTab(t.id)}
                className={`py-2 rounded-lg font-bold transition-all ${
                  hostSubTab === t.id
                    ? `${theme.bgSoftClass} ${theme.textLightClass} border ${theme.borderActiveClass}`
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? t.ar : t.en}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3">
            <span className={`text-xs font-bold font-mono ${theme.textClass} flex items-center gap-1.5`}>
              <Lock className="w-3.5 h-3.5" />
              <span>{isAr ? 'أدخل النطاق أو هوست SNI للفحص المباشر:' : 'Enter Host / SNI Domain:'}</span>
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                value={hostUrl}
                onChange={(e) => setHostUrl(e.target.value)}
                placeholder="www.snapchat.com"
                dir="ltr"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-slate-600"
              />
              <div className="relative w-28">
                <select
                  value={hostMethod}
                  onChange={(e) => setHostMethod(e.target.value)}
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

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono text-slate-400">
                {isAr ? 'تحديد منفذ TLS مخصص (Port)' : 'Custom TLS Port'}
              </span>
              <input
                type="checkbox"
                checked={useCustomHostPort}
                onChange={(e) => setUseCustomHostPort(e.target.checked)}
                className="rounded cursor-pointer w-4 h-4"
              />
            </div>

            {useCustomHostPort && (
              <input
                type="number"
                value={hostPortInput}
                onChange={(e) => setHostPortInput(e.target.value)}
                placeholder="443"
                dir="ltr"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
              />
            )}

            <button
              type="button"
              onClick={handleCheckHostSni}
              disabled={checkingHost || !hostUrl.trim()}
              className={`w-full py-2.5 rounded-xl ${theme.buttonClass} disabled:opacity-50 font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {checkingHost
                  ? (isAr ? 'جاري فحص الهوست و SNI...' : 'PROBING HOST & SNI...')
                  : (isAr ? 'فحص الهوست والـ SNI الآن' : 'CHECK HOST & SNI')}
              </span>
            </button>
          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800">
              <span className={`text-[10px] font-mono font-bold ${theme.textClass}`}>
                {isAr ? 'نتيجة فحص الهوست و SNI المباشر' : 'Live Host & SNI Output'}
              </span>
              <span className="text-[10px] font-mono text-slate-500" dir="ltr">
                {hostMethod} :{useCustomHostPort ? hostPortInput : '443'}
              </span>
            </div>

            <div className={`p-4 font-mono text-xs min-h-[170px] ${theme.textLightClass} whitespace-pre-wrap leading-relaxed`} dir="auto">
              {hostOutput ? (
                hostOutput
              ) : (
                <div className="flex flex-col items-center justify-center h-28 text-slate-500">
                  <span className="text-sm mb-1">$ _</span>
                  <span className="text-[11px] text-center">
                    {isAr
                      ? 'أدخل اسم النطاق واضغط للفحص الحقيقي لشهادة SNI والترويسات و CDN'
                      : 'Enter a domain and press Check to inspect SNI TLS, headers & CDN'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: IP & SAME-IP / TLS SAN CHECKER                                 */}
      {/* ===================================================================== */}
      {activeTab === 'ip_san' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-3 gap-2 text-center font-mono">
            <div className="border-e border-slate-800/80 pe-1">
              <div className={`text-[10px] ${theme.textClass} mb-1`}>
                {isAr ? 'IP الأساسي' : 'Primary IP'}
              </div>
              <div className="text-xs font-bold text-slate-100 truncate" dir="ltr">
                {resolvedPrimaryIp}
              </div>
            </div>

            <div className="border-e border-slate-800/80 px-1">
              <div className={`text-[10px] ${theme.textClass} mb-1`}>
                {isAr ? 'زمن DNS' : 'DNS RTT'}
              </div>
              <div className="text-xs font-bold text-slate-100">
                {dnsLatencyMs !== null ? `${dnsLatencyMs} ms` : '-'}
              </div>
            </div>

            <div className="ps-1">
              <div className={`text-[10px] ${theme.textClass} mb-1`}>
                {isAr ? 'نطاقات SAN' : 'SAN Count'}
              </div>
              <div className={`text-sm font-bold ${theme.textLightClass}`}>{sanDomainsFound.length}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3">
            <span className={`text-xs font-bold font-mono ${theme.textClass} flex items-center gap-1.5`}>
              <Search className="w-3.5 h-3.5" />
              <span>{isAr ? 'أدخل النطاق لاستخراج عناوين IP ونطاقات الشهادة:' : 'Domain for IP & TLS SAN lookup:'}</span>
            </span>

            <input
              type="text"
              value={ipDomain}
              onChange={(e) => setIpDomain(e.target.value)}
              placeholder={isAr ? 'مثال: www.snapchat.com' : 'e.g., www.snapchat.com'}
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-slate-600"
            />

            <button
              type="button"
              onClick={handleCheckIpAndSan}
              disabled={checkingIp || !ipDomain.trim()}
              className={`w-full py-2.5 rounded-xl ${theme.buttonClass} disabled:opacity-50 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>
                {checkingIp
                  ? (isAr ? 'جاري استعلام DNS و IP...' : 'RESOLVING IP & SAN...')
                  : (isAr ? 'فحص الـ IP وسجلات DNS والنطاقات' : 'CHECK IP, DNS & SAN DOMAINS')}
              </span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 min-h-[210px] space-y-3">
            {ipErrorMsg ? (
              <div className="flex flex-col items-center justify-center h-36 text-center text-slate-300 font-mono text-xs px-4">
                {ipErrorMsg}
              </div>
            ) : ipv4List.length === 0 && ipv6List.length === 0 && sanDomainsFound.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-36 text-center text-slate-500 font-mono space-y-2">
                <Server className="w-8 h-8 text-slate-700" />
                <div className="text-xs text-slate-400">
                  {isAr
                    ? 'أدخل نطاقاً لاستخراج IPv4 / IPv6 / CNAME والنطاقات المرتبطة بالشهادة'
                    : 'Enter a domain to inspect IPv4, IPv6, CNAME & TLS SAN domains'}
                </div>
              </div>
            ) : (
              <div className="space-y-3 font-mono">
                {(ipv4List.length > 0 || ipv6List.length > 0) && (
                  <div className="space-y-1.5">
                    <div className={`text-[11px] ${theme.textClass} font-bold`}>
                      {isAr ? 'عناوين IP المكتشفة:' : 'Resolved IP Addresses:'}
                    </div>
                    {[...ipv4List, ...ipv6List].map((ipVal, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200"
                      >
                        <span dir="ltr" className="truncate">{ipVal}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${theme.bgSoftClass} ${theme.textLightClass}`}>
                          {ipVal.includes(':') ? 'IPv6' : 'IPv4'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {cnameList.length > 0 && (
                  <div className="space-y-1.5">
                    <div className={`text-[11px] ${theme.textClass} font-bold`}>CNAME:</div>
                    {cnameList.map((cn, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 truncate" dir="ltr">
                        {cn}
                      </div>
                    ))}
                  </div>
                )}

                {sanDomainsFound.length > 0 && (
                  <div className="space-y-1.5">
                    <div className={`text-[11px] ${theme.textClass} font-bold`}>
                      {isAr ? `النطاقات المستخرجة من الشهادة (${sanDomainsFound.length})` : `TLS SAN Domains (${sanDomainsFound.length})`}
                    </div>
                    {sanDomainsFound.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
                      >
                        <span dir="ltr" className="truncate pe-2">{item}</span>
                        <span className={`text-[10px] ${theme.textLightClass} ${theme.bgSoftClass} px-2 py-0.5 rounded shrink-0`}>
                          TLS SAN
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: INTERNET SPEED TEST                                            */}
      {/* ===================================================================== */}
      {activeTab === 'speed' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className={`flex items-center justify-center gap-1 ${theme.textClass} text-xs font-mono mb-2`}>
                <ArrowDown className="w-4 h-4" />
                <span>{isAr ? 'التحميل' : 'DOWNLOAD'}</span>
              </div>
              <div className={`text-3xl font-mono font-black ${theme.textClass} tracking-tight`}>
                {downloadMbps.toFixed(2)}
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">{isAr ? 'ميجابت/ث' : 'Mbps'}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className={`flex items-center justify-center gap-1 ${theme.textLightClass} text-xs font-mono mb-2`}>
                <ArrowUp className="w-4 h-4" />
                <span>{isAr ? 'الرفع' : 'UPLOAD'}</span>
              </div>
              <div className={`text-3xl font-mono font-black ${theme.textLightClass} tracking-tight`}>
                {uploadMbps.toFixed(2)}
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">{isAr ? 'ميجابت/ث' : 'Mbps'}</div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <button
              type="button"
              onClick={startSpeedTest}
              disabled={testingSpeed}
              className={`px-8 py-3 rounded-full font-mono font-bold text-xs tracking-wider flex items-center gap-2 transition-all shadow-lg ${
                testingSpeed
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : `${theme.buttonClass} active:scale-95`
              }`}
            >
              {testingSpeed ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>
                {testingSpeed
                  ? (isAr ? 'جاري قياس السرعة...' : 'TESTING...')
                  : (isAr ? 'بدء اختبار سرعة الإنترنت' : 'START SPEED TEST')}
              </span>
            </button>

            <p className={`mt-3 text-xs font-mono ${theme.textLightClass}`}>{speedStatusText}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className={`text-[11px] font-mono ${theme.textClass} font-bold uppercase tracking-wider`}>
              {isAr ? 'تفاصيل جودة الاتصال' : 'CONNECTION DETAILS'}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-mono text-slate-500">{isAr ? 'البينغ (التأخير)' : 'Ping'}</div>
                <div className={`text-lg font-mono font-bold ${theme.textClass}`}>
                  {speedPing} {isAr ? 'مللي ثانية' : 'ms'}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono text-slate-500">{isAr ? 'التذبذب (Jitter)' : 'Jitter'}</div>
                <div className={`text-lg font-mono font-bold ${theme.textClass}`}>
                  {speedJitter} {isAr ? 'مللي ثانية' : 'ms'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: EXTERNAL ANALYZER SITES (IN-APP VIEWER)                        */}
      {/* ===================================================================== */}
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
