'use client';

import React from 'react';
import { CensusStats } from '../lib/types';
import { Language, TRANSLATIONS } from '../lib/translations';
import { Users, Home, Heart, Award, GraduationCap, Briefcase, TrendingUp } from 'lucide-react';

interface AnalyticsViewProps {
  stats: CensusStats;
  lang: Language;
}

export default function AnalyticsView({ stats, lang }: AnalyticsViewProps) {
  const t = TRANSLATIONS[lang];

  const avgFamilySize =
    stats.totalHouseholds > 0
      ? (stats.totalMembers / stats.totalHouseholds).toFixed(1)
      : '0';

  const malePercent =
    stats.totalMembers > 0
      ? Math.round((stats.males / stats.totalMembers) * 100)
      : 0;
  const femalePercent = 100 - malePercent;

  const totalHousing = stats.ownedHomes + stats.rentedHomes;
  const ownedPercent =
    totalHousing > 0 ? Math.round((stats.ownedHomes / totalHousing) * 100) : 0;
  const rentedPercent = 100 - ownedPercent;

  return (
    <div className="space-y-6">
      {/* 6 Core KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Members */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {t.totalMembers}
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {stats.totalMembers.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats.males}M · {stats.females}F
          </span>
        </div>

        {/* Total Households */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {t.totalHouseholds}
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-700 dark:text-teal-400">
            {stats.totalHouseholds.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            ~{avgFamilySize} {lang === 'am' ? 'በአንድ ቤት' : 'per family'}
          </span>
        </div>

        {/* Baptism */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {t.baptized}
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {stats.baptizedPercentage}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats.baptizedCount} {lang === 'am' ? 'የተጠመቁ' : 'baptized'}
          </span>
        </div>

        {/* Lord's Supper */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {t.lordSupper}
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {stats.lordSupperPercentage}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats.lordSupperCount} {lang === 'am' ? 'ተካፋዮች' : 'communion'}
          </span>
        </div>

        {/* Tithe */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {t.titheGivers}
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-600 dark:text-teal-300">
            {stats.tithePercentage}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats.titheCount} {lang === 'am' ? 'የሚከፍሉ' : 'faithful'}
          </span>
        </div>

        {/* Housing */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            {t.owned}
          </span>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {ownedPercent}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats.ownedHomes} {lang === 'am' ? 'የግል' : 'owned'} · {stats.rentedHomes} {lang === 'am' ? 'ክራይ' : 'rent'}
          </span>
        </div>
      </div>

      {/* Main Analysis Section: Demographics & Spiritual Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Gender & Age Demographics */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>{t.genderRatio}</span>
            <span className="text-xs text-slate-500 tabular-nums">
              {stats.totalMembers} {lang === 'am' ? 'አባላት' : 'total'}
            </span>
          </h3>

          {/* Gender Ratio Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="text-blue-700 dark:text-blue-400">
                {t.males}: {stats.males} ({malePercent}%)
              </span>
              <span className="text-purple-700 dark:text-purple-400">
                {t.females}: {stats.females} ({femalePercent}%)
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${malePercent}%` }}
                className="bg-blue-600 h-full transition-all"
                title={`Male: ${malePercent}%`}
              />
              <div
                style={{ width: `${femalePercent}%` }}
                className="bg-purple-600 h-full transition-all"
                title={`Female: ${femalePercent}%`}
              />
            </div>
          </div>

          {/* Age Brackets Pyramid */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
              {t.ageDistribution}
            </h4>
            <div className="space-y-3">
              {[
                { label: t.children, count: stats.childrenCount, color: 'bg-emerald-500' },
                { label: t.youth, count: stats.youthCount, color: 'bg-teal-500' },
                { label: t.adults, count: stats.adultCount, color: 'bg-blue-500' },
                { label: t.seniors, count: stats.elderlyCount, color: 'bg-amber-500' },
              ].map(item => {
                const pct =
                  stats.totalMembers > 0
                    ? Math.round((item.count / stats.totalMembers) * 100)
                    : 0;
                return (
                  <div key={item.label} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {item.label}
                      </span>
                      <span className="text-slate-500 font-mono tabular-nums">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Chapel Comparison */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            {t.chapelBreakdown}
          </h3>

          <div className="space-y-3">
            {stats.chapelBreakdown.map(chap => {
              const pct =
                stats.totalMembers > 0
                  ? Math.round((chap.count / stats.totalMembers) * 100)
                  : 0;

              return (
                <div key={chap.chapel} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {lang === 'am' ? chap.chapelAmharic : chap.chapel}
                    </span>
                    <div className="flex items-center gap-2 text-slate-500 font-mono tabular-nums">
                      <span>{chap.households} {lang === 'am' ? 'ቤተሰቦች' : 'families'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {chap.count} {lang === 'am' ? 'አባላት' : 'members'} ({pct}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 dark:bg-teal-400 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spiritual Leadership & Education Footnote */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              <span className="block font-medium text-slate-700 dark:text-slate-300">
                {lang === 'am' ? 'መንፈሳዊ ትምህርት ያላቸው' : 'Trained in Ministry'}
              </span>
              <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white text-base">
                {stats.withSpiritualEdu}
              </span>{' '}
              <span className="text-[11px] text-slate-400">
                (ቢቲሲፒ፣ ድፕሎማ፣ ኤማሆስ...)
              </span>
            </div>
            <div className="text-right">
              <span className="block font-medium text-slate-700 dark:text-slate-300">
                {lang === 'am' ? 'የአገልግሎት ኃላፊነት ያላቸው' : 'Active Church Servants'}
              </span>
              <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white text-base">
                {stats.leadershipCount}
              </span>{' '}
              <span className="text-[11px] text-slate-400">
                (መሪዎች፣ ኳይር፣ ዲያቆን...)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
