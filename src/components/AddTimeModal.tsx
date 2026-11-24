import React from 'react';
import { Clock, Plus, X } from 'lucide-react';
import { LanguageCode, ThemeAccent } from '../types/vpn';

interface AddTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTimeSeconds: (seconds: number) => void;
  language: LanguageCode;
  themeAccent: ThemeAccent;
}

export const AddTimeModal: React.FC<AddTimeModalProps> = ({
  isOpen,
  onClose,
  onAddTimeSeconds,
  language,
}) => {
  if (!isOpen) return null;

  const isAr = language === 'ar';

  const options = isAr
    ? [
        { label: '+15 دقيقة', seconds: 15 * 60, desc: 'تمديد سريع للجلسة' },
        { label: '+1 ساعة', seconds: 60 * 60, desc: 'باقة تصفح قياسية' },
        { label: '+6 ساعات', seconds: 6 * 3600, desc: 'جلسة ألعاب ومشاهدة طويلة' },
        { label: '+24 ساعة', seconds: 24 * 3600, desc: 'تمديد ليوم كامل' },
        { label: '∞ باقة غير محدودة', seconds: 365 * 24 * 3600, desc: 'اتصال دائم مفتوح مجاناً' },
      ]
    : [
        { label: '+15 Minutes', seconds: 15 * 60, desc: 'Quick session boost' },
        { label: '+1 Hour', seconds: 60 * 60, desc: 'Standard browsing pass' },
        { label: '+6 Hours', seconds: 6 * 3600, desc: 'Full-day gaming & streaming' },
        { label: '+24 Hours', seconds: 24 * 3600, desc: 'Extended 1-Day Pass' },
        { label: '∞ Unlimited Pass', seconds: 365 * 24 * 3600, desc: 'Permanent Unlimited Connection' },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-[#090e1a] border border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold font-mono text-white tracking-wide">
              {isAr ? 'إضافة وقت اتصال إضافي' : 'ADD CONNECTION TIME'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          {isAr
            ? 'اختر باقة الوقت المناسبة لتمديد صلاحية اتصال النفق المشفر:'
            : 'Select a time package to extend your encrypted tunnel connection:'}
        </p>

        {/* Options list */}
        <div className="space-y-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onAddTimeSeconds(opt.seconds);
                onClose();
              }}
              className="w-full p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-400 hover:bg-slate-850 flex items-center justify-between transition-all group"
            >
              <div className="text-start">
                <div className="font-mono text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                  {opt.label}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{opt.desc}</div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
