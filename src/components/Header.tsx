'use client';

import Link from 'next/link';
import { Sparkles, Languages, Volume2, BookOpen } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 text-white shadow-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight tracking-wide bg-gradient-to-r from-white via-slate-100 to-amber-300 bg-clip-text text-transparent flex items-center gap-2">
              华语Talk Master
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Pinyin & Speech
              </span>
            </div>
            <p className="text-xs text-slate-400 font-light">ฝึกสนทนาภาษาจีน & ออกเสียงวรรณยุกต์ถูกต้อง</p>
          </div>
        </Link>

        {/* Action Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>หมวดแนะนำ: 🍜 สั่งอาหาร & 🏖️ ท่องเที่ยว</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <BookOpen className="w-4 h-4 text-rose-400" />
            <span>หน้าแรก</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
