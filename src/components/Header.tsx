'use client';

import Link from 'next/link';
import { Sparkles, Languages, BookOpen } from 'lucide-react';
import { UserMenu } from './UserMenu';

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/80 text-slate-900 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <Languages className="w-5 h-5" />
          </div>
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

        {/* Action Badges & User Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-600" />
            <span>หมวดแนะนำ: 🍜 สั่งอาหาร & 🏖️ ท่องเที่ยว</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-xl border border-slate-200 transition shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-rose-500" />
            <span>หน้าแรก</span>
          </Link>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
