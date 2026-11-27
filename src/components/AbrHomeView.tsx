import React, { useState, useEffect } from 'react';
import {
  Shield,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Server,
  Search,
  X,
  RefreshCw,
  Power,
  Clock,
  Rocket,
  Check,
  MapPin,
  Share2,
  Plus,
  Trash2,
  Activity
} from 'lucide-react';
import {
  ConnectionState,
  VpnServer,
  LanguageCode,
  ThemeAccent,
  AbrTunnelConfig,
  ExportableConfigFile
} from '../types/vpn';
import { formatBytes } from '../utils/mockData';
import { READY_MADE_CONFIGS } from '../utils/readyConfigs';
import { THEMES } from '../utils/theme';

interface AbrHomeViewProps {
  connectionState: ConnectionState;
  onToggleConnect: () => void;
  selectedServer: VpnServer;
  servers: VpnServer[];
  onSelectServer: (server: VpnServer) => void;
  abrConfig: AbrTunnelConfig;
  onUpdateAbrConfig: (updates: Partial<AbrTunnelConfig>) => void;
  onApplyConfig: (config: ExportableConfigFile) => void;
  activeConfigName?: string | null;
  uploadedBytes: number;
  downloadedBytes: number;
  onOpenVpnShare?: () => void;
  onAddServer?: (server: Omit<VpnServer, 'id'>) => void;
  onDeleteServer?: (serverId: string) => void;
  onOpenServerAnalyzer?: () => void;
  language: LanguageCode;
  themeAccent: ThemeAccent;
}

const PORT_DROPDOWN_OPTIONS = ['AUTO', 'P 80', 'P 443', 'P 8080', 'P 8443', 'P 53', 'P 22'];

const CONNECTION_MODES: {
  id: AbrTunnelConfig['connectionMode'];
  titleAr: string;
  titleEn: string;
  subAr: string;
  subEn: string;
}[] = [
  {
    id: 'Direct',
    titleAr: 'اتصال مباشر (Direct Connection)',
    titleEn: 'Direct Connection',
    subAr: 'إنترنت مباشر',
    subEn: 'Internet',
  },
  {
    id: 'Custom SNI',
    titleAr: 'كوستوم SNI (Custom SNI)',
    titleEn: 'Custom SNI',
    subAr: 'وضع التشفير SSL, TLS Mode',
    subEn: 'SSL, TLS Mode',
  },
  {
    id: 'Custom Payload',
    titleAr: 'بايلود مخصص (Custom Payload)',
    titleEn: 'Custom Payload',
    subAr: 'حقن ترويسة HTTP المخصصة',
    subEn: 'HTTP Header Inject',
  },
];

const getLocalizedServer = (srv: VpnServer, lang: LanguageCode) => {
  if (lang !== 'ar') return srv;
  const map: Record<string, { country: string; city: string; name: string }> = {
    'srv-ca': { country: 'كندا', city: 'مونتريال', name: 'خادم كندا السريع #1' },
    'srv-de': { country: 'ألمانيا', city: 'فرانكفورت', name: 'خادم ألمانيا المركزي #1' },
    'srv-sa': { country: 'السعودية', city: 'الرياض', name: 'خادم الرياض فائق السرعة #1' },
    'srv-ae': { country: 'الإمارات', city: 'دبي', name: 'بوابة الخليج دبي #2' },
    'srv-nl': { country: 'هولندا', city: 'أمستردام', name: 'خادم أمستردام #2' },
    'srv-fr': { country: 'فرنسا', city: 'باريس', name: 'درع باريس الآمن #3' },
    'srv-us': { country: 'الولايات المتحدة', city: 'نيويورك', name: 'خادم نيويورك جيجابت #4' },
    'srv-uk': { country: 'المملكة المتحدة', city: 'لندن', name: 'خادم لندن السريع #1' },
    'srv-sg': { country: 'سنغافورة', city: 'سنغافورة', name: 'محور آسيا سنغافورة #1' },
  };
  const entry = map[srv.id];
  return entry ? { ...srv, ...entry } : srv;
};

