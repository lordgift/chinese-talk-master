'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/data/categories';
import { SCENARIOS } from '@/data/scenarios';
import { Header } from '@/components/Header';
import { ScenarioCard } from '@/components/ScenarioCard';
import { SuggestLessonModal } from '@/components/SuggestLessonModal';
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
  GraduationCap,
  Calculator,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';

export default function HomePage() {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isFoundationExpanded, setIsFoundationExpanded] = useState<boolean>(true);
  const [isSuggestOpen, setIsSuggestOpen] = useState<boolean>(false);
  const { userFavorites } = useAuth();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-indigo-500" />;
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-emerald-500" />;
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

  const foundationCategory = CATEGORIES.find((c) => c.id === 'survival-foundation');
  const foundationScenarios = SCENARIOS.filter((sc) => sc.categoryId === 'survival-foundation');

  const otherCategories = CATEGORIES.filter((c) => c.id !== 'survival-foundation').sort((a, b) => {
    if (a.isAvailable === b.isAvailable) return 0;
    return a.isAvailable ? -1 : 1;
  });

  const favoriteScenarios = SCENARIOS.filter((sc) => !!userFavorites[sc.id]);

  const scrollToSection = (id: string) => {
    if (id === 'survival-foundation') {
      setIsFoundationExpanded(true);
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
            <span>หลักสูตรภาษาจีนเอาตัวรอดสำหรับผู้ไม่มีพื้นฐาน 🇨🇳</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
            ภาษาจีนเอาตัวรอด <span className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 bg-clip-text text-transparent">ท่องเที่ยวจีน</span> สำหรับผู้เริ่มต้น
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            ไม่ต้องท่องศัพท์เยอะ! เน้นสถานการณ์จริงที่ต้องเจอในทริปตั้งแต่ <span className="text-indigo-700 font-bold">ปูพื้นฐานสั้นๆ 🔰</span> <span className="text-sky-700 font-bold">เดินทางขึ้นรถไฟฟ้า Metro/เรียกรถ 🚇</span> <span className="text-amber-700 font-bold">สั่งอาหาร/สแกน Alipay 🍜</span> ไปจนถึง <span className="text-emerald-700 font-bold">เช็คอินโรงแรม 🏨</span>
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8">
        {/* Sticky Filter & Section Jump Bar */}
        <div className="bg-white/90 backdrop-blur-md sticky top-16 z-30 p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
          {/* Quick jump to sections */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-xs font-semibold text-slate-700 max-w-full">
            <span className="text-slate-400 flex items-center gap-1 mr-1 shrink-0">
              <Layers className="w-4 h-4 text-slate-500" />
              หมวดการเรียนรู้:
            </span>

            {foundationCategory && (
              <button
                type="button"
                onClick={() => scrollToSection('survival-foundation')}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/90 transition flex items-center gap-1.5 whitespace-nowrap font-bold touch-manipulation select-none active:scale-95 min-h-[40px] cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>คอร์สปูพื้นฐาน ({foundationScenarios.length})</span>
              </button>
            )}

            {favoriteScenarios.length > 0 && (
              <button
                type="button"
                onClick={() => scrollToSection('favorites')}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition flex items-center gap-1.5 whitespace-nowrap font-bold touch-manipulation select-none active:scale-95 min-h-[40px] cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>บทเรียนที่ชอบ ({favoriteScenarios.length})</span>
              </button>
            )}

            {otherCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => scrollToSection(cat.id)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition flex items-center gap-1.5 whitespace-nowrap touch-manipulation select-none active:scale-95 min-h-[40px] cursor-pointer"
              >
                <span>{cat.title}</span>
              </button>
            ))}
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
            <span className="text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              ระดับความยาก:
            </span>

            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer touch-manipulation select-none active:scale-95 min-h-[40px] ${
                selectedLevel === 'all'
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด
            </button>

            <button
              type="button"
              onClick={() => setSelectedLevel('easy')}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer touch-manipulation select-none active:scale-95 min-h-[40px] ${
                selectedLevel === 'easy'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              🟢 ง่าย
            </button>

            <button
              type="button"
              onClick={() => setSelectedLevel('medium')}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer touch-manipulation select-none active:scale-95 min-h-[40px] ${
                selectedLevel === 'medium'
                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              🟡 ปานกลาง
            </button>
          </div>
        </div>

        {/* COLLAPSIBLE FOUNDATION COURSE SECTION */}
        {foundationCategory && (
          <section
            id="survival-foundation"
            className="scroll-mt-24 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-emerald-50/30 border border-indigo-200/90 p-4 sm:p-5 shadow-2xs space-y-4"
          >
            {/* Header with Toggle */}
            <button
              type="button"
              onClick={() => setIsFoundationExpanded(!isFoundationExpanded)}
              className="w-full flex items-center justify-between text-left cursor-pointer group touch-manipulation select-none active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-indigo-200 shadow-2xs text-indigo-600 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      🎓 {foundationCategory.title}
                    </h2>
                    <span className="text-xs font-serif font-semibold text-indigo-600 px-2 py-0.5 rounded-md bg-white border border-indigo-200 shadow-2xs">
                      {foundationCategory.titleZh}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {foundationScenarios.length} บทเรียน
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {foundationCategory.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-200 transition shadow-2xs whitespace-nowrap ml-2">
                <span>{isFoundationExpanded ? 'ย่อซ่อนบทเรียน' : 'ขยายดูบทเรียนปูพื้นฐาน'}</span>
                {isFoundationExpanded ? (
                  <ChevronUp className="w-4 h-4 text-indigo-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-indigo-600" />
                )}
              </div>
            </button>

            {/* Collapsed / Expanded Content */}
            {isFoundationExpanded && (
              <div className="pt-4 border-t border-indigo-200/60 space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {foundationScenarios
                    .filter((sc) => selectedLevel === 'all' || sc.level === selectedLevel)
                    .map((scenario) => (
                      <ScenarioCard key={scenario.id} scenario={scenario} />
                    ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* FAVORITES SECTION CONTAINER (IF ANY) */}
        {favoriteScenarios.length > 0 && (
          <section
            id="favorites"
            className="scroll-mt-24 rounded-3xl bg-gradient-to-b from-rose-50/80 via-rose-50/30 to-white border border-rose-200/90 p-5 sm:p-7 shadow-xs space-y-5"
          >
            {/* Panel Header */}
            <div className="flex flex-wrap items-end justify-between border-b border-rose-200/80 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white border border-rose-200 shadow-2xs text-rose-500">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900">บทเรียนที่ชอบของคุณ</h2>
                    <span className="text-xs font-serif font-semibold text-rose-600 px-2.5 py-0.5 rounded-md bg-white border border-rose-200 shadow-2xs">
                      收藏课程
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    บทเรียนที่คุณกดหัวใจบันทึกไว้ เพื่อการทบทวนได้อย่างรวดเร็วในทุกๆ วัน
                  </p>
                </div>
              </div>

              <div className="text-xs font-bold text-rose-700 bg-white px-3.5 py-1 rounded-full border border-rose-200 shadow-2xs">
                {favoriteScenarios.length} บทเรียน
              </div>
            </div>

            {/* Grid of favorited scenarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteScenarios
                .filter((sc) => selectedLevel === 'all' || sc.level === selectedLevel)
                .map((scenario) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} />
                ))}
            </div>
          </section>
        )}

        {/* RENDER OTHER ROADMAP CATEGORIES */}
        <div className="space-y-10">
          {otherCategories.map((cat) => {
            const categoryScenarios = SCENARIOS.filter((sc) => {
              const matchCategory = sc.categoryId === cat.id;
              if (!matchCategory) return false;
              if (selectedLevel === 'all') return true;
              return sc.level === selectedLevel;
            });

            if (categoryScenarios.length === 0) return null;

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
        </div>

        {/* Suggest Lesson Section Banner */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 text-white shadow-inner">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold">อยากได้บทเรียนสถานการณ์ไหนเพิ่มอีกไหม? 💡</h3>
              <p className="text-xs text-amber-100 mt-0.5">
                พิมพ์บอกทีมงานได้เลย! เราพร้อมสร้างบทเรียนสนทนาภาษาจีนสถานการณ์ใหม่ๆ ให้ตามคำขอของคุณ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSuggestOpen(true)}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-amber-700 font-extrabold text-xs shadow-lg transition cursor-pointer shrink-0 active:scale-95 touch-manipulation min-h-[44px] flex items-center gap-2"
          >
            <span>✉️ เสนอบทเรียนที่คุณต้องการ</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 华语Talk Master - คอร์สภาษาจีนเอาตัวรอดเที่ยวจีน สำหรับคนไทยผู้ไม่มีพื้นฐาน</p>
        </div>
      </footer>

      <SuggestLessonModal isOpen={isSuggestOpen} onClose={() => setIsSuggestOpen(false)} />
    </div>
  );
}
