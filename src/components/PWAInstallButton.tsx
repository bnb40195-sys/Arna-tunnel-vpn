import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { LanguageCode, ThemeAccent } from '../types/vpn';
import { THEMES } from '../utils/theme';

interface PWAInstallButtonProps {
  language: LanguageCode;
  themeAccent: ThemeAccent;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  language,
  themeAccent,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const theme = THEMES[themeAccent];
  const isAr = language === 'ar';

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`w-full flex items-center justify-center gap-2 rounded-xl ${theme.solidBgClass} ${theme.solidHoverClass} ${theme.solidTextClass} px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95`}
      >
        <Download className="w-4 h-4" />
        <span>{isAr ? 'تثبيت التطبيق للعمل بدون إنترنت' : 'Install App for Offline Use'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`w-full flex items-center justify-center gap-2 rounded-xl border ${theme.borderClass} ${theme.bgSoftClass} ${theme.textLightClass} px-4 py-2.5 text-xs font-bold transition-all`}
        >
          <Smartphone className="w-4 h-4" />
          <span>{isAr ? 'تثبيت التطبيق على iPhone / iPad' : 'Install on iPhone / iPad'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className={`w-full max-w-sm rounded-2xl bg-[#0a101d] border ${theme.borderClass} p-5 shadow-2xl space-y-3`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'تثبيت Arna tunnel للعمل بدون نت' : 'Install on iPhone / iPad'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr
                  ? '1. اضغط على زر المشاركة (Share) في متصفح Safari.\n2. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
                  : '1. Tap the Share button in Safari.\n2. Scroll down and tap Add to Home Screen.'}
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className={`w-full rounded-xl ${theme.solidBgClass} ${theme.solidTextClass} py-2 text-xs font-bold`}
              >
                {isAr ? 'حسناً' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
