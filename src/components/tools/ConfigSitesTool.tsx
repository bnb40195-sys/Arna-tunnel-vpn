import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  HelpCircle,
  RefreshCw,
  Search,
  X,
  Copy,
  Check,
  Shield,
  ShieldCheck,
  Zap,
  WifiOff,
  ExternalLink
} from 'lucide-react';
import { ConnectionState, LanguageCode, ThemeAccent } from '../../types/vpn';
import { THEMES } from '../../utils/theme';

interface ConfigSitesToolProps {
  language: LanguageCode;
  themeAccent: ThemeAccent;
  onBack: () => void;
  onOpenHelp?: (topic?: string) => void;
  connectionState: ConnectionState;
  onToggleConnect: () => void;
  isOnline: boolean;
  onRequestInternet: (reasonAr: string, reasonEn: string) => void;
}

interface ConfigSiteItem {
  id: string;
  name: string;
  url: string;
  descAr: string;
  descEn: string;
  tags: string[];
}

const CONFIG_CREATOR_SITES: ConfigSiteItem[] = [
  {
    id: 'vpnjantit',
    name: 'VPN Jantit',
    url: 'https://www.vpnjantit.com',
    descAr: 'يقدم مجموعة واسعة من الخوادم لإنشاء كونفيجات متنوعة مثل V2Ray و Trojan.',
    descEn: 'Offers a wide selection of servers to create various configs like V2Ray and Trojan.',
    tags: ['V2Ray', 'Trojan', 'SSH'],
  },
  {
    id: 'sshocean',
    name: 'SSHOcean.com',
    url: 'https://sshocean.com',
    descAr: 'يوفر خوادم SSH و V2Ray و WireGuard مجانية مع صلاحية تصل إلى 30 يومًا.',
    descEn: 'Provides free SSH, V2Ray, and WireGuard servers with validity up to 30 days.',
    tags: ['SSH', 'V2Ray', 'WireGuard'],
  },
  {
    id: 'sshkit',
    name: 'SSHKit.com',
    url: 'https://sshkit.com',
    descAr: 'يقدم حسابات SSH و V2Ray و Trojan بجودة عالية وخوادم متنوعة.',
    descEn: 'Offers high-quality SSH, V2Ray, and Trojan accounts with diverse servers.',
    tags: ['SSH', 'V2Ray', 'Trojan'],
  },
  {
    id: 'sshs8',
    name: 'SSHS8.com',
    url: 'https://sshs8.com',
    descAr: 'موقع متخصص في توفير كونفيجات VPN و SSH بجودة عالية وسرعات ممتازة، مع خوادم متنوعة.',
    descEn: 'Specialized site offering high-quality VPN and SSH configs with fast speeds and varied servers.',
    tags: ['SSH', 'VPN'],
  },
  {
    id: 'cybertunnel',
    name: 'CyberTunnel.org',
    url: 'https://cybertunnel.org',
    descAr: 'يوفر أدوات متنوعة لإنشاء كونفيجات V2Ray و Trojan و Shadowsocks.',
    descEn: 'Provides diverse tools for creating V2Ray, Trojan, and Shadowsocks configs.',
    tags: ['V2Ray', 'Trojan', 'Shadowsocks'],
  },
  {
    id: 'fastssh',
    name: 'FastSSH.com',
    url: 'https://www.fastssh.com',
    descAr: 'موقع ممتاز لإنشاء حسابات SSH و VPN بسرعة، مع خوادم خاصة للألعاب.',
    descEn: 'Great site to quickly create SSH and VPN accounts, including dedicated gaming servers.',
    tags: ['SSH', 'VPN'],
  },
  {
    id: 'mytunneling',
    name: 'MyTunneling.com',
    url: 'https://mytunneling.com',
    descAr: 'موقع شامل يوفر أدوات متنوعة لإنشاء كونفيجات Vmess و Vless و Trojan.',
    descEn: 'Comprehensive site offering tools to create Vmess, Vless, and Trojan configs.',
    tags: ['V2Ray', 'Trojan'],
  },
  {
    id: 'globalssh',
    name: 'GlobalSSH.net',
    url: 'https://globalssh.net',
    descAr: 'يوفر حسابات SSH و OpenVPN مجانية مع تركيز على السرعة والاستقرار.',
    descEn: 'Provides free SSH and OpenVPN accounts focusing on speed and stability.',
    tags: ['SSH', 'OpenVPN'],
  },
  {
    id: 'jagoanssh',
    name: 'JagoanSSH.com',
    url: 'https://www.jagoanssh.com',
    descAr: 'يقدم خوادم SSH و V2Ray و Trojan موثوقة في آسيا وأوروبا.',
    descEn: 'Offers reliable SSH, V2Ray, and Trojan servers across Asia and Europe.',
    tags: ['SSH', 'V2Ray', 'Trojan'],
  },
  {
    id: 'lionssh',
    name: 'LionSSH.com',
    url: 'https://lionssh.com',
    descAr: 'يقدم خيارات متعددة لإنشاء حسابات SSH و SoftEther و VPN و V2Ray.',
    descEn: 'Offers multiple options to create SSH, SoftEther, VPN, and V2Ray accounts.',
    tags: ['SSH', 'VPN', 'V2Ray'],
  },
  {
    id: 'opentunnel',
    name: 'OpenTunnel.net',
    url: 'https://opentunnel.net',
    descAr: 'مصدر جيد لكونفيجات جاهزة لتطبيقات مثل HTTP Injector و KPN Tunnel.',
    descEn: 'Reliable source for ready configs compatible with HTTP Injector and KPN Tunnel.',
    tags: ['SSH', 'V2Ray'],
  },
  {
    id: 'akunssh',
    name: 'AkunSSH.net',
    url: 'https://akunssh.net',
    descAr: 'موقع موثوق يقدم حسابات SSH و V2Ray و Trojan مع خوادم متعددة.',
    descEn: 'Trusted site providing SSH, V2Ray, and Trojan accounts with multiple servers.',
    tags: ['SSH', 'V2Ray', 'Trojan'],
  },
  {
    id: 'finessh',
    name: 'FineSSH.com',
    url: 'https://finessh.com',
    descAr: 'يوفر خوادم مستقرة لبروتوكولات SSH و V2Ray مع تركيز على الأداء الجيد.',
    descEn: 'Provides stable servers for SSH and V2Ray protocols focusing on strong performance.',
    tags: ['SSH', 'V2Ray'],
  },
  {
    id: 'cyberssh',
    name: 'CyberSSH.com',
    url: 'https://cyberssh.com',
    descAr: 'مصدر جيد لحسابات Vmess و Vless و Trojan المجانية مع خوادم سريعة.',
    descEn: 'Good source for free Vmess, Vless, and Trojan accounts with fast servers.',
    tags: ['V2Ray', 'Trojan'],
  },
  {
    id: 'createssh',
    name: 'CreateSSH.com',
    url: 'https://createssh.com',
    descAr: 'بسيط ومباشر لإنشاء حسابات SSH و VPN مجانية بصلاحيات مختلفة.',
    descEn: 'Simple and direct platform to create free SSH and VPN accounts with various durations.',
    tags: ['SSH', 'VPN'],
  },
  {
    id: 'howdy',
    name: 'Howdy.id',
    url: 'https://howdy.id',
    descAr: 'يقدم مجموعة متنوعة من الخدمات تشمل SSH و OpenVPN و Tunnel و Shadowsocks.',
    descEn: 'Offers a variety of services including SSH, OpenVPN, Tunnel, and Shadowsocks.',
    tags: ['SSH', 'OpenVPN', 'Shadowsocks'],
  },
  {
    id: 'sshmax',
    name: 'SSHMAX.net',
    url: 'https://sshmax.net',
    descAr: 'يوفر حسابات SSH و V2Ray بمدة صلاحية مختلفة، تصل إلى 30 يومًا.',
    descEn: 'Provides SSH and V2Ray accounts with different durations, up to 30 days.',
    tags: ['SSH', 'V2Ray'],
  },
  {
    id: 'vpnsplit',
    name: 'VPNSplit.com',
    url: 'https://vpnsplit.com',
    descAr: 'متخصص في توفير حسابات V2Ray و Trojan و WireGuard مع خوادم سريعة.',
    descEn: 'Specialized in providing V2Ray, Trojan, and WireGuard accounts with fast servers.',
    tags: ['V2Ray', 'Trojan', 'WireGuard'],
  },
  {
    id: 'bestv2ray',
    name: 'BestV2Ray.com',
    url: 'https://bestv2ray.com',
    descAr: 'متخصص في توفير كونفيجات V2Ray عالية الجودة مع خوادم محسنة للسرعة.',
    descEn: 'Specialized in providing high-quality V2Ray configs with speed-optimized servers.',
    tags: ['V2Ray'],
  },
  {
    id: 'sshstores',
    name: 'SSHStores.net',
    url: 'https://sshstores.net',
    descAr: 'يقدم مجموعة واسعة من الحسابات المجانية تشمل SSH و WireGuard و V2Ray.',
    descEn: 'Offers a wide range of free accounts including SSH, WireGuard, and V2Ray.',
    tags: ['SSH', 'WireGuard', 'V2Ray'],
  },
  {
    id: 'freevpn',
    name: 'Freevpn.us',
    url: 'https://freevpn.us',
    descAr: 'مصدر آخر يوفر حسابات SSH و VPN مجانية في مواقع جغرافية متنوعة.',
    descEn: 'Another source providing free SSH and VPN accounts across various geographic locations.',
    tags: ['SSH', 'VPN'],
  },
];

