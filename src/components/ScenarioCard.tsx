'use client';

import Link from 'next/link';
import { Scenario } from '@/lib/pinyinUtils';
import { Clock, MapPin, ChevronRight, CupSoda, Compass, Car, Hotel, Soup, Utensils, User, CheckCircle2, Heart, ShoppingBag, GraduationCap, Calculator, CloudSun, LifeBuoy, TrainFront, Siren } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ScorePieChart } from './ScorePieChart';

interface ScenarioCardProps {
  scenario: Scenario;
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const { userProgress, userFavorites, toggleFavorite } = useAuth();
  const progress = userProgress[scenario.id];
  const isFavorited = !!userFavorites[scenario.id];
  const isFoundation = scenario.categoryId === 'survival-foundation' || scenario.categoryId === 'language-basics';

  const getLevelBadge = (level: Scenario['level']) => {
    switch (level) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hard':
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-indigo-600" />;
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-emerald-600" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
      case 'User':
        return <User className="w-5 h-5 text-indigo-600" />;
      case 'CupSoda':
        return <CupSoda className="w-5 h-5 text-amber-600" />;
      case 'CloudSun':
        return <CloudSun className="w-5 h-5 text-sky-600" />;
      case 'UtensilsCrossed':
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-rose-600" />;
      case 'Soup':
        return <Soup className="w-5 h-5 text-red-600" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5 text-sky-600" />;
      case 'Car':
        return <Car className="w-5 h-5 text-indigo-600" />;
      case 'TrainFront':
        return <TrainFront className="w-5 h-5 text-sky-600" />;
      case 'LifeBuoy':
        return <LifeBuoy className="w-5 h-5 text-rose-600" />;
      case 'Siren':
        return <Siren className="w-5 h-5 text-red-600" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-violet-600" />;
      case 'Hotel':
      case 'Building2':
        return <Hotel className="w-5 h-5 text-purple-600" />;
      default:
        return <Compass className="w-5 h-5 text-teal-600" />;
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(scenario.id);
  };

  return (
    <div
      className={`group relative rounded-2xl bg-white hover:bg-slate-50/90 border border-slate-200/80 hover:border-slate-300 p-5 transition-all duration-200 shadow-xs hover:shadow-xl flex flex-col justify-between ${
        isFoundation
          ? 'hover:border-indigo-300 hover:shadow-indigo-500/10'
          : scenario.categoryId === 'travel-transport'
          ? 'hover:border-sky-300 hover:shadow-sky-500/10'
          : scenario.categoryId === 'weather-climate'
          ? 'hover:border-sky-300 hover:shadow-sky-500/10'
          : scenario.categoryId === 'dining-shopping'
          ? 'hover:border-amber-300 hover:shadow-amber-500/10'
          : 'hover:border-emerald-300 hover:shadow-emerald-500/10'
      }`}
    >
      {/* Full-Card Semantic Link for instant touch/click navigation across all mobile devices */}
      <Link
        href={`/session/${scenario.id}`}
        className="absolute inset-0 z-0 rounded-2xl cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-rose-500"
        aria-label={`เริ่มบทเรียน ${scenario.title}`}
      />

      {/* Card Content - Inner elements with proper layering */}
      <div className="relative z-10 pointer-events-none flex flex-col justify-between h-full">
        <div>
          {/* Top bar with level badge & estimated time & favorite heart */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getLevelBadge(
                  scenario.level
                )}`}
              >
                {scenario.levelTitle}
              </span>

              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs flex items-center gap-1">
                <span>🧩 เรียงประโยค & จำศัพท์</span>
              </span>

              {progress && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>ผ่านแล้ว</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {scenario.estimatedMinutes} นาที
              </span>

              {/* Favorite toggle button with high z-index & isolated pointer events */}
              <button
                type="button"
                onClick={handleFavoriteToggle}
                className={`pointer-events-auto p-2 rounded-full transition-transform active:scale-75 hover:bg-rose-50 cursor-pointer relative z-20 touch-manipulation ${
                  isFavorited ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'
                }`}
                title={isFavorited ? 'ยกเลิกบทเรียนที่ชอบ' : 'บันทึกเป็นบทเรียนที่ชอบ'}
                aria-label={isFavorited ? 'ยกเลิกบทเรียนที่ชอบ' : 'บันทึกเป็นบทเรียนที่ชอบ'}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isFavorited ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Ghibli Scenario Scene Cover */}
          {scenario.image && (
            <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden mb-3 border border-slate-100/90 shadow-2xs group-hover:shadow-sm transition-all bg-slate-100">
              <img
                src={scenario.image}
                alt={scenario.imageAlt || scenario.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <span className="text-[10px] font-semibold text-white/95 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md border border-white/20 flex items-center gap-1 shadow-2xs">
                  <MapPin className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                  <span className="truncate max-w-[160px]">{scenario.location}</span>
                </span>
              </div>
            </div>
          )}

          {/* Icon, Title & Score Pie Chart */}
          <div className="flex items-start justify-between gap-3 my-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 group-hover:scale-105 transition-transform shrink-0">
                {renderIcon(scenario.icon)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition leading-snug">
                  {scenario.title}
                </h3>
                <p className="text-xs font-serif font-semibold text-rose-600">{scenario.titleZh}</p>
              </div>
            </div>

            {/* Mini Pie Chart for Score */}
            <div className="shrink-0">
              <ScorePieChart score={progress ? progress.bestScore : 0} />
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {scenario.description}
          </p>
        </div>

        {/* Footer Info & Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {scenario.location}
          </span>

          <span className="inline-flex items-center gap-1 font-bold text-rose-600 group-hover:text-rose-700 group-hover:translate-x-1 transition">
            <span>{progress ? 'ฝึกซ้อมอีกครั้ง' : 'เริ่มฝึกสนทนา'}</span>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
