'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';
import { SCENARIOS } from '@/data/scenarios';
import { Header } from '@/components/Header';
import { ScenarioCard } from '@/components/ScenarioCard';
import { Sparkles, UtensilsCrossed, Compass, ShoppingBag, Building2, Flame, Volume2, ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react';
import { getToneColorClass } from '@/lib/pinyinUtils';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const filteredScenarios = SCENARIOS.filter((sc) => {
    const matchCategory = selectedCategory === 'all' || sc.categoryId === selectedCategory;
    const matchLevel = selectedLevel === 'all' || sc.level === selectedLevel;
    return matchCategory && matchLevel;
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-6 h-6 text-amber-400" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-sky-400" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-6 h-6 text-emerald-400" />;
      default:
        return <Building2 className="w-6 h-6 text-purple-400" />;
    }
  };

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
            เลือกระดับบทสนทนาจำลองตั้งแต่ <span className="text-emerald-700 font-bold">ง่าย (Beginner)</span> ไปจนถึง <span className="text-rose-600 font-bold">ท้าทาย (Advanced)</span> ในหมวดหมู่ <span className="text-amber-700 font-bold">สั่งอาหาร 🍜</span> และ <span className="text-sky-700 font-bold">ท่องเที่ยว 🏖️</span>
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

      {/* Main Categories Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            เลือกหมวดหมู่สถานการณ์ (Categories)
          </h2>
          <p className="text-xs text-slate-500 mt-1">เริ่มต้นฝึกฝนในสถานการณ์ที่คุณสนใจใช้งานจริง</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                disabled={!cat.isAvailable}
                className={`text-left p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  !cat.isAvailable
                    ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200'
                    : isSelected
                    ? 'bg-white border-amber-500 ring-2 ring-amber-400/50 shadow-md scale-[1.02]'
                    : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                      {getCategoryIcon(cat.icon)}
                    </div>
                    {cat.isAvailable ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cat.scenariosCount} บทเรียน
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        เร็วๆ นี้
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{cat.title}</h3>
                  <p className="text-xs font-serif text-rose-600 font-semibold">{cat.titleZh}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{cat.description}</p>
                </div>

                {cat.isAvailable && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className={isSelected ? 'text-amber-700' : 'text-slate-500'}>
                      {isSelected ? 'กำลังกรองหมวดนี้' : 'เลือกหมวดนี้'}
                    </span>
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">รายการสถานการณ์จำลอง (Practice Scenarios)</h2>
            <p className="text-xs text-slate-500">เลือกบทสนทนาที่ต้องการฝึกออกเสียง</p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                selectedLevel === 'all'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              ระดับทั้งหมด
            </button>
            <button
              onClick={() => setSelectedLevel('easy')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                selectedLevel === 'easy'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              🟢 ง่าย (Beginner)
            </button>
            <button
              onClick={() => setSelectedLevel('medium')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                selectedLevel === 'medium'
                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              🟡 ปานกลาง (Intermediate)
            </button>
            <button
              onClick={() => setSelectedLevel('hard')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                selectedLevel === 'hard'
                  ? 'bg-rose-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              🔴 ท้าทาย (Advanced)
            </button>
          </div>
        </div>

        {/* Scenarios Grid */}
        {filteredScenarios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-sm text-slate-500">ไม่พบสถานการณ์ตามตัวกรองที่เลือก</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedLevel('all');
              }}
              className="mt-3 text-xs font-bold text-rose-600 underline hover:text-rose-700"
            >
              ล้างตัวกรองทั้งหมด
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
