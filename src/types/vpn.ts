export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';

export type ProtocolType = 
  | 'quick' 
  | 'custom_sni'
  | 'ssh' 
  | 'ssl_ssh' 
  | 'dnstt' 
  | 'openvpn' 
  | 'ssl_ovpn' 
  | 'hysteria' 
  | 'v2ray';

export type LanguageCode = 'ar' | 'en' | 'fr' | 'es';

export type ThemeAccent = 'teal' | 'cyan' | 'blue' | 'yellow' | 'white';

export interface VpnServer {
  id: string;
  name: string;
  country: string;
  city?: string;
  countryCode: string;
  flag: string;
  ip: string;
  ping: number;
  load: number;
  type: string;
  speed: string;
}

export interface AbrTunnelConfig {
  selectedPort: string;
  customSetup: boolean;
  connectionMode: 'Custom SNI' | 'Custom Payload' | 'Direct' | 'SlowDNS' | 'Hysteria UDP' | 'Imported Config';
  customSni: string;
  useTcpPayload: boolean;
  useRealmHost: boolean;
  preserveSni: boolean;
  tcpPayloadText: string;
}

export interface CustomSniConfigData {
  sniHost: string;
  serverPort: string;
  proxyType: 'SSL/TLS' | 'Direct' | 'WebSocket';
  usePayload: boolean;
  payloadText: string;
  preserveSni: boolean;
  dnsResolver: string;
  carrierPreset?: string;
}

export interface ExportableConfigFile {
  version: string;
  app: string;
  name: string;
  author: string;
  description: string;
  createdAt: string;
  expiresAt: string; // ISO date or 'never'
  protocol: 'custom_sni' | 'ssh' | 'ssl_ssh' | 'v2ray' | 'hysteria' | 'openvpn' | 'dnstt';
  server: string;
  port: number;
  sniHost: string;
  payloadText: string;
  notes: string;
  isLocked: boolean; // Cannot edit internal server/sni
  lockHwid: string; // Lock to specific hardware device ID
  blockRoot: boolean; // Prevent connection on rooted devices
  passwordProtected: boolean;
  passwordHash?: string;
  category?: 'arab' | 'wifi' | 'social';
  flag?: string;
  isoCode?: string;
  countryAr?: string;
  countryEn?: string;
  shortTitle?: string;
}

export interface SSHConfigData {
  server: string;
  username: string;
  password: string;
  port: number;
  httpProxy: boolean;
  proxyHost: string;
  proxyPort: number;
  customPayload: boolean;
  payloadText: string;
  sniEnabled?: boolean;
  sniHost?: string;
}

export interface DNSTTConfigData {
  server: string;
  port: number;
  username: string;
  password: string;
  dnsResolver: string;
  dnsResolverCustom: string;
  nameserver: string;
  publicKey: string;
}

export interface OpenVPNConfigData {
  profileName: string;
  ovpnContent: string;
  remoteOverride: boolean;
  remoteHost: string;
  remotePort: number;
  authCredentials: boolean;
  username: string;
  password: string;
  httpProxy: boolean;
  proxyHost: string;
  proxyPort: number;
  payload: boolean;
  payloadText: string;
  sniEnabled?: boolean;
  sniHost?: string;
}

export interface HysteriaConfigData {
  server: string;
  authPassword: string;
  sni: string;
  allowInsecure: boolean;
  certificatePin: boolean;
  pinHash: string;
  obfuscation: boolean;
  obfuscationKey: string;
  bandwidthLimit: boolean;
  uploadMbps: number;
  downloadMbps: number;
  portHopping: boolean;
  portsRange: string;
  quicTuning: boolean;
}

export interface V2RayConfigData {
  mode: 'visual' | 'editor';
  protocol: 'VLESS' | 'VMess' | 'Trojan' | 'Shadowsocks';
  server: string;
  port: number;
  uuid: string;
  encryption: string;
  flow: string;
  transport: 'tcp' | 'ws' | 'grpc' | 'http';
  path: string;
  security: 'none' | 'tls' | 'reality';
  sni: string;
  fingerprint: string;
  alpn: string;
  allowInsecure: boolean;
  jsonConfig: string;
}

export interface LogEntry {
  id: string;
  time: string;
  type: 'INFO' | 'SSH' | 'VPN' | 'PERM' | 'ERROR';
  message: string;
}

export interface AppSettings {
  language: LanguageCode;
  themeAccent: ThemeAccent;
  appStyle: 'abr_modern'; // Dedicated ABR tunnel vpn sleek modern style
  darkMode: boolean;
  timeReminder: boolean;
  backgroundAnimation: boolean;
  dataWaves: boolean;
  udpForwarding: boolean;
  autoReconnect: boolean;
  killSwitch: boolean;
  dnsLeakProtection: boolean;
}
