import React from 'react';
import { Cpu, Layers, ShieldCheck, ArrowLeft, HelpCircle } from 'lucide-react';
import { LanguageCode, ThemeAccent } from '../../types/vpn';

interface SystemDiagnosticsProps {
  language: LanguageCode;
  themeAccent: ThemeAccent;
  onBack?: () => void;
  onOpenHelp?: (topic?: string) => void;
}

export const SystemDiagnostics: React.FC<SystemDiagnosticsProps> = ({ language, onBack, onOpenHelp }) => {
  const isAr = language === 'ar';

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10 font-sans">
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
            <Cpu className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold font-mono text-emerald-400">
            {isAr ? 'تشخيص النظام والموارد' : 'System Diagnostics'}
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

      {/* Quick Metrics Pills */}
      <div className="grid grid-cols-3 gap-2 text-center font-mono">
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-500 block">{isAr ? 'الذاكرة' : 'Memory'}</span>
          <span className="text-sm font-bold text-emerald-400">{isAr ? '13.31 م.ب' : '13.31 MB'}</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-500 block">{isAr ? 'المنافذ المفتوحة' : 'FD'}</span>
          <span className="text-sm font-bold text-emerald-400">243</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-500 block">{isAr ? 'الخيوط النشطة' : 'Threads'}</span>
          <span className="text-sm font-bold text-emerald-400">95</span>
        </div>
      </div>

      {/* CPU Usage Card */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <Cpu className="w-4 h-4" />
            <span>{isAr ? 'المعالج المركزي' : 'CPU'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isAr ? 'استخدام 14%' : '14% Usage'}</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs pt-1">
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">{isAr ? 'نوع المعالج' : 'Processor'}</span>
            <span className="text-slate-200">{isAr ? 'ثماني النواة ARMv8' : 'ARMv8 Octa-Core'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">{isAr ? 'الأنوية' : 'Cores'}</span>
            <span className="text-emerald-400">{isAr ? '8 أنوية' : '8 cores'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">{isAr ? 'المعمارية' : 'Architecture'}</span>
            <span className="text-slate-200" dir="ltr">ARM64 (64-bit)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">{isAr ? 'أقصى تردد' : 'Max Frequency'}</span>
            <span className="text-slate-200">{isAr ? '2.00 جيجاهرتز' : '2.00 GHz'}</span>
          </div>
        </div>
      </div>

      {/* Memory Breakdown Card */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
          <Layers className="w-4 h-4" />
          <span>{isAr ? 'توزيع الذاكرة الحية' : 'MEMORY ALLOCATION'}</span>
        </div>

        <div className="h-10 w-full flex items-end gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <div className="w-[10%] h-[30%] bg-emerald-700 rounded-t" />
          <div className="w-[15%] h-[45%] bg-emerald-600 rounded-t" />
          <div className="w-[20%] h-[40%] bg-emerald-500 rounded-t" />
          <div className="w-[25%] h-[75%] bg-teal-400 rounded-t" />
          <div className="w-[30%] h-[70%] bg-emerald-400 rounded-t" />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs pt-1">
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">{isAr ? 'ذاكرة النظام' : 'System Heap'}</span>
            <span className="text-emerald-300">{isAr ? '8.79 م.ب' : '8.79 MB'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">{isAr ? 'الذاكرة الأصلية' : 'Native Heap'}</span>
            <span className="text-emerald-300">{isAr ? '13.61 م.ب' : '13.61 MB'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">{isAr ? 'الإجمالي المستخدم' : 'Total PSS'}</span>
            <span className="text-emerald-400 font-bold">{isAr ? '123.92 م.ب' : '123.92 MB'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">{isAr ? 'الذاكرة البديلة' : 'Total Swap'}</span>
            <span className="text-slate-300">{isAr ? '13.97 م.ب' : '13.97 MB'}</span>
          </div>
        </div>
      </div>

      {/* Permissions & Network Info */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 font-mono text-xs">
        <div className="text-emerald-400 font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>{isAr ? 'حالة التصاريح والنفق' : 'PERMISSION & TUNNEL STATUS'}</span>
        </div>

        <div className="flex justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400">{isAr ? 'جاهزية نفق الـ VPN' : 'VPN Prepared'}</span>
          <span className="text-emerald-400 font-bold">{isAr ? 'مفعل وجاهز' : 'YES'}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-800/60">
          <span className="text-slate-400">{isAr ? 'دعم IPv6' : 'IPv6 Available'}</span>
          <span className="text-emerald-400 font-bold">{isAr ? 'متاح' : 'true'}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-slate-400">{isAr ? 'توفير البطارية' : 'Power Saving'}</span>
          <span className="text-emerald-300">{isAr ? 'معطل (عمل مستمر بالخلفية)' : 'Disabled (Unrestricted)'}</span>
        </div>
      </div>
    </div>
  );
};
