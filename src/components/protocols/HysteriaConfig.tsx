import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, Flame } from 'lucide-react';
import { HysteriaConfigData, ThemeAccent, LanguageCode } from '../../types/vpn';
import { translations } from '../../utils/translations';

interface HysteriaConfigProps {
  onSaveAndConnect: (config: HysteriaConfigData) => void;
  onOpenHelp?: (topic?: string) => void;
  onBack?: () => void;
  themeAccent: ThemeAccent;
  language: LanguageCode;
}

export const HysteriaConfig: React.FC<HysteriaConfigProps> = ({
  onSaveAndConnect,
  onOpenHelp,
  onBack,
  language,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  const [server, setServer] = useState('hysteria.arnatunnel.net:443');
  const [authPassword, setAuthPassword] = useState('arna_secret_pass_2026');
  const [sni, setSni] = useState('www.snapchat.com');
  const [allowInsecure, setAllowInsecure] = useState(true);
  const [certificatePin, setCertificatePin] = useState(false);
  const [pinHash, setPinHash] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [obfuscation, setObfuscation] = useState(false);
  const [obfuscationKey] = useState('salamander_key');
  const [bandwidthLimit, setBandwidthLimit] = useState(true);
  const [uploadMbps, setUploadMbps] = useState(50);
  const [downloadMbps, setDownloadMbps] = useState(100);
  const [portHopping, setPortHopping] = useState(false);
  const [portsRange] = useState('20000-50000');
  const [quicTuning, setQuicTuning] = useState(false);

  const handleConnect = () => {
    onSaveAndConnect({
      server,
      authPassword,
      sni,
      allowInsecure,
      certificatePin,
      pinHash,
      obfuscation,
      obfuscationKey,
      bandwidthLimit,
      uploadMbps,
      downloadMbps,
      portHopping,
      portsRange,
      quicTuning,
    });
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
            <Flame className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold font-mono text-emerald-400">
            {isAr ? 'نفق Hysteria UDP المخصص' : 'Custom Hysteria'}
          </h2>
        </div>

        {onOpenHelp && (
          <button
            onClick={() => onOpenHelp('protocols')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all text-xs font-mono font-bold shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'مساعدة' : 'Help'}</span>
          </button>
        )}
      </div>

      {/* Server */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'عنوان الخادم' : 'Server'}</div>
        <div className="text-[11px] text-slate-500 font-mono">
          {isAr ? 'المضيف والمنفذ (مثال: example.com:443)' : 'host:port (e.g. example.com:443)'}
        </div>
        <input
          type="text"
          value={server}
          onChange={(e) => setServer(e.target.value)}
          placeholder="host:port"
          dir="ltr"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Authentication */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'كلمة مرور المصادقة' : 'Authentication'}</div>
        <div className="text-[11px] text-slate-500 font-mono">
          {isAr ? 'كلمة المرور الخاصة بسيرفر Hysteria' : 'Server auth password'}
        </div>
        <input
          type="password"
          value={authPassword}
          onChange={(e) => setAuthPassword(e.target.value)}
          placeholder={isAr ? 'كلمة المرور' : 'password'}
          dir="ltr"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* SNI */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'نطاق الهوست (SNI)' : 'SNI (TLS)'}</div>
        <div className="text-[11px] text-slate-500 font-mono">
          {isAr ? 'اتركه فارغاً لاستخدام عنوان الخادم الافتراضي' : 'Leave blank to use server host'}
        </div>
        <input
          type="text"
          value={sni}
          onChange={(e) => setSni(e.target.value)}
          placeholder="www.snapchat.com"
          dir="ltr"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Allow Insecure */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'السماح بالشهادات غير الموثوقة' : 'Allow Insecure'}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            {isAr ? 'تخطي فحص شهادة TLS عند الاتصال' : 'Skip TLS certificate verification'}
          </div>
        </div>
        <input
          type="checkbox"
          checked={allowInsecure}
          onChange={(e) => setAllowInsecure(e.target.checked)}
          className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
        />
      </div>

      {/* Certificate Pin */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'تثبيت بصمة الشهادة' : 'Certificate Pin'}</div>
            <div className="text-[11px] text-slate-500 font-mono">
              {isAr ? 'تثبيت شهادة الخادم عبر بصمة SHA-256' : 'Pin server certificate (SHA-256)'}
            </div>
          </div>
          <input
            type="checkbox"
            checked={certificatePin}
            onChange={(e) => setCertificatePin(e.target.checked)}
            className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
          />
        </div>
        {certificatePin && (
          <input
            type="text"
            value={pinHash}
            onChange={(e) => setPinHash(e.target.value)}
            placeholder="SHA-256"
            dir="ltr"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono"
          />
        )}
      </div>

      {/* Obfuscation */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'تمويه الحزم (Obfuscation)' : 'Obfuscation'}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            {isAr ? 'تمويه الاتصال كحركة UDP عشوائية' : 'Disguise traffic as random UDP packets'}
          </div>
        </div>
        <input
          type="checkbox"
          checked={obfuscation}
          onChange={(e) => setObfuscation(e.target.checked)}
          className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
        />
      </div>

      {/* Bandwidth Limit */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'تحديد سرعة الضخ (Brutal)' : 'Bandwidth Limit'}</div>
            <div className="text-[11px] text-slate-500 font-mono">
              {isAr ? 'وضع ثابت لتحقيق أقصى ثبات للسرعة' : 'Brutal mode (fixed rate)'}
            </div>
          </div>
          <input
            type="checkbox"
            checked={bandwidthLimit}
            onChange={(e) => setBandwidthLimit(e.target.checked)}
            className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
          />
        </div>

        {bandwidthLimit && (
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono text-emerald-400 mb-1">
                <span>{isAr ? 'سرعة الرفع:' : 'Upload:'}</span>
                <span>{uploadMbps} {isAr ? 'ميجابت/ث' : 'Mbps'}</span>
              </div>
              <input
                type="range"
                min="5"
                max="300"
                value={uploadMbps}
                onChange={(e) => setUploadMbps(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono text-teal-400 mb-1">
                <span>{isAr ? 'سرعة التحميل:' : 'Download:'}</span>
                <span>{downloadMbps} {isAr ? 'ميجابت/ث' : 'Mbps'}</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                value={downloadMbps}
                onChange={(e) => setDownloadMbps(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Port Hopping */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'تبديل المنافذ التلقائي' : 'Port Hopping'}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            {isAr ? 'تدوير منافذ UDP لتفادي الحجب' : 'Rotate UDP ports to evade blocks'}
          </div>
        </div>
        <input
          type="checkbox"
          checked={portHopping}
          onChange={(e) => setPortHopping(e.target.checked)}
          className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
        />
      </div>

      {/* QUIC Tuning */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-emerald-400 font-bold">{isAr ? 'تحسين بروتوكول QUIC' : 'QUIC Tuning'}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            {isAr ? 'ضبط الذاكرة المؤقتة (8 ميجابايت)' : 'Default (8 MB)'}
          </div>
        </div>
        <input
          type="checkbox"
          checked={quicTuning}
          onChange={(e) => setQuicTuning(e.target.checked)}
          className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
        />
      </div>

      <button
        onClick={handleConnect}
        className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-950"
      >
        {t.connect}
      </button>
    </div>
  );
};
