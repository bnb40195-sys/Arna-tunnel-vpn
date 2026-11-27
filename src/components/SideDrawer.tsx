import React from 'react';
import {
  X,
  Shield,
  Terminal,
  Lock,
  Globe2,
  Radio,
  Flame,
  Send,
  Cpu,
  Fingerprint,
  Activity,
  Code2,
  FileText,
  HelpCircle,
  Languages,
  Waves,
  Sparkles,
  ChevronRight,
  Palette
} from 'lucide-react';
import { ProtocolType, ThemeAccent, AppSettings } from '../types/vpn';
import { THEMES } from '../utils/theme';
import { translations } from '../utils/translations';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeProtocol: ProtocolType | null;
  onSelectProtocol: (protocol: ProtocolType) => void;
  onOpenTool: (toolId: string) => void;
  onOpenTunnelHome?: () => void;
  onOpenSettings: () => void;
  onOpenConfigManager?: () => void;
  onOpenHelp: (topic?: string) => void;
  settings: AppSettings;
  onUpdateSettings: (updater: Partial<AppSettings>) => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  activeProtocol,
  onSelectProtocol,
  onOpenTool,
  onOpenTunnelHome,
  onOpenSettings,
  onOpenConfigManager,
  onOpenHelp,
  settings,
  onUpdateSettings,
}) => {
  const t = translations[settings.language];
  const theme = THEMES[settings.themeAccent] || THEMES.teal;
  const isAr = settings.language === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside
        className={`relative z-10 w-80 max-w-[85vw] h-full bg-[#080d19] border-r border-slate-800 flex flex-col shadow-2xl overflow-y-auto ${
          isAr ? 'order-last border-l border-r-0' : ''
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-[#080d19]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${theme.bgDeepClass} border ${theme.borderClass} flex items-center justify-center`}>
                <Shield className={`w-4 h-4 ${theme.textClass}`} />
              </div>
              <span className="text-lg font-black tracking-wider text-white font-mono">
                Arna tunnel
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {t.appTagline}
          </p>
        </div>

        {/* Content list */}
        <div className="flex-1 py-3 px-3 space-y-5 text-sm">
          {onOpenTunnelHome && (
            <div>
              <button
                onClick={() => {
                  onOpenTunnelHome();
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border ${theme.bgSoftClass} ${theme.borderClass} text-white hover:opacity-90 transition-all`}
              >
                <div className="flex items-center gap-3">
                  <Shield className={`w-4 h-4 ${theme.textClass}`} />
                  <span className="text-xs font-bold">
                    {isAr ? 'النفق الرئيسي (الشاشة الرئيسية)' : 'Tunnel Home'}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}

          {/* PROTOCOLS SECTION */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-mono tracking-wider text-slate-400 font-semibold">
              {t.connectionType}
            </div>
            <div className="space-y-1">
              {[
                { id: 'custom_sni', label: isAr ? 'نفق كوستوم SNI (مثل سناب شات)' : 'Custom SNI (SSL/TLS)', icon: Sparkles },
                { id: 'v2ray', label: t.v2rayXray, icon: Send },
                { id: 'hysteria', label: t.hysteriaCustom, icon: Flame },
                { id: 'ssl_ssh', label: t.sslSshCustom, icon: Lock },
                { id: 'ssh', label: t.sshCustom, icon: Terminal },
                { id: 'dnstt', label: t.dnsttCustom, icon: Radio },
                { id: 'openvpn', label: t.openvpn, icon: Shield },
                { id: 'ssl_ovpn', label: t.sslOvpnCustom, icon: Globe2 },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeProtocol === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectProtocol(item.id as ProtocolType);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                      isActive
                        ? `bg-slate-800 text-white font-semibold border-s-2 ${theme.borderActiveClass}`
                        : 'text-slate-300 hover:bg-slate-900/60 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${theme.textClass}`} />
                    <span className="truncate text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TOOLS SECTION */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-mono tracking-wider text-slate-400 font-semibold">
              {t.tools}
            </div>
            <div className="space-y-1">
              {[
                { id: 'server_analyzer', label: isAr ? 'فحص السيرفرات و SNI و IP والسرعة' : 'Servers, SNI, IP & Speed Lab', icon: Activity },
                { id: 'config_sites', label: isAr ? 'مواقع صنع الكونفيجات' : 'Config Creator Sites', icon: Globe2 },
                { id: 'payload_gen', label: t.payloadGenerator, icon: Code2 },
                { id: 'fingerprint', label: t.deviceFingerprint, icon: Fingerprint },
                { id: 'diagnostics', label: t.systemDiagnostics, icon: Cpu },
                { id: 'encoder', label: t.encoderDecoder, icon: Activity },
                { id: 'logs', label: t.logs, icon: FileText },
              ].map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onOpenTool(tool.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900/60 hover:text-white transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${theme.textClass}`} />
                      <span className="truncate text-xs">{tool.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-600 ${isAr ? 'rotate-180' : ''}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* SETTINGS & HELP */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-mono tracking-wider text-slate-400 font-semibold">
              {t.settings}
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenSettings();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900/60 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Languages className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs">{t.language}</span>
                </div>
                <span className="text-xs font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-emerald-300">
                  {settings.language === 'ar' ? 'العربية' : settings.language}
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenHelp('start');
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900/60 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs">{t.helpAndSupport}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-600 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* APPEARANCE TOGGLES */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-mono tracking-wider text-slate-400 font-semibold">
              {t.appearance}
            </div>
            <div className="space-y-2 px-3 py-2 bg-slate-900/40 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  {t.themeAccent}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {(Object.keys(THEMES) as ThemeAccent[]).map((col) => (
                    <button
                      key={col}
                      onClick={() => onUpdateSettings({ themeAccent: col })}
                      className={`w-4 h-4 rounded-full transition-transform ${THEMES[col].swatchClass} ${
                        settings.themeAccent === col ? 'ring-2 ring-white scale-110' : 'opacity-65 hover:opacity-100'
                      }`}
                      aria-label={col}
                      title={isAr ? THEMES[col].nameAr : THEMES[col].name}
                    />
                  ))}
                </div>
              </div>

              {/* Data waves */}
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Waves className="w-3.5 h-3.5 text-slate-400" />
                  {t.dataWaves}
                </span>
                <input
                  type="checkbox"
                  checked={settings.dataWaves}
                  onChange={(e) => onUpdateSettings({ dataWaves: e.target.checked })}
                  className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
                />
              </div>

              {/* Background animation */}
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  {t.bgAnimation}
                </span>
                <input
                  type="checkbox"
                  checked={settings.backgroundAnimation}
                  onChange={(e) => onUpdateSettings({ backgroundAnimation: e.target.checked })}
                  className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-center text-xs text-slate-500 font-mono">
          {isAr ? 'Arna tunnel — الإصدار 1.0' : 'Arna tunnel v1.0'}
        </div>
      </aside>
    </div>
  );
};
