'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
        .catch((err) => console.warn('Service Worker registration failed:', err));
    }

    // Check if already running as installed app (standalone)
    const isStandaloneApp =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    if (isStandaloneApp) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if user dismissed prompt in this session
    const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (dismissed) return;

    // Listen for Chrome / Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS Safari and not standalone, show prompt after 2 seconds delay
    if (isIosDevice && !isStandaloneApp) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* Floating Bottom PWA Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slideUp">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-3.5 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <img
              src="/app-icon.png"
              alt="App Icon"
              className="w-12 h-12 rounded-2xl shadow-md border border-amber-400/40 object-cover shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-extrabold text-white">华语Talk Master</h4>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/30">
                  App
                </span>
              </div>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                ติดตั้งแอปบนหน้าจอมือถือเพื่อใช้งานได้สะดวก 📱
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition cursor-pointer touch-manipulation select-none active:scale-95 flex items-center gap-1.5 whitespace-nowrap min-h-[40px]"
            >
              <Download className="w-4 h-4" />
              <span>ติดตั้งแอป</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer touch-manipulation active:scale-95 min-h-[40px] flex items-center justify-center"
              title="ปิดการแจ้งเตือน"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full text-slate-900 shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src="/app-icon.png"
              alt="App Icon"
              className="w-16 h-16 mx-auto rounded-2xl shadow-md border border-amber-200 mb-3"
            />
            <h3 className="text-base font-extrabold text-slate-900">วิธีติดตั้งบน iPhone / iPad 📲</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              เพิ่มแอป 华语Talk Master ลงบนหน้าจอโฮมของคุณใน 2 ขั้นตอนง่ายๆ:
            </p>

            <div className="space-y-3 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    แตะปุ่มแชร์ <Share className="w-4 h-4 text-sky-600 inline" /> (Share)
                  </p>
                  <p className="text-[11px] text-slate-500">บริเวณเมนูด้านล่างหรือด้านบนของ Safari</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    เลือก &quot;เพิ่มไปยังหน้าจอโฮม&quot; <PlusSquare className="w-4 h-4 text-emerald-600 inline" />
                  </p>
                  <p className="text-[11px] text-slate-500">หรือ &quot;Add to Home Screen&quot;</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition"
            >
              เข้าใจแล้ว ปิดหน้านี้
            </button>
          </div>
        </div>
      )}
    </>
  );
}
