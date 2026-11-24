import React, { useState, useEffect } from 'react';
import {
  ConnectionState,
  ProtocolType,
  VpnServer,
  AppSettings,
  LogEntry,
  AbrTunnelConfig,
  ExportableConfigFile
} from './types/vpn';
import { INITIAL_SERVERS, INITIAL_LOGS } from './utils/mockData';
import { THEMES } from './utils/theme';

// Navigation
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { AppHeader } from './components/AppHeader';
import { SideDrawer } from './components/SideDrawer';
import { useOnlineStatus } from './hooks/usePWAInstall';

export type MainTab = 'tunnel' | 'protocols' | 'tools' | 'settings';

// Main views
import { AbrHomeView } from './components/AbrHomeView';
import { ProtocolsHub } from './components/protocols/ProtocolsHub';
import { ToolsHub } from './components/tools/ToolsHub';
import { SettingsView } from './components/settings/SettingsView';

// Protocols
import { CustomSniConfig } from './components/protocols/CustomSniConfig';
import { SSHConfig } from './components/protocols/SSHConfig';
import { DNSTTConfig } from './components/protocols/DNSTTConfig';
import { OpenVPNConfig } from './components/protocols/OpenVPNConfig';
import { HysteriaConfig } from './components/protocols/HysteriaConfig';
import { V2RayConfig } from './components/protocols/V2RayConfig';

// Tools
import { SpeedTest } from './components/tools/SpeedTest';
import { HostChecker } from './components/tools/HostChecker';
import { SameIPChecker } from './components/tools/SameIPChecker';
import { PayloadGenerator } from './components/tools/PayloadGenerator';
import { DeviceFingerprint } from './components/tools/DeviceFingerprint';
import { SystemDiagnostics } from './components/tools/SystemDiagnostics';
import { EncoderDecoder } from './components/tools/EncoderDecoder';
import { ConnectionLogs } from './components/tools/ConnectionLogs';
import { ConfigSitesTool } from './components/tools/ConfigSitesTool';
import { VpnHotspotShare } from './components/tools/VpnHotspotShare';

// Modals
import { AddTimeModal } from './components/AddTimeModal';
import { ConfigManagerModal } from './components/ConfigManagerModal';
import { HelpCenterModal } from './components/help/HelpCenterModal';

