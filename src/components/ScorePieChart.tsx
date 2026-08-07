'use client';

import React from 'react';

interface ScorePieChartProps {
  score: number; // 0 - 100
  size?: number; // width & height in px, default 42
  strokeWidth?: number; // stroke thickness, default 4
}

export function ScorePieChart({ score = 0, size = 44, strokeWidth = 4 }: ScorePieChartProps) {
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Determine color scheme based on score
  let strokeColor = '#94a3b8'; // slate-400 (0% / unstudied)
  let textColor = 'text-slate-400';
  let bgColor = 'bg-slate-50 border-slate-200';

  if (clampedScore >= 80) {
    strokeColor = '#10b981'; // emerald-500
    textColor = 'text-emerald-700';
    bgColor = 'bg-emerald-50/70 border-emerald-200';
  } else if (clampedScore >= 60) {
    strokeColor = '#f59e0b'; // amber-500
    textColor = 'text-amber-700';
    bgColor = 'bg-amber-50/70 border-amber-200';
  } else if (clampedScore > 0) {
    strokeColor = '#f43f5e'; // rose-500
    textColor = 'text-rose-700';
    bgColor = 'bg-rose-50/70 border-rose-200';
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl p-1.5 border transition-all ${bgColor}`}
      title={clampedScore > 0 ? `คะแนนสูงสุด: ${clampedScore}%` : 'ยังไม่ได้เริ่มเรียน'}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress circle arc */}
          {clampedScore > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Center Percentage Label */}
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <span className={`font-extrabold text-[10px] leading-none ${textColor}`}>
            {clampedScore > 0 ? `${clampedScore}%` : '0%'}
          </span>
        </div>
      </div>
    </div>
  );
}