export const AbrHomeView: React.FC<AbrHomeViewProps> = ({
  connectionState,
  onToggleConnect,
  selectedServer,
  servers,
  onSelectServer,
  abrConfig,
  onUpdateAbrConfig,
  onApplyConfig,
  activeConfigName,
  uploadedBytes,
  downloadedBytes,
  onOpenVpnShare,
  onAddServer,
  onDeleteServer,
  onOpenServerAnalyzer,
  language,
  themeAccent,
}) => {
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';
  const isAr = language === 'ar';
  const isFr = language === 'fr';
  const isEs = language === 'es';
  const theme = THEMES[themeAccent] || THEMES.teal;

  const txt = {
    selectPortLabel: isAr ? 'تحديد المنفذ' : isFr ? 'CHOISIR PORT' : isEs ? 'ELEGIR PUERTO' : 'SELECT PORT',
    selectServerLabel: isAr ? 'تحديد السيرفر' : isFr ? 'CHOISIR SERVEUR' : isEs ? 'ELEGIR SERVIDOR' : 'SELECT SERVER',
    customSetupLabel: isAr ? 'إعداد مخصص' : isFr ? 'CONFIG PERSO' : isEs ? 'CONFIG PROPIA' : 'CUSTOM SETUP',
    connectionModeLabel: isAr ? 'وضع الاتصال' : isFr ? 'MODE CONNEXION' : isEs ? 'MODO CONEXIÓN' : 'CONNECTION MODE',
    autoPortLabel: isAr ? 'تلقائي (AUTO)' : 'AUTO',
    connecting: isAr ? 'جاري الاتصال...' : isFr ? 'CONNEXION...' : isEs ? 'CONECTANDO...' : 'CONNECTING...',
    connected: isAr ? 'متصل ومحمي' : isFr ? 'CONNECTÉ' : isEs ? 'CONECTADO' : 'CONNECTED',
    connect: isAr ? 'اضغط للاتصال' : isFr ? 'CONNECTER' : isEs ? 'CONECTAR' : 'TAP TO CONNECT',
    orbSubConnected: isAr ? 'تشفير AES-256 نشط' : isFr ? 'Chiffrement AES-256 actif' : isEs ? 'Cifrado AES-256 activo' : 'AES-256 Encrypted',
    orbSubReady: isAr ? 'نفق Arna جاهز' : isFr ? 'Tunnel Arna prêt' : isEs ? 'Túnel Arna listo' : 'Arna Tunnel Ready',
    descConnected: isAr ? 'حركة المرور مشفرة وتمر عبر نفق Arna tunnel بأعلى سرعة واستقرار' : isFr ? 'Le trafic est chiffré et protégé contre DPI' : isEs ? 'El tráfico está cifrado y protegido contra DPI' : 'Traffic is encrypted and masked against DPI',
    descReady: isAr ? 'اختر الخادم والشبكة ثم اضغط على زر الطاقة للاتصال المباشر' : isFr ? 'Choisissez un serveur et appuyez pour connecter' : isEs ? 'Elige un servidor y pulsa para conectar' : 'Select a server gateway and tap to connect',
    download: isAr ? 'التحميل' : isFr ? 'Téléchargement' : isEs ? 'Descarga' : 'Download',
    upload: isAr ? 'الرفع' : isFr ? 'Envoi' : isEs ? 'Subida' : 'Upload',
    speedDown: isConnected ? (isAr ? '18.4 م.ب/ث' : '18.4 MB/s') : (isAr ? '0.0 ب/ث' : '0.0 B/s'),
    speedUp: isConnected ? (isAr ? '6.2 م.ب/ث' : '6.2 MB/s') : (isAr ? '0.0 ب/ث' : '0.0 B/s'),
    pingUnit: isAr ? 'مللي ثانية' : 'ms',
    serverLoad: isAr ? 'الضغط' : isFr ? 'Charge' : isEs ? 'Carga' : 'Load',
    selectServerTitle: isAr ? 'اختيار خادم النفق' : isFr ? 'Sélectionner un nœud' : isEs ? 'Seleccionar servidor' : 'Select Server Node',
    searchPlaceholder: isAr ? 'ابحث بالدولة أو المدينة...' : isFr ? 'Rechercher pays ou ville...' : isEs ? 'Buscar país o ciudad...' : 'Search country or city...',
    customSniInlineLabel: isAr ? 'كوستوم SNI' : 'CUSTOM SNI',
    customPayloadInlineLabel: isAr ? 'بايلود مخصص (Payload)' : 'CUSTOM PAYLOAD',
    configSearchPlaceholder: isAr ? 'ابحث عن دولة عربية، واي فاي، أو تطبيق...' : isFr ? 'Rechercher un pays, WiFi ou app...' : isEs ? 'Buscar país, WiFi o app...' : 'Search country, WiFi or app...',
  };

  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isPortModalOpen, setIsPortModalOpen] = useState(false);
  const [isSelectorDropdownOpen, setIsSelectorDropdownOpen] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState('');
  const [selectorCategory, setSelectorCategory] = useState<'all' | 'arab' | 'wifi' | 'social'>('all');
  const [serverSearch, setServerSearch] = useState('');
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvIp, setNewSrvIp] = useState('');
  const [newSrvCountry, setNewSrvCountry] = useState('🇩🇿 الجزائر');
  const [newSrvCity, setNewSrvCity] = useState('');
  const [newSrvType, setNewSrvType] = useState('Custom SNI / SSL');
  const [newSrvChecking, setNewSrvChecking] = useState(false);
  const [newSrvError, setNewSrvError] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isConnected) {
      timer = setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isConnected]);

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const displaySelected = getLocalizedServer(selectedServer, language);

  // Active carrier preset matching current SNI or config name
  const activePreset =
    READY_MADE_CONFIGS.find(
      (c) =>
        (activeConfigName && c.name === activeConfigName) ||
        c.sniHost.toLowerCase() === abrConfig.customSni.trim().toLowerCase()
    ) || READY_MADE_CONFIGS[0];

  const activeModeObj =
    CONNECTION_MODES.find((m) => m.id === abrConfig.connectionMode) || CONNECTION_MODES[1];

  const filteredServers = servers.filter((s) => {
    const loc = getLocalizedServer(s, language);
    const q = serverSearch.toLowerCase();
    return (
      loc.country.toLowerCase().includes(q) ||
      (loc.city && loc.city.toLowerCase().includes(q)) ||
      loc.name.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q)
    );
  });

  const filteredDropdownPresets = READY_MADE_CONFIGS.filter((cfg) => {
    const matchesCat = selectorCategory === 'all' || cfg.category === selectorCategory;
    if (!matchesCat) return false;
    if (!selectorSearch.trim()) return true;
    const q = selectorSearch.toLowerCase();
    return (
      cfg.name.toLowerCase().includes(q) ||
      (cfg.shortTitle && cfg.shortTitle.toLowerCase().includes(q)) ||
      (cfg.countryAr && cfg.countryAr.toLowerCase().includes(q)) ||
      (cfg.countryEn && cfg.countryEn.toLowerCase().includes(q)) ||
      (cfg.isoCode && cfg.isoCode.toLowerCase().includes(q)) ||
      cfg.sniHost.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-6 select-none animate-fade-in font-sans">
      {/* 1B. DUAL PORT & SERVER + CUSTOM SETUP / CONNECTION MODE CARD (PER SCREENSHOTS) */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        {/* Top Labels + Selectors: SELECT PORT | SELECT SERVER */}
        <div className="grid grid-cols-2 gap-3 items-center">
          {/* SELECT PORT */}
          <div>
            <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase mb-1 text-center">
              {txt.selectPortLabel}
            </div>
            <button
              type="button"
              onClick={() => setIsPortModalOpen(true)}
              className="w-full px-3 py-2 rounded-xl bg-[#070b14] border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs font-mono font-bold text-white transition-all"
            >
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>{abrConfig.selectedPort === 'AUTO' ? txt.autoPortLabel : abrConfig.selectedPort}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
            </button>
          </div>

          {/* SELECT SERVER */}
          <div>
            <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase mb-1 text-center">
              {txt.selectServerLabel}
            </div>
            <button
              type="button"
              onClick={() => setIsServerModalOpen(true)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#070b14] border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2 text-start transition-all"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{displaySelected.country}</div>
                <div className="text-[10px] text-slate-400 truncate">{displaySelected.city || displaySelected.name}</div>
              </div>
              <div className="relative w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-sm shrink-0 shadow-sm">
                <span>{displaySelected.flag || '🌐'}</span>
                <MapPin className={`w-2.5 h-2.5 ${theme.textClass} absolute -bottom-0.5 -right-0.5`} />
              </div>
            </button>
          </div>
        </div>

        {/* Compact Data Counter Pill */}
        <div className="py-1.5 px-4 rounded-full bg-[#070b14] border border-slate-800/90 flex items-center justify-center gap-6 text-[11px] font-mono font-bold text-slate-200">
          <div className="flex items-center gap-1.5">
            <span>{formatBytes(downloadedBytes, 2, language)}</span>
            <span className={`w-4 h-4 rounded-full ${theme.solidBgClass} ${theme.solidTextClass} inline-flex items-center justify-center`}>
              <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>{formatBytes(uploadedBytes, 2, language)}</span>
            <span className={`w-4 h-4 rounded-full ${theme.bgSoftClass} border ${theme.borderActiveClass} ${theme.textLightClass} inline-flex items-center justify-center`}>
              <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          </div>
        </div>

        {/* CUSTOM SETUP TOGGLE + CONNECTION MODE LABEL */}
        <div className="flex items-center justify-between pt-0.5 px-1">
          <button
            type="button"
            onClick={() => onUpdateAbrConfig({ customSetup: !abrConfig.customSetup })}
            className="flex items-center gap-2.5 group"
            aria-pressed={abrConfig.customSetup}
          >
            <div
              className={`w-10 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                abrConfig.customSetup ? theme.solidBgClass : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                  abrConfig.customSetup
                    ? isAr
                      ? '-translate-x-5'
                      : 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-[11px] font-mono font-bold tracking-wide text-slate-200 uppercase">
              {txt.customSetupLabel}
            </span>
          </button>

          <span className="text-[11px] font-mono font-bold tracking-wide text-slate-400 uppercase">
            {txt.connectionModeLabel}
          </span>
        </div>

        {/* DROPDOWN TRIGGER BAR: Carrier Preset (when customSetup OFF) OR Connection Mode (when customSetup ON) */}
        <button
          type="button"
          onClick={() => setIsSelectorDropdownOpen(true)}
          className={`w-full px-3.5 py-2.5 rounded-2xl bg-[#070b14] border ${theme.borderClass} hover:bg-slate-950 transition-all flex items-center justify-between gap-2 text-start`}
        >
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />

          {abrConfig.customSetup ? (
            <div className="flex-1 min-w-0 text-end">
              <div className="text-xs font-bold text-white truncate">
                {isAr ? activeModeObj.titleAr : activeModeObj.titleEn}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {isAr ? activeModeObj.subAr : activeModeObj.subEn}
                {abrConfig.connectionMode === 'Custom SNI' && abrConfig.customSni ? ` · ${abrConfig.customSni}` : ''}
              </div>
            </div>
          ) : (
            <div className="flex-1 min-w-0 text-end">
              <div className="text-xs font-bold text-white font-mono truncate">
                [{activePreset.flag || '🌐'}][{activePreset.isoCode || 'INT'}] [{activePreset.shortTitle || activePreset.name}]
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {isAr ? activePreset.countryAr || activePreset.description : activePreset.countryEn || activePreset.description}
              </div>
            </div>
          )}

          <div className={`w-8 h-8 rounded-xl ${theme.bgSoftClass} border ${theme.borderClass} flex items-center justify-center shrink-0`}>
            <Rocket className={`w-4 h-4 ${theme.textClass}`} />
          </div>
        </button>

        {/* INLINE CUSTOM SETUP INPUT BOX (MATCHING IMAGE 2) */}
        {abrConfig.customSetup && abrConfig.connectionMode === 'Custom SNI' && (
          <div className="pt-1 space-y-1.5 animate-fade-in">
            <div className="text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase text-end px-1">
              {txt.customSniInlineLabel}
            </div>
            <input
              type="text"
              dir="ltr"
              value={abrConfig.customSni}
              onChange={(e) => onUpdateAbrConfig({ customSni: e.target.value })}
              placeholder="www.snapchat.com"
              className={`w-full px-4 py-3 rounded-xl bg-[#070b14] border border-slate-800 focus:${theme.borderActiveClass} text-white text-sm font-mono focus:outline-none transition-colors`}
            />
          </div>
        )}

        {abrConfig.customSetup && abrConfig.connectionMode === 'Custom Payload' && (
          <div className="pt-1 space-y-1.5 animate-fade-in">
            <div className="text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase text-end px-1">
              {txt.customPayloadInlineLabel}
            </div>
            <textarea
              dir="ltr"
              rows={2}
              value={abrConfig.tcpPayloadText}
              onChange={(e) => onUpdateAbrConfig({ tcpPayloadText: e.target.value, useTcpPayload: true })}
              placeholder="CONNECT [host_port] HTTP/1.1[crlf]Host: www.snapchat.com[crlf][crlf]"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#070b14] border border-slate-800 focus:${theme.borderActiveClass} text-white text-xs font-mono focus:outline-none transition-colors resize-none`}
            />
          </div>
        )}
      </div>

      {/* 2. THE MASTER POWER ORB */}
      <div className="relative py-5 flex flex-col items-center justify-center">
        {/* Soft atmospheric theme glow */}
        <div
          className={`absolute w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isConnecting ? `${theme.auraBgClass} animate-pulse` : theme.auraBgClass
          }`}
        />

        {isConnected && (
          <div className={`absolute w-56 h-56 rounded-full border ${theme.borderActiveClass} opacity-40 animate-ping pointer-events-none duration-1000`} />
        )}
        {isConnecting && (
          <div className={`absolute w-56 h-56 rounded-full border ${theme.borderActiveClass} opacity-60 animate-spin pointer-events-none`} />
        )}

        <button
          onClick={onToggleConnect}
          disabled={isConnecting}
          aria-label={isConnected ? txt.connected : txt.connect}
          className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center p-2.5 transition-all duration-500 transform active:scale-95 shadow-2xl ${
            isConnected
              ? theme.orbOuterConnected
              : isConnecting
              ? theme.orbOuterConnected
              : theme.orbOuterIdle
          }`}
        >
          <div
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-500 ${
              isConnected || isConnecting
                ? theme.orbCoreConnected
                : 'bg-gradient-to-b from-slate-900 to-slate-950'
            }`}
          >
            {isConnecting ? (
              <RefreshCw className={`w-11 h-11 ${theme.textClass} animate-spin mb-1.5`} />
            ) : isConnected ? (
              <Shield className={`w-11 h-11 ${theme.textClass} mb-1.5 animate-pulse`} />
            ) : (
              <Power className={`w-11 h-11 ${theme.textClass} mb-1.5`} />
            )}

            <span
              className={`text-xs font-bold font-mono tracking-wider transition-colors ${
                isConnected || isConnecting
                  ? theme.textClass
                  : 'text-slate-100'
              }`}
            >
              {isConnecting ? txt.connecting : isConnected ? txt.connected : txt.connect}
            </span>

            <span className={`text-[10px] ${theme.textClass} opacity-80 font-mono mt-1`}>
              {isConnected ? txt.orbSubConnected : txt.orbSubReady}
            </span>
          </div>
        </button>

        {isConnected && (
          <div className={`mt-3 flex items-center gap-1.5 font-mono text-xs font-bold ${theme.textClass} ${theme.bgDeepClass} border ${theme.borderClass} px-3 py-1 rounded-full shadow-sm`}>
            <Clock className={`w-3.5 h-3.5 ${theme.textClass}`} />
            <span>{formatTimer(sessionSeconds)}</span>
          </div>
        )}

        <p className="mt-2.5 text-xs text-slate-300 text-center max-w-xs leading-relaxed">
          {isConnected ? txt.descConnected : txt.descReady}
        </p>

        {onOpenVpnShare && (
          <button
            type="button"
            onClick={onOpenVpnShare}
            className={`mt-3 px-4 py-2 rounded-2xl bg-slate-900/90 border ${theme.borderClass} hover:bg-slate-800/80 text-xs font-bold text-slate-100 flex items-center gap-2 transition-all active:scale-95 shadow-md`}
          >
            <Share2 className={`w-3.5 h-3.5 ${theme.textClass}`} />
            <span>{isAr ? 'مشاركة VPN' : 'Share VPN'}</span>
          </button>
        )}
      </div>

      {/* 5. PORT SELECTION MODAL */}
      {isPortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-xs bg-[#0a101d] border ${theme.borderClass} rounded-3xl shadow-2xl overflow-hidden`}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <span className="text-sm font-bold text-white font-mono">{txt.selectPortLabel}</span>
              <button
                onClick={() => setIsPortModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 space-y-1.5">
              {PORT_DROPDOWN_OPTIONS.map((portOpt) => {
                const isSelected = abrConfig.selectedPort === portOpt;
                return (
                  <button
                    key={portOpt}
                    onClick={() => {
                      onUpdateAbrConfig({ selectedPort: portOpt });
                      setIsPortModalOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-2xl border flex items-center justify-between font-mono text-xs font-bold transition-all ${
                      isSelected
                        ? `${theme.bgSoftClass} ${theme.borderActiveClass} text-white`
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <span>{portOpt === 'AUTO' ? txt.autoPortLabel : portOpt}</span>
                    {isSelected && (
                      <span className={`w-5 h-5 rounded-full ${theme.solidBgClass} ${theme.solidTextClass} flex items-center justify-center`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. CARRIER PROFILE OR CONNECTION MODE DROPDOWN MODAL (MATCHING IMAGES) */}
      {isSelectorDropdownOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md max-h-[85vh] bg-[#090e1a] border ${theme.borderClass} rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
              <div className="flex items-center gap-2">
                <Rocket className={`w-4 h-4 ${theme.textClass}`} />
                <h3 className="text-sm font-bold text-white font-mono">
                  {abrConfig.customSetup
                    ? txt.connectionModeLabel
                    : isAr
                    ? 'اختيار كونفيج الشبكة / الدولة'
                    : 'Select Carrier / Tunnel Profile'}
                </h3>
              </div>
              <button
                onClick={() => setIsSelectorDropdownOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {abrConfig.customSetup ? (
              /* MODE 1: CUSTOM SETUP ON -> CONNECTION MODE PICKER (IMG_20261118_190444) */
              <div className="p-3 overflow-y-auto space-y-2">
                {CONNECTION_MODES.map((mode) => {
                  const isSelected = abrConfig.connectionMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        onUpdateAbrConfig({ connectionMode: mode.id, customSetup: true });
                        setIsSelectorDropdownOpen(false);
                      }}
                      className={`w-full p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        isSelected
                          ? `${theme.bgDeepClass} ${theme.borderActiveClass} text-white`
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="w-6 flex items-center justify-center shrink-0">
                        {isSelected && (
                          <span className={`w-6 h-6 rounded-full ${theme.solidBgClass} ${theme.solidTextClass} flex items-center justify-center shadow`}>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <div className="flex-1 text-end min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {isAr ? mode.titleAr : mode.titleEn}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {isAr ? mode.subAr : mode.subEn}
                        </div>
                      </div>

                      <div className={`w-9 h-9 rounded-xl ${theme.bgSoftClass} border ${theme.borderClass} flex items-center justify-center shrink-0`}>
                        <Rocket className={`w-4 h-4 ${theme.textClass}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* MODE 2: CUSTOM SETUP OFF -> CARRIER & FREE PROFILES PICKER (IMG_20261118_190340) */
              <>
                <div className="p-3 border-b border-slate-800 bg-slate-950 space-y-2.5">
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-mono">
                    {[
                      { id: 'all', label: isAr ? `الكل (${READY_MADE_CONFIGS.length})` : `All (${READY_MADE_CONFIGS.length})` },
                      { id: 'arab', label: isAr ? '🌍 الدول العربية' : '🌍 Arab Countries' },
                      { id: 'wifi', label: isAr ? '📶 الواي فاي' : '📶 WiFi' },
                      { id: 'social', label: isAr ? '📱 التواصل الاجتماعي' : '📱 Social' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectorCategory(cat.id as 'all' | 'arab' | 'wifi' | 'social')}
                        className={`px-3 py-1.5 rounded-xl shrink-0 font-bold border transition-all ${
                          selectorCategory === cat.id
                            ? `${theme.solidBgClass} ${theme.solidTextClass} ${theme.borderActiveClass}`
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={selectorSearch}
                      onChange={(e) => setSelectorSearch(e.target.value)}
                      placeholder={txt.configSearchPlaceholder}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredDropdownPresets.map((cfg, idx) => {
                    const isSelected =
                      activePreset.name === cfg.name &&
                      activePreset.sniHost === cfg.sniHost;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          onApplyConfig(cfg);
                          onUpdateAbrConfig({ customSetup: false });
                          setIsSelectorDropdownOpen(false);
                        }}
                        className={`w-full p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                          isSelected
                            ? `${theme.bgDeepClass} ${theme.borderActiveClass} text-white`
                            : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="w-6 flex items-center justify-center shrink-0">
                          {isSelected && (
                            <span className={`w-6 h-6 rounded-full ${theme.solidBgClass} ${theme.solidTextClass} flex items-center justify-center shadow`}>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        <div className="flex-1 text-end min-w-0">
                          <div className="text-xs font-bold font-mono text-white truncate">
                            [{cfg.flag || '🌐'}][{cfg.isoCode || 'INT'}] [{cfg.shortTitle || cfg.name}]
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {isAr ? cfg.countryAr || cfg.description : cfg.countryEn || cfg.description}
                          </div>
                        </div>

                        <div className={`w-8 h-8 rounded-xl ${theme.bgSoftClass} border ${theme.borderClass} flex items-center justify-center shrink-0`}>
                          <Rocket className={`w-4 h-4 ${theme.textClass}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 7. SERVER SELECTION MODAL */}
      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md max-h-[88vh] bg-[#0a101d] border ${theme.borderClass} rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Server className={`w-4 h-4 ${theme.textClass}`} />
                <h3 className="text-sm font-bold text-white font-mono">{txt.selectServerTitle}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                {onOpenServerAnalyzer && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsServerModalOpen(false);
                      onOpenServerAnalyzer();
                    }}
                    className={`px-2.5 py-1.5 rounded-xl ${theme.bgSoftClass} border ${theme.borderClass} ${theme.textLightClass} text-[11px] font-mono font-bold flex items-center gap-1 hover:opacity-90`}
                    title={isAr ? 'تحليل وفحص السيرفرات' : 'Analyze Servers'}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تحليل' : 'Analyze'}</span>
                  </button>
                )}
                <button
                  onClick={() => setIsServerModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search + Add Server Toggle */}
            <div className="p-3 border-b border-slate-800 bg-slate-950 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={serverSearch}
                    onChange={(e) => setServerSearch(e.target.value)}
                    placeholder={txt.searchPlaceholder}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
                  />
                </div>
                {onAddServer && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddServerOpen((v) => !v);
                      setNewSrvError(null);
                    }}
                    className={`px-3 py-2 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95 ${
                      isAddServerOpen
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : `${theme.solidBgClass} ${theme.solidHoverClass} ${theme.solidTextClass} shadow-md`
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة سيرفر' : 'Add'}</span>
                  </button>
                )}
              </div>

              {/* Inline Add New Server Form */}
              {isAddServerOpen && onAddServer && (
                <div className={`p-3 rounded-2xl bg-slate-900/95 border ${theme.borderClass} space-y-2.5 animate-fade-in`}>
                  <div className={`text-xs font-bold font-mono ${theme.textClass} flex items-center gap-1.5`}>
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة سيرفر جديد' : 'Add New Server'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newSrvName}
                      onChange={(e) => setNewSrvName(e.target.value)}
                      placeholder={isAr ? 'اسم السيرفر (مثال: VIP 1)' : 'Server Name'}
                      className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      value={newSrvIp}
                      onChange={(e) => setNewSrvIp(e.target.value)}
                      placeholder="IP / Host:Port"
                      className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newSrvCountry}
                      onChange={(e) => setNewSrvCountry(e.target.value)}
                      className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                    >
                      <option value="🇩🇿 الجزائر">🇩🇿 الجزائر</option>
                      <option value="🇸🇦 السعودية">🇸🇦 السعودية</option>
                      <option value="🇦🇪 الإمارات">🇦🇪 الإمارات</option>
                      <option value="🇲🇦 المغرب">🇲🇦 المغرب</option>
                      <option value="🇪🇬 مصر">🇪🇬 مصر</option>
                      <option value="🇩🇪 ألمانيا">🇩🇪 ألمانيا</option>
                      <option value="🇫🇷 فرنسا">🇫🇷 فرنسا</option>
                      <option value="🇺🇸 أمريكا">🇺🇸 أمريكا</option>
                      <option value="🇬🇧 بريطانيا">🇬🇧 بريطانيا</option>
                      <option value="🇨🇦 كندا">🇨🇦 كندا</option>
                      <option value="🇸🇬 سنغافورة">🇸🇬 سنغافورة</option>
                      <option value="🌐 مخصص">🌐 مخصص</option>
                    </select>
                    <input
                      type="text"
                      value={newSrvCity}
                      onChange={(e) => setNewSrvCity(e.target.value)}
                      placeholder={isAr ? 'المدينة (اختياري)' : 'City (optional)'}
                      className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                    />
                  </div>

                  <select
                    value={newSrvType}
                    onChange={(e) => setNewSrvType(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                  >
                    <option value="Custom SNI / SSL">Custom SNI / SSL</option>
                    <option value="V2Ray / VLESS">V2Ray / VLESS</option>
                    <option value="SSH / SSL">SSH / SSL</option>
                    <option value="Hysteria UDP">Hysteria UDP</option>
                    <option value="OpenVPN">OpenVPN</option>
                    <option value="DNSTT">DNSTT</option>
                  </select>

                  {newSrvError && (
                    <div className="text-[11px] text-rose-300 font-mono">{newSrvError}</div>
                  )}

                  <button
                    type="button"
                    disabled={newSrvChecking}
                    onClick={async () => {
                      const rawHostPort = newSrvIp.trim();
                      if (!rawHostPort) {
                        setNewSrvError(isAr ? 'يرجى إدخال عنوان IP أو نطاق السيرفر' : 'Please enter Server IP or Host');
                        return;
                      }
                      setNewSrvError(null);
                      setNewSrvChecking(true);
                      const [hostPart, portPart] = rawHostPort.replace(/^https?:\/\//i, '').split('/')[0].split(':');
                      const portNum = parseInt(portPart || '443', 10) || 443;
                      let measuredPing = 35;

                      try {
                        const r = await fetch(`/api/check-host?host=${encodeURIComponent(hostPart)}&port=${portNum}&method=HEAD`);
                        const d = await r.json();
                        if (d.ok) {
                          measuredPing = d.tls?.latencyMs || d.tcp?.latencyMs || d.dnsMs || 35;
                        }
                      } catch {
                        // Offline or custom internal host — save cleanly with default ping
                      }

                      const parts = newSrvCountry.split(' ');
                      const flagEmoji = parts[0] || '🌐';
                      const countryLabel = parts.slice(1).join(' ') || newSrvCountry;

                      onAddServer({
                        name: newSrvName.trim() || `${countryLabel} (${hostPart})`,
                        country: countryLabel,
                        city: newSrvCity.trim() || `${hostPart}:${portNum}`,
                        countryCode: 'CUSTOM',
                        flag: flagEmoji,
                        ip: `${hostPart}:${portNum}`,
                        ping: measuredPing,
                        load: 20,
                        type: newSrvType,
                        speed: '10 Gbps Custom',
                        isCustom: true,
                      });

                      setNewSrvName('');
                      setNewSrvIp('');
                      setNewSrvCity('');
                      setNewSrvChecking(false);
                      setIsAddServerOpen(false);
                      setIsServerModalOpen(false);
                    }}
                    className={`w-full py-2.5 rounded-xl ${theme.buttonClass} font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md`}
                  >
                    {newSrvChecking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{newSrvChecking ? (isAr ? 'جاري الفحص والحفظ...' : 'Testing & Saving...') : (isAr ? 'فحص وحفظ السيرفر' : 'Test & Save Server')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Server List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredServers.map((srv) => {
                const isCurrent = srv.id === selectedServer.id;
                const loc = getLocalizedServer(srv, language);
                return (
                  <div
                    key={srv.id}
                    onClick={() => {
                      onSelectServer(srv);
                      setIsServerModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-start flex items-center justify-between transition-all cursor-pointer ${
                      isCurrent
                        ? `${theme.bgSoftClass} ${theme.borderActiveClass} text-white shadow-md`
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl p-1 bg-slate-950 rounded-xl border border-slate-800/80 shrink-0">
                        {loc.flag}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span>{loc.country}</span>
                          {loc.city && <span className="text-slate-400 font-normal truncate">· {loc.city}</span>}
                          {srv.isCustom && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${theme.bgSoftClass} ${theme.textLightClass} font-mono`}>
                              {isAr ? 'مخصص' : 'Custom'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                          {loc.name} · {txt.serverLoad}: {loc.load}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          srv.ping < 60
                            ? `${theme.bgSoftClass} ${theme.textLightClass}`
                            : srv.ping < 120
                            ? 'bg-slate-800 text-slate-200'
                            : 'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {srv.ping} {txt.pingUnit}
                      </span>
                      {srv.isCustom && onDeleteServer && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteServer(srv.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400"
                          title={isAr ? 'حذف السيرفر' : 'Delete server'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isCurrent && <CheckCircle2 className={`w-4 h-4 ${theme.textClass}`} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
