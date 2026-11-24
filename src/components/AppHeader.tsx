import React, { useState } from 'react';
import {
  Menu,
  Palette,
  HelpCircle,
  FileCode
} from 'lucide-react';
import { ConnectionState, LanguageCode, ThemeAccent } from '../types/vpn';
import { THEMES } from '../utils/theme';

interface AppHeaderProps {
  connectionState: ConnectionState;
  onOpenDrawer: () => void;
  onOpenConfigManager?: () => void;
  onOpenHelp: (topic?: string) => void;
  onChangeTheme: (theme: ThemeAccent) => void;
  language: LanguageCode;
  themeAccent: ThemeAccent;
  showBackToTunnel?: boolean;
  onBackToTunnel?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  connectionState,
  onOpenDrawer,
  onOpenConfigManager,
  onOpenHelp,
  onChangeTheme,
  language,
  themeAccent,
  showBackToTunnel = false,
  onBackToTunnel,
}) => {
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';
  const isAr = language === 'ar';
  const isFr = language === 'fr';
  const isEs = language === 'es';
  const theme = THEMES[themeAccent] || THEMES.teal;

  const menuAria = isAr ? 'القائمة الجانبية' : isFr ? 'Menu latéral' : isEs ? 'Menú lateral' : 'Side menu';
  const themeTip = isAr ? 'تغيير ثيم التطبيق' : isFr ? 'Changer le thème' : isEs ? 'Cambiar tema' : 'App Theme';
  const configTip = isAr ? 'استيراد وتصدير الكونفيجات' : isFr ? 'Importer / Exporter Configs' : isEs ? 'Importar / Exportar Configs' : 'Import / Export Configs';
  const helpTip = isAr ? 'المساعدة ودليل الاستخدام' : isFr ? 'Aide et support' : isEs ? 'Ayuda y soporte' : 'Help & Support';
  const subConnected = isAr
    ? 'النفق مشفر بنشاط ومحمي بالكامل'
    : isFr
    ? 'Tunnel actif et chiffré'
    : isEs
    ? 'Túnel activo y cifrado'
    : 'Tunnel active and fully encrypted';
  const subReady = isAr
    ? `ثيم ${theme.nameAr} · جاهز للاتصال`
    : isFr
    ? `${theme.name} · Prêt`
    : isEs
    ? `${theme.name} · Listo`
    : `${theme.name} · Ready to connect`;

  return (
    <div className="space-y-2.5 pt-1 pb-3 select-none">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenDrawer}
            className={`w-10 h-10 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-center text-slate-300 hover:text-white ${theme.borderClass} hover:bg-slate-800/80 transition-all shadow-md active:scale-95`}
            title={menuAria}
            aria-label={menuAria}
          >
            <Menu className={`w-5 h-5 ${theme.textClass}`} />
          </button>

          <div
            onClick={showBackToTunnel && onBackToTunnel ? onBackToTunnel : undefined}
            className={showBackToTunnel && onBackToTunnel ? 'cursor-pointer' : ''}
          >
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wide text-white font-mono">
                Arna tunnel
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${theme.bgSoftClass} ${theme.textLightClass} border ${theme.borderClass}`}
              >
                v1.0
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected
                    ? `${theme.solidBgClass}`
                    : isConnecting
                    ? `${theme.bgSoftClass} animate-ping`
                    : `${theme.bgSoftClass} border ${theme.borderActiveClass}`
                }`}
              />
            </div>
            <div className={`text-[11px] ${theme.textClass} font-mono`}>
              {isConnected ? subConnected : subReady}
            </div>
          </div>
        </div>

        {/* Theme + Config Manager + Help */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsThemePickerOpen((v) => !v)}
            className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-all shadow-md active:scale-95 ${
              isThemePickerOpen
                ? `${theme.bgSoftClass} ${theme.borderActiveClass} text-white`
                : `bg-slate-900/90 border-slate-800/80 ${theme.textClass} hover:text-white ${theme.borderClass}`
            }`}
            title={themeTip}
            aria-label={themeTip}
          >
            <Palette className="w-4 h-4" />
          </button>

          {onOpenConfigManager && (
            <button
              type="button"
              onClick={onOpenConfigManager}
              className={`w-9 h-9 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-center ${theme.textClass} hover:text-white ${theme.borderClass} hover:bg-slate-800/80 transition-all shadow-md active:scale-95`}
              title={configTip}
              aria-label={configTip}
            >
              <FileCode className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenHelp('start')}
            className={`w-9 h-9 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-center ${theme.textClass} hover:text-white ${theme.borderClass} hover:bg-slate-800/80 transition-all shadow-md active:scale-95`}
            title={helpTip}
            aria-label={helpTip}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Quick Theme Selector Strip */}
      {isThemePickerOpen && (
        <div
          className={`p-3 rounded-2xl bg-slate-900/95 border ${theme.borderClass} flex flex-wrap items-center justify-between gap-2 animate-fade-in shadow-xl`}
        >
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Palette className={`w-3.5 h-3.5 ${theme.textClass}`} />
            <span>{isAr ? 'اختر ثيم التطبيق:' : 'Select Theme:'}</span>
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {(Object.keys(THEMES) as ThemeAccent[]).map((key) => {
              const item = THEMES[key];
              const isSelected = themeAccent === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChangeTheme(key)}
                  title={isAr ? item.nameAr : item.name}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all active:scale-95 ${
                    isSelected
                      ? `${item.bgSoftClass} ${item.borderActiveClass} text-white shadow-sm`
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${item.swatchClass}`} />
                  <span>{isAr ? item.nameAr : item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