export default function App() {
  // App Settings - Default to Arabic & Ocean Teal theme
  const [settings, setSettings] = useState<AppSettings>({
    language: 'ar',
    themeAccent: 'teal',
    appStyle: 'abr_modern',
    darkMode: true,
    timeReminder: true,
    backgroundAnimation: true,
    dataWaves: true,
    udpForwarding: true,
    autoReconnect: true,
    killSwitch: false,
    dnsLeakProtection: true,
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('tunnel');
  const [activeProtocol, setActiveProtocol] = useState<ProtocolType | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // Dialogs
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddTimeOpen, setIsAddTimeOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpTopic, setHelpTopic] = useState<string | undefined>(undefined);

  const isOnline = useOnlineStatus();
  const [internetPrompt, setInternetPrompt] = useState<{
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    onProceed?: () => void;
  } | null>(null);

  const openHelp = (topic?: string) => {
    setHelpTopic(topic);
    setIsHelpOpen(true);
  };

  const requestInternetAccess = (
    descAr: string,
    descEn: string,
    onProceed?: () => void
  ) => {
    setInternetPrompt({
      titleAr: 'طلب الوصول إلى الإنترنت',
      titleEn: 'Internet Access Required',
      descAr,
      descEn,
      onProceed,
    });
  };

  // ABR Tunnel Configuration
  const [abrConfig, setAbrConfig] = useState<AbrTunnelConfig>({
    selectedPort: 'AUTO',
    customSetup: false,
    connectionMode: 'Custom SNI',
    customSni: 'free.ooredoo.dz',
    useTcpPayload: true,
    useRealmHost: false,
    preserveSni: true,
    tcpPayloadText: 'CONNECT [host_port] HTTP/1.1[crlf]Host: free.ooredoo.dz[crlf]Connection: Keep-Alive[crlf][crlf]',
  });

  // Traffic counters (session bytes)
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);

  // Connection State
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [, setRemainingSeconds] = useState(900);
  const [selectedServer, setSelectedServer] = useState<VpnServer>(INITIAL_SERVERS[0]);
  const [activeConfigName, setActiveConfigName] = useState<string | null>('OOREDOO Free (Some Areas)');

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

  useEffect(() => {
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  useEffect(() => {
    const activeTheme = THEMES[settings.themeAccent] || THEMES.teal;
    const root = document.documentElement;
    root.style.setProperty('--arna-accent-rgb', activeTheme.rgb);
    root.style.accentColor = activeTheme.primary;
    Object.entries(activeTheme.shades).forEach(([shade, hex]) => {
      root.style.setProperty(`--color-emerald-${shade}`, hex);
      root.style.setProperty(`--color-teal-${shade}`, hex);
    });
  }, [settings.themeAccent]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (connectionState === 'connected') {
      timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setConnectionState('disconnected');
            addLog('INFO', 'انتهت مدة الجلسة المتبقية. يرجى إعادة الاتصال.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [connectionState]);

  const addLog = (type: LogEntry['type'], message: string) => {
    const newEntry: LogEntry = {
      id: Date.now().toString() + '-' + Math.floor(Math.random() * 1000),
      time: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [newEntry, ...prev.slice(0, 50)]);
  };

  const startHandshakeConnect = async () => {
    setConnectionState('connecting');
    const targetHost = (abrConfig.customSni || selectedServer.ip || 'www.snapchat.com').trim();
    const numericPort = abrConfig.selectedPort.startsWith('P ')
      ? parseInt(abrConfig.selectedPort.replace('P ', ''), 10) || 443
      : 443;

    addLog('INFO', `بدء فحص الاتصال الحقيقي عبر ${selectedServer.name} (${abrConfig.connectionMode})`);

    try {
      const probeStart = performance.now();
      const resp = await fetch(`/api/check-host?host=${encodeURIComponent(targetHost)}&port=${numericPort}&method=HEAD`);
      const probeBytes = new Blob([JSON.stringify(resp)]).size + 512;
      setDownloadedBytes((b) => b + probeBytes);
      setUploadedBytes((b) => b + 256);

      const data = await resp.json();
      const rtt = Math.round(performance.now() - probeStart);

      if (data.ok && data.tls?.connected) {
        const resolvedIp = (data.ipv4 && data.ipv4[0]) || (data.ipv6 && data.ipv6[0]) || selectedServer.ip;
        addLog('SSH', `نجح فحص الهوست SNI: ${targetHost} -> IP ${resolvedIp}`);
        addLog(
          'VPN',
          `تم تفعيل بروكسي الويب الداخلي (${data.tls.protocol || 'TLS'}, ${data.tls.cipherName || 'AES'}) | زمن الاستجابة الفعلي: ${data.tls.latencyMs ?? rtt} مللي ثانية`
        );
        setConnectionState('connected');
      } else if (data.ok) {
        addLog('INFO', `تم حل DNS للنطاق ${targetHost} (أحد المنافذ قد يكون مقيداً): ${data.tls?.error || 'تفعيل البروكسي الداخلي'}`);
        addLog('VPN', `تم تفعيل بروكسي التصفح الداخلي Arna tunnel (ملاحظة: نفق النظام الكامل tun0 يتطلب تطبيق أندرويد أصلي).`);
        setConnectionState('connected');
      } else {
        addLog('ERROR', `تعذر الوصول إلى ${targetHost}: ${data.error || 'فشل الاتصال'}`);
        setConnectionState('disconnected');
      }
    } catch (err) {
      addLog('ERROR', `فشل فحص الشبكة الحقيقي: ${err instanceof Error ? err.message : 'لا يوجد اتصال بالخادم'}`);
      setConnectionState('disconnected');
    }
  };

  const ONLINE_TOOLS = new Set(['config_sites', 'speed_test', 'host_checker', 'same_ip']);

  const handleToggleConnect = () => {
    if (connectionState === 'connected') {
      setConnectionState('disconnected');
      addLog('INFO', 'تم إيقاف بروكسي Arna tunnel الداخلي.');
    } else if (connectionState === 'disconnected') {
      if (!isOnline) {
        requestInternetAccess(
          'فحص الخادم وتشغيل بروكسي التصفح الداخلي يتطلبان اتصالاً بالإنترنت.',
          'Probing hosts and using the in-app web proxy requires internet access.',
          () => startHandshakeConnect()
        );
        return;
      }
      startHandshakeConnect();
    }
  };

  const handleProtocolSelect = (proto: ProtocolType) => {
    setActiveTool(null);
    if (!isOnline) {
      requestInternetAccess(
        'تشغيل هذا البروتوكول يتطلب الوصول إلى الإنترنت للاتصال بالخادم. يمكنك إعداد القيم محلياً أو الاتصال لاحقاً.',
        'This protocol requires internet access to reach servers. You can configure locally or enable internet.',
        () => {
          setActiveProtocol(proto);
          setActiveTab('protocols');
        }
      );
      return;
    }
    setActiveProtocol(proto);
    setActiveTab('protocols');
    addLog('INFO', `تم اختيار البروتوكول: ${proto}`);
  };

  const handleOpenTool = (toolId: string) => {
    if (toolId === 'config_manager') {
      setIsConfigModalOpen(true);
      return;
    }
    if (ONLINE_TOOLS.has(toolId) && !isOnline && connectionState !== 'connected') {
      requestInternetAccess(
        'هذه الأداة تحتاج إلى إذن الوصول إلى الإنترنت لفتح المواقع أو فحص الشبكة. باقي التطبيق والأدوات المحلية تعمل بدون إنترنت.',
        'This tool requires internet access to fetch live sites or network diagnostics. Other tools work offline.',
        () => {
          setActiveTool(toolId);
          setActiveTab('tools');
        }
      );
      return;
    }
    setActiveTool(toolId);
    setActiveTab('tools');
  };

  const handleClearCustomConfig = () => {
    setAbrConfig({
      selectedPort: 'AUTO',
      customSetup: false,
      connectionMode: 'Custom SNI',
      customSni: 'free.ooredoo.dz',
      useTcpPayload: true,
      useRealmHost: false,
      preserveSni: true,
      tcpPayloadText: '',
    });
    setActiveConfigName('OOREDOO Free (Some Areas)');
    addLog('INFO', 'تم مسح الإعدادات المخصصة وإعادة ضبط الإعداد الافتراضي.');
  };

  const handleApplyExportableConfig = (cfg: ExportableConfigFile) => {
    setAbrConfig((prev) => ({
      ...prev,
      selectedPort: `P ${cfg.port}`,
      customSetup: true,
      connectionMode:
        cfg.protocol === 'custom_sni' || cfg.protocol === 'ssl_ssh'
          ? 'Custom SNI'
          : cfg.protocol === 'dnstt'
          ? 'SlowDNS'
          : cfg.protocol === 'hysteria'
          ? 'Hysteria UDP'
          : 'Custom Payload',
      customSni: cfg.sniHost || prev.customSni,
      useTcpPayload: Boolean(cfg.payloadText),
      tcpPayloadText: cfg.payloadText || prev.tcpPayloadText,
    }));
    setActiveConfigName(cfg.name);

    if (cfg.protocol) {
      setActiveProtocol(cfg.protocol);
    }

    addLog('INFO', `تم تحميل الكونفيج: ${cfg.name} (${cfg.sniHost || cfg.server})`);
    if (cfg.notes) {
      addLog('INFO', `ملاحظة الكونفيج: ${cfg.notes}`);
    }
    setActiveTab('tunnel');
  };

  return (
    <div
      className={`min-h-screen bg-[#070b14] text-slate-100 ${
        settings.backgroundAnimation ? 'bg-circuit-grid' : ''
      }`}
    >
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative pb-4 shadow-2xl border-x border-slate-900/60 bg-[#080d19]/95">
        {/* SIDE DRAWER */}
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeProtocol={activeProtocol}
          onSelectProtocol={handleProtocolSelect}
          onOpenTool={handleOpenTool}
          onOpenTunnelHome={() => {
            setActiveTab('tunnel');
            setActiveProtocol(null);
            setActiveTool(null);
          }}
          onOpenSettings={() => setActiveTab('settings')}
          onOpenConfigManager={() => setIsConfigModalOpen(true)}
          onOpenHelp={openHelp}
          settings={settings}
          onUpdateSettings={(up) => setSettings((s) => ({ ...s, ...up }))}
        />

        {/* MAIN BODY VIEW ROUTER */}
        <main className="flex-1 p-4 overflow-y-auto">
          <AppHeader
            connectionState={connectionState}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onOpenConfigManager={() => setIsConfigModalOpen(true)}
            onOpenHelp={openHelp}
            onChangeTheme={(themeAccent) => setSettings((s) => ({ ...s, themeAccent }))}
            language={settings.language}
            themeAccent={settings.themeAccent}
            showBackToTunnel={activeTab !== 'tunnel'}
            onBackToTunnel={() => {
              setActiveTab('tunnel');
              setActiveProtocol(null);
              setActiveTool(null);
            }}
          />

          {/* TAB 1: TUNNEL HOME */}
          {activeTab === 'tunnel' && (
            <AbrHomeView
              connectionState={connectionState}
              onToggleConnect={handleToggleConnect}
              selectedServer={selectedServer}
              servers={INITIAL_SERVERS}
              onSelectServer={(srv) => {
                setSelectedServer(srv);
                addLog('INFO', `تم تغيير السيرفر إلى: ${srv.country} (${srv.city || ''})`);
              }}
              abrConfig={abrConfig}
              onUpdateAbrConfig={(updates) => {
                setAbrConfig((prev) => ({ ...prev, ...updates }));
                if (updates.customSni !== undefined) {
                  setActiveConfigName(null);
                }
              }}
              onApplyConfig={handleApplyExportableConfig}
              activeConfigName={activeConfigName}
              uploadedBytes={uploadedBytes}
              downloadedBytes={downloadedBytes}
              onOpenVpnShare={() => handleOpenTool('vpn_share')}
              language={settings.language}
              themeAccent={settings.themeAccent}
            />
          )}

          {/* TAB 2: PROTOCOLS */}
          {activeTab === 'protocols' && (
            <div>
              {!activeProtocol ? (
                <ProtocolsHub
                  onSelectProtocol={handleProtocolSelect}
                  onOpenImport={() => setIsConfigModalOpen(true)}
                  onOpenHelp={openHelp}
                  language={settings.language}
                  themeAccent={settings.themeAccent}
                />
              ) : null}

              {activeProtocol === 'custom_sni' && (
                <CustomSniConfig
                  initialConfig={{
                    sniHost: abrConfig.customSni,
                    serverPort:
                      abrConfig.selectedPort === 'AUTO'
                        ? '443'
                        : abrConfig.selectedPort.replace('P ', ''),
                    payloadText: abrConfig.tcpPayloadText,
                    usePayload: abrConfig.useTcpPayload,
                    preserveSni: abrConfig.preserveSni,
                  }}
                  onSaveAndConnect={(cfg) => {
                    setAbrConfig((prev) => ({
                      ...prev,
                      customSni: cfg.sniHost,
                      selectedPort: `P ${cfg.serverPort}`,
                      tcpPayloadText: cfg.payloadText,
                      useTcpPayload: cfg.usePayload,
                      preserveSni: cfg.preserveSni,
                      connectionMode: 'Custom SNI',
                      customSetup: true,
                    }));
                    addLog('SSH', `تطبيق كوستوم SNI: ${cfg.sniHost} عبر المنفذ ${cfg.serverPort}`);
                    setActiveTab('tunnel');
                    startHandshakeConnect();
                  }}
                  onBack={() => setActiveProtocol(null)}
                  onOpenHelp={openHelp}
                  themeAccent={settings.themeAccent}
                  language={settings.language}
                />
              )}

              {activeProtocol === 'ssh' && (
                <SSHConfig
                  isSslMode={false}
                  onSaveAndConnect={(cfg) => {
                    addLog('SSH', `اتصال عبر SSH المخصص: ${cfg.server}`);
                    setActiveTab('tunnel');
                    startHandshakeConnect();
                  }}
                  onBack={() => setActiveProtocol(null)}
                  onOpenHelp={openHelp}
                  themeAccent={settings.themeAccent}
                  language={settings.language}
                />
              )}

              {activeProtocol === 'ssl_ssh' && (
                <SSHConfig
                  isSslMode={true}
                  onSaveAndConnect={(cfg) => {
                    addLog('SSH', `اتصال عبر SSL/TLS SSH (SNI: ${cfg.sniHost})`);
                    setActiveTab('tunnel');
                    startHandshakeConnect();
                  }}
                  onBack={() => setActiveProtocol(null)}
                  onOpenHelp={openHelp}
                  themeAccent={settings.themeAccent}
                  language={settings.language}
                />
              )}

              {activeProtocol === 'dnstt' && (
                <DNSTTConfig
                  onSaveAndConnect={(cfg) => {
                    addLog('VPN', `اتصال عبر DNSTT مع ${cfg.dnsResolver}`);
                    setActiveTab('tunnel');
                    startHandshakeConnect();
                  }}
                  onBack={() => setActiveProtocol(null)}
                  onOpenHelp={openHelp}
                  themeAccent={settings.themeAccent}
                  language={settings.language}
                />
              )}

              {activeProtocol === 'openvpn' && (
                <OpenVPNConfig
                  isSslMode={false}
                  onSaveAndConnect={(cfg) => {
                    addLog('VPN', `اتصال عبر OpenVPN: ${cfg.profileName}`);
                    setActiveTab('tunnel');
                    startHandshakeConnect();
                  }}
                  onBack={() => setActiveProtocol(null)}
                  onOpenHelp={openHelp}
                  themeAccent={settings.themeAccent}
                  language={settings.language}
                />
              )}

              {activeProtocol === 'ssl_ovpn' && (
                <OpenVPNConfig
                  isSslMode={true}
                  onSaveAndConnect={() => {
                    addLog('VPN', 'اتصال عبر نفق SSL/TLS OVPN');
                    setActiveTab('tunnel');
                    startHandshakeConnect();
                  }}
                  onBack={() => setActiveProtocol(null)}
                  onOpenHelp={openHelp}
                  themeAccent={settings.themeAccent}
                  language={settings.language}
                />
              )}

              {activeProtocol === 'hysteria' && (
                <HysteriaConfig
                  onSaveAndConnect={(cfg) => {
                    addLog('VPN', `اتصال عبر Hysteria UDP (${cfg.downloadMbps} ميجابت)`);
                    setActiveTab('tunnel');
                    startHandshakeConnect();
                  }}
                  onBack={() => setActiveProtocol(null)}
                  onOpenHelp={openHelp}
                  themeAccent={settings.themeAccent}
                  language={settings.language}
                />
              )}

              {activeProtocol === 'v2ray' && (
                <V2RayConfig
                  onSaveAndConnect={(cfg) => {
                    addLog('VPN', `اتصال عبر Xray ${cfg.protocol} مع ${cfg.security.toUpperCase()}`);
                    setActiveTab('tunnel');
                    startHandshakeConnect();
                  }}
                  onBack={() => setActiveProtocol(null)}
                  onOpenHelp={openHelp}
                  themeAccent={settings.themeAccent}
                  language={settings.language}
                />
              )}
            </div>
          )}

          {/* TAB 3: TOOLS & LOGS */}
          {activeTab === 'tools' && (
            <div>
              {activeTool === 'logs' ? (
                <ConnectionLogs
                  logs={logs}
                  onClearLogs={() => setLogs([])}
                  onRefreshLogs={() => addLog('INFO', 'تم تحديث سجلات الاتصال')}
                  onBack={() => setActiveTool(null)}
                  onOpenHelp={openHelp}
                  language={settings.language}
                  themeAccent={settings.themeAccent}
                />
              ) : !activeTool ? (
                <ToolsHub
                  onSelectTool={(id) => handleOpenTool(id)}
                  onClearConfig={handleClearCustomConfig}
                  onOpenHelp={openHelp}
                  language={settings.language}
                  themeAccent={settings.themeAccent}
                />
              ) : null}

              {activeTool === 'vpn_share' && (
                <VpnHotspotShare
                  language={settings.language}
                  themeAccent={settings.themeAccent}
                  connectionState={connectionState}
                  selectedServer={selectedServer}
                  abrConfig={abrConfig}
                  onToggleConnect={handleToggleConnect}
                  onBack={() => setActiveTool(null)}
                  onOpenHelp={openHelp}
                  onLog={(type, message) => addLog(type, message)}
                />
              )}

              {activeTool === 'config_sites' && (
                <ConfigSitesTool
                  language={settings.language}
                  themeAccent={settings.themeAccent}
                  onBack={() => setActiveTool(null)}
                  onOpenHelp={openHelp}
                  connectionState={connectionState}
                  onToggleConnect={handleToggleConnect}
                  isOnline={isOnline}
                  onRequestInternet={(descAr, descEn) =>
                    requestInternetAccess(descAr, descEn)
                  }
                />
              )}

              {activeTool === 'speed_test' && (
                <SpeedTest
                  language={settings.language}
                  themeAccent={settings.themeAccent}
                  onBack={() => setActiveTool(null)}
                  onOpenHelp={openHelp}
                />
              )}

              {activeTool === 'host_checker' && (
                <HostChecker
                  language={settings.language}
                  themeAccent={settings.themeAccent}
                  onBack={() => setActiveTool(null)}
                  onOpenHelp={openHelp}
                />
              )}

              {activeTool === 'same_ip' && (
                <SameIPChecker
                  language={settings.language}
                  themeAccent={settings.themeAccent}
                  onBack={() => setActiveTool(null)}
                  onOpenHelp={openHelp}
                />
              )}

              {activeTool === 'payload_gen' && (
                <PayloadGenerator
                  language={settings.language}
                  themeAccent={settings.themeAccent}
                  onBack={() => setActiveTool(null)}
                  onOpenHelp={openHelp}
                  onApplyPayload={(p, sniHost) => {
                    setAbrConfig((prev) => ({
                      ...prev,
                      tcpPayloadText: p,
                      useTcpPayload: true,
                      customSni: sniHost || prev.customSni,
                    }));
                    addLog('INFO', `تم حقن البايلود والهوست ${sniHost || ''} في نفق Arna tunnel`);
                    setActiveTab('tunnel');
                  }}
                />
              )}

              {activeTool === 'fingerprint' && (
                <DeviceFingerprint
                  language={settings.language}
                  themeAccent={settings.themeAccent}
                  onClose={() => setActiveTool(null)}
                  onOpenHelp={openHelp}
                />
              )}

              {activeTool === 'diagnostics' && (
                <SystemDiagnostics
                  language={settings.language}
                  themeAccent={settings.themeAccent}
                  onBack={() => setActiveTool(null)}
                  onOpenHelp={openHelp}
                />
              )}

              {activeTool === 'encoder' && (
                <EncoderDecoder
                  language={settings.language}
                  themeAccent={settings.themeAccent}
                  onBack={() => setActiveTool(null)}
                  onOpenHelp={openHelp}
                />
              )}
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={(up) => setSettings((s) => ({ ...s, ...up }))}
              language={settings.language}
              themeAccent={settings.themeAccent}
              onOpenHelp={() => openHelp('start')}
              onResetSettings={() => {
                setSettings({
                  language: 'ar',
                  themeAccent: 'teal',
                  appStyle: 'abr_modern',
                  darkMode: true,
                  timeReminder: true,
                  backgroundAnimation: true,
                  dataWaves: true,
                  udpForwarding: true,
                  autoReconnect: true,
                  killSwitch: false,
                  dnsLeakProtection: true,
                });
                addLog('INFO', 'تمت استعادة الإعدادات الافتراضية');
              }}
            />
          )}
        </main>

        {/* MODALS */}
        <AddTimeModal
          isOpen={isAddTimeOpen}
          onClose={() => setIsAddTimeOpen(false)}
          onAddTimeSeconds={(sec) => {
            setRemainingSeconds((p) => p + sec);
            addLog('INFO', `تم تمديد وقت الجلسة بمقدار +${Math.round(sec / 60)} دقيقة`);
          }}
          language={settings.language}
          themeAccent={settings.themeAccent}
        />

        <ConfigManagerModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onApplyConfig={handleApplyExportableConfig}
          onOpenHelp={openHelp}
          activeServer={selectedServer}
          activeSni={abrConfig.customSni}
          language={settings.language}
          themeAccent={settings.themeAccent}
        />

        <HelpCenterModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          initialTopic={helpTopic}
          language={settings.language}
          themeAccent={settings.themeAccent}
        />

        {/* INTERNET ACCESS REQUEST MODAL FOR ONLINE TOOLS & PROTOCOLS WHEN OFFLINE */}
        {internetPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-sm bg-[#0a101d] border border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <WifiOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {settings.language === 'ar' ? internetPrompt.titleAr : internetPrompt.titleEn}
                  </h3>
                  <p className="text-[11px] text-emerald-300 font-mono">
                    {settings.language === 'ar' ? 'التطبيق يعمل بدون إنترنت (وضع أوفلاين)' : 'App Offline Mode Active'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {settings.language === 'ar' ? internetPrompt.descAr : internetPrompt.descEn}
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.onLine) {
                      const proceed = internetPrompt.onProceed;
                      setInternetPrompt(null);
                      if (proceed) proceed();
                    } else {
                      addLog('INFO', 'لا يزال الجهاز غير متصل بالإنترنت.');
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {isOnline ? <Wifi className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                  <span>
                    {settings.language === 'ar'
                      ? isOnline
                        ? 'تم الاتصال — متابعة الآن'
                        : 'إعادة فحص الاتصال بالإنترنت'
                      : 'Check Internet & Retry'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {internetPrompt.onProceed && (
                    <button
                      type="button"
                      onClick={() => {
                        const proceed = internetPrompt.onProceed;
                        setInternetPrompt(null);
                        if (proceed) proceed();
                      }}
                      className="py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                    >
                      {settings.language === 'ar' ? 'متابعة أوفلاين' : 'Continue Anyway'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setInternetPrompt(null)}
                    className={`py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold ${
                      internetPrompt.onProceed ? '' : 'col-span-2'
                    }`}
                  >
                    {settings.language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NON-INTRUSIVE OFFLINE MODE BADGE */}
        {!isOnline && (
          <div className="fixed bottom-3 left-3 z-40 flex items-center gap-2 rounded-xl bg-emerald-500/95 px-3 py-1.5 text-[11px] font-bold text-slate-950 shadow-lg pointer-events-none">
            <span className="h-2 w-2 rounded-full bg-slate-950 animate-pulse" />
            <span>
              {settings.language === 'ar'
                ? 'وضع الأوفلاين — يعمل بدون نت'
                : 'Offline Mode — Cached App'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
