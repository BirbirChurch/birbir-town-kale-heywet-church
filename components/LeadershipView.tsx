'use client';

import React, { useState, useMemo } from 'react';
import { Award, BookOpen, Phone, Check, Copy, User, Search, ShieldCheck } from 'lucide-react';
import { MemberRecord } from '../lib/types';
import { Language, TRANSLATIONS } from '../lib/translations';

interface LeadershipViewProps {
  members: MemberRecord[];
  lang: Language;
  onSelectMember: (member: MemberRecord) => void;
}

export default function LeadershipView({
  members,
  lang,
  onSelectMember,
}: LeadershipViewProps) {
  const t = TRANSLATIONS[lang];
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Filter members with real leadership roles or spiritual education
  const leaders = useMemo(() => {
    return members.filter(m => {
      const resp = (m.responsibility || '').trim();
      const spEdu = (m.spiritualEdu || '').trim();
      const hasLeadership = resp && resp !== 'አባል';
      const hasSpiritualEdu = spEdu !== '';
      return hasLeadership || hasSpiritualEdu;
    });
  }, [members]);

  const categories = useMemo(() => {
    return [
      { id: 'all', labelAm: 'ሁሉም አገልጋዮች', labelEn: 'All Servants', count: leaders.length },
      {
        id: 'chapel_leader',
        labelAm: 'የቻፕል መሪዎች',
        labelEn: 'Chapel Leaders',
        match: (m: MemberRecord) => m.responsibility.includes('የቻፕል መሪ') || m.responsibility.includes('መሪ'),
      },
      {
        id: 'evangelist',
        labelAm: 'ወንጌላውያን',
        labelEn: 'Evangelists & Full-Time',
        match: (m: MemberRecord) =>
          m.responsibility.includes('ወንጌላዊ') ||
          m.responsibility.includes('የሙሉ ጊዜ') ||
          m.occupation.includes('Evangelist') ||
          m.occupation.includes('ወንጌላዊ'),
      },
      {
        id: 'choir',
        labelAm: 'ኳይርና ዘማሪዎች',
        labelEn: 'Choir & Worship',
        match: (m: MemberRecord) => m.responsibility.includes('ኳይር') || m.occupation.includes('ዘማሪ'),
      },
      {
        id: 'prayer',
        labelAm: 'የጸሎት አባቶች/እናቶች',
        labelEn: 'Prayer Ministry',
        match: (m: MemberRecord) => m.responsibility.includes('ጸሎት'),
      },
      {
        id: 'education',
        labelAm: 'የነገረ መለኮት ምሩቃን',
        labelEn: 'Theological Graduates',
        match: (m: MemberRecord) =>
          m.spiritualEdu.includes('ድፕሎማ') ||
          m.spiritualEdu.includes('ድግሪ') ||
          m.spiritualEdu.includes('ቢቲሲፒ') ||
          m.spiritualEdu.includes('ኤማሆስ'),
      },
    ];
  }, [leaders]);

  const filteredLeaders = useMemo(() => {
    return leaders.filter(m => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesResp = m.responsibility.toLowerCase().includes(q);
        const matchesEdu = m.spiritualEdu.toLowerCase().includes(q);
        const matchesChapel = m.chapel.toLowerCase().includes(q) || m.chapelAmharic.includes(q);
        if (!matchesName && !matchesResp && !matchesEdu && !matchesChapel) return false;
      }

      if (categoryFilter !== 'all') {
        const cat = categories.find(c => c.id === categoryFilter);
        if (cat?.match && !cat.match(m)) return false;
      }

      return true;
    });
  }, [leaders, search, categoryFilter, categories]);

  const handleCopyPhone = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Category Pills & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm transition-colors space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={
                lang === 'am'
                  ? 'በመሪ ስም፣ ኃላፊነት፣ መንፈሳዊ ትምህርት ወይም ቻፕል ፈልግ...'
                  : 'Search by servant name, ministry role, or theological training...'
              }
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums self-center">
            <strong className="text-slate-900 dark:text-white">{filteredLeaders.length}</strong>{' '}
            {lang === 'am' ? 'አገልጋዮች ተገኝተዋል' : 'servants found'}
          </span>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {categories.map(cat => {
            const isSelected = categoryFilter === cat.id;
            const label = lang === 'am' ? cat.labelAm : cat.labelEn;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Servants Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeaders.map(m => {
          return (
            <div
              key={m.id}
              onClick={() => onSelectMember(m)}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-teal-400 dark:hover:border-teal-600 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {m.name}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {lang === 'am' ? m.chapelAmharic : m.chapel}
                    </span>
                  </div>

                  {m.responsibility && m.responsibility !== 'አባል' ? (
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">
                      {m.responsibility}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">
                      {m.roleInFamily === 'Head' ? (lang === 'am' ? 'የቤተሰብ ራስ' : 'Head') : m.roleInFamily}
                    </span>
                  )}
                </div>

                <div className="py-3 space-y-2 text-xs">
                  {/* Occupation & Secular Education */}
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {lang === 'am' ? 'የሥራ ዘርፍ:' : 'Work:'}
                    </span>
                    <span>{m.occupation || '—'}</span>
                    {m.education && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{m.education}</span>
                      </>
                    )}
                  </div>

                  {/* Spiritual Education */}
                  {m.spiritualEdu && (
                    <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-medium">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span>{m.spiritualEdu}</span>
                    </div>
                  )}

                  {/* Spiritual Standing */}
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] pt-1">
                    <span>
                      {t.baptismStatus}:{' '}
                      <strong className={m.baptism === 'የተጠመቀ' ? 'text-emerald-600' : 'text-slate-400'}>
                        {m.baptism || '—'}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {t.lordSupperStatus}:{' '}
                      <strong className={m.lordSupper === 'የሚካፈል' ? 'text-blue-600' : 'text-slate-400'}>
                        {m.lordSupper || '—'}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {t.titheStatus}:{' '}
                      <strong className={m.tithe === 'የሚከፍል' ? 'text-teal-600' : 'text-slate-400'}>
                        {m.tithe || '—'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer: Phone */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {m.phoneNumber ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${m.phoneNumber}`}
                      onClick={e => e.stopPropagation()}
                      className="font-mono text-[11px] text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-medium flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{m.phoneNumber}</span>
                    </a>
                    <button
                      onClick={e => handleCopyPhone(e, m.phoneNumber)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    >
                      {copiedPhone === m.phoneNumber ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">
                    {lang === 'am' ? 'ስልክ አልተመዘገበም' : 'No phone listed'}
                  </span>
                )}

                <span className="text-xs text-teal-600 dark:text-teal-400 group-hover:underline font-medium">
                  {t.viewDetails} →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
