'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Lightbulb } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { SuggestLessonModal } from './SuggestLessonModal';

export function Header() {
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/80 text-slate-900 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group touch-manipulation active:scale-95 transition-transform">
            <img
              src="/app-icon.png"
              alt="华语Talk Master Icon"
              className="w-10 h-10 rounded-xl shadow-md shadow-rose-500/10 group-hover:scale-105 transition-transform object-cover overflow-hidden"
            />
            <div>
              <div className="font-extrabold text-lg leading-tight tracking-wide text-slate-900 flex items-center gap-2">
                华语Talk Master
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-semibold">
                  Pinyin & Speech
                </span>
              </div>
              <p className="text-xs text-slate-500 font-light">ฝึกสนทนาภาษาจีน & ออกเสียงวรรณยุกต์ถูกต้อง</p>
            </div>
          </Link>

          {/* Navigation & User Menu */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSuggestOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100/80 px-3 py-2 rounded-xl border border-amber-200 transition shadow-2xs touch-manipulation active:scale-95 min-h-[40px] cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">💡 เสนอบทเรียน</span>
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-xl border border-slate-200 transition shadow-2xs touch-manipulation active:scale-95 min-h-[40px]"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>หน้าแรก</span>
            </Link>

            <UserMenu />
          </div>
        </div>
      </header>

      <SuggestLessonModal isOpen={isSuggestOpen} onClose={() => setIsSuggestOpen(false)} />
    </>
  );
}
