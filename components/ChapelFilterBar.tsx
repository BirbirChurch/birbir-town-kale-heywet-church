'use client';

import React from 'react';
import { CHAPELS } from '../lib/churchData';
import { ChapelId } from '../lib/types';
import { Language, TRANSLATIONS } from '../lib/translations';

interface ChapelFilterBarProps {
  selectedChapel: ChapelId;
  onSelectChapel: (id: ChapelId) => void;
  lang: Language;
  counts: Record<string, { members: number; households: number }>;
}

export default function ChapelFilterBar({
  selectedChapel,
  onSelectChapel,
  lang,
  counts,
}: ChapelFilterBarProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {CHAPELS.map(chapel => {
            const isSelected = selectedChapel === chapel.id;
            const chapData = counts[chapel.id] || { members: 0, households: 0 };
            const displayName = lang === 'am' ? chapel.nameAmharic : chapel.nameEnglish;

            return (
              <button
                key={chapel.id}
                onClick={() => onSelectChapel(chapel.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{displayName}</span>
                <span className="text-[11px] tabular-nums font-mono opacity-70">
                  ({chapData.members})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
