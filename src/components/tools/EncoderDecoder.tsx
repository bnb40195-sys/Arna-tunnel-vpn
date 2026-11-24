import React, { useState } from 'react';
import { ArrowDownUp, Copy, Check, ArrowLeft, HelpCircle, Activity } from 'lucide-react';
import { LanguageCode, ThemeAccent } from '../../types/vpn';

interface EncoderDecoderProps {
  language: LanguageCode;
  themeAccent: ThemeAccent;
  onBack?: () => void;
  onOpenHelp?: (topic?: string) => void;
}

export const EncoderDecoder: React.FC<EncoderDecoderProps> = ({ language, onBack, onOpenHelp }) => {
  const isAr = language === 'ar';

  const [format, setFormat] = useState<'base64' | 'url' | 'hex'>('base64');
  const [action, setAction] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('GET / HTTP/1.1\nHost: www.snapchat.com');
  const [copied, setCopied] = useState(false);

  const computeOutput = () => {
    if (!input) return isAr ? '(فارغ)' : '(empty)';
    try {
      if (format === 'base64') {
        return action === 'encode'
          ? btoa(unescape(encodeURIComponent(input)))
          : decodeURIComponent(escape(atob(input)));
      }
      if (format === 'url') {
        return action === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
      }
      if (format === 'hex') {
        if (action === 'encode') {
          return Array.from(new TextEncoder().encode(input))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        } else {
          const clean = input.replace(/\s+/g, '');
          const bytes = new Uint8Array(clean.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
          return new TextDecoder().decode(bytes);
        }
      }
    } catch (e: any) {
      return isAr ? `خطأ: النص المدخل غير صالح بصيغة ${format.toUpperCase()}` : `Error: Invalid input for ${format.toUpperCase()} ${action}: ${e.message}`;
    }
    return '';
  };

  const output = computeOutput();

  const handleSwap = () => {
    if (output && !output.startsWith('Error:') && !output.startsWith('خطأ:')) {
      setInput(output);
      setAction(action === 'encode' ? 'decode' : 'encode');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <Activity className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold font-mono text-emerald-400">
            {isAr ? 'تشفير وفك تشفير النصوص' : 'ENCODER / DECODER'}
          </h2>
        </div>

        {onOpenHelp && (
          <button
            onClick={() => onOpenHelp('payload')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all text-xs font-mono font-bold shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      {/* Format Selector */}
      <div className="grid grid-cols-3 gap-2">
        {(['base64', 'url', 'hex'] as const).map((fmt) => (
          <button
            key={fmt}
            onClick={() => setFormat(fmt)}
            className={`py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
              format === fmt
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {fmt}
          </button>
        ))}
      </div>

      {/* Action Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setAction('encode')}
          className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            action === 'encode'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {isAr ? 'تشفير (Encode)' : 'Encode'}
        </button>
        <button
          onClick={() => setAction('decode')}
          className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            action === 'decode'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {isAr ? 'فك التشفير (Decode)' : 'Decode'}
        </button>
      </div>

      {/* Input Box */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase">
          {isAr ? 'النص المدخل' : 'INPUT'}
        </div>
        <textarea
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isAr ? 'اكتب أو الصق النص هنا...' : 'Type or paste text...'}
          dir="ltr"
          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none resize-none"
        />
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-2">
        <button
          onClick={handleSwap}
          className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 active:scale-90 transition-all shadow-md"
          title={isAr ? 'عكس المدخل والمخرج' : 'Swap input and output'}
        >
          <ArrowDownUp className="w-4 h-4" />
        </button>
      </div>

      {/* Output Box */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">
            {isAr ? 'النتيجة' : 'OUTPUT'}
          </span>
          <button onClick={handleCopy} className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-white">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ' : 'Copy'}</span>
          </button>
        </div>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 text-xs font-mono min-h-[90px] break-all whitespace-pre-wrap" dir="ltr">
          {output}
        </div>
      </div>
    </div>
  );
};
