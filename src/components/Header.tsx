'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sliders } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { VoiceSettingsModal } from './VoiceSettingsModal';

export function Header() {
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 border-b border-slate-200/80 text-slate-900 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Logo & Title (Click to return to Home) */}
        <Link
          href="/"
          title="กลับสู่หน้าแรก"
          className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink group touch-manipulation active:scale-95 transition-transform cursor-pointer"
        >
          <img
            src="/app-icon.png"
            alt="华语Talk Master Icon"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-md shadow-rose-500/10 group-hover:scale-105 transition-transform object-cover overflow-hidden shrink-0"
          />
          <div className="min-w-0 flex flex-col justify-center">
            <div className="font-extrabold text-sm sm:text-base md:text-lg leading-tight tracking-tight text-slate-900 flex items-center gap-1.5 truncate">
              <span className="truncate">华语Talk Master</span>
              <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-semibold shrink-0">
                Pinyin & Speech
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 font-light truncate leading-none mt-0.5">
              คอร์สภาษาจีนเอาตัวรอดเที่ยวจีน สำหรับคนไทยผู้ไม่มีพื้นฐาน
            </p>
          </div>
        </Link>

        {/* Right Action Controls: Voice Settings + User Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Voice Settings Button */}
          <button
            type="button"
            onClick={() => setIsVoiceSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs font-bold text-xs transition active:scale-95 cursor-pointer touch-manipulation min-h-[40px]"
            title="ปรับแต่งเสียงพูดภาษาจีน (Voice & Pitch Settings)"
          >
            <Sliders className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">ตั้งค่าเสียง</span>
          </button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />
    </header>
  );
}

