import React from 'react';
import {
  Languages,
  Palette,
  Shield,
  RotateCcw,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { AppSettings, LanguageCode, ThemeAccent } from '../../types/vpn';
import { THEMES } from '../../utils/theme';
import { translations } from '../../utils/translations';
import { PWAInstallButton } from '../PWAInstallButton';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (updater: Partial<AppSettings>) => void;
  language: LanguageCode;
  themeAccent: ThemeAccent;
  onResetSettings: () => void;
  onOpenHelp?: (topic?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  language,
  themeAccent,
  onResetSettings,
  onOpenHelp,
}) => {
  const t = translations[language];
  const theme = THEMES[themeAccent] || THEMES.teal;
  const isAr = language === 'ar';

  const languagesList: { code: LanguageCode; name: string; native: string }[] = [
    { code: 'ar', name: isAr ? 'العربية (الافتراضية)' : 'Arabic', native: 'العربية' },
    { code: 'en', name: isAr ? 'الإنجليزية' : 'English', native: 'English (US)' },
    { code: 'fr', name: isAr ? 'الفرنسية' : 'French', native: 'Français' },
    { code: 'es', name: isAr ? 'الإسبانية' : 'Spanish', native: 'Español' },
  ];

  const themeOptions: { id: ThemeAccent; name: string; col: string }[] = (Object.keys(THEMES) as ThemeAccent[]).map((id) => ({
    id,
    name: isAr
      ? id === 'teal'
        ? `${THEMES[id].nameAr} (الافتراضي)`
        : THEMES[id].nameAr
      : THEMES[id].name,
    col: THEMES[id].swatchClass,
  }));

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10 font-sans">
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className={`text-sm font-bold font-mono tracking-wider ${theme.textClass} flex items-center gap-2`}>
            <span>{t.settings}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${theme.bgSoftClass} ${theme.textLightClass} border ${theme.borderClass}`}>
              {isAr ? 'الإصدار 1.0' : 'v1.0'}
            </span>
          </h2>
          <p className="text-[11px] text-slate-400">
            {isAr ? 'ضبط اللغة والمظهر وحماية النفق' : 'Language, appearance & security tuning'}
          </p>
        </div>

        {onOpenHelp && (
          <button
            onClick={() => onOpenHelp('start')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${theme.bgSoftClass} border ${theme.borderClass} ${theme.textLightClass} transition-all text-xs font-mono font-bold`}
          >
            <HelpCircle className={`w-4 h-4 ${theme.textClass}`} />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      {/* 1. LANGUAGE SETTINGS */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className={`flex items-center gap-2 ${theme.textClass} font-bold text-xs font-mono`}>
          <Languages className="w-4 h-4" />
          <span>{t.language}</span>
        </div>

        <p className="text-xs text-slate-400">
          {isAr
            ? 'يتغير كامل التطبيق إلى اللغة المختارة فورياً مع دعم الاتجاه المناسب:'
            : 'The entire application switches immediately to your selected language:'}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {languagesList.map((lang) => {
            const isSelected = settings.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => onUpdateSettings({ language: lang.code })}
                className={`p-3 rounded-xl border text-start flex items-center justify-between transition-all ${
                  isSelected
                    ? `${theme.bgSoftClass} ${theme.borderActiveClass} text-white shadow-sm`
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div>
                  <div className={`text-xs font-bold font-mono ${theme.textLightClass}`}>{lang.native}</div>
                  <div className="text-[10px] text-slate-500">{lang.name}</div>
                </div>
                {isSelected && <CheckCircle2 className={`w-4 h-4 ${theme.textClass} shrink-0`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. THEME & CYBER GLOW PALETTE */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className={`flex items-center gap-2 ${theme.textClass} font-bold text-xs font-mono`}>
          <Palette className="w-4 h-4" />
          <span>{isAr ? `ثيمات وألوان التطبيق (${themeOptions.length} ثيمات)` : 'App Themes & Glow Palette'}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {themeOptions.map((th) => {
            const isActive = settings.themeAccent === th.id;
            return (
              <button
                key={th.id}
                onClick={() => onUpdateSettings({ themeAccent: th.id })}
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                  isActive
                    ? `bg-slate-800 ${THEMES[th.id].borderActiveClass} text-white shadow-md`
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-4 h-4 rounded-full shrink-0 ${th.col}`} />
                  <span className="text-xs font-mono font-semibold text-start truncate">{th.name}</span>
                </div>
                {isActive && <CheckCircle2 className={`w-3.5 h-3.5 ${THEMES[th.id].textClass} shrink-0`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TUNNEL SECURITY & PERFORMANCE TOGGLES */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
          <Shield className="w-4 h-4" />
          <span>{isAr ? 'ضبط الأمان والاتصال المتقدم' : 'SECURITY & CONNECTION TUNING'}</span>
        </div>

        <div className="space-y-3 text-xs divide-y divide-slate-800/80">
          {/* Kill Switch */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-semibold text-slate-200">{isAr ? 'مفتاح القطع التلقائي' : 'Kill Switch'}</span>
              <p className="text-[11px] text-slate-500">
                {isAr ? 'قطع الإنترنت فوراً عند انقطاع النفق لحماية هويتك' : 'Block internet if VPN tunnel drops unexpectedly'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.killSwitch}
              onChange={(e) => onUpdateSettings({ killSwitch: e.target.checked })}
              className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
            />
          </div>

          {/* DNS Leak Protection */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-semibold text-slate-200">{isAr ? 'الحماية من تسريب الـ DNS' : 'DNS Leak Protection'}</span>
              <p className="text-[11px] text-slate-500">
                {isAr ? 'تمرير كافة طلبات النطاقات عبر نفق مشفر آمن' : 'Force all queries through encrypted DNS tunnel'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.dnsLeakProtection}
              onChange={(e) => onUpdateSettings({ dnsLeakProtection: e.target.checked })}
              className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
            />
          </div>

          {/* Auto Reconnect */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-semibold text-slate-200">{isAr ? 'إعادة الاتصال التلقائي' : 'Auto Reconnect'}</span>
              <p className="text-[11px] text-slate-500">
                {isAr ? 'إعادة محاولة الاتصال تلقائياً عند تغير الشبكة' : 'Automatically retry handshake on network change'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoReconnect}
              onChange={(e) => onUpdateSettings({ autoReconnect: e.target.checked })}
              className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
            />
          </div>

          {/* UDP Forwarding */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-semibold text-slate-200">{isAr ? 'توجيه حزم الألعاب والمكالمات UDP' : 'UDP Forwarding / BadVPN'}</span>
              <p className="text-[11px] text-slate-500">
                {isAr ? 'دعم المكالمات الصوتية وألعاب الأونلاين عبر النفق' : 'Support voice calls and gaming UDP packets over SSH'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.udpForwarding}
              onChange={(e) => onUpdateSettings({ udpForwarding: e.target.checked })}
              className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
            />
          </div>
        </div>
      </div>

      {/* Help & Support Card */}
      {onOpenHelp && (
        <div className={`p-4 rounded-2xl ${theme.bgDeepClass} border ${theme.borderClass} flex items-center justify-between`}>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{isAr ? 'المساعدة ودليل الاستخدام' : 'Help & Support Center'}</span>
              <span className={`text-[10px] ${theme.bgSoftClass} ${theme.textLightClass} px-1.5 py-0.5 rounded font-mono`}>
                {isAr ? 'دليل' : 'FAQ'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isAr
                ? 'شروحات تشغيل النفق، البروتوكولات، وفحص الأعطال'
                : 'Tunnel tutorials, protocols, and live diagnostics'}
            </p>
          </div>
          <button
            onClick={() => onOpenHelp('faq')}
            className={`px-3.5 py-2 rounded-xl ${theme.buttonClass} text-xs font-bold font-mono transition-all shadow-md active:scale-95`}
          >
            {isAr ? 'فتح المساعدة' : 'Open Help'}
          </button>
        </div>
      )}

      {/* Offline PWA Install Button */}
      <PWAInstallButton language={language} themeAccent={themeAccent} />

      {/* Reset Defaults */}
      <button
        onClick={onResetSettings}
        className={`w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white ${theme.borderClass} text-xs font-mono flex items-center justify-center gap-2 transition-all`}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>{isAr ? 'استعادة الإعدادات الافتراضية' : `${t.reset} Defaults`}</span>
      </button>
    </div>
  );
};
