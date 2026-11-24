import React from 'react';
import {
  Terminal,
  Lock,
  Radio,
  Shield,
  Globe,
  Flame,
  Send,
  ChevronRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { ProtocolType, LanguageCode, ThemeAccent } from '../../types/vpn';
import { THEMES } from '../../utils/theme';

interface ProtocolsHubProps {
  onSelectProtocol: (protocol: ProtocolType) => void;
  onOpenImport?: () => void;
  onOpenHelp?: (topic?: string) => void;
  language: LanguageCode;
  themeAccent: ThemeAccent;
}

export const ProtocolsHub: React.FC<ProtocolsHubProps> = ({
  onSelectProtocol,
  onOpenHelp,
  language,
  themeAccent,
}) => {
  const isAr = language === 'ar';
  const theme = THEMES[themeAccent] || THEMES.teal;

  const protocols = [
    {
      id: 'custom_sni' as ProtocolType,
      title: isAr ? 'كوستوم SNI (تشفير SSL/TLS)' : 'Custom SNI (SSL/TLS Mode)',
      desc: isAr ? 'تخطي الحجب بالهوست المخصص (مثل www.snapchat.com)' : 'Direct & Proxy TLS tunnel with custom bug hosts (e.g. www.snapchat.com)',
      icon: Sparkles,
      badge: isAr ? 'تخطي فوري' : 'TOP BYPASS',
    },
    {
      id: 'v2ray' as ProtocolType,
      title: isAr ? 'نفق V2Ray / Xray المخصص' : 'V2Ray / Xray Custom',
      desc: isAr ? 'بروتوكولات VLESS و Reality للتخفي المطلق ضد الرقابة وفحص الحزم' : 'Multi-protocol proxy framework (VLESS, VMess, Reality)',
      icon: Send,
      badge: isAr ? 'رياليتي' : 'REALITY',
    },
    {
      id: 'hysteria' as ProtocolType,
      title: isAr ? 'نفق Hysteria UDP السريع' : 'Hysteria Custom',
      desc: isAr ? 'بروتوكول UDP فائق السرعة يعتمد على QUIC لتجاوز ضعف الشبكة' : 'UDP-based high-speed tunnel with Brutal mode for high packet loss',
      icon: Flame,
      badge: isAr ? 'فائق' : 'BRUTAL',
    },
    {
      id: 'ssl_ssh' as ProtocolType,
      title: isAr ? 'نفق SSH عبر SSL/TLS' : 'SSL/TLS SSH Custom',
      desc: isAr ? 'نفق SSH مشفر فوق طبقة TLS مع حقن البايلود وحفظ الـ SNI' : 'SNI tunnel with SSH over TLS encryption & payload injection',
      icon: Lock,
    },
    {
      id: 'ssh' as ProtocolType,
      title: isAr ? 'نفق SSH مخصص' : 'SSH Custom',
      desc: isAr ? 'نفق SSH كلاسيكي مباشر مع دعم البروكسي وحقن البايلود' : 'Host, port, credentials & HTTP payload injector',
      icon: Terminal,
    },
    {
      id: 'dnstt' as ProtocolType,
      title: isAr ? 'نفق DNSTT (عبر الـ DNS)' : 'DNSTT Custom (DNS)',
      desc: isAr ? 'تمرير البيانات عبر استعلامات DNS للعمل في الشبكات المغلقة بالكامل' : 'DNS tunnel transport with SSH tunneling for firewall bypass',
      icon: Radio,
    },
    {
      id: 'openvpn' as ProtocolType,
      title: isAr ? 'نفق OpenVPN المخصص' : 'OpenVPN Custom',
      desc: isAr ? 'ملفات تكوين OVPN مع إعدادات البروكسي وحقن الترويسات' : 'OVPN profile with proxy & payload settings',
      icon: Shield,
    },
    {
      id: 'ssl_ovpn' as ProtocolType,
      title: isAr ? 'نفق OpenVPN عبر SSL/TLS' : 'SSL/TLS OVPN Custom',
      desc: isAr ? 'تغليف نفق OpenVPN داخل تشفير SSL/TLS لتجاوز الحجب' : 'OpenVPN wrapped in SSL/TLS encryption for DPI bypass',
      icon: Globe,
    },
  ];

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-12 animate-fade-in font-sans">
      {/* Header with Help button */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 gap-2">
        <div>
          <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <span>{isAr ? 'بروتوكولات الأنفاق وتجاوز الحجب' : 'Tunneling Protocols'}</span>
            <span className={`text-[10px] ${theme.bgSoftClass} ${theme.textLightClass} font-mono px-1.5 py-0.5 rounded`}>
              {protocols.length}
            </span>
          </h2>
          <p className="text-[11px] text-slate-400">
            {isAr ? 'اختر البروتوكول الأنسب لشبكتك أو ثغرة باقة الإنترنت لديك' : 'Select a tunneling protocol engineered for your carrier'}
          </p>
        </div>

        {onOpenHelp && (
          <button
            onClick={() => onOpenHelp('protocols')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${theme.bgSoftClass} border ${theme.borderClass} ${theme.textLightClass} transition-all text-xs font-mono font-bold shrink-0`}
          >
            <HelpCircle className={`w-4 h-4 ${theme.textClass}`} />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      {/* Protocols List */}
      <div className="space-y-2.5">
        {protocols.map((proto) => {
          const Icon = proto.icon;
          return (
            <button
              key={proto.id}
              onClick={() => onSelectProtocol(proto.id)}
              className={`w-full p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 ${theme.borderClass} hover:bg-slate-850 transition-all flex items-center justify-between text-start group shadow-sm active:scale-[0.99]`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all shrink-0 ${theme.bgDeepClass} ${theme.borderClass} ${theme.textClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs font-mono text-white transition-colors">
                      {proto.title}
                    </span>
                    {proto.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${theme.bgSoftClass} ${theme.textLightClass} ${theme.borderClass}`}
                      >
                        {proto.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{proto.desc}</div>
                </div>
              </div>

              <ChevronRight className={`w-4 h-4 text-slate-500 ${theme.textClass} transition-all shrink-0 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
