import React, { useState } from 'react';
import { RotateCw, Share2, Trash2, ArrowLeft, HelpCircle, FileText } from 'lucide-react';
import { LogEntry, LanguageCode, ThemeAccent } from '../../types/vpn';

interface ConnectionLogsProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onRefreshLogs: () => void;
  onBack?: () => void;
  onOpenHelp?: (topic?: string) => void;
  language: LanguageCode;
  themeAccent: ThemeAccent;
}

export const ConnectionLogs: React.FC<ConnectionLogsProps> = ({
  logs,
  onClearLogs,
  onRefreshLogs,
  onBack,
  onOpenHelp,
  language,
}) => {
  const isAr = language === 'ar';
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = logs.map((l) => `[${l.time}] [${l.type}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogTypeLabel = (type: LogEntry['type']) => {
    if (!isAr) return type;
    switch (type) {
      case 'INFO':
        return 'معلومة';
      case 'SSH':
        return 'اتصال SSH';
      case 'VPN':
        return 'النفق';
      case 'PERM':
        return 'التصاريح';
      case 'ERROR':
        return 'خطأ';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40"
              aria-label={isAr ? 'رجوع' : 'Back'}
            >
              <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center text-emerald-400">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold font-mono text-emerald-400">
            {isAr ? 'سجلات الاتصال الفورية' : 'CONNECTION LOGS'}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onRefreshLogs}
            className="p-2 text-emerald-400 hover:text-white rounded-lg hover:bg-slate-800 active:scale-95"
            title={isAr ? 'تحديث' : 'Refresh'}
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-emerald-400 hover:text-white rounded-lg hover:bg-slate-800 active:scale-95"
            title={isAr ? 'نسخ السجلات' : 'Copy all logs'}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClearLogs}
            className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-slate-800 active:scale-95"
            title={isAr ? 'مسح السجلات' : 'Clear logs'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {onOpenHelp && (
            <button
              onClick={() => onOpenHelp('diagnostic')}
              className="p-2 text-emerald-400 hover:text-white rounded-lg hover:bg-slate-800 active:scale-95"
              title={isAr ? 'مساعدة' : 'Help'}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {copied && (
        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono text-center">
          {isAr ? 'تم نسخ جميع السجلات بنجاح!' : 'Logs copied to clipboard!'}
        </div>
      )}

      {/* Device Info Card */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono text-xs">
        <div className="text-emerald-400 font-bold text-[11px] pb-1 border-b border-slate-800/80">
          {isAr ? 'معلومات الجهاز والشبكة' : 'DEVICE INFO'}
        </div>
        <div className="flex justify-between py-0.5">
          <span className="text-slate-500">{isAr ? 'الجهاز' : 'Device'}</span>
          <span className="text-emerald-300" dir="ltr">Android Smart Device</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span className="text-slate-500">{isAr ? 'النظام' : 'OS'}</span>
          <span className="text-teal-300" dir="ltr">Android 14 (API 34)</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span className="text-slate-500">{isAr ? 'المعمارية' : 'Architecture'}</span>
          <span className="text-emerald-300" dir="ltr">arm64-v8a</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span className="text-slate-500">{isAr ? 'الشبكة' : 'Network'}</span>
          <span className="text-emerald-400 font-bold">{isAr ? 'واي فاي / شريحة 4G' : 'WiFi / LTE'}</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span className="text-slate-500">{isAr ? 'العنوان المحلي' : 'Local IP'}</span>
          <span className="text-emerald-300" dir="ltr">192.168.1.105</span>
        </div>
      </div>

      {/* Logs Feed */}
      <div className="space-y-2.5 font-mono">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            {isAr ? 'لا توجد سجلات اتصال مسجلة حالياً.' : 'No connection logs recorded yet.'}
          </div>
        ) : (
          logs.map((log) => {
            const isWarn = log.type === 'PERM' || log.type === 'ERROR';
            const isSuccess = log.type === 'SSH' || log.type === 'VPN';

            return (
              <div
                key={log.id}
                className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                  isWarn
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    : isSuccess
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[10px] text-slate-500">
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      isWarn
                        ? 'bg-rose-500/20 text-rose-300'
                        : isSuccess
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {getLogTypeLabel(log.type)}
                  </span>
                  <span>{log.time}</span>
                </div>
                <p className="text-xs">{log.message}</p>
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-end pt-2">
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
          {isAr ? `${logs.length} سجل` : `${logs.length} logs`}
        </span>
      </div>
    </div>
  );
};
