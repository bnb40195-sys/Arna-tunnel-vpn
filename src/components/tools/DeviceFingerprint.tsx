import React, { useState } from 'react';
import { Fingerprint, Copy, Check, Smartphone, Info, ArrowLeft, HelpCircle } from 'lucide-react';
import { LanguageCode, ThemeAccent } from '../../types/vpn';

interface DeviceFingerprintProps {
  language: LanguageCode;
  themeAccent: ThemeAccent;
  onClose?: () => void;
  onOpenHelp?: (topic?: string) => void;
}

export const DeviceFingerprint: React.FC<DeviceFingerprintProps> = ({
  language,
  onClose,
  onOpenHelp,
}) => {
  const isAr = language === 'ar';
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const androidId = '38f7eafd0d251b77';
  const installId = '75cd3369-6ceb-4bda-b274-a86775d5fd1a';
  const fingerprint = '47BDC24A1383A9CF6088339D55DA7CE2BA0482B7D481AA493C';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10 font-sans">
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40"
              aria-label={isAr ? 'رجوع' : 'Back'}
            >
              <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center text-emerald-400">
            <Fingerprint className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold font-mono text-emerald-400">
            {isAr ? 'بصمة ومعرف الجهاز' : 'Device Fingerprint'}
          </h2>
        </div>

        {onOpenHelp && (
          <button
            onClick={() => onOpenHelp('diagnostic')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all text-xs font-mono font-bold shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      {/* Android ID Card */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            {isAr ? 'معرف أندرويد (HWID)' : 'Android ID'}
          </span>
          <button onClick={() => copyToClipboard(androidId, 'androidId')} className="text-slate-400 hover:text-white">
            {copiedKey === 'androidId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300" dir="ltr">
          {androidId}
        </div>
        <p className="text-[10px] text-slate-500 font-mono">
          {isAr ? 'معرف فريد لقفل الكونفيجات على جهازك فقط' : 'Unique ID per device & app combination'}
        </p>
      </div>

      {/* Installation ID Card */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
          <span className="flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5" />
            {isAr ? 'معرف التثبيت' : 'Installation ID'}
          </span>
          <button onClick={() => copyToClipboard(installId, 'installId')} className="text-slate-400 hover:text-white">
            {copiedKey === 'installId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 truncate" dir="ltr">
          {installId}
        </div>
        <p className="text-[10px] text-slate-500 font-mono">
          {isAr ? 'المعرف الفريد لتثبيت التطبيق الحالي' : 'Unique ID for this app installation'}
        </p>
      </div>

      {/* SHA-256 Fingerprint */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
          <span className="flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5" />
            {isAr ? 'بصمة العتاد المشفرة' : 'Device Fingerprint'}
          </span>
          <button onClick={() => copyToClipboard(fingerprint, 'fp')} className="text-slate-400 hover:text-white">
            {copiedKey === 'fp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 break-all leading-relaxed" dir="ltr">
          {fingerprint}
        </div>
        <p className="text-[10px] text-slate-500 font-mono">
          {isAr ? 'توقيع SHA-256 لمواصفات جهازك' : 'SHA-256 hash of device hardware properties'}
        </p>
      </div>

      {/* Device Info */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          {isAr ? 'بيانات النظام' : 'Device Info'}
        </div>

        <div className="space-y-1.5 text-xs font-mono pt-1">
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">{isAr ? 'إصدار النظام' : 'Android'}</span>
            <span className="text-emerald-300" dir="ltr">14 (API 34)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">{isAr ? 'المعمارية' : 'Architecture'}</span>
            <span className="text-emerald-300" dir="ltr">arm64-v8a</span>
          </div>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase"
        >
          {isAr ? 'إغلاق' : 'CLOSE'}
        </button>
      )}
    </div>
  );
};
