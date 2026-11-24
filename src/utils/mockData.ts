import { VpnServer, LogEntry } from '../types/vpn';

export const HA_PORTS = [
  { id: 'p-80', label: 'P 80', port: 80, desc: 'HTTP Standard Bypass' },
  { id: 'p-443', label: 'P 443', port: 443, desc: 'HTTPS / TLS Stealth' },
  { id: 'p-8080', label: 'P 8080', port: 8080, desc: 'Proxy Web Socket' },
  { id: 'p-8000', label: 'P 8000', port: 8000, desc: 'Alternate Proxy' },
  { id: 'p-3128', label: 'P 3128', port: 3128, desc: 'Squid Proxy Port' },
  { id: 'p-53', label: 'P 53', port: 53, desc: 'DNS / SlowDNS Port' },
  { id: 'p-22', label: 'P 22', port: 22, desc: 'Direct SSH Port' },
];

export const INITIAL_SERVERS: VpnServer[] = [
  {
    id: 'srv-ca',
    name: 'Canada Montreal VIP #1',
    country: 'Canada',
    city: 'Montreal',
    countryCode: 'CA',
    flag: '🇨🇦',
    ip: '198.27.100.45:443',
    ping: 34,
    load: 28,
    type: 'Custom SNI / SSL',
    speed: '10 Gbps Ultra'
  },
  {
    id: 'srv-de',
    name: 'Germany Frankfurt Core #1',
    country: 'Germany',
    city: 'Frankfurt',
    countryCode: 'DE',
    flag: '🇩🇪',
    ip: '185.220.101.45:443',
    ping: 22,
    load: 35,
    type: 'VLESS / Hysteria 2',
    speed: '10 Gbps Turbo'
  },
  {
    id: 'srv-sa',
    name: 'Saudi Arabia Riyadh Fast #1',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    countryCode: 'SA',
    flag: '🇸🇦',
    ip: '178.62.204.11:443',
    ping: 16,
    load: 22,
    type: 'Direct SNI / TCP',
    speed: 'Gigabit Low-Ping'
  },
  {
    id: 'srv-ae',
    name: 'UAE Dubai Gulf Gateway #2',
    country: 'United Arab Emirates',
    city: 'Dubai',
    countryCode: 'AE',
    flag: '🇦🇪',
    ip: '185.193.64.9:443',
    ping: 18,
    load: 31,
    type: 'TLS / SSL Fast',
    speed: 'Gigabit Fiber'
  },
  {
    id: 'srv-nl',
    name: 'Netherlands Amsterdam #2',
    country: 'Netherlands',
    city: 'Amsterdam',
    countryCode: 'NL',
    flag: '🇳🇱',
    ip: '194.36.144.12:443',
    ping: 27,
    load: 40,
    type: 'SSH / SSL High-Speed',
    speed: '10 Gbps Fiber'
  },
  {
    id: 'srv-fr',
    name: 'France Paris Shield #3',
    country: 'France',
    city: 'Paris',
    countryCode: 'FR',
    flag: '🇫🇷',
    ip: '51.38.120.88:443',
    ping: 31,
    load: 38,
    type: 'Hysteria UDP / QUIC',
    speed: '10 Gbps Ultra'
  },
  {
    id: 'srv-us',
    name: 'USA New York Gigabit #4',
    country: 'United States',
    city: 'New York',
    countryCode: 'US',
    flag: '🇺🇸',
    ip: '198.51.100.22:443',
    ping: 72,
    load: 54,
    type: 'OpenVPN / TCP',
    speed: 'Gigabit Premium'
  },
  {
    id: 'srv-uk',
    name: 'UK London Express #1',
    country: 'United Kingdom',
    city: 'London',
    countryCode: 'GB',
    flag: '🇬🇧',
    ip: '51.89.155.67:443',
    ping: 33,
    load: 41,
    type: 'DNSTT / SSH',
    speed: '10 Gbps Fast'
  },
  {
    id: 'srv-sg',
    name: 'Singapore Asia Hub #1',
    country: 'Singapore',
    city: 'Singapore',
    countryCode: 'SG',
    flag: '🇸🇬',
    ip: '139.180.201.89:443',
    ping: 68,
    load: 45,
    type: 'Xray Reality',
    speed: '10 Gbps Ultra'
  }
];

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: '1',
    time: '14:50:01',
    type: 'INFO',
    message: 'تم تهيئة محرك Arna tunnel بنجاح'
  },
  {
    id: '2',
    time: '14:50:02',
    type: 'PERM',
    message: 'خدمة نفق الـ VPN مفعلة ومرخصة على النظام'
  },
  {
    id: '4',
    time: '14:50:04',
    type: 'INFO',
    message: 'سيرفرات كندا وألمانيا والسعودية جاهزة مع المنفذ P 80 و P 443'
  }
];

export function formatBytes(bytes: number, decimals = 2, language: 'ar' | 'en' | 'fr' | 'es' = 'en'): string {
  if (bytes === 0) return language === 'ar' ? '0 بايت' : '0 B';
  if (!isFinite(bytes)) return language === 'ar' ? '∞ غير محدود' : '∞ Unlimited';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes =
    language === 'ar'
      ? ['بايت', 'ك.ب', 'م.ب', 'ج.ب', 'ت.ب', 'ب.ب']
      : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatSpeed(bytesPerSec: number, language: 'ar' | 'en' | 'fr' | 'es' = 'en'): string {
  if (bytesPerSec < 1024) {
    return `${Math.round(bytesPerSec)} ${language === 'ar' ? 'ب/ث' : 'B/s'}`;
  }
  if (bytesPerSec < 1024 * 1024) {
    return `${(bytesPerSec / 1024).toFixed(1)} ${language === 'ar' ? 'ك.ب/ث' : 'KB/s'}`;
  }
  return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} ${language === 'ar' ? 'م.ب/ث' : 'MB/s'}`;
}
