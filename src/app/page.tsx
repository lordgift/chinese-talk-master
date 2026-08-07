'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';
import { SCENARIOS } from '@/data/scenarios';
import { Header } from '@/components/Header';
import { ScenarioCard } from '@/components/ScenarioCard';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  UtensilsCrossed,
  Compass,
  ShoppingBag,
  Building2,
  Volume2,
  Layers,
  Filter,
  Heart,
} from 'lucide-react';

export default function HomePage() {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const { userFavorites } = useAuth();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-5 h-5 text-amber-500" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-sky-500" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-emerald-500" />;
      case 'Building2':
      default:
        return <Building2 className="w-5 h-5 text-purple-500" />;
    }
  };

  const sortedCategories = [...CATEGORIES].sort((a, b) => {
    if (a.isAvailable === b.isAvailable) return 0;
    return a.isAvailable ? -1 : 1;
  });

  const favoritesCount = Object.values(userFavorites).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-rose-50/60 via-amber-50/30 to-slate-50 py-12 sm:py-16">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-bold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>เรียนรู้ภาษาจีนแบบโต้ตอบจริง พร้อมระบบประเมินเสียง Pinyin</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
            ฝึกสนทนาภาษาจีน & ออกเสียง <span className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 bg-clip-text text-transparent">Pinyin</span> ได้ถูกต้องแม่นยำ
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            เลือกลองฝึกบทสนทนาจำลองในสถานการณ์จริงตั้งแต่ <span className="text-amber-700 font-bold">สั่งอาหาร/กาแฟ 🍜</span> <span className="text-purple-700 font-bold">เช็คอินโรงแรม 🏨</span> ไปจนถึง <span className="text-sky-700 font-bold">การเดินทางท่องเที่ยว 🏖️</span>
          </p>

          {/* Tone Guide Bar */}
          <div className="mt-8 max-w-2xl mx-auto bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-600" />
                คู่มือสัญลักษณ์สีวรรณยุกต์ Pinyin (Pinyin Tone Color System)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-rose-500 text-white font-bold flex items-center justify-center text-[11px]">1</span>
                <div className="text-left">
                  <div className="font-bold text-rose-700">Tone 1 (ˉ)</div>
                  <div className="text-[10px] text-slate-500">เสียงสามัญ (mā)</div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px]">2</span>
                <div className="text-left">
                  <div className="font-bold text-emerald-700">Tone 2 (ˊ)</div>
                  <div className="text-[10px] text-slate-500">เสียงจัตวา (má)</div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-bold flex items-center justify-center text-[11px]">3</span>
                <div className="text-left">
                  <div className="font-bold text-amber-700">Tone 3 (ˇ)</div>
                  <div className="text-[10px] text-slate-500">เสียงเอก (mǎ)</div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px]">4</span>
                <div className="text-left">
                  <div className="font-bold text-indigo-700">Tone 4 (ˋ)</div>
                  <div className="text-[10px] text-slate-500">เสียงโท (mà)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-12">
        {/* Sticky Filter & Section Jump Bar */}
        <div className="bg-white/90 backdrop-blur-md sticky top-16 z-30 p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
          {/* Quick jump to sections */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-xs font-semibold text-slate-700">
            <span className="text-slate-400 flex items-center gap-1 mr-1">
              <Layers className="w-4 h-4 text-slate-500" />
              หมวดบทเรียน:
            </span>
            {sortedCategories
              .filter((c) => c.isAvailable)
              .map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>{cat.title}</span>
                </a>
              ))}
          </div>

          {/* Filter Dropdown / Buttons */}
          <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
            <span className="text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              ตัวกรอง:
            </span>

            <button
              onClick={() => setSelectedLevel('favorites')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                selectedLevel === 'favorites'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold shadow-xs'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${selectedLevel === 'favorites' ? 'fill-white' : 'fill-rose-500 text-rose-500'}`} />
              <span>บทเรียนที่ชอบ</span>
              {favoritesCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedLevel === 'favorites' ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-800'}`}>
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                selectedLevel === 'all'
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด
            </button>

            <button
              onClick={() => setSelectedLevel('easy')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                selectedLevel === 'easy'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              🟢 ง่าย
            </button>

            <button
              onClick={() => setSelectedLevel('medium')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                selectedLevel === 'medium'
                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              🟡 ปานกลาง
            </button>

            <button
              onClick={() => setSelectedLevel('hard')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                selectedLevel === 'hard'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              🔴 ท้าทาย
            </button>
          </div>
        </div>

        {/* Render Lessons Grouped by Category Sections */}
        {sortedCategories.map((cat) => {
          const categoryScenarios = SCENARIOS.filter((sc) => {
            const matchCategory = sc.categoryId === cat.id;
            if (!matchCategory) return false;

            if (selectedLevel === 'favorites') {
              return !!userFavorites[sc.id];
            }
            if (selectedLevel === 'all') return true;
            return sc.level === selectedLevel;
          });

          // Skip empty categories if filtering
          if (categoryScenarios.length === 0) {
            if (selectedLevel === 'favorites') return null;

            if (!cat.isAvailable) {
              return (
                <section key={cat.id} id={cat.id} className="scroll-mt-24">
                  <div className="bg-slate-100/80 rounded-2xl p-6 border border-slate-200/80 text-center">
                    <div className="inline-flex p-3 rounded-2xl bg-white border border-slate-200 mb-2">
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{cat.title}</h3>
                    <p className="text-xs text-rose-600 font-serif font-semibold">{cat.titleZh}</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{cat.description}</p>
                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold">
                      🚧 เปิดให้บริการบทเรียนหมวดนี้เร็วๆ นี้
                    </span>
                  </div>
                </section>
              );
            }

            return null;
          }

          return (
            <section key={cat.id} id={cat.id} className="scroll-mt-24 space-y-4">
              {/* Section Header */}
              <div className="flex flex-wrap items-end justify-between border-b border-slate-200 pb-3 gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900">{cat.title}</h2>
                      <span className="text-xs font-serif font-semibold text-rose-600 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200">
                        {cat.titleZh}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {categoryScenarios.length} บทเรียน
                </div>
              </div>

              {/* Scenarios Grid for this section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryScenarios.map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Empty state when filtering favorites */}
        {selectedLevel === 'favorites' && favoritesCount === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Heart className="w-8 h-8 fill-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ยังไม่มีบทเรียนที่ชอบ</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
              คุณสามารถกดปุ่มหัวใจ ❤️ บนมุมขวาของการ์ดบทเรียนใดก็ได้ เพื่อบันทึกไว้ในบทเรียนที่ชอบของคุณ
            </p>
            <button
              onClick={() => setSelectedLevel('all')}
              className="mt-6 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              ดูบทเรียนทั้งหมด
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 华语Talk Master - แอปพลิเคชันฝึกสนทนาภาษาจีน & ออกเสียง Pinyin สำหรับคนไทย</p>
        </div>
      </footer>
    </div>
  );
}
