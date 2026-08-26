import React, { useMemo } from 'react';
import { cn } from '../lib/utils';

export function calculateReadabilityScore(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  
  const words = text.trim().split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  
  if (words === 0) return 0;
  const effectiveSentences = sentences === 0 ? 1 : sentences;
  
  // Approximation for syllables (vowels count)
  const syllableMatch = text.match(/[aeiouy]{1,2}/gi);
  const syllables = syllableMatch ? syllableMatch.length : Math.max(1, words);
  
  // Flesch Reading Ease Formula
  const score = 206.835 - 1.015 * (words / effectiveSentences) - 84.6 * (syllables / words);
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function ReadabilityRing({ text }: { text: string }) {
  const score = useMemo(() => calculateReadabilityScore(text || ''), [text]);

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "text-red-500";
  let label = "Hard";
  if (score >= 70) {
    colorClass = "text-emerald-500";
    label = "Easy";
  } else if (score >= 50) {
    colorClass = "text-amber-500";
    label = "Fair";
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="relative flex items-center justify-center">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-500 ease-out", colorClass)}
          />
        </svg>
        <div className="absolute flex items-center justify-center font-bold text-slate-800 dark:text-slate-200">
          {score}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Readability</h4>
        <p className="text-xs text-slate-500 mt-0.5">Score: {label}</p>
      </div>
    </div>
  );
}
