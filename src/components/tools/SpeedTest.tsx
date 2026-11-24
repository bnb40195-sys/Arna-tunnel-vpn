import React, { useState } from 'react';
import { Play, RotateCw, ArrowDown, ArrowUp, ArrowLeft, HelpCircle, Gauge } from 'lucide-react';
import { LanguageCode, ThemeAccent } from '../../types/vpn';

interface SpeedTestProps {
  language: LanguageCode;
  themeAccent: ThemeAccent;
  onBack?: () => void;
  onOpenHelp?: (topic?: string) => void;
}

export const SpeedTest: React.FC<SpeedTestProps> = ({ language, onBack, onOpenHelp }) => {
  const isAr = language === 'ar';

  const [testing, setTesting] = useState(false);
  const [downloadMbps, setDownloadMbps] = useState(0);
  const [uploadMbps, setUploadMbps] = useState(0);
  const [ping, setPing] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [statusText, setStatusText] = useState(isAr ? 'جاهز لبدء القياس الحقيقي' : 'Ready for live speed test');

  const startTest = async () => {
    setTesting(true);
    setDownloadMbps(0);
    setUploadMbps(0);
    setPing(0);
    setJitter(0);

    try {
      // 1. Real Ping & Jitter across 4 samples
      setStatusText(isAr ? 'جاري قياس البينغ والتذبذب الحقيقي...' : 'Measuring real latency & jitter...');
      const pings: number[] = [];
      for (let i = 0; i < 4; i++) {
        const t0 = performance.now();
        await fetch(`/api/speed-ping?i=${i}&ts=${Date.now()}`, { cache: 'no-store' });
        pings.push(performance.now() - t0);
      }
      const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
      const jitterVal =
        pings.slice(1).reduce((acc, val, idx) => acc + Math.abs(val - pings[idx]), 0) /
        Math.max(1, pings.length - 1);
      setPing(Math.round(avgPing));
      setJitter(Math.round(jitterVal));

      // 2. Real Download Speed measurement (2 MB payload)
      setStatusText(isAr ? 'جاري قياس سرعة التحميل الفعلية...' : 'Measuring real download throughput...');
      const downBytes = 2 * 1024 * 1024;
      const dStart = performance.now();
      const dResp = await fetch(`/api/speed-payload?bytes=${downBytes}&ts=${Date.now()}`, { cache: 'no-store' });
      const dBuf = await dResp.arrayBuffer();
      const dSec = Math.max(0.01, (performance.now() - dStart) / 1000);
      const downMbpsReal = (dBuf.byteLength * 8) / (dSec * 1_000_000);
      setDownloadMbps(Number(downMbpsReal.toFixed(2)));

      // 3. Real Upload Speed measurement (1 MB payload)
      setStatusText(isAr ? 'جاري قياس سرعة الرفع الفعلية...' : 'Measuring real upload throughput...');
      const upBytes = 1024 * 1024;
      const upPayload = new Uint8Array(upBytes);
      const uStart = performance.now();
      await fetch(`/api/speed-upload?ts=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: upPayload,
      });
      const uSec = Math.max(0.01, (performance.now() - uStart) / 1000);
      const upMbpsReal = (upBytes * 8) / (uSec * 1_000_000);
      setUploadMbps(Number(upMbpsReal.toFixed(2)));

      setStatusText(isAr ? 'اكتمل القياس الحقيقي بنجاح' : 'Live speed test completed');
    } catch (err) {
      setStatusText(
        isAr
          ? `تعذر القياس: ${err instanceof Error ? err.message : 'تحقق من الشبكة'}`
          : `Test failed: ${err instanceof Error ? err.message : 'Check network'}`
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-lg mx-auto pb-10 font-sans">
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
            <Gauge className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold font-mono text-emerald-400">
            {isAr ? 'قياس سرعة الاتصال الحقيقي' : 'LIVE SPEED TEST'}
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

      {/* Download & Upload Display Boxes */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-mono mb-2">
            <ArrowDown className="w-4 h-4" />
            <span>{isAr ? 'التحميل' : 'DOWNLOAD'}</span>
          </div>
          <div className="text-3xl font-mono font-black text-emerald-400 tracking-tight">
            {downloadMbps.toFixed(2)}
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-1">{isAr ? 'ميجابت/ث' : 'Mbps'}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-teal-400 text-xs font-mono mb-2">
            <ArrowUp className="w-4 h-4" />
            <span>{isAr ? 'الرفع' : 'UPLOAD'}</span>
          </div>
          <div className="text-3xl font-mono font-black text-teal-400 tracking-tight">
            {uploadMbps.toFixed(2)}
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-1">{isAr ? 'ميجابت/ث' : 'Mbps'}</div>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex flex-col items-center justify-center py-2">
        <button
          onClick={startTest}
          disabled={testing}
          className={`px-8 py-3 rounded-full font-mono font-bold text-xs tracking-wider flex items-center gap-2 transition-all shadow-lg ${
            testing
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/60 active:scale-95'
          }`}
        >
          {testing ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{testing ? (isAr ? 'جاري القياس...' : 'TESTING...') : isAr ? 'بدء القياس الحقيقي' : 'START LIVE TEST'}</span>
        </button>

        <p className="mt-3 text-xs font-mono text-emerald-400/85">{statusText}</p>
      </div>

      {/* Connection Details */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
          {isAr ? 'تفاصيل جودة الاتصال' : 'CONNECTION DETAILS'}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-mono text-slate-500">{isAr ? 'البينغ (التأخير)' : 'Ping'}</div>
            <div className="text-lg font-mono font-bold text-emerald-400">
              {ping} {isAr ? 'مللي ثانية' : 'ms'}
            </div>
          </div>
          <div>
            <div className="text-xs font-mono text-slate-500">{isAr ? 'التذبذب (Jitter)' : 'Jitter'}</div>
            <div className="text-lg font-mono font-bold text-emerald-400">
              {jitter} {isAr ? 'مللي ثانية' : 'ms'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
