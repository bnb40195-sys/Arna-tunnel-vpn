import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  Wifi,
  Usb,
  Bluetooth,
  ShieldCheck,
  ArrowLeft,
  HelpCircle,
  CheckCircle2,
  Copy,
  Check,
  Download,
  RefreshCw,
  Radio,
  Zap,
  AlertCircle,
  Lock,
  Smartphone,
  Router
} from 'lucide-react';
import {
  ConnectionState,
  LanguageCode,
  ThemeAccent,
  VpnServer,
  AbrTunnelConfig
} from '../../types/vpn';
import { THEMES } from '../../utils/theme';

interface VpnHotspotShareProps {
  language: LanguageCode;
  themeAccent: ThemeAccent;
  connectionState: ConnectionState;
  selectedServer: VpnServer;
  abrConfig: AbrTunnelConfig;
  onToggleConnect: () => void;
  onBack?: () => void;
  onOpenHelp?: (topic?: string) => void;
  onLog?: (type: 'INFO' | 'VPN', message: string) => void;
}

type ShareInterface = 'hotspot' | 'usb' | 'bluetooth';
type RoutingEngine = 'nat_transparent' | 'usb_ics' | 'tproxy_dns';

interface DirectShareProfile {
  enabled: boolean;
  shareInterface: ShareInterface;
  routingEngine: RoutingEngine;
  gatewayIp: string;
  dnsPrimary: string;
  mtu: number;
  forwardUdp: boolean;
  dnsLeakGuard: boolean;
  keepScreenAwake: boolean;
  hotspotSsid: string;
  hotspotPassword: string;
}

const STORAGE_KEY = 'arna_direct_vpn_share_profile_v1';

const DEFAULT_PROFILE: DirectShareProfile = {
  enabled: false,
  shareInterface: 'hotspot',
  routingEngine: 'nat_transparent',
  gatewayIp: '192.168.43.1',
  dnsPrimary: '1.1.1.1',
  mtu: 1420,
  forwardUdp: true,
  dnsLeakGuard: true,
  keepScreenAwake: false,
  hotspotSsid: 'Arna_Tunnel_Share',
  hotspotPassword: '',
};

