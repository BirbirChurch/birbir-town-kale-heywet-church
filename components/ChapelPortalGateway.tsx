'use client';

import React from 'react';
import {
  Church,
  Users,
  Home,
  Droplets,
  HeartHandshake,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  Landmark,
  Compass,
} from 'lucide-react';
import { CHAPELS } from '../lib/churchData';
import { ChapelId, MemberRecord, Household } from '../lib/types';
import { Language, TRANSLATIONS } from '../lib/translations';

interface ChapelPortalGatewayProps {
  members: MemberRecord[];
  households: Household[];
  lang: Language;
  onEnterChapel: (chapelId: ChapelId, destination?: 'spiritual' | 'directory') => void;
}

export default function ChapelPortalGateway({
  members,
  households,
  lang,
  onEnterChapel,
}: ChapelPortalGatewayProps) {
  const t = TRANSLATIONS[lang];

  // Pre-calculate per-chapel metrics
  const chapelMetrics = React.useMemo(() => {
    const stats: Record<
      string,
      {
        totalMembers: number;
        totalHouseholds: number;
        baptized: number;
        lordSupper: number;
        tithe: number;
        spiritualScholars: number;
        ministers: number;
      }
    > = {};

    CHAPELS.forEach(c => {
      stats[c.id] = {
        totalMembers: 0,
        totalHouseholds: 0,
        baptized: 0,
        lordSupper: 0,
        tithe: 0,
        spiritualScholars: 0,
        ministers: 0,
      };
    });

    members.forEach(m => {
      const cId = m.chapel.toLowerCase() as ChapelId;
      const target = stats[cId] || stats['eliroi'];
      if (target) {
        target.totalMembers++;
        if (m.baptism.includes('የተጠመቀ') || m.baptism.toLowerCase().includes('baptized')) {
          target.baptized++;
        }
        if (m.lordSupper.includes('የሚካፈል') || m.lordSupper.toLowerCase().includes('part')) {
          target.lordSupper++;
        }
        if (m.tithe.includes('የሚከፍል') || m.tithe.toLowerCase().includes('give')) {
          target.tithe++;
        }
        if (m.spiritualEdu && m.spiritualEdu.trim() !== '') {
          target.spiritualScholars++;
        }
        if (m.responsibility && m.responsibility.trim() !== '' && m.responsibility !== 'አባል') {
          target.ministers++;
        }
      }
    });

    households.forEach(h => {
      const cId = h.chapel.toLowerCase() as ChapelId;
      const target = stats[cId] || stats['eliroi'];
      if (target) {
        target.totalHouseholds++;
      }
    });

    return stats;
  }, [members, households]);

  const specificChapels = CHAPELS.filter(c => c.id !== 'all');

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Grand Spiritual Gate Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-teal-800/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>
              {lang === 'am' ? 'ብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን - የቻፕሎች መግቢያ በር' : 'Birbir Town Kale Heywet Church - Chapel Portals'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            {lang === 'am'
              ? 'በየራሱ ቻፕል መግቢያ ይግቡ፤ በመንፈሳዊ ዘርፍ ይተዳደሩ'
              : 'Enter Through Each Chapel Portal, Managed Under Spiritual Ministries'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            {lang === 'am'
              ? 'እያንዳንዱ ቻፕል የራሱ መጋቢ፣ መንፈሳዊ ራዕይ፣ የአገልግሎት ዘርፎችና ማህበረሰብ አለው። ወደሚፈልጉት ቻፕል በቀጥታ መግቢያ በር ይግቡ፤ ወይም ማዕከላዊውን ጉባኤ ያስተዳድሩ።'
              : 'Each chapel is ordained with pastoral leadership, a distinct spiritual motto, sacramental life, and dedicated ministry sectors. Enter directly into your respective chapel portal below.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onEnterChapel('all', 'spiritual')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>{lang === 'am' ? 'የጠቅላላ ማዕከላዊ ጉባኤ መንፈሳዊ ዘርፍ' : 'Enter Central Assembly Council'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEnterChapel('all', 'directory')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>{lang === 'am' ? 'የሁሉም ቻፕሎች ጠቅላላ ቆጠራ' : 'All Chapels Census Directory'}</span>
            </button>
          </div>
        </div>

        {/* Aggregate Quick Summary */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
          <div className="bg-slate-800/40 rounded-xl p-3 backdrop-blur-xs border border-slate-700/40">
            <span className="block text-[11px] text-slate-400 font-medium">
              {lang === 'am' ? 'የተመዘገቡ ቻፕሎች' : 'Active Chapels'}
            </span>
            <span className="font-mono text-xl font-bold text-white">10</span>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 backdrop-blur-xs border border-slate-700/40">
            <span className="block text-[11px] text-slate-400 font-medium">
              {lang === 'am' ? 'ጠቅላላ ነፍሳት' : 'Total Souls'}
            </span>
            <span className="font-mono text-xl font-bold text-teal-300">
              {members.length.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 backdrop-blur-xs border border-slate-700/40">
            <span className="block text-[11px] text-slate-400 font-medium">
              {lang === 'am' ? 'ጠቅላላ ቤተሰቦች' : 'Total Families'}
            </span>
            <span className="font-mono text-xl font-bold text-emerald-300">
              {households.length.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 backdrop-blur-xs border border-slate-700/40">
            <span className="block text-[11px] text-slate-400 font-medium">
              {lang === 'am' ? 'የተጠመቁ' : 'Baptized'}
            </span>
            <span className="font-mono text-xl font-bold text-sky-300">
              {members.filter(m => m.baptism.includes('የተጠመቀ')).length}
            </span>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 backdrop-blur-xs border border-slate-700/40">
            <span className="block text-[11px] text-slate-400 font-medium">
              {lang === 'am' ? 'የጌታ እራት ተካፋይ' : 'Communion'}
            </span>
            <span className="font-mono text-xl font-bold text-purple-300">
              {members.filter(m => m.lordSupper.includes('የሚካፈል')).length}
            </span>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 backdrop-blur-xs border border-slate-700/40">
            <span className="block text-[11px] text-slate-400 font-medium">
              {lang === 'am' ? 'አስራት ከፋዮች' : 'Tithe Givers'}
            </span>
            <span className="font-mono text-xl font-bold text-amber-300">
              {members.filter(m => m.tithe.includes('የሚከፍል')).length}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of 10 Dedicated Chapel Portals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>{lang === 'am' ? 'የአስሩ ቻፕሎች መግቢያ በሮች' : 'The 10 Chapel Entrance Portals'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'am'
                ? 'የሚፈልጉትን ቻፕል መርጠው በመግባት የቻፕሉን መንፈሳዊ ዘርፍ፣ አገልጋዮችና አባላት ያስተዳድሩ'
                : 'Select your chapel portal to enter directly into its dedicated spiritual ministry and directory'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specificChapels.map(chapel => {
            const data = chapelMetrics[chapel.id] || {
              totalMembers: 0,
              totalHouseholds: 0,
              baptized: 0,
              lordSupper: 0,
              tithe: 0,
              spiritualScholars: 0,
              ministers: 0,
            };

            const displayName = lang === 'am' ? chapel.nameAmharic : chapel.nameEnglish;
            const motto = lang === 'am' ? chapel.mottoAmharic : chapel.mottoEnglish;

            return (
              <div
                key={chapel.id}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Decorative Top Accent Stripe */}
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: chapel.color }}
                />

                <div className="p-5 sm:p-6 space-y-4 flex-1">
                  {/* Top Chapel Badge & Spiritual Motto */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: chapel.color }}
                        />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {displayName}
                        </h3>
                      </div>
                      {chapel.scriptureVerse && (
                        <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 block mt-0.5">
                          {chapel.scriptureVerse}
                        </span>
                      )}
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 ${chapel.badgeClass}`}>
                      {chapel.id.toUpperCase()}
                    </span>
                  </div>

                  {/* Spiritual Motto / Meaning Quote */}
                  {motto && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>&ldquo;{motto}&rdquo;</span>
                    </div>
                  )}

                  {/* Pastoral Leader */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {lang === 'am' ? 'መጋቢ / መሪ፦' : 'Pastor / Leader:'}
                      </strong>{' '}
                      {chapel.leader || (lang === 'am' ? 'የቻፕል መሪ ቦርድ' : 'Chapel Board')}
                    </span>
                  </div>

                  {/* Chapel Key Spiritual Statistics */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {lang === 'am' ? 'ነፍሳት' : 'Souls'}
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {data.totalMembers}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {lang === 'am' ? 'ቤተሰቦች' : 'Families'}
                      </span>
                      <span className="font-mono text-sm font-bold text-teal-700 dark:text-teal-300">
                        {data.totalHouseholds}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {lang === 'am' ? 'የተጠመቁ' : 'Baptized'}
                      </span>
                      <span className="font-mono text-sm font-bold text-sky-700 dark:text-sky-300">
                        {data.baptized}
                      </span>
                    </div>
                  </div>

                  {/* Secondary Sacramental & Educational metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="block font-bold text-purple-600 dark:text-purple-400 font-mono">
                        {data.lordSupper}
                      </span>
                      <span className="text-[10px]">{lang === 'am' ? 'የጌታ እራት' : 'Supper'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="block font-bold text-amber-600 dark:text-amber-400 font-mono">
                        {data.tithe}
                      </span>
                      <span className="text-[10px]">{lang === 'am' ? 'አስራት' : 'Tithe'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="block font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {data.spiritualScholars}
                      </span>
                      <span className="text-[10px]">{lang === 'am' ? 'ምሩቃን' : 'Scholars'}</span>
                    </div>
                  </div>
                </div>

                {/* Entrance Action Footers */}
                <div className="p-4 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => onEnterChapel(chapel.id, 'spiritual')}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>{lang === 'am' ? `ወደ ${displayName} ግባ` : `Enter ${displayName}`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onEnterChapel(chapel.id, 'directory')}
                    title={lang === 'am' ? 'የአባላት ዝርዝር' : 'Member Directory'}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
