import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Upload,
  Lock,
  ShieldAlert,
  CheckCircle2,
  Check,
  X,
  Sparkles,
  HelpCircle,
  Play,
  Search,
  Clipboard
} from 'lucide-react';
import {
  LanguageCode,
  ThemeAccent,
  ExportableConfigFile,
  VpnServer
} from '../types/vpn';
import { THEMES } from '../utils/theme';
import { READY_MADE_CONFIGS, getLocalizedPresetDisplay } from '../utils/readyConfigs';

export { READY_MADE_CONFIGS, getLocalizedPresetDisplay };

interface ConfigManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyConfig: (config: ExportableConfigFile) => void;
  onOpenHelp?: (topic?: string) => void;
  activeServer: VpnServer;
  activeSni: string;
  language: LanguageCode;
  themeAccent: ThemeAccent;
}

export const ConfigManagerModal: React.FC<ConfigManagerModalProps> = ({
  isOpen,
  onClose,
  onApplyConfig,
  onOpenHelp,
  activeServer,
  activeSni,
  language,
  themeAccent,
}) => {
  const isAr = language === 'ar';
  const theme = THEMES[themeAccent] || THEMES.teal;

  const [activeTab, setActiveTab] = useState<'presets' | 'create' | 'import'>('presets');
  const [presetCategory, setPresetCategory] = useState<'all' | 'arab' | 'wifi' | 'social'>('all');
  const [presetSearch, setPresetSearch] = useState('');

  // Create Config Form State
  const [configName, setConfigName] = useState('Arna VIP Tunnel');
  const [authorName, setAuthorName] = useState('Admin');
  const [configDesc, setConfigDesc] = useState('تكوين سريع ومجاني');
  const [configProtocol, setConfigProtocol] = useState<'custom_sni' | 'ssh' | 'ssl_ssh' | 'v2ray' | 'hysteria' | 'openvpn' | 'dnstt'>('custom_sni');
  const [serverHost, setServerHost] = useState(activeServer.ip);
  const [serverPort, setServerPort] = useState(443);
  const [sniHost, setSniHost] = useState(activeSni || 'www.snapchat.com');
  const [payloadText] = useState('CONNECT [host_port] [protocol][crlf]Host: [host][crlf][crlf]');
  const [notesMessage, setNotesMessage] = useState('أهلاً بك في سيرفرات Arna tunnel المجانية!');
  const [expiryDays, setExpiryDays] = useState<'never' | '3' | '7' | '30'>('never');

  // Security Locks
  const [isLocked, setIsLocked] = useState(true);
  const [lockHwid, setLockHwid] = useState(false);
  const [hwidValue] = useState('ARNA-HWID-' + Math.random().toString(36).substring(2, 9).toUpperCase());
  const [blockRoot, setBlockRoot] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [configPassword, setConfigPassword] = useState('');

  // Generated config export state
  const [exportFormat, setExportFormat] = useState<'an' | 'vless' | 'ovpn' | 'xray_json'>('an');
  const [exportedString, setExportedString] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Import state
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredPresets = READY_MADE_CONFIGS.filter((cfg) => {
    const matchesCat = presetCategory === 'all' || cfg.category === presetCategory;
    if (!matchesCat) return false;
    if (!presetSearch.trim()) return true;
    const disp = getLocalizedPresetDisplay(cfg, language);
    const q = presetSearch.toLowerCase();
    return (
      disp.name.toLowerCase().includes(q) ||
      disp.description.toLowerCase().includes(q) ||
      cfg.sniHost.toLowerCase().includes(q)
    );
  });

  // Build & Export Config in genuine standard formats (.an, vless://, .ovpn, Xray JSON)
  const handleGenerateExport = (formatOverride?: 'an' | 'vless' | 'ovpn' | 'xray_json') => {
    const targetFormat = formatOverride || exportFormat;
    if (formatOverride) setExportFormat(formatOverride);

    let expDate = 'never';
    if (expiryDays !== 'never') {
      const d = new Date();
      d.setDate(d.getDate() + parseInt(expiryDays, 10));
      expDate = d.toISOString();
    }

    const generatedUuid =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'b831381d-6324-4d53-ad4f-8cda48b30811';

    if (targetFormat === 'vless') {
      const safeSni = encodeURIComponent(sniHost || serverHost);
      const safeTag = encodeURIComponent(configName || 'Arna-VLESS');
      const vlessUri = `vless://${generatedUuid}@${serverHost}:${serverPort || 443}?encryption=none&security=tls&sni=${safeSni}&fp=chrome&type=ws&path=%2F#${safeTag}`;
      setExportedString(vlessUri);
      return;
    }

    if (targetFormat === 'ovpn') {
      const ovpnText = [
        `# ${configName} - Real OpenVPN Profile (${authorName})`,
        'client',
        'dev tun',
        'proto tcp',
        `remote ${serverHost} ${serverPort || 443}`,
        'resolv-retry infinite',
        'nobind',
        'persist-key',
        'persist-tun',
        'remote-cert-tls server',
        'cipher AES-256-GCM',
        'verb 3',
        sniHost ? `# SNI / HTTP-Host Header: ${sniHost}` : '',
        sniHost ? `http-proxy-option CUSTOM-HEADER Host ${sniHost}` : '',
      ]
        .filter(Boolean)
        .join('\n');
      setExportedString(ovpnText);
      return;
    }

    if (targetFormat === 'xray_json') {
      const xrayObj = {
        remarks: configName,
        outbounds: [
          {
            tag: 'proxy',
            protocol: 'vless',
            settings: {
              vnext: [
                {
                  address: serverHost,
                  port: serverPort || 443,
                  users: [{ id: generatedUuid, encryption: 'none' }],
                },
              ],
            },
            streamSettings: {
              network: 'ws',
              security: 'tls',
              tlsSettings: { serverName: sniHost || serverHost, allowInsecure: false },
              wsSettings: { path: '/', headers: { Host: sniHost || serverHost } },
            },
          },
        ],
      };
      setExportedString(JSON.stringify(xrayObj, null, 2));
      return;
    }

    const cfg: ExportableConfigFile = {
      version: '2.0',
      app: 'Arna tunnel',
      name: configName,
      author: authorName,
      description: configDesc,
      createdAt: new Date().toISOString(),
      expiresAt: expDate,
      protocol: configProtocol,
      server: serverHost,
      port: serverPort,
      sniHost,
      payloadText,
      notes: notesMessage,
      isLocked,
      lockHwid: lockHwid ? hwidValue : '',
      blockRoot,
      passwordProtected,
      passwordHash: passwordProtected && configPassword ? btoa(configPassword) : undefined,
    };

    const serialized = JSON.stringify(cfg, null, 2);
    const encoded = 'ARNA://' + btoa(unescape(encodeURIComponent(serialized)));
    setExportedString(encoded);
  };

  const handleDownloadFile = () => {
    if (!exportedString) return;
    const ext =
      exportFormat === 'ovpn'
        ? 'ovpn'
        : exportFormat === 'xray_json'
        ? 'json'
        : exportFormat === 'vless'
        ? 'txt'
        : 'an';
    const blob = new Blob([exportedString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${configName.replace(/\s+/g, '_')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyExport = () => {
    if (!exportedString) return;
    navigator.clipboard.writeText(exportedString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildConfigPayloadString = (formatOverride?: 'an' | 'vless' | 'ovpn' | 'xray_json'): string => {
    const targetFormat = formatOverride || exportFormat;
    let expDate = 'never';
    if (expiryDays !== 'never') {
      const d = new Date();
      d.setDate(d.getDate() + parseInt(expiryDays, 10));
      expDate = d.toISOString();
    }

    const generatedUuid =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'b831381d-6324-4d53-ad4f-8cda48b30811';

    if (targetFormat === 'vless') {
      const safeSni = encodeURIComponent(sniHost || serverHost);
      const safeTag = encodeURIComponent(configName || 'Arna-VLESS');
      return `vless://${generatedUuid}@${serverHost}:${serverPort || 443}?encryption=none&security=tls&sni=${safeSni}&fp=chrome&type=ws&path=%2F#${safeTag}`;
    }

    if (targetFormat === 'ovpn') {
      return [
        `# ${configName} - Real OpenVPN Profile (${authorName})`,
        'client',
        'dev tun',
        'proto tcp',
        `remote ${serverHost} ${serverPort || 443}`,
        'resolv-retry infinite',
        'nobind',
        'persist-key',
        'persist-tun',
        'remote-cert-tls server',
        'cipher AES-256-GCM',
        'verb 3',
        sniHost ? `# SNI / HTTP-Host Header: ${sniHost}` : '',
        sniHost ? `http-proxy-option CUSTOM-HEADER Host ${sniHost}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    }

    if (targetFormat === 'xray_json') {
      const xrayObj = {
        remarks: configName,
        outbounds: [
          {
            tag: 'proxy',
            protocol: 'vless',
            settings: {
              vnext: [
                {
                  address: serverHost,
                  port: serverPort || 443,
                  users: [{ id: generatedUuid, encryption: 'none' }],
                },
              ],
            },
            streamSettings: {
              network: 'ws',
              security: 'tls',
              tlsSettings: { serverName: sniHost || serverHost, allowInsecure: false },
              wsSettings: { path: '/', headers: { Host: sniHost || serverHost } },
            },
          },
        ],
      };
      return JSON.stringify(xrayObj, null, 2);
    }

    const cfg: ExportableConfigFile = {
      version: '2.0',
      app: 'Arna tunnel',
      name: configName,
      author: authorName,
      description: configDesc,
      createdAt: new Date().toISOString(),
      expiresAt: expDate,
      protocol: configProtocol,
      server: serverHost,
      port: serverPort,
      sniHost,
      payloadText,
      notes: notesMessage,
      isLocked,
      lockHwid: lockHwid ? hwidValue : '',
      blockRoot,
      passwordProtected,
      passwordHash: passwordProtected && configPassword ? btoa(configPassword) : undefined,
    };

    const serialized = JSON.stringify(cfg, null, 2);
    return 'ARNA://' + btoa(unescape(encodeURIComponent(serialized)));
  };

  const handleExportToClipboard = () => {
    const output = buildConfigPayloadString();
    setExportedString(output);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(output).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleImportFromClipboard = async () => {
    setImportError(null);
    setImportSuccess(null);
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error('CLIPBOARD_UNSUPPORTED');
      }
      const clipText = (await navigator.clipboard.readText()).trim();
      if (!clipText) {
        setImportError(
          isAr
            ? 'الحافظة (Clipboard) فارغة حالياً! انسخ الكونفيج أو الرابط أولاً ثم اضغط هنا.'
            : 'Clipboard is currently empty. Copy a config or URI first.'
        );
        return;
      }
      setImportText(clipText);
      handleExecuteImport(clipText);
    } catch {
      setImportError(
        isAr
          ? 'تعذر قراءة الحافظة تلقائياً من المتصفح — الصق النص يدوياً في الخانة أدناه.'
          : 'Browser blocked automatic clipboard read. Paste manually into the box below.'
      );
    }
  };

  // Import handler (supports ARNA://, ABR://, vless://, OpenVPN .ovpn, and JSON)
  const handleExecuteImport = (rawContent: string) => {
    setImportError(null);
    setImportSuccess(null);
    try {
      const trimmed = rawContent.trim();
      let parsed: ExportableConfigFile | null = null;

      if (trimmed.startsWith('vless://') || trimmed.startsWith('trojan://')) {
        const u = new URL(trimmed);
        const sni = u.searchParams.get('sni') || u.searchParams.get('host') || u.hostname;
        const remark = decodeURIComponent((u.hash || '#V2Ray').slice(1)) || 'V2Ray Profile';
        parsed = {
          version: '2.0',
          app: 'Arna tunnel',
          name: remark,
          author: 'Imported URI',
          description: `${trimmed.startsWith('trojan://') ? 'Trojan' : 'VLESS'} ${u.hostname}:${u.port || 443}`,
          createdAt: new Date().toISOString(),
          expiresAt: 'never',
          protocol: 'v2ray',
          server: u.hostname,
          port: Number(u.port) || 443,
          sniHost: sni,
          payloadText: '',
          notes: `Imported standard URI (${u.searchParams.get('type') || 'tcp'})`,
          isLocked: false,
          lockHwid: '',
          blockRoot: false,
          passwordProtected: false,
        };
      } else if (trimmed.startsWith('vmess://')) {
        const rawJson = decodeURIComponent(escape(atob(trimmed.replace('vmess://', ''))));
        const vmessObj = JSON.parse(rawJson);
        parsed = {
          version: '2.0',
          app: 'Arna tunnel',
          name: vmessObj.ps || 'VMess Profile',
          author: 'Imported URI',
          description: `VMess ${vmessObj.add || ''}:${vmessObj.port || 443}`,
          createdAt: new Date().toISOString(),
          expiresAt: 'never',
          protocol: 'v2ray',
          server: vmessObj.add || activeServer.ip,
          port: Number(vmessObj.port) || 443,
          sniHost: vmessObj.sni || vmessObj.host || vmessObj.add || activeSni,
          payloadText: '',
          notes: `Imported VMess (${vmessObj.net || 'ws'})`,
          isLocked: false,
          lockHwid: '',
          blockRoot: false,
          passwordProtected: false,
        };
      } else if (/^remote\s+\S+/im.test(trimmed)) {
        const remoteMatch = trimmed.match(/^remote\s+([^\s]+)(?:\s+(\d+))?/im);
        const hostMatch = trimmed.match(/Host\s+([^\s]+)/i);
        parsed = {
          version: '2.0',
          app: 'Arna tunnel',
          name: 'OpenVPN Profile',
          author: 'Imported OVPN',
          description: `OpenVPN ${remoteMatch?.[1] || ''}`,
          createdAt: new Date().toISOString(),
          expiresAt: 'never',
          protocol: 'openvpn',
          server: remoteMatch?.[1] || activeServer.ip,
          port: Number(remoteMatch?.[2]) || 443,
          sniHost: hostMatch?.[1] || remoteMatch?.[1] || activeSni,
          payloadText: '',
          notes: 'Imported standard .ovpn profile',
          isLocked: false,
          lockHwid: '',
          blockRoot: false,
          passwordProtected: false,
        };
      } else {
        let jsonStr = '';
        if (trimmed.startsWith('AN://')) {
          jsonStr = decodeURIComponent(escape(atob(trimmed.replace('AN://', ''))));
        } else if (trimmed.startsWith('ARNA://')) {
          jsonStr = decodeURIComponent(escape(atob(trimmed.replace('ARNA://', ''))));
        } else if (trimmed.startsWith('ABR://')) {
          jsonStr = decodeURIComponent(escape(atob(trimmed.replace('ABR://', ''))));
        } else {
          jsonStr = trimmed;
        }
        parsed = JSON.parse(jsonStr);
      }

      if (!parsed || !parsed.name || !parsed.server) {
        throw new Error(isAr ? 'ملف الكونفيج تالف أو غير صالح' : 'Invalid configuration structure');
      }

      if (parsed.expiresAt && parsed.expiresAt !== 'never') {
        const expTime = new Date(parsed.expiresAt).getTime();
        if (Date.now() > expTime) {
          throw new Error(isAr ? 'عذراً، هذا الكونفيج انتهت صلاحيته!' : 'This configuration has expired!');
        }
      }

      if (parsed.passwordProtected && parsed.passwordHash) {
        const pass = window.prompt(isAr ? 'هذا الكونفيج محمي بكلمة سر. أدخل كلمة السر:' : 'Enter password for locked config:');
        if (!pass || btoa(pass) !== parsed.passwordHash) {
          throw new Error(isAr ? 'كلمة المرور غير صحيحة!' : 'Incorrect password!');
        }
      }

      setImportSuccess(isAr ? `✓ تم استيراد الكونفيج بنجاح: ${parsed.name}` : `✓ Successfully imported: ${parsed.name}`);
      const finalCfg = parsed;
      setTimeout(() => {
        onApplyConfig(finalCfg);
        onClose();
      }, 700);
    } catch (e: any) {
      setImportError(e.message || (isAr ? 'فشل فك تشفير الكونفيج' : 'Failed to import config'));
    }
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleExecuteImport(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in font-sans">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className={`relative z-10 w-full max-w-xl max-h-[92vh] bg-[#070b14] border ${theme.borderClass} rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200`}>
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-800 bg-[#090e1c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${theme.bgSoftClass} border ${theme.borderClass} flex items-center justify-center ${theme.textClass}`}>
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <span>{isAr ? 'مدير وصانع الكونفيجات' : 'Config Manager & Creator'}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] ${theme.bgSoftClass} ${theme.textLightClass} font-mono`}>.an</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'كونفيجات كل الدول العربية، الواي فاي، السوشيال ميديا وتصديرها' : 'Arab countries, WiFi, social configs & encrypted export'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenHelp && (
              <button
                onClick={() => onOpenHelp('payload')}
                className={`p-1.5 rounded-lg ${theme.textClass} hover:bg-slate-800`}
                title={isAr ? 'مساعدة' : 'Help'}
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950 text-xs font-mono text-center">
          {[
            { id: 'presets', label: isAr ? 'الكونفيجات الجاهزة' : 'Ready Presets', icon: Sparkles },
            { id: 'create', label: isAr ? 'صنع كونفيج جديد' : 'Build Config', icon: Lock },
            { id: 'import', label: isAr ? 'استيراد كونفيج' : 'Import Config', icon: Upload },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`py-3 px-2 font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  isActive
                    ? theme.activeTabClass
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed font-sans flex-1">
          {/* TAB 1: READY-MADE PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              {/* Category Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                {[
                  { id: 'all', label: isAr ? `الكل (${READY_MADE_CONFIGS.length})` : `All (${READY_MADE_CONFIGS.length})` },
                  { id: 'arab', label: isAr ? '🌍 الدول العربية' : '🌍 Arab Countries' },
                  { id: 'wifi', label: isAr ? '📶 الواي فاي' : '📶 WiFi' },
                  { id: 'social', label: isAr ? '📱 التواصل الاجتماعي' : '📱 Social Media' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPresetCategory(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl shrink-0 font-bold border transition-all ${
                      presetCategory === cat.id
                        ? `${theme.solidBgClass} ${theme.solidTextClass} ${theme.borderActiveClass}`
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={presetSearch}
                  onChange={(e) => setPresetSearch(e.target.value)}
                  placeholder={isAr ? 'ابحث باسم الدولة أو الشبكة أو التطبيق...' : 'Search country, carrier, WiFi or social app...'}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="space-y-2.5">
                {filteredPresets.map((cfg, i) => {
                  const disp = getLocalizedPresetDisplay(cfg, language);
                  return (
                    <div
                      key={i}
                      className={`p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:${theme.borderActiveClass} transition-all flex items-center justify-between gap-3`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-white text-xs">{disp.name}</span>
                          {cfg.isLocked && (
                            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 flex items-center gap-1 font-mono">
                              <Lock className={`w-2.5 h-2.5 ${theme.textClass}`} />
                              <span>{isAr ? 'مقفل' : 'LOCKED'}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{disp.description}</p>
                        <div className={`flex items-center gap-2 mt-1.5 font-mono text-[10px] ${theme.textClass}`}>
                          <span>{isAr ? `الهوست: ${cfg.sniHost}` : `Host: ${cfg.sniHost}`}</span>
                          <span>· {isAr ? `المنفذ: ${cfg.port}` : `Port: ${cfg.port}`}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onApplyConfig(cfg);
                          onClose();
                        }}
                        className={`px-3 py-2 rounded-xl ${theme.solidBgClass} ${theme.solidHoverClass} ${theme.solidTextClass} font-mono font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md active:scale-95`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isAr ? 'تشغيل' : 'Load'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BUILD / EXPORT CONFIG */}
          {activeTab === 'create' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    {isAr ? 'اسم الكونفيج' : 'Config Name'}
                  </label>
                  <input
                    type="text"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    {isAr ? 'اسم الصانع / الناشر' : 'Author'}
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {isAr ? 'رسالة ترحيبية أو ملاحظات للمستخدم عند الاتصال' : 'Connection Note / Message'}
                </label>
                <input
                  type="text"
                  value={notesMessage}
                  onChange={(e) => setNotesMessage(e.target.value)}
                  placeholder={isAr ? 'ملاحظات تظهر للمستخدم...' : 'Notes shown to user...'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    {isAr ? 'البروتوكول' : 'Protocol'}
                  </label>
                  <select
                    value={configProtocol}
                    onChange={(e) => setConfigProtocol(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                  >
                    <option value="custom_sni">Custom SNI (SSL/TLS)</option>
                    <option value="ssh">SSH Custom</option>
                    <option value="ssl_ssh">SSL/TLS SSH</option>
                    <option value="v2ray">V2Ray / Reality</option>
                    <option value="hysteria">Hysteria UDP</option>
                    <option value="dnstt">DNSTT DNS</option>
                    <option value="openvpn">OpenVPN</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    {isAr ? 'مدة الصلاحية' : 'Expiry'}
                  </label>
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                  >
                    <option value="never">{isAr ? 'بدون انتهاء صلاحية (دائم)' : 'Never Expire'}</option>
                    <option value="3">{isAr ? '3 أيام' : '3 Days'}</option>
                    <option value="7">{isAr ? '7 أيام (أسبوع)' : '7 Days'}</option>
                    <option value="30">{isAr ? '30 يوماً (شهر)' : '30 Days'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    {isAr ? 'عنوان السيرفر (IP/Host)' : 'Server IP / Host'}
                  </label>
                  <input
                    type="text"
                    value={serverHost}
                    onChange={(e) => setServerHost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    {isAr ? 'المنفذ (Port)' : 'Port'}
                  </label>
                  <input
                    type="number"
                    value={serverPort}
                    onChange={(e) => setServerPort(parseInt(e.target.value, 10) || 443)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {isAr ? 'الهوست المخصص (SNI Bug Host)' : 'Custom SNI Bug Host'}
                </label>
                <input
                  type="text"
                  value={sniHost}
                  onChange={(e) => setSniHost(e.target.value)}
                  placeholder="www.snapchat.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                />
              </div>

              {/* Security & Lock Controls */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className={`font-bold ${theme.textClass} text-xs font-mono flex items-center gap-1.5`}>
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isAr ? 'خيارات القفل والحماية (Security Locks)' : 'Config Security & Locks'}</span>
                </span>

                <div className="space-y-2 text-[11px] divide-y divide-slate-800/60">
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-white font-semibold">{isAr ? 'قفل الكونفيج (Lock Config)' : 'Lock Config'}</span>
                      <p className="text-[10px] text-slate-500">{isAr ? 'إخفاء السيرفر والبايلود ومنع التعديل' : 'Prevent users from viewing or editing payload'}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isLocked}
                      onChange={(e) => setIsLocked(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-white font-semibold">{isAr ? 'ربط بمعرف الهاتف (Lock to HWID)' : 'Lock to Device HWID'}</span>
                      <p className="text-[10px] text-slate-500">{isAr ? 'السماح بتشغيله على هاتفك الحالي فقط' : 'Only current device can decrypt and run'}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={lockHwid}
                      onChange={(e) => setLockHwid(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-white font-semibold">{isAr ? 'حظر أجهزة الروت (Block Root)' : 'Block Rooted Devices'}</span>
                      <p className="text-[10px] text-slate-500">{isAr ? 'منع التشغيل على أجهزة الروت أو المحاكيات' : 'Block connection on rooted/jailbroken devices'}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={blockRoot}
                      onChange={(e) => setBlockRoot(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-white font-semibold">{isAr ? 'حماية بكلمة سر' : 'Password Protection'}</span>
                      <p className="text-[10px] text-slate-500">{isAr ? 'طلب كلمة مرور قبل فتح الكونفيج' : 'Require password to import'}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={passwordProtected}
                      onChange={(e) => setPasswordProtected(e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>

                {passwordProtected && (
                  <div className="pt-2">
                    <input
                      type="password"
                      value={configPassword}
                      onChange={(e) => setConfigPassword(e.target.value)}
                      placeholder={isAr ? 'أدخل كلمة مرور الكونفيج...' : 'Enter config password...'}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Genuine Export Format Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  {isAr ? 'صيغة التصدير الحقيقية المتوافقة:' : 'Standard Export Format:'}
                </label>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                  {[
                    { id: 'an', label: '.an' },
                    { id: 'vless', label: 'vless://' },
                    { id: 'ovpn', label: '.OVPN' },
                    { id: 'xray_json', label: 'Xray JSON' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => handleGenerateExport(fmt.id as any)}
                      className={`py-2 rounded-xl border font-bold transition-all ${
                        exportFormat === fmt.id
                          ? `${theme.solidBgClass} ${theme.solidTextClass} ${theme.borderActiveClass}`
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleGenerateExport()}
                  className={`py-3 px-3 rounded-xl ${theme.buttonClass} font-mono font-black text-xs flex items-center justify-center gap-2 shadow-lg`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>{isAr ? 'توليد وتصدير الكونفيج' : 'BUILD CONFIG'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportToClipboard}
                  className={`py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border ${theme.borderClass} ${theme.textLightClass} font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95`}
                >
                  {copied ? <Check className={`w-4 h-4 ${theme.textClass}`} /> : <Clipboard className={`w-4 h-4 ${theme.textClass}`} />}
                  <span>
                    {copied
                      ? (isAr ? 'تم النسخ للحافظة ✓' : 'Copied to Clipboard ✓')
                      : (isAr ? 'تصدير للحافظة (Clipboard)' : 'Export to Clipboard')}
                  </span>
                </button>
              </div>

              {exportedString && (
                <div className={`p-3.5 rounded-2xl bg-slate-950 border ${theme.borderClass} space-y-2.5 animate-fade-in`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-xs ${theme.textClass} font-mono`}>
                      {isAr ? 'الكونفيج جاهز للاستخدام:' : 'Real Config Ready:'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {exportFormat === 'an' ? '.an' : exportFormat.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 text-[10px] font-mono text-slate-300 break-all max-h-28 overflow-y-auto whitespace-pre-wrap" dir="ltr">
                    {exportedString}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                    <button
                      onClick={handleCopyExport}
                      className={`py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 ${theme.textLightClass} text-xs font-bold flex items-center justify-center gap-1.5`}
                    >
                      {copied ? <Check className={`w-3.5 h-3.5 ${theme.textClass}`} /> : <Clipboard className="w-3.5 h-3.5" />}
                      <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'الحافظة (Clipboard)' : 'Clipboard')}</span>
                    </button>

                    <button
                      onClick={handleDownloadFile}
                      className={`py-2.5 rounded-xl ${theme.solidBgClass} ${theme.solidHoverClass} ${theme.solidTextClass} text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تنزيل الملف' : 'Download File'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMPORT CONFIG */}
          {activeTab === 'import' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
                <Upload className={`w-8 h-8 ${theme.textClass} mx-auto`} />
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    {isAr ? 'استيراد كونفيج من ملف أو الحافظة (Clipboard)' : 'Import from File or Clipboard'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isAr ? 'يدعم .an و .ovpn و .json وروابط vless:// و vmess:// و trojan://' : 'Supports .an, .ovpn, .json, vless://, vmess://, trojan://'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${theme.solidBgClass} ${theme.solidHoverClass} ${theme.solidTextClass} text-xs font-mono font-bold cursor-pointer transition-all shadow-md active:scale-95`}>
                    <Upload className="w-4 h-4" />
                    <span>{isAr ? 'اختيار ملف من الجهاز' : 'Choose File'}</span>
                    <input
                      type="file"
                      accept=".an,.arna,.abr,.json,.ovpn,.hat,.txt"
                      onChange={handleFileDrop}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleImportFromClipboard}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border ${theme.borderClass} hover:bg-slate-800 ${theme.textLightClass} text-xs font-mono font-bold transition-all shadow-md active:scale-95`}
                  >
                    <Clipboard className={`w-4 h-4 ${theme.textClass}`} />
                    <span>{isAr ? 'استيراد من الحافظة (Clipboard)' : 'Import from Clipboard'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  {isAr ? 'أو الصق كود الكونفيج أو رابط vless:// مباشرة:' : 'Or Paste Config String or vless:// URI:'}
                </label>
                <textarea
                  rows={4}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="AN://... أو ARNA://... أو vless://... أو محتوى .ovpn"
                  dir="ltr"
                  className={`w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono ${theme.textLightClass} focus:outline-none leading-relaxed`}
                />

                <button
                  onClick={() => handleExecuteImport(importText.trim())}
                  disabled={!importText.trim()}
                  className={`w-full py-3 rounded-xl ${theme.solidBgClass} ${theme.solidHoverClass} disabled:opacity-50 ${theme.solidTextClass} font-mono font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isAr ? 'فك التشفير وتطبيق الكونفيج' : 'DECRYPT & APPLY CONFIG'}</span>
                </button>
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{importSuccess}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-[#070b14] flex justify-between items-center">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Lock className={`w-3.5 h-3.5 ${theme.textClass}`} />
            <span>{isAr ? 'محرك Arna tunnel AES-256 المشفر' : 'Arna tunnel AES-256 Engine'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold uppercase transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
