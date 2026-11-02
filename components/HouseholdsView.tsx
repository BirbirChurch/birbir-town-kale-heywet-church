'use client';

import React, { useState, useMemo } from 'react';
import { Home, Users, Phone, Check, Copy, ChevronRight, Search, Building2, User } from 'lucide-react';
import { Household, MemberRecord } from '../lib/types';
import { Language, TRANSLATIONS } from '../lib/translations';

interface HouseholdsViewProps {
  households: Household[];
  lang: Language;
  onSelectMember: (member: MemberRecord) => void;
}

export default function HouseholdsView({
  households,
  lang,
  onSelectMember,
}: HouseholdsViewProps) {
  const t = TRANSLATIONS[lang];

  const [search, setSearch] = useState('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [housingFilter, setHousingFilter] = useState<'all' | 'owned' | 'rented'>('all');

  const filteredHouseholds = useMemo(() => {
    return households.filter(h => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesHead = h.headName.toLowerCase().includes(q);
        const matchesSpouse = h.spouseName?.toLowerCase().includes(q);
        const matchesPhone = h.primaryPhone.includes(q);
        const matchesChapel = h.chapel.toLowerCase().includes(q) || h.chapelAmharic.includes(q);
        const matchesChild = h.children.some(c => c.name.toLowerCase().includes(q));
        if (!matchesHead && !matchesSpouse && !matchesPhone && !matchesChapel && !matchesChild) {
          return false;
        }
      }

      if (housingFilter === 'owned' && h.houseCondition !== 'የግል') return false;
      if (housingFilter === 'rented' && h.houseCondition !== 'ክራይ') return false;

      return true;
    });
  }, [households, search, housingFilter]);

  const handleCopyPhone = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Search & Housing Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm transition-colors flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={
              lang === 'am'
                ? 'በቤተሰብ ራስ፣ ባለቤት፣ ልጅ ስም ወይም ስልክ ፈልግ...'
                : 'Search by family head, spouse, children, or phone...'
            }
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setHousingFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                housingFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {lang === 'am' ? 'ሁሉም ቤቶች' : 'All Housing'}
            </button>
            <button
              onClick={() => setHousingFilter('owned')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                housingFilter === 'owned'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {lang === 'am' ? 'የግል ቤት' : 'Homeowners'}
            </button>
            <button
              onClick={() => setHousingFilter('rented')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                housingFilter === 'rented'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {lang === 'am' ? 'የኪራይ ቤት' : 'Tenants'}
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            <strong className="text-slate-900 dark:text-white">{filteredHouseholds.length}</strong>{' '}
            {lang === 'am' ? 'ቤተሰቦች' : 'households'}
          </span>
        </div>
      </div>

      {/* Household Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredHouseholds.map(hh => {
          return (
            <div
              key={hh.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-teal-400 dark:hover:border-teal-600 transition-all flex flex-col justify-between"
            >
              {/* Header: Family No, Chapel, Housing */}
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded text-[11px]">
                      #{hh.familyNo}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {lang === 'am' ? hh.chapelAmharic : hh.chapel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Home className="w-3 h-3 text-slate-400" />
                      <span>{hh.houseCondition || 'የግል'}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                      {hh.membersCount} {lang === 'am' ? 'አባላት' : 'members'}
                    </span>
                  </div>
                </div>

                {/* Head & Spouse Info */}
                <div className="py-3 space-y-2">
                  {/* Head */}
                  {hh.head && (
                    <div
                      onClick={() => onSelectMember(hh.head)}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-teal-600" />
                          <span className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                            {hh.head.name}
                          </span>
                        </div>
                        {hh.head.age !== null && (
                          <span className="text-xs text-slate-500 tabular-nums">
                            {hh.head.age} {lang === 'am' ? 'ዓመት' : 'yrs'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 pl-5">
                        <span>{hh.head.occupation || '—'}</span>
                        {hh.head.education && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{hh.head.education}</span>
                          </>
                        )}
                        {hh.head.responsibility && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-teal-700 dark:text-teal-400">
                              {hh.head.responsibility}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Spouse */}
                  {hh.spouse && (
                    <div
                      onClick={() => onSelectMember(hh.spouse!)}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-purple-600" />
                          <span className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                            {hh.spouse.name}
                          </span>
                        </div>
                        {hh.spouse.age !== null && (
                          <span className="text-xs text-slate-500 tabular-nums">
                            {hh.spouse.age} {lang === 'am' ? 'ዓመት' : 'yrs'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 pl-5">
                        <span>{hh.spouse.occupation || '—'}</span>
                        {hh.spouse.education && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{hh.spouse.education}</span>
                          </>
                        )}
                        {hh.spouse.responsibility && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-purple-700 dark:text-purple-400">
                              {hh.spouse.responsibility}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Children / Dependents */}
                {hh.children.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {lang === 'am' ? 'ልጆች / ጥገኞች' : 'Children'} ({hh.children.length})
                    </span>
                    <div className="space-y-1">
                      {hh.children.map(ch => (
                        <div
                          key={ch.id}
                          onClick={() => onSelectMember(ch)}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="hover:text-teal-600 dark:hover:text-teal-400 font-medium">
                              {ch.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            {ch.age !== null && (
                              <span className="tabular-nums font-mono">{ch.age} yrs</span>
                            )}
                            {ch.education && (
                              <span className="text-slate-400">({ch.education})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Phone & Quick Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {hh.primaryPhone ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${hh.primaryPhone}`}
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1 font-mono text-[11px] text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium"
                    >
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{hh.primaryPhone}</span>
                    </a>
                    <button
                      onClick={e => handleCopyPhone(e, hh.primaryPhone)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      title="Copy phone"
                    >
                      {copiedPhone === hh.primaryPhone ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">
                    {lang === 'am' ? 'ስልክ የለም' : 'No phone listed'}
                  </span>
                )}

                {hh.head && (
                  <button
                    onClick={() => onSelectMember(hh.head)}
                    className="flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline font-medium text-xs ml-auto"
                  >
                    <span>{t.viewDetails}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