export const ConfigSitesTool: React.FC<ConfigSitesToolProps> = ({
  language,
  themeAccent,
  onBack,
  onOpenHelp,
  connectionState,
  onToggleConnect,
  isOnline,
  onRequestInternet,
}) => {
  const isAr = language === 'ar';
  const theme = THEMES[themeAccent];
  const isVpnConnected = connectionState === 'connected';
  const isVpnConnecting = connectionState === 'connecting';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  // In-app fast browser state (with weak-internet Lite mode active by default)
  const [activeSite, setActiveSite] = useState<ConfigSiteItem | null>(null);
  const [currentBrowserUrl, setCurrentBrowserUrl] = useState<string>('');
  const [liteMode, setLiteMode] = useState<boolean>(true);
  const [browserMode, setBrowserMode] = useState<'proxy' | 'direct'>('proxy');
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoadingFrame, setIsLoadingFrame] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ARNA_WEBVIEW_URL' && typeof event.data.url === 'string') {
        setCurrentBrowserUrl(event.data.url);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const openInAppBrowser = (site: ConfigSiteItem) => {
    if (!isOnline && !isVpnConnected) {
      onRequestInternet(
        `فتح موقع "${site.name}" يتطلب اتصالاً بالإنترنت أو تفعيل نفق التطبيق.`,
        `Opening "${site.name}" requires internet access or an active tunnel.`
      );
      return;
    }
    setActiveSite(site);
    setCurrentBrowserUrl(site.url);
    setBrowserMode('proxy');
    setIsLoadingFrame(true);
    setIframeKey((k) => k + 1);
  };

  const closeInAppBrowser = () => {
    setActiveSite(null);
    setCurrentBrowserUrl('');
    setIsLoadingFrame(false);
  };

  const handleCopyUrl = () => {
    if (!currentBrowserUrl) return;
    navigator.clipboard.writeText(currentBrowserUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1800);
  };

  const iframeSrc = activeSite
    ? browserMode === 'proxy'
      ? `/api/web-proxy?url=${encodeURIComponent(activeSite.url)}&lite=${liteMode ? '1' : '0'}&vpn=${isVpnConnected ? '1' : '0'}`
      : activeSite.url
    : '';

  const filteredSites = CONFIG_CREATOR_SITES.filter((site) => {
    const matchesTag = selectedTag === 'ALL' || site.tags.includes(selectedTag);
    if (!matchesTag) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      site.name.toLowerCase().includes(q) ||
      site.descAr.toLowerCase().includes(q) ||
      site.descEn.toLowerCase().includes(q) ||
      site.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const tags = ['ALL', 'SSH', 'V2Ray', 'Trojan', 'WireGuard', 'OpenVPN'];

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-8 font-sans animate-fade-in">
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
            <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Globe className={`w-4 h-4 ${theme.textClass}`} />
              <span>{isAr ? 'مواقع صنع الكونفيجات' : 'Config Creator Sites'}</span>
              <span className={`text-[10px] ${theme.bgSoftClass} ${theme.textLightClass} px-1.5 py-0.5 rounded font-mono`}>
                {CONFIG_CREATOR_SITES.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {isAr
                ? 'تصفح خفيف وسريع يناسب الإنترنت الضعيف مع VPN التطبيق'
                : 'Fast low-data browsing inside the app with built-in VPN'}
            </p>
          </div>
        </div>

        {onOpenHelp && (
          <button
            type="button"
            onClick={() => onOpenHelp('payload')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${theme.bgSoftClass} border ${theme.borderClass} ${theme.textLightClass} hover:opacity-90 transition-all text-xs font-mono font-bold shrink-0`}
            title={isAr ? 'مساعدة' : 'Help'}
          >
            <HelpCircle className={`w-4 h-4 ${theme.textClass}`} />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      {/* Quick Control Strip: App VPN Toggle + Lite Mode (Weak Internet) */}
      <div className={`p-3 rounded-2xl ${theme.bgDeepClass} border ${theme.borderClass} flex flex-wrap items-center justify-between gap-2`}>
        <button
          type="button"
          onClick={onToggleConnect}
          disabled={isVpnConnecting}
          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 border transition-all active:scale-95 ${
            isVpnConnected
              ? `${theme.solidBgClass} ${theme.solidTextClass} ${theme.borderActiveClass} shadow-sm`
              : isVpnConnecting
              ? `${theme.bgSoftClass} ${theme.borderActiveClass} ${theme.textLightClass}`
              : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500'
          }`}
        >
          {isVpnConnected ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : (
            <Shield className="w-3.5 h-3.5" />
          )}
          <span>
            {isVpnConnecting
              ? isAr
                ? 'جاري تشغيل VPN...'
                : 'Connecting VPN...'
              : isVpnConnected
              ? isAr
                ? 'VPN التطبيق مفعل ✓'
                : 'App VPN Active ✓'
              : isAr
              ? 'تشغيل VPN التطبيق'
              : 'Start App VPN'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setLiteMode((v) => !v)}
          className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 border transition-all ${
            liteMode
              ? `${theme.bgSoftClass} ${theme.borderActiveClass} ${theme.textLightClass}`
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>
            {liteMode
              ? isAr
                ? 'وضع الإنترنت الضعيف ⚡'
                : 'Weak-Net Lite Mode ⚡'
              : isAr
              ? 'الوضع الكامل'
              : 'Full Mode'}
          </span>
        </button>
      </div>

      {/* Offline Warning Notice if no internet */}
      {!isOnline && !isVpnConnected && (
        <div className={`p-3 rounded-2xl ${theme.bgDeepClass} border ${theme.borderClass} flex items-center justify-between gap-2 text-xs text-slate-200`}>
          <div className="flex items-center gap-2">
            <WifiOff className={`w-4 h-4 ${theme.textClass} shrink-0`} />
            <span>
              {isAr
                ? 'أنت حالياً بدون إنترنت. افتح أي موقع لطلب الوصول أو فعّل VPN التطبيق.'
                : 'Currently offline. Internet access is required to open sites.'}
            </span>
          </div>
        </div>
      )}

      {/* Search & Tag Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'ابحث عن موقع (مثل SSHOcean، FastSSH، V2Ray...)' : 'Search sites (SSHOcean, V2Ray, Trojan...)'}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl shrink-0 font-bold border transition-all ${
                selectedTag === tag
                  ? `${theme.solidBgClass} ${theme.solidTextClass} ${theme.borderActiveClass}`
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tag === 'ALL' ? (isAr ? `الكل (${CONFIG_CREATOR_SITES.length})` : `All (${CONFIG_CREATOR_SITES.length})`) : tag}
            </button>
          ))}
        </div>
      </div>

      {/* Sites Cards (Clean Card with Single "اذهب للموقع" Green Button) */}
      <div className="space-y-3.5">
        {filteredSites.map((site) => (
          <div
            key={site.id}
            className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800/90 hover:border-slate-700 shadow-lg space-y-3.5 transition-all"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap gap-1 pt-1">
                {site.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h3 className={`text-lg font-extrabold font-mono tracking-tight ${theme.textClass} text-end`} dir="ltr">
                {site.name}
              </h3>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {isAr ? site.descAr : site.descEn}
            </p>

            {/* Single Full-Width Button: اذهب للموقع */}
            <button
              type="button"
              onClick={() => openInAppBrowser(site)}
              className={`w-full py-2.5 px-4 rounded-xl ${theme.solidBgClass} ${theme.solidHoverClass} ${theme.solidTextClass} font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2`}
            >
              <Zap className="w-4 h-4" />
              <span>{isAr ? 'اذهب للموقع' : 'Go to Site'}</span>
            </button>
          </div>
        ))}
      </div>

      {/* IN-APP FAST BROWSER OVERLAY */}
      {activeSite && (
        <div className="fixed inset-0 z-50 bg-[#070b14] flex flex-col animate-fade-in max-w-md mx-auto border-x border-slate-800 shadow-2xl">
          {/* Top In-App Browser Controls */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={closeInAppBrowser}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:scale-95 shrink-0"
                  title={isAr ? 'إغلاق المتصفح المدمج' : 'Close Viewer'}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <div className={`text-xs font-extrabold font-mono ${theme.textClass} truncate`} dir="ltr">
                    {activeSite.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate" dir="ltr">
                    {currentBrowserUrl || activeSite.url}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onToggleConnect}
                  disabled={isVpnConnecting}
                  className={`px-2.5 py-1.5 rounded-xl border font-mono text-[10px] font-bold flex items-center gap-1 transition-all ${
                    isVpnConnected
                      ? `${theme.solidBgClass} ${theme.solidTextClass} ${theme.borderActiveClass}`
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title={isAr ? 'تشغيل/إيقاف VPN التطبيق' : 'Toggle App VPN'}
                >
                  {isVpnConnected ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                  <span>{isVpnConnected ? 'VPN ✓' : 'VPN'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:scale-95"
                  title={isAr ? 'نسخ الرابط' : 'Copy URL'}
                >
                  {copiedUrl ? <Check className={`w-4 h-4 ${theme.textClass}`} /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoadingFrame(true);
                    setIframeKey((k) => k + 1);
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:scale-95"
                  title={isAr ? 'تحديث الصفحة' : 'Reload'}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingFrame ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Speed / Data Saver Bar */}
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setBrowserMode('proxy');
                    setIsLoadingFrame(true);
                    setIframeKey((k) => k + 1);
                  }}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition-all ${
                    browserMode === 'proxy'
                      ? `${theme.solidBgClass} ${theme.solidTextClass} ${theme.borderActiveClass}`
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
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
                  className={`px-2.5 py-1 rounded-lg border font-bold transition-all flex items-center gap-1 ${
                    browserMode === 'direct'
                      ? `${theme.solidBgClass} ${theme.solidTextClass} ${theme.borderActiveClass}`
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{isAr ? 'مباشر' : 'Direct'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLiteMode((prev) => !prev);
                  setBrowserMode('proxy');
                  setIsLoadingFrame(true);
                  setIframeKey((k) => k + 1);
                }}
                className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                  liteMode
                    ? `${theme.bgSoftClass} ${theme.borderActiveClass} ${theme.textLightClass}`
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{liteMode ? (isAr ? 'وضع خفيف (توفير النت)' : 'Lite Mode') : (isAr ? 'الوضع الكامل' : 'Full Mode')}</span>
              </button>
            </div>
          </div>

          {/* Embedded In-App Iframe Container */}
          <div className="relative flex-1 bg-white overflow-hidden">
            {isLoadingFrame && (
              <div className="absolute inset-0 z-10 bg-[#070b14]/90 flex flex-col items-center justify-center gap-3 text-slate-300 pointer-events-none">
                <RefreshCw className={`w-8 h-8 ${theme.textClass} animate-spin`} />
                <div className="text-xs font-mono font-bold">
                  {isAr
                    ? `جاري الفتح السريع لـ ${activeSite.name}${liteMode ? ' (وضع توفير البيانات)' : ''}...`
                    : `Fast opening ${activeSite.name}...`}
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