export const VpnHotspotShare: React.FC<VpnHotspotShareProps> = ({
  language,
  themeAccent,
  connectionState,
  selectedServer,
  abrConfig,
  onToggleConnect,
  onBack,
  onOpenHelp,
  onLog,
}) => {
  const isAr = language === 'ar';
  const theme = THEMES[themeAccent] || THEMES.teal;
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  const [profile, setProfile] = useState<DirectShareProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore storage error
    }
    return DEFAULT_PROFILE;
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [probeLoading, setProbeLoading] = useState(false);
  const [probeResult, setProbeResult] = useState<{
    ok: boolean;
    pingMs: number | null;
    tlsLatencyMs: number | null;
    targetHost: string;
    resolvedIp: string | null;
    error?: string;
  } | null>(null);

  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota error
    }
  }, [profile]);

  // Browser Screen Wake Lock when keeping device awake during sharing
  useEffect(() => {
    let cancelled = false;
    const syncWakeLock = async () => {
      const nav = navigator as Navigator & {
        wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
      };
      if (profile.enabled && profile.keepScreenAwake && nav.wakeLock) {
        try {
          const sentinel = await nav.wakeLock.request('screen');
          if (!cancelled) {
            wakeLockRef.current = sentinel;
            setWakeLockActive(true);
          } else {
            await sentinel.release();
          }
        } catch {
          if (!cancelled) setWakeLockActive(false);
        }
      } else {
        if (wakeLockRef.current) {
          try {
            await wakeLockRef.current.release();
          } catch {
            // Ignore release error
          }
          wakeLockRef.current = null;
        }
        if (!cancelled) setWakeLockActive(false);
      }
    };
    syncWakeLock();

    return () => {
      cancelled = true;
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [profile.enabled, profile.keepScreenAwake]);

  const updateProfile = (patch: Partial<DirectShareProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  const handleToggleShare = () => {
    const next = !profile.enabled;
    updateProfile({ enabled: next });
    if (onLog) {
      onLog(
        'VPN',
        next
          ? `تم تفعيل وضع مشاركة VPN المباشرة (${profile.gatewayIp} | MTU ${profile.mtu})`
          : 'تم إيقاف وضع مشاركة VPN المباشرة.'
      );
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleRunReadinessProbe = async () => {
    setProbeLoading(true);
    const targetHost = (abrConfig.customSni || selectedServer.ip || '1.1.1.1').trim();
    const numericPort = abrConfig.selectedPort.startsWith('P ')
      ? parseInt(abrConfig.selectedPort.replace('P ', ''), 10) || 443
      : 443;

    try {
      const pingStart = performance.now();
      await fetch('/api/speed-ping');
      const pingMs = Math.round(performance.now() - pingStart);

      const resp = await fetch(
        `/api/check-host?host=${encodeURIComponent(targetHost)}&port=${numericPort}&method=HEAD`
      );
      const data = await resp.json();

      setProbeResult({
        ok: Boolean(data.ok),
        pingMs,
        tlsLatencyMs: data.tls?.latencyMs ?? null,
        targetHost,
        resolvedIp: (data.ipv4 && data.ipv4[0]) || (data.ipv6 && data.ipv6[0]) || null,
        error: data.ok ? undefined : data.error || 'Probe failed',
      });
    } catch (err) {
      setProbeResult({
        ok: false,
        pingMs: null,
        tlsLatencyMs: null,
        targetHost,
        resolvedIp: null,
        error: err instanceof Error ? err.message : 'Network error',
      });
    } finally {
      setProbeLoading(false);
    }
  };

  const handleDownloadTransparentProfile = () => {
    const configPayload = {
      app: 'Arna tunnel v1.0',
      mode: 'direct_vpn_share',
      description: 'Transparent NAT / TProxy tether profile — direct VPN sharing for connected devices',
      createdAt: new Date().toISOString(),
      tether: {
        interface:
          profile.shareInterface === 'hotspot'
            ? 'wlan0 / ap0'
            : profile.shareInterface === 'usb'
            ? 'rndis0'
            : 'bt-pan',
        routingEngine: profile.routingEngine,
        gatewayIp: profile.gatewayIp,
        subnetMask: '255.255.255.0',
        dhcpRange: `${profile.gatewayIp.replace(/\.\d+$/, '')}.10 - ${profile.gatewayIp.replace(/\.\d+$/, '')}.250`,
        dns: [profile.dnsPrimary, '1.0.0.1'],
        mtu: profile.mtu,
        forwardUdp: profile.forwardUdp,
        dnsLeakGuard: profile.dnsLeakGuard,
      },
      xrayTransparentRouting: {
        inbounds: [
          {
            tag: 'tun-transparent',
            port: 12345,
            protocol: 'dokodemo-door',
            settings: {
              network: profile.forwardUdp ? 'tcp,udp' : 'tcp',
              followRedirect: true,
            },
            sniffing: {
              enabled: true,
              destOverride: ['http', 'tls', 'quic'],
            },
            streamSettings: {
              sockopt: { tproxy: 'tproxy' },
            },
          },
        ],
        dns: {
          servers: [profile.dnsPrimary, 'localhost'],
        },
        upstreamTunnel: {
          server: selectedServer.ip,
          country: selectedServer.country,
          mode: abrConfig.connectionMode,
          sni: abrConfig.customSni || null,
          port: abrConfig.selectedPort,
        },
      },
    };

    const blob = new Blob([JSON.stringify(configPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arna-direct-share-${profile.shareInterface}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (onLog) {
      onLog('INFO', `تم تنزيل ملف التوجيه المباشر (arna-direct-share-${profile.shareInterface}.json)`);
    }
  };

  const wifiUri = `WIFI:T:WPA;S:${profile.hotspotSsid || 'Arna_Tunnel_Share'};P:${profile.hotspotPassword || ''};;`;

  const shareSummaryText = isAr
    ? `اتصل بشبكة الواي فاي: ${profile.hotspotSsid || 'Arna_Tunnel_Share'}\nكلمة المرور: ${
        profile.hotspotPassword || '(بدون كلمة مرور)'
      }\nالبوابة الافتراضية: ${profile.gatewayIp}\nDNS: ${profile.dnsPrimary}`
    : `Connect to Wi-Fi: ${profile.hotspotSsid || 'Arna_Tunnel_Share'}\nPassword: ${
        profile.hotspotPassword || '(none)'
      }\nGateway: ${profile.gatewayIp}\nDNS: ${profile.dnsPrimary}`;

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10 font-sans animate-fade-in">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white shrink-0"
              aria-label={isAr ? 'رجوع' : 'Back'}
            >
              <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          )}
          <div className={`w-9 h-9 rounded-xl ${theme.bgSoftClass} border ${theme.borderClass} flex items-center justify-center ${theme.textClass} shrink-0`}>
            <Share2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate">
              {isAr ? 'مشاركة VPN' : 'Share VPN'}
            </h2>
            <p className="text-[11px] text-slate-400 truncate">
              {isAr ? 'مشاركة النفق مباشرةً للأجهزة الأخرى تلقائياً' : 'Direct hotspot & USB tunnel sharing'}
            </p>
          </div>
        </div>

        {onOpenHelp && (
          <button
            type="button"
            onClick={() => onOpenHelp('start')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${theme.bgSoftClass} ${theme.textLightClass} border ${theme.borderClass} transition-all text-xs font-mono font-bold shrink-0`}
            title={isAr ? 'مساعدة' : 'Help'}
          >
            <HelpCircle className={`w-4 h-4 ${theme.textClass}`} />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      {/* Main Activation Card */}
      <div className={`p-4 rounded-2xl border transition-all ${
        profile.enabled
          ? `${theme.bgDeepClass} ${theme.borderActiveClass} shadow-lg`
          : 'bg-slate-900/85 border-slate-800'
      } space-y-3`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              profile.enabled
                ? `${theme.solidBgClass} ${theme.solidTextClass}`
                : 'bg-slate-950 border border-slate-800 text-slate-400'
            }`}>
              <Router className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                <span>{isAr ? 'وضع المشاركة المباشرة التلقائية' : 'Direct Transparent Tether'}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                  profile.enabled
                    ? `${theme.bgSoftClass} ${theme.textLightClass}`
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {profile.enabled ? (isAr ? 'مُفعّل' : 'ENABLED') : (isAr ? 'متوقف' : 'OFF')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isAr
                  ? 'الهاتف المستقبِل يتصفح مباشرة عبر الشبكة دون أي إعدادات يدوية'
                  : 'Connected devices get VPN internet directly on connect'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleShare}
            aria-pressed={profile.enabled}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors flex items-center shrink-0 ${
              profile.enabled ? theme.solidBgClass : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                profile.enabled
                  ? isAr
                    ? '-translate-x-6'
                    : 'translate-x-6'
                  : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Highlights row */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">{isAr ? 'الربط على المستقبِل' : 'Client Setup'}</div>
            <div className={`text-[11px] font-bold mt-0.5 ${theme.textLightClass}`}>
              {isAr ? 'تلقائي' : 'Automatic'}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">{isAr ? 'توجيه النظام' : 'Routing'}</div>
            <div className={`text-[11px] font-bold mt-0.5 ${theme.textLightClass}`}>
              {isAr ? 'مباشر 100%' : 'Direct NAT'}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">{isAr ? 'دعم الألعاب والمكالمات' : 'UDP / Calls'}</div>
            <div className={`text-[11px] font-bold mt-0.5 ${profile.forwardUdp ? theme.textLightClass : 'text-slate-400'}`}>
              {profile.forwardUdp ? (isAr ? 'ممرّر بالكامل' : 'Full UDP') : (isAr ? 'TCP فقط' : 'TCP Only')}
            </div>
          </div>
        </div>

        {/* VPN Link Status & Quick Connect */}
        <div className="p-2.5 rounded-xl bg-[#070b14] border border-slate-800 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? theme.solidBgClass : isConnecting ? `${theme.bgSoftClass} animate-ping` : 'bg-slate-600'}`} />
              <span>
                {isConnected
                  ? (isAr ? 'النفق متصل وجاهز للمشاركة' : 'VPN Connected')
                  : (isAr ? 'النفق غير متصل حالياً' : 'VPN Disconnected')}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5" dir="ltr">
              {selectedServer.country} · {abrConfig.connectionMode} · {abrConfig.customSni || selectedServer.ip}
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleConnect}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all active:scale-95 ${
              isConnected
                ? 'bg-slate-800 text-white border border-slate-700'
                : `${theme.buttonClass}`
            }`}
          >
            {isConnected ? (isAr ? 'إيقاف النفق' : 'Disconnect') : (isAr ? 'تشغيل النفق' : 'Connect VPN')}
          </button>
        </div>
      </div>

      {/* Honest Browser/OS Capability Notice */}
      <div className={`p-3 rounded-2xl ${theme.bgDeepClass} border ${theme.borderClass} flex items-start gap-2.5 text-[11px] text-slate-200 leading-relaxed`}>
        <AlertCircle className={`w-4 h-4 ${theme.textClass} shrink-0 mt-0.5`} />
        <div>
          {isAr
            ? 'ملاحظة تقنية: متصفح الويب (PWA) لا يملك صلاحية تعديل راوتر نظام أندرويد (iptables / tun0) مباشرة؛ هذا القسم يحفظ إعدادات المشاركة المباشرة، يفحص جاهزية النفق فعلياً، ويولّد ملف التوجيه التلقائي (.json) عند استخدام تطبيق الأندرويد.'
            : 'Technical note: A browser PWA cannot alter Android kernel iptables/tun0 routing directly. This section configures and exports your transparent NAT/TProxy tether profile and tests tunnel readiness.'}
        </div>
      </div>

      {/* Share Interface Selection */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-white flex items-center gap-2">
          <Radio className={`w-4 h-4 ${theme.textClass}`} />
          <span>{isAr ? '1. اختيار منفذ المشاركة المباشرة' : '1. Share Interface'}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            {
              id: 'hotspot' as ShareInterface,
              icon: Wifi,
              title: isAr ? 'نقطة اتصال Wi-Fi' : 'Wi-Fi Hotspot',
              sub: 'wlan0 / ap0',
            },
            {
              id: 'usb' as ShareInterface,
              icon: Usb,
              title: isAr ? 'كابل USB مباشر' : 'USB Tether',
              sub: 'rndis0',
            },
            {
              id: 'bluetooth' as ShareInterface,
              icon: Bluetooth,
              title: isAr ? 'بلوتوث PAN' : 'Bluetooth',
              sub: 'bt-pan',
            },
          ].map((item) => {
            const Icon = item.icon;
            const active = profile.shareInterface === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  const defaultGw =
                    item.id === 'usb'
                      ? '192.168.42.129'
                      : item.id === 'bluetooth'
                      ? '192.168.44.1'
                      : '192.168.43.1';
                  updateProfile({ shareInterface: item.id, gatewayIp: defaultGw });
                }}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  active
                    ? `${theme.bgSoftClass} ${theme.borderActiveClass} text-white`
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? theme.textClass : ''}`} />
                <span className="text-[11px] font-bold leading-tight">{item.title}</span>
                <span className="text-[9px] font-mono opacity-75" dir="ltr">{item.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Routing Engine */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-bold text-slate-300 block">
            {isAr ? 'محرك تمرير الحزم المباشر:' : 'Transparent Routing Engine:'}
          </label>
          <div className="space-y-1.5">
            {[
              {
                id: 'nat_transparent' as RoutingEngine,
                title: isAr ? 'تمرير NAT الشفاف (tun0 ➔ wlan0)' : 'Transparent NAT (tun0 -> wlan0)',
                desc: isAr
                  ? 'يمرر كل ترافيك نقطة الاتصال عبر نفق VPN تلقائياً (يدعم جميع التطبيقات والألعاب).'
                  : 'Forwards all hotspot traffic directly into tun0.',
              },
              {
                id: 'tproxy_dns' as RoutingEngine,
                title: isAr ? 'جسر Xray Dokodemo + DNS تلقائي' : 'Xray Dokodemo TProxy + DNS',
                desc: isAr
                  ? 'يلتقط الاتصال الشفاف ويعيد توجيهه من جهازك تلقائياً دون أي إعداد على الجهاز المستقبِل.'
                  : 'Transparent interception with automatic tunnel routing.',
              },
              {
                id: 'usb_ics' as RoutingEngine,
                title: isAr ? 'ربط USB RNDIS مباشر' : 'USB RNDIS Direct Bridge',
                desc: isAr
                  ? 'شارك عبر USB إلى الحاسوب أو موزع Wi-Fi مع تمرير مباشر لكل المنافذ.'
                  : 'Direct USB interface sharing.',
              },
            ].map((eng) => {
              const selected = profile.routingEngine === eng.id;
              return (
                <button
                  key={eng.id}
                  type="button"
                  onClick={() => updateProfile({ routingEngine: eng.id })}
                  className={`w-full p-2.5 rounded-xl border text-start transition-all flex items-start gap-2.5 ${
                    selected
                      ? `${theme.bgSoftClass} ${theme.borderActiveClass}`
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    selected ? `${theme.solidBgClass} border-transparent ${theme.solidTextClass}` : 'border-slate-600'
                  }`}>
                    {selected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{eng.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{eng.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Network & Transparent DNS / MTU Parameters */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-white flex items-center gap-2">
          <Zap className={`w-4 h-4 ${theme.textClass}`} />
          <span>{isAr ? '2. إعدادات الشبكة و DNS التلقائي' : '2. Gateway, DNS & MTU'}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              {isAr ? 'بوابة التوجيه (Gateway)' : 'Gateway IP'}
            </label>
            <select
              dir="ltr"
              value={profile.gatewayIp}
              onChange={(e) => updateProfile({ gatewayIp: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none"
            >
              <option value="192.168.43.1">192.168.43.1 (Hotspot)</option>
              <option value="192.168.42.129">192.168.42.129 (USB)</option>
              <option value="192.168.137.1">192.168.137.1 (PC ICS)</option>
              <option value="10.10.0.1">10.10.0.1 (Tunnel)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              {isAr ? 'الـ DNS التلقائي للمستقبِل' : 'Transparent DNS'}
            </label>
            <select
              dir="ltr"
              value={profile.dnsPrimary}
              onChange={(e) => updateProfile({ dnsPrimary: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none"
            >
              <option value="1.1.1.1">1.1.1.1 (Cloudflare)</option>
              <option value="8.8.8.8">8.8.8.8 (Google)</option>
              <option value="9.9.9.9">9.9.9.9 (Quad9)</option>
              <option value="94.140.14.14">94.140.14.14 (AdGuard)</option>
            </select>
          </div>
        </div>

        {/* MTU Presets */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
            <span>{isAr ? 'حجم الحزم MTU للثبات أثناء المشاركة:' : 'Tunnel Share MTU:'}</span>
            <span className="font-mono font-bold text-white">{profile.mtu} bytes</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 1280, label: isAr ? '1280 (ثبات عالٍ)' : '1280 Safe' },
              { val: 1420, label: isAr ? '1420 (موصى به)' : '1420 Optimal' },
              { val: 1500, label: isAr ? '1500 (قياسي)' : '1500 Std' },
            ].map((m) => (
              <button
                key={m.val}
                type="button"
                onClick={() => updateProfile({ mtu: m.val })}
                className={`py-1.5 px-2 rounded-xl border text-[10px] font-mono font-bold transition-all ${
                  profile.mtu === m.val
                    ? `${theme.bgSoftClass} ${theme.borderActiveClass} text-white`
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2 pt-1 border-t border-slate-800/70 text-xs">
          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-slate-200 flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${theme.textClass}`} />
              <span>{isAr ? 'تمرير UDP التلقائي (واتساب، مكالمات، ألعاب)' : 'Forward UDP Traffic (Calls & Gaming)'}</span>
            </span>
            <input
              type="checkbox"
              checked={profile.forwardUdp}
              onChange={(e) => updateProfile({ forwardUdp: e.target.checked })}
              className="w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-slate-200 flex items-center gap-2">
              <Lock className={`w-4 h-4 ${theme.textClass}`} />
              <span>{isAr ? 'حماية الرصيد ومنع تسريب DNS للمستقبِل' : 'Prevent DNS Leak on Client Devices'}</span>
            </span>
            <input
              type="checkbox"
              checked={profile.dnsLeakGuard}
              onChange={(e) => updateProfile({ dnsLeakGuard: e.target.checked })}
              className="w-4 h-4 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-slate-200 flex items-center gap-2">
              <Smartphone className={`w-4 h-4 ${theme.textClass}`} />
              <span>
                {isAr ? 'إبقاء الشاشة مستيقظة أثناء المشاركة' : 'Keep Screen Awake While Sharing'}
                {wakeLockActive && (
                  <span className={`ms-1.5 text-[10px] ${theme.textClass} font-mono`}>
                    ({isAr ? 'نشط' : 'Active'})
                  </span>
                )}
              </span>
            </span>
            <input
              type="checkbox"
              checked={profile.keepScreenAwake}
              onChange={(e) => updateProfile({ keepScreenAwake: e.target.checked })}
              className="w-4 h-4 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Live Tunnel Readiness Probe + Export Direct Config */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-white">
          {isAr ? '3. فحص النفق وتصدير ملف التوجيه المباشر' : '3. Probe Tunnel & Export Profile'}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleRunReadinessProbe}
            disabled={probeLoading}
            className={`py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 ${theme.borderClass} text-xs font-bold text-slate-100 flex items-center justify-center gap-1.5 transition-all active:scale-95`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${theme.textClass} ${probeLoading ? 'animate-spin' : ''}`} />
            <span>{probeLoading ? (isAr ? 'جاري الفحص...' : 'Checking...') : (isAr ? 'فحص جاهزية النفق' : 'Test Tunnel')}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTransparentProfile}
            className={`py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${theme.buttonClass}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصدير ملف التوجيه' : 'Export JSON'}</span>
          </button>
        </div>

        {probeResult && (
          <div className={`p-3 rounded-xl border text-[11px] font-mono space-y-1 ${
            probeResult.ok
              ? `${theme.bgDeepClass} ${theme.borderActiveClass} ${theme.textLightClass}`
              : 'bg-slate-950 border-slate-700 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {probeResult.ok
                  ? (isAr ? 'النفق جاهز للمشاركة المباشرة' : 'Tunnel Ready for Direct Share')
                  : (isAr ? 'تعذر الوصول للهدف' : 'Probe Failed')}
              </span>
              {probeResult.pingMs !== null && <span>Ping: {probeResult.pingMs} ms</span>}
            </div>
            <div className="text-[10px] opacity-85" dir="ltr">
              Host: {probeResult.targetHost}
              {probeResult.resolvedIp ? ` → ${probeResult.resolvedIp}` : ''}
              {probeResult.tlsLatencyMs !== null ? ` | TLS: ${probeResult.tlsLatencyMs} ms` : ''}
            </div>
            {probeResult.error && <div className="text-[10px] text-slate-400">{probeResult.error}</div>}
          </div>
        )}
      </div>

      {/* Wi-Fi Share Card */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-white flex items-center justify-between">
          <span>{isAr ? 'بطاقة اتصال الجهاز المستقبِل' : 'Client Wi-Fi Share Card'}</span>
          <span className={`text-[10px] font-mono ${theme.textClass}`}>
            {isAr ? 'اتصال مباشر' : 'Direct Join'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              {isAr ? 'اسم نقطة الاتصال (SSID)' : 'Hotspot SSID'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={profile.hotspotSsid}
              onChange={(e) => updateProfile({ hotspotSsid: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              {isAr ? 'كلمة السر (اختياري)' : 'Password (Optional)'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={profile.hotspotPassword}
              onChange={(e) => updateProfile({ hotspotPassword: e.target.value })}
              placeholder="12345678"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleCopy('summary', shareSummaryText)}
            className={`py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 ${theme.borderClass} text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5`}
          >
            {copiedId === 'summary' ? <Check className={`w-3.5 h-3.5 ${theme.textClass}`} /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'summary' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ بطاقة الشبكة' : 'Copy Wi-Fi Info')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleCopy('uri', wifiUri)}
            className={`py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 ${theme.borderClass} text-[11px] font-mono font-bold text-slate-300 flex items-center justify-center gap-1.5`}
          >
            {copiedId === 'uri' ? <Check className={`w-3.5 h-3.5 ${theme.textClass}`} /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'uri' ? (isAr ? 'تم النسخ' : 'Copied') : 'WIFI:T:WPA URI'}</span>
          </button>
        </div>
      </div>

      {/* Step-by-Step Practical Guide */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5 text-xs">
        <div className="font-bold text-white">
          {isAr ? 'كيف يتصل الجهاز الثاني؟' : 'How the second device connects:'}
        </div>
        <ol className="space-y-2 text-[11px] text-slate-300 list-decimal list-inside leading-relaxed">
          <li>
            {isAr
              ? 'شغّل النفق (VPN) أولاً على هذا الهاتف وتأكد من ثبات الاتصال.'
              : 'Connect your VPN tunnel first on this host device.'}
          </li>
          <li>
            {isAr
              ? 'فعّل وضع "المشاركة المباشرة التلقائية" أعلاه واختر المنفذ (Wi-Fi Hotspot أو كابل USB أو البلوتوث).'
              : 'Enable Direct Transparent Tether above and choose Wi-Fi Hotspot, USB RNDIS, or Bluetooth.'}
          </li>
          <li>
            {isAr
              ? 'في الهاتف أو الحاسوب المستقبِل: اتصل بالشبكة بشكل عادي تماماً وسيتم توجيه الاتصال عبر النفق.'
              : 'On the receiving device: join the Wi-Fi or USB network normally.'}
          </li>
        </ol>
      </div>
    </div>
  );
};
