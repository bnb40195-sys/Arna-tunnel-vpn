import React from 'react';
import {
  Code2,
  Fingerprint,
  Cpu,
  Activity,
  FileText,
  Trash2,
  ChevronRight,
  HelpCircle,
  Globe,
  Share2,
  FileCode
} from 'lucide-react';
import { LanguageCode, ThemeAccent } from '../../types/vpn';
import { THEMES } from '../../utils/theme';

interface ToolsHubProps {
  onSelectTool: (toolId: string) => void;
  onClearConfig: () => void;
  onOpenHelp?: (topic?: string) => void;
  language: LanguageCode;
  themeAccent: ThemeAccent;
}

export const ToolsHub: React.FC<ToolsHubProps> = ({
  onSelectTool,
  onClearConfig,
  onOpenHelp,
  language,
  themeAccent,
}) => {
  const isAr = language === 'ar';
  const theme = THEMES[themeAccent] || THEMES.teal;

  const tools: {
    id: string;
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'config_manager',
      title: isAr ? 'استيراد وتصدير الكونفيجات' : 'Import & Export Configs',
      desc: isAr ? 'استيراد وتصدير عبر الملفات أو الحافظة (Clipboard) بصيغ .an و vless://' : 'Import & export via files or Clipboard (.an, vless://, .ovpn)',
      icon: FileCode,
    },
    {
      id: 'vpn_share',
      title: isAr ? 'مشاركة VPN' : 'Share VPN',
      desc: isAr ? 'مشاركة اتصال النفق عبر Wi-Fi أو USB للأجهزة الأخرى مباشرة' : 'Direct hotspot & USB VPN tethering for connected devices',
      icon: Share2,
    },
    {
      id: 'server_analyzer',
      title: isAr ? 'فحص السيرفرات و SNI والهوستات و IP والسرعة' : 'Servers, SNI, Host, IP & Speed Lab',
      desc: isAr
        ? 'قسم موحّد لفحص السيرفرات، SNI والهوستات، IP، اختبار سرعة الإنترنت، ومواقع التحليل'
        : 'All-in-one section for Server probes, SNI/Host, IP/SAN, Internet Speed Test & Sites',
      icon: Activity,
    },
    {
      id: 'config_sites',
      title: isAr ? 'مواقع صنع الكونفيجات' : 'Config Creator Sites',
      desc: isAr ? 'مواقع إنشاء حسابات SSH و V2Ray و Trojan مع فتحها بسرعة داخل التطبيق' : 'Free SSH, V2Ray & Trojan creator websites opened fast inside the app',
      icon: Globe,
    },
    {
      id: 'payload_gen',
      title: isAr ? 'مولد البايلود' : 'Payload Generator',
      desc: isAr ? 'صناعة وحقن بايلودات الشبكات وتطبيقات السوشيال ميديا' : 'Create custom HTTP payloads & presets',
      icon: Code2,
    },
    {
      id: 'fingerprint',
      title: isAr ? 'بصمة ومعرف الجهاز' : 'Device Fingerprint',
      desc: isAr ? 'عرض معرف الجهاز الفريد ومعلومات النظام' : 'View UUID and device fingerprint',
      icon: Fingerprint,
    },
    {
      id: 'diagnostics',
      title: isAr ? 'تشخيص النظام والموارد' : 'System Diagnostics',
      desc: isAr ? 'فحص المعالج والذاكرة وحالة تصاريح الشبكة' : 'CPU, memory, network & permissions',
      icon: Cpu,
    },
    {
      id: 'encoder',
      title: isAr ? 'تشفير وفك تشفير النصوص' : 'Encoder / Decoder',
      desc: isAr ? 'تحويل Base64 و URL و Hex بالكامل' : 'Base64, URL & Hex encode/decode',
      icon: Activity,
    },
    {
      id: 'logs',
      title: isAr ? 'سجلات الاتصال الفورية' : 'Connection Logs',
      desc: isAr ? 'متابعة حالة المصافحة وأحداث النفق لحظة بلحظة' : 'Real-time terminal handshake and debug stream',
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10 font-sans">
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 gap-2">
        <div>
          <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <span>{isAr ? 'أدوات الشبكة والتشخيص' : 'NETWORK TOOLS & UTILITIES'}</span>
            <span className={`text-[10px] ${theme.bgSoftClass} ${theme.textLightClass} font-mono px-1.5 py-0.5 rounded`}>
              {isAr ? '9 أدوات' : '9 TOOLS'}
            </span>
          </h2>
          <p className="text-[11px] text-slate-400">
            {isAr ? 'فحص البايلود، قياس السرعة، وفحص هوستات السيرفرات' : 'Host testing, payload crafting & diagnostics'}
          </p>
        </div>

        {onOpenHelp && (
          <button
            onClick={() => onOpenHelp('payload')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${theme.bgSoftClass} border ${theme.borderClass} ${theme.textLightClass} transition-all text-xs font-mono font-bold shrink-0`}
          >
            <HelpCircle className={`w-4 h-4 ${theme.textClass}`} />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={`p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 ${theme.borderClass} hover:bg-slate-850 cursor-pointer flex items-center justify-between transition-all group`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${theme.bgDeepClass} ${theme.borderClass} ${theme.textClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-slate-100">
                    {tool.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{tool.desc}</div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-600 ${theme.textClass} transition-colors shrink-0 ${isAr ? 'rotate-180' : ''}`} />
            </div>
          );
        })}

        {/* Clear Custom Config */}
        <div
          onClick={onClearConfig}
          className={`p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 ${theme.borderClass} cursor-pointer flex items-center justify-between transition-all group`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl ${theme.bgDeepClass} border ${theme.borderClass} flex items-center justify-center ${theme.textClass}`}>
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-xs font-mono font-bold ${theme.textLightClass}`}>
                {isAr ? 'مسح الإعدادات المخصصة' : 'Clear Custom Config'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isAr ? 'حذف الكونفيج المحفوظ والملاحظات واستعادة الافتراضي' : 'Clear saved configuration and notes'}
              </div>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-600 ${theme.textClass} shrink-0 ${isAr ? 'rotate-180' : ''}`} />
        </div>
      </div>
    </div>
  );
};
