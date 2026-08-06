'use client';

import Link from 'next/link';
import { Scenario } from '@/lib/pinyinUtils';
import { Clock, MapPin, ChevronRight, MessageSquare, CupSoda, UtensilsCrossed, Compass, Car, Hotel, Soup, Utensils } from 'lucide-react';

interface ScenarioCardProps {
  scenario: Scenario;
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const getLevelBadge = (level: Scenario['level']) => {
    switch (level) {
      case 'easy':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'hard':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'CupSoda':
        return <CupSoda className="w-5 h-5 text-amber-400" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-rose-400" />;
      case 'Soup':
        return <Soup className="w-5 h-5 text-red-400" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5 text-sky-400" />;
      case 'Car':
        return <Car className="w-5 h-5 text-indigo-400" />;
      case 'Hotel':
        return <Hotel className="w-5 h-5 text-purple-400" />;
      default:
        return <Compass className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <Link
      href={`/session/${scenario.id}`}
      className="group relative rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/10 flex flex-col justify-between block"
    >
      <div>
        {/* Top bar with level badge & estimated time */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getLevelBadge(
              scenario.level
            )}`}
          >
            {scenario.levelTitle}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {scenario.estimatedMinutes} นาที
          </span>
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-3 my-2">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-110 transition-transform">
            {renderIcon(scenario.icon)}
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">
              {scenario.title}
            </h3>
            <p className="text-xs text-rose-400 font-serif font-medium">{scenario.titleZh}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
          {scenario.description}
        </p>
      </div>

      {/* Footer Info & Action Button */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          {scenario.location}
        </span>

        <span className="inline-flex items-center gap-1 font-semibold text-rose-400 group-hover:text-rose-300 group-hover:translate-x-1 transition">
          <span>เริ่มฝึกสนทนา</span>
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
