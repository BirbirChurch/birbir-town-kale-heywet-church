'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Music,
  Compass,
  HeartHandshake,
  Flame,
  Droplets,
  Coins,
  Search,
  CheckCircle2,
  Phone,
  Copy,
  Check,
  User,
  Users,
  Filter,
  PlusCircle,
  ExternalLink,
  Award,
  Layers,
  ArrowRight,
  Sparkles,
  BarChart2,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MemberRecord, Household, ChapelId } from '../lib/types';
import { Language, TRANSLATIONS } from '../lib/translations';
import { CHAPELS } from '../lib/churchData';
import SpiritualPlanView from './SpiritualPlanView';

interface SpiritualMinistryViewProps {
  members: MemberRecord[];
  allMembers?: MemberRecord[];
  households?: Household[];
  lang: Language;
  selectedChapel: ChapelId;
  onSelectMember: (member: MemberRecord) => void;
  onUpdateMember?: (updated: MemberRecord) => void;
  onSwitchChapel?: (chapelId: ChapelId) => void;
}

export type MinistrySectorId =
  | 'all'
  | 'pastoral_council'
  | 'theology_education'
  | 'worship_choir'
  | 'evangelism_mission'
  | 'diaconate_benevolence'
  | 'prayer_intercession'
  | 'sacraments'
  | 'stewardship_tithe';

export default function SpiritualMinistryView({
  members,
  allMembers = [],
  households = [],
  lang,
  selectedChapel,
  onSelectMember,
  onUpdateMember,
  onSwitchChapel,
}: SpiritualMinistryViewProps) {
  const t = TRANSLATIONS[lang];
  const [subTab, setSubTab] = useState<'roster' | 'plan'>('roster');
  const [activeSector, setActiveSector] = useState<MinistrySectorId>('all');
  const [search, setSearch] = useState('');
  const [educationFilter, setEducationFilter] = useState<string>('all');
  const [ageBracketFilter, setAgeBracketFilter] = useState<'all' | '0-14' | '15-29' | '30-59' | '60+' | 'unspecified'>('all');
  const [showAgeMatrixTable, setShowAgeMatrixTable] = useState<boolean>(true);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Quick edit modal state
  const [editingMember, setEditingMember] = useState<MemberRecord | null>(null);
  const [editResp, setEditResp] = useState('');
  const [editEdu, setEditEdu] = useState('');

  const currentChapelInfo = useMemo(() => {
    return CHAPELS.find(c => c.id === selectedChapel) || CHAPELS[0];
  }, [selectedChapel]);

  // Define the 8 Biblical Spiritual Sectors
  const sectors = useMemo(() => {
    return [
      {
        id: 'pastoral_council' as MinistrySectorId,
        titleAm: 'የአመራርና የሽማግሌዎች ጉባኤ',
        titleEn: 'Pastoral & Elders Council',
        scripture: '1ኛ ጢሞቴዎስ 3:1-7',
        icon: ShieldCheck,
        colorClass: 'text-indigo-600 dark:text-indigo-400',
        bgClass: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
        badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200',
        descAm: 'የመንፈሳዊ ራዕይ፣ የቃሉ አስተምህሮ እና የጉባኤው መጋቢዎችና የቻፕል መሪዎች ጉባኤ',
        descEn: 'Spiritual oversight, doctrinal guidance, pastors, and chapel elders.',
        match: (m: MemberRecord) => {
          const resp = (m.responsibility || '').toLowerCase();
          return (
            resp.includes('መሪ') ||
            resp.includes('የቻፕል መሪ') ||
            resp.includes('አመራር') ||
            resp.includes('ሽማግሌ') ||
            resp.includes('pastor') ||
            resp.includes('leader')
          );
        },
      },
      {
        id: 'theology_education' as MinistrySectorId,
        titleAm: 'የነገረ-መለኮትና የመንፈሳዊ ትምህርት ዘርፍ',
        titleEn: 'Theological & Discipleship Ministry',
        scripture: '2ኛ ጢሞቴዎስ 2:2',
        icon: BookOpen,
        colorClass: 'text-emerald-600 dark:text-emerald-400',
        bgClass: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
        descAm: 'የዲግሪ፣ ዲፕሎማ፣ ቢቲሲፒ (BTCP)፣ ኤማሆስ ምሩቃን እና የመጽሐፍ ቅዱስ አስተማሪዎች',
        descEn: 'Degree, Diploma, BTCP, and Emmaus bible scholars and teachers.',
        match: (m: MemberRecord) => {
          const edu = (m.spiritualEdu || '').toLowerCase();
          const resp = (m.responsibility || '').toLowerCase();
          return (
            edu.includes('ድግሪ') ||
            edu.includes('ድፕሎማ') ||
            edu.includes('ዲፕሎማ') ||
            edu.includes('ቢቲሲፒ') ||
            edu.includes('btcp') ||
            edu.includes('ኤማሆስ') ||
            edu.includes('emmaus') ||
            edu.includes('degree') ||
            edu.includes('diploma') ||
            resp.includes('መምህር') ||
            resp.includes('ትምህርት')
          );
        },
      },
      {
        id: 'worship_choir' as MinistrySectorId,
        titleAm: 'የአምልኮና ዝማሬ ዘርፍ',
        titleEn: 'Worship & Levites Choir Ministry',
        scripture: 'መዝሙር 150:1-6',
        icon: Music,
        colorClass: 'text-pink-600 dark:text-pink-400',
        bgClass: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800',
        badgeBg: 'bg-pink-100 text-pink-800 dark:bg-pink-900/60 dark:text-pink-200',
        descAm: 'የጉባኤው መዘምራን፣ የአምልኮ መሪዎች እና የዝማሬ አገልጋዮች',
        descEn: 'Choir members, worship leaders, musicians, and audio ministers.',
        match: (m: MemberRecord) => {
          const resp = (m.responsibility || '').toLowerCase();
          const occ = (m.occupation || '').toLowerCase();
          return resp.includes('ኳይር') || resp.includes('ዘማሪ') || occ.includes('ዘማሪ') || occ.includes('choir');
        },
      },
      {
        id: 'evangelism_mission' as MinistrySectorId,
        titleAm: 'የወንጌል ስርጭትና የተልዕኮ ዘርፍ',
        titleEn: 'Evangelism & Mission Outreach',
        scripture: 'ማቴዎስ 28:19-20',
        icon: Compass,
        colorClass: 'text-teal-600 dark:text-teal-400',
        bgClass: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
        badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200',
        descAm: 'ወንጌላውያን፣ የሙሉ ጊዜ ሠራተኞች፣ የነፍሳት አዳኞችና የአካባቢ ተልዕኮ አስተባባሪዎች',
        descEn: 'Evangelists, missionaries, full-time outreach workers, soul winners.',
        match: (m: MemberRecord) => {
          const resp = (m.responsibility || '').toLowerCase();
          const occ = (m.occupation || '').toLowerCase();
          return (
            resp.includes('ወንጌላዊ') ||
            resp.includes('ወንጌል') ||
            resp.includes('የሙሉ ጊዜ') ||
            occ.includes('evangelist') ||
            occ.includes('ወንጌላዊ')
          );
        },
      },
      {
        id: 'prayer_intercession' as MinistrySectorId,
        titleAm: 'የጸሎትና የምልጃ ዘርፍ',
        titleEn: 'Prayer & Intercession Ministry',
        scripture: '1ኛ ተሰሎንቄ 5:17',
        icon: Flame,
        colorClass: 'text-amber-600 dark:text-amber-400',
        bgClass: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
        descAm: 'የጸሎት አባቶችና እናቶች፣ በምልጃ ቅጥሩን የሚጠብቁ የጸሎት አርበኞች',
        descEn: 'Intercessors, prayer fathers and mothers, vigil prayer warriors.',
        match: (m: MemberRecord) => {
          const resp = (m.responsibility || '').toLowerCase();
          return resp.includes('ጸሎት') || resp.includes('ምልጃ');
        },
      },
      {
        id: 'diaconate_benevolence' as MinistrySectorId,
        titleAm: 'የዲያቆናትና የማህበራዊ አገልግሎት ዘርፍ',
        titleEn: 'Diaconate & Benevolence Service',
        scripture: 'የሐዋርያት ሥራ 6:3',
        icon: HeartHandshake,
        colorClass: 'text-cyan-600 dark:text-cyan-400',
        bgClass: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800',
        badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200',
        descAm: 'ዲያቆናት፣ እንግዳ ተቀባዮች፣ አረጋውያንና አቅመ-ደካሞችን የሚረዱ አገልጋዮች',
        descEn: 'Deacons, ushers, benevolence coordinators caring for widows and tenants.',
        match: (m: MemberRecord) => {
          const resp = (m.responsibility || '').toLowerCase();
          return resp.includes('ዲያቆን') || resp.includes('እንግዳ') || resp.includes('አስተናጋጅ');
        },
      },
      {
        id: 'sacraments' as MinistrySectorId,
        titleAm: 'የቅዱስ ቁርባንና የጥምቀት ኪዳን ዘርፍ',
        titleEn: 'Sacramental Covenant (Baptism & Supper)',
        scripture: '1ኛ ቆሮንቶስ 11:26',
        icon: Droplets,
        colorClass: 'text-sky-600 dark:text-sky-400',
        bgClass: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
        badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
        descAm: 'የተጠመቁና የጌታን እራት የሚካፈሉ የቃል ኪዳን አባላት ማህበር',
        descEn: 'Baptized disciples in covenant table communion with the Lord.',
        match: (m: MemberRecord) => {
          return m.baptism.includes('የተጠመቀ') && m.lordSupper.includes('የሚካፈል');
        },
      },
      {
        id: 'stewardship_tithe' as MinistrySectorId,
        titleAm: 'የአስራትና የበረከት ዘርፍ',
        titleEn: 'Tithe & Kingdom Stewardship',
        scripture: 'ሚልክያስ 3:10',
        icon: Coins,
        colorClass: 'text-emerald-600 dark:text-emerald-400',
        bgClass: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
        descAm: 'የጌታን ቤት ሥራ በታማኝነት በአስራትና በስጦታ የሚደግፉ ታማኝ አባላት',
        descEn: 'Faithful stewards sustaining the gospel through tithes and offerings.',
        match: (m: MemberRecord) => {
          return m.tithe.includes('የሚከፍል');
        },
      },
    ];
  }, []);

  // Compute live counts per sector
  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sectors.forEach(s => {
      counts[s.id] = members.filter(s.match).length;
    });
    return counts;
  }, [members, sectors]);

  // Compute age distribution matrix across all 10 chapels (0-14, 15-29, 30-59, 60+, unspecified)
  const chapelAgeMatrix = useMemo(() => {
    const sourceMembers = allMembers && allMembers.length > 0 ? allMembers : members;

    return CHAPELS.filter(c => c.id !== 'all').map(c => {
      const chapM = sourceMembers.filter(m => m.chapel.toLowerCase() === c.id.toLowerCase());

      let age0_14 = 0;
      let age15_29 = 0;
      let age30_59 = 0;
      let age60Plus = 0;
      let unspecified = 0;

      chapM.forEach(m => {
        if (m.age === null || isNaN(m.age)) {
          unspecified++;
        } else if (m.age <= 14) {
          age0_14++;
        } else if (m.age <= 29) {
          age15_29++;
        } else if (m.age <= 59) {
          age30_59++;
        } else {
          age60Plus++;
        }
      });

      return {
        id: c.id as ChapelId,
        nameAmharic: c.nameAmharic,
        nameEnglish: c.nameEnglish,
        color: c.color,
        total: chapM.length,
        age0_14,
        age15_29,
        age30_59,
        age60Plus,
        unspecified,
      };
    });
  }, [allMembers, members]);

  // Compute grand totals across all chapels for the age matrix
  const grandAgeTotals = useMemo(() => {
    return chapelAgeMatrix.reduce(
      (acc, row) => ({
        total: acc.total + row.total,
        age0_14: acc.age0_14 + row.age0_14,
        age15_29: acc.age15_29 + row.age15_29,
        age30_59: acc.age30_59 + row.age30_59,
        age60Plus: acc.age60Plus + row.age60Plus,
        unspecified: acc.unspecified + row.unspecified,
      }),
      { total: 0, age0_14: 0, age15_29: 0, age30_59: 0, age60Plus: 0, unspecified: 0 }
    );
  }, [chapelAgeMatrix]);

  // Compute active chapel age stats
  const activeChapelAgeStats = useMemo(() => {
    let age0_14 = 0;
    let age15_29 = 0;
    let age30_59 = 0;
    let age60Plus = 0;
    let unspecified = 0;

    members.forEach(m => {
      if (m.age === null || isNaN(m.age)) {
        unspecified++;
      } else if (m.age <= 14) {
        age0_14++;
      } else if (m.age <= 29) {
        age15_29++;
      } else if (m.age <= 59) {
        age30_59++;
      } else {
        age60Plus++;
      }
    });

    return {
      total: members.length,
      age0_14,
      age15_29,
      age30_59,
      age60Plus,
      unspecified,
    };
  }, [members]);

  // Filter members based on activeSector, search, education, ageBracketFilter
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // Sector filter
      if (activeSector !== 'all') {
        const targetSector = sectors.find(s => s.id === activeSector);
        if (targetSector && !targetSector.match(m)) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesResp = m.responsibility.toLowerCase().includes(q);
        const matchesEdu = m.spiritualEdu.toLowerCase().includes(q);
        const matchesChapel = m.chapel.toLowerCase().includes(q) || m.chapelAmharic.includes(q);
        const matchesPhone = (m.phoneNumber || '').includes(q);
        if (!matchesName && !matchesResp && !matchesEdu && !matchesChapel && !matchesPhone) {
          return false;
        }
      }

      // Education filter
      if (educationFilter !== 'all') {
        const spEdu = (m.spiritualEdu || '').toLowerCase();
        if (educationFilter === 'degree' && !spEdu.includes('ድግሪ') && !spEdu.includes('degree')) return false;
        if (educationFilter === 'diploma' && !spEdu.includes('ድፕሎማ') && !spEdu.includes('ዲፕሎማ') && !spEdu.includes('diploma')) return false;
        if (educationFilter === 'btcp' && !spEdu.includes('ቢቲሲፒ') && !spEdu.includes('btcp')) return false;
        if (educationFilter === 'emmaus' && !spEdu.includes('ኤማሆስ') && !spEdu.includes('emmaus')) return false;
      }

      // Age bracket filter
      if (ageBracketFilter !== 'all') {
        if (ageBracketFilter === 'unspecified' && m.age !== null) return false;
        if (ageBracketFilter === '0-14' && (m.age === null || m.age < 0 || m.age > 14)) return false;
        if (ageBracketFilter === '15-29' && (m.age === null || m.age < 15 || m.age > 29)) return false;
        if (ageBracketFilter === '30-59' && (m.age === null || m.age < 30 || m.age > 59)) return false;
        if (ageBracketFilter === '60+' && (m.age === null || m.age < 60)) return false;
      }

      return true;
    });
  }, [members, activeSector, sectors, search, educationFilter, ageBracketFilter]);

  const handleCopyPhone = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleOpenEdit = (e: React.MouseEvent, m: MemberRecord) => {
    e.stopPropagation();
    setEditingMember(m);
    setEditResp(m.responsibility || '');
    setEditEdu(m.spiritualEdu || '');
  };

  const handleSaveEdit = () => {
    if (!editingMember || !onUpdateMember) return;
    const updated: MemberRecord = {
      ...editingMember,
      responsibility: editResp.trim() || 'አባል',
      spiritualEdu: editEdu.trim(),
    };
    onUpdateMember(updated);
    setEditingMember(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Chapel Context Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white shadow-lg border border-teal-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-3.5 h-3.5 rounded-full inline-block"
              style={{ backgroundColor: currentChapelInfo.color }}
            />
            <span className="text-xs font-semibold tracking-wide uppercase text-teal-300">
              {lang === 'am' ? 'የመንፈሳዊ ዘርፍ አስተዳደር' : 'Spiritual Sector Governance'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-mono text-slate-300">
              {lang === 'am' ? currentChapelInfo.nameAmharic : currentChapelInfo.nameEnglish}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {lang === 'am'
              ? `${currentChapelInfo.nameAmharic} - መንፈሳዊ አገልግሎት ዘርፎች`
              : `${currentChapelInfo.nameEnglish} - Spiritual Ministries`}
          </h1>

          {currentChapelInfo.mottoAmharic && (
            <p className="text-sm text-teal-100/90 mt-1 italic">
              &ldquo;{lang === 'am' ? currentChapelInfo.mottoAmharic : currentChapelInfo.mottoEnglish}&rdquo;
              {currentChapelInfo.scriptureVerse && (
                <span className="font-mono text-xs text-teal-300 ml-2">
                  ({currentChapelInfo.scriptureVerse})
                </span>
              )}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span>
              <strong>{lang === 'am' ? 'የቻፕል መሪ፦' : 'Chapel Leader:'}</strong>{' '}
              {currentChapelInfo.leader || (lang === 'am' ? 'የጋራ አመራር ቦርድ' : 'Leadership Board')}
            </span>
            <span>·</span>
            <span>
              <strong>{lang === 'am' ? 'የተመዘገቡ አባላት፦' : 'Congregation:'}</strong>{' '}
              {members.length} {lang === 'am' ? 'ነፍሳት' : 'souls'}
            </span>
          </div>
        </div>

        {/* Chapel Switcher Pills */}
        {onSwitchChapel && (
          <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium">
              {lang === 'am' ? 'ወደ ሌላ ቻፕል ግባ፦' : 'Switch Portal:'}
            </span>
            <select
              value={selectedChapel}
              onChange={e => onSwitchChapel(e.target.value as ChapelId)}
              className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              {CHAPELS.map(c => (
                <option key={c.id} value={c.id}>
                  {lang === 'am' ? c.nameAmharic : c.nameEnglish}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sub Tab Switcher: Roster vs Strategic Plan */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setSubTab('roster')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'roster'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{lang === 'am' ? 'የአገልግሎት ዘርፎችና አባላት' : 'Ministry Sectors & Roster'}</span>
        </button>
        <button
          onClick={() => setSubTab('plan')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            subTab === 'plan'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{lang === 'am' ? 'የ2019 ዓ.ም የመንፈሳዊ ዘርፍ ዕቅድ' : '2019 Spiritual Strategic Plan'}</span>
        </button>
      </div>

      {subTab === 'plan' ? (
        <SpiritualPlanView
          members={members}
          households={households}
          lang={lang}
          selectedChapel={selectedChapel}
          onSelectChapel={onSwitchChapel || (() => {})}
        />
      ) : (
        <>
          {/* 1. Age Group Demographics Banner & Interactive Cards */}
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-900/5 to-teal-500/10 dark:from-slate-900 dark:to-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    {lang === 'am'
                      ? 'የቻፕሎች የዕድሜ ክልል እስታትስቲክስ (0-14፣ 15-29፣ 30-59፣ 60+)'
                      : 'Chapel Age Group Demographics (0-14, 15-29, 30-59, 60+)'}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'am'
                    ? `${selectedChapel === 'all' ? 'በሁሉም ቻፕሎች' : currentChapelInfo.nameAmharic} ውስጥ ያሉ አባላት በዕድሜ ክልል የተከፋፈሉበት ስታቲስቲክስ`
                    : `Age bracket distribution for ${selectedChapel === 'all' ? 'All Chapels' : currentChapelInfo.nameEnglish}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAgeMatrixTable(!showAgeMatrixTable)}
                  className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>
                    {showAgeMatrixTable
                      ? (lang === 'am' ? 'የ10ሩ ቻፕሎች ሰንጠረዥ ደብቅ' : 'Hide 10-Chapel Matrix')
                      : (lang === 'am' ? 'የ10ሩ ቻፕሎች ሰንጠረዥ አሳይ' : 'Show 10-Chapel Matrix')}
                  </span>
                  {showAgeMatrixTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Interactive Age Group Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Card 1: 0 - 14 yrs */}
              <div
                onClick={() => setAgeBracketFilter(ageBracketFilter === '0-14' ? 'all' : '0-14')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  ageBracketFilter === '0-14'
                    ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
                    <span className="text-xs font-extrabold uppercase">{lang === 'am' ? 'ህፃናት' : 'Children'}</span>
                    <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-200">
                      0 - 14
                    </span>
                  </div>
                  <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {activeChapelAgeStats.age0_14}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>
                    {activeChapelAgeStats.total > 0
                      ? Math.round((activeChapelAgeStats.age0_14 / activeChapelAgeStats.total) * 100)
                      : 0}% {lang === 'am' ? 'የጉባኤው' : 'of flock'}
                  </span>
                  <span className="text-amber-600 font-bold">
                    {ageBracketFilter === '0-14' ? (lang === 'am' ? 'ተመርጧል' : 'Active') : (lang === 'am' ? 'ለይ' : 'Filter')}
                  </span>
                </div>
              </div>

              {/* Card 2: 15 - 29 yrs */}
              <div
                onClick={() => setAgeBracketFilter(ageBracketFilter === '15-29' ? 'all' : '15-29')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  ageBracketFilter === '15-29'
                    ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
                    <span className="text-xs font-extrabold uppercase">{lang === 'am' ? 'ወጣቶች' : 'Youth'}</span>
                    <span className="text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded text-indigo-800 dark:text-indigo-200">
                      15 - 29
                    </span>
                  </div>
                  <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {activeChapelAgeStats.age15_29}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>
                    {activeChapelAgeStats.total > 0
                      ? Math.round((activeChapelAgeStats.age15_29 / activeChapelAgeStats.total) * 100)
                      : 0}% {lang === 'am' ? 'የጉባኤው' : 'of flock'}
                  </span>
                  <span className="text-indigo-600 font-bold">
                    {ageBracketFilter === '15-29' ? (lang === 'am' ? 'ተመርጧል' : 'Active') : (lang === 'am' ? 'ለይ' : 'Filter')}
                  </span>
                </div>
              </div>

              {/* Card 3: 30 - 59 yrs */}
              <div
                onClick={() => setAgeBracketFilter(ageBracketFilter === '30-59' ? 'all' : '30-59')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  ageBracketFilter === '30-59'
                    ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
                    <span className="text-xs font-extrabold uppercase">{lang === 'am' ? 'ጎልማሶች' : 'Adults'}</span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-800 dark:text-emerald-200">
                      30 - 59
                    </span>
                  </div>
                  <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {activeChapelAgeStats.age30_59}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>
                    {activeChapelAgeStats.total > 0
                      ? Math.round((activeChapelAgeStats.age30_59 / activeChapelAgeStats.total) * 100)
                      : 0}% {lang === 'am' ? 'የጉባኤው' : 'of flock'}
                  </span>
                  <span className="text-emerald-600 font-bold">
                    {ageBracketFilter === '30-59' ? (lang === 'am' ? 'ተመርጧል' : 'Active') : (lang === 'am' ? 'ለይ' : 'Filter')}
                  </span>
                </div>
              </div>

              {/* Card 4: 60+ yrs */}
              <div
                onClick={() => setAgeBracketFilter(ageBracketFilter === '60+' ? 'all' : '60+')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  ageBracketFilter === '60+'
                    ? 'ring-2 ring-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
                    <span className="text-xs font-extrabold uppercase">{lang === 'am' ? 'አረጋውያን' : 'Seniors'}</span>
                    <span className="text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 rounded text-rose-800 dark:text-rose-200">
                      60+
                    </span>
                  </div>
                  <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {activeChapelAgeStats.age60Plus}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>
                    {activeChapelAgeStats.total > 0
                      ? Math.round((activeChapelAgeStats.age60Plus / activeChapelAgeStats.total) * 100)
                      : 0}% {lang === 'am' ? 'የጉባኤው' : 'of flock'}
                  </span>
                  <span className="text-rose-600 font-bold">
                    {ageBracketFilter === '60+' ? (lang === 'am' ? 'ተመርጧል' : 'Active') : (lang === 'am' ? 'ለይ' : 'Filter')}
                  </span>
                </div>
              </div>

              {/* Card 5: Unspecified */}
              <div
                onClick={() => setAgeBracketFilter(ageBracketFilter === 'unspecified' ? 'all' : 'unspecified')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  ageBracketFilter === 'unspecified'
                    ? 'ring-2 ring-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-400 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-xs font-extrabold uppercase">{lang === 'am' ? 'ያልተጠቀሰ' : 'Unspecified'}</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      N/A
                    </span>
                  </div>
                  <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {activeChapelAgeStats.unspecified}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>
                    {activeChapelAgeStats.total > 0
                      ? Math.round((activeChapelAgeStats.unspecified / activeChapelAgeStats.total) * 100)
                      : 0}% {lang === 'am' ? 'የጉባኤው' : 'of flock'}
                  </span>
                  <span className="text-slate-600 font-bold">
                    {ageBracketFilter === 'unspecified' ? (lang === 'am' ? 'ተመርጧል' : 'Active') : (lang === 'am' ? 'ለይ' : 'Filter')}
                  </span>
                </div>
              </div>
            </div>

            {/* 10-Chapel Side-by-Side Comparison Table */}
            {showAgeMatrixTable && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{lang === 'am' ? 'የ10ሩ ቻፕሎች የዕድሜ ክልል ዝርዝር እስታትስቲክስ ማጠቃለያ' : '10-Chapel Age Bracket Demographics Breakdown Table'}</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {lang === 'am' ? 'ማንኛውንም ቻፕል በመንካት ቀጥታ ወደ ቻፕሉ መግባት ይችላሉ' : 'Click any chapel row to filter to that chapel'}
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-4">{lang === 'am' ? 'የቻፕሉ ስም (Chapel)' : 'Chapel Name'}</th>
                        <th className="py-2.5 px-3 text-center bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200">
                          0 - 14 {lang === 'am' ? 'ዓመት (ህፃናት)' : 'yrs'}
                        </th>
                        <th className="py-2.5 px-3 text-center bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200">
                          15 - 29 {lang === 'am' ? 'ዓመት (ወጣቶች)' : 'yrs'}
                        </th>
                        <th className="py-2.5 px-3 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200">
                          30 - 59 {lang === 'am' ? 'ዓመት (ጎልማሶች)' : 'yrs'}
                        </th>
                        <th className="py-2.5 px-3 text-center bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200">
                          60+ {lang === 'am' ? 'ዓመት (አረጋውያን)' : 'yrs'}
                        </th>
                        <th className="py-2.5 px-3 text-center text-slate-500">
                          {lang === 'am' ? 'ያልተጠቀሰ' : 'Unspecified'}
                        </th>
                        <th className="py-2.5 px-4 text-center font-extrabold text-slate-900 dark:text-white">
                          {lang === 'am' ? 'ጠቅላላ ድምር' : 'Total'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {chapelAgeMatrix.map((row, idx) => {
                        const isCurrent = selectedChapel === row.id;

                        return (
                          <tr
                            key={row.id}
                            onClick={() => onSwitchChapel && onSwitchChapel(row.id)}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                              isCurrent ? 'bg-amber-50/40 dark:bg-amber-950/20 font-semibold' : ''
                            }`}
                          >
                            <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="py-2 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: row.color }}
                              />
                              <span>{lang === 'am' ? row.nameAmharic : row.nameEnglish}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 px-1.5 py-0.2 rounded">
                                  {lang === 'am' ? 'የተመረጠ' : 'Active'}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-amber-800 dark:text-amber-300 font-bold bg-amber-50/30 dark:bg-amber-950/10">
                              {row.age0_14}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-indigo-800 dark:text-indigo-300 font-bold bg-indigo-50/30 dark:bg-indigo-950/10">
                              {row.age15_29}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50/30 dark:bg-emerald-950/10">
                              {row.age30_59}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-rose-800 dark:text-rose-300 font-bold bg-rose-50/30 dark:bg-rose-950/10">
                              {row.age60Plus}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-slate-400">
                              {row.unspecified}
                            </td>
                            <td className="py-2 px-4 text-center font-mono font-extrabold text-slate-900 dark:text-white">
                              {row.total}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                      <tr>
                        <td colSpan={2} className="py-2.5 px-4 text-right">
                          {lang === 'am' ? 'የሁሉንም ቻፕሎች ጠቅላላ ድምር (Grand Total)፦' : 'Grand Total across all Chapels:'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-amber-700 dark:text-amber-300 text-sm">
                          {grandAgeTotals.age0_14}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-indigo-700 dark:text-indigo-300 text-sm">
                          {grandAgeTotals.age15_29}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-emerald-700 dark:text-emerald-300 text-sm">
                          {grandAgeTotals.age30_59}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-rose-700 dark:text-rose-300 text-sm">
                          {grandAgeTotals.age60Plus}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                          {grandAgeTotals.unspecified}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono text-teal-700 dark:text-teal-400 text-sm">
                          {grandAgeTotals.total}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* 2. The 8 Spiritual Sectors Grid Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>{lang === 'am' ? 'መንፈሳዊ ዘርፎች (8 Ministries)' : 'Spiritual Ministry Sectors'}</span>
                </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'am'
                ? 'በእያንዳንዱ ዘርፍ የተሰማሩ አገልጋዮችና ምእመናንን ለማየት ዘርፉን ይምረጡ'
                : 'Click any sector card to filter the church roster by that spiritual ministry'}
            </p>
          </div>

          <button
            onClick={() => setActiveSector('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSector === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {lang === 'am' ? 'ሁሉንም አሳይ' : 'Show All'} ({members.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sectors.map(sec => {
            const Icon = sec.icon;
            const count = sectorCounts[sec.id] || 0;
            const isSelected = activeSector === sec.id;
            const percentage = members.length > 0 ? Math.round((count / members.length) * 100) : 0;

            return (
              <div
                key={sec.id}
                onClick={() => setActiveSector(isSelected ? 'all' : sec.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-teal-500 dark:ring-teal-400 shadow-md bg-teal-50/50 dark:bg-teal-950/30 border-teal-400 dark:border-teal-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className={`p-2 rounded-lg ${sec.bgClass}`}>
                      <Icon className={`w-5 h-5 ${sec.colorClass}`} />
                    </div>
                    <span className="font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                      {count}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                    {lang === 'am' ? sec.titleAm : sec.titleEn}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 block mb-2">
                    {sec.scripture}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                    {lang === 'am' ? sec.descAm : sec.descEn}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{percentage}% {lang === 'am' ? 'የጉባኤው' : 'of flock'}</span>
                  <span className="text-teal-600 dark:text-teal-400 font-semibold">
                    {isSelected ? (lang === 'am' ? 'ተመርጧል' : 'Active') : (lang === 'am' ? 'ዝርዝር እይ' : 'View')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar for Roster */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'am' ? 'በአገልጋይ ስም፣ ኃላፊነት፣ ስልክ ወይም መንፈሳዊ ትምህርት ፈልግ...' : 'Search servant by name, ministry role, phone, or theological training...'}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-slate-500 shrink-0 font-medium">
              {lang === 'am' ? 'የዕድሜ ክልል፦' : 'Age Bracket:'}
            </span>
            <select
              value={ageBracketFilter}
              onChange={e => setAgeBracketFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">{lang === 'am' ? 'ሁሉም ዕድሜዎች' : 'All Ages'}</option>
              <option value="0-14">{lang === 'am' ? 'ከ0 - 14 ዓመት (ህፃናት)' : '0 - 14 yrs'}</option>
              <option value="15-29">{lang === 'am' ? 'ከ15 - 29 ዓመት (ወጣቶች)' : '15 - 29 yrs'}</option>
              <option value="30-59">{lang === 'am' ? 'ከ30 - 59 ዓመት (ጎልማሶች)' : '30 - 59 yrs'}</option>
              <option value="60+">{lang === 'am' ? 'ከ60 ዓመት በላይ (አረጋውያን)' : '60+ yrs'}</option>
              <option value="unspecified">{lang === 'am' ? 'ዕድሜ ያልተጠቀሰ' : 'Unspecified'}</option>
            </select>

            <span className="text-xs text-slate-500 shrink-0 font-medium">
              {lang === 'am' ? 'መንፈሳዊ ትምህርት፦' : 'Spiritual Edu:'}
            </span>
            <select
              value={educationFilter}
              onChange={e => setEducationFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">{lang === 'am' ? 'ሁሉም ደረጃዎች' : 'All Levels'}</option>
              <option value="degree">{lang === 'am' ? 'ድግሪ (Degree)' : 'Degree'}</option>
              <option value="diploma">{lang === 'am' ? 'ዲፕሎማ (Diploma)' : 'Diploma'}</option>
              <option value="btcp">ቢቲሲፒ (BTCP)</option>
              <option value="emmaus">ኤማሆስ (Emmaus)</option>
            </select>

            {(search || educationFilter !== 'all' || ageBracketFilter !== 'all' || activeSector !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setEducationFilter('all');
                  setAgeBracketFilter('all');
                  setActiveSector('all');
                }}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors shrink-0"
              >
                {lang === 'am' ? 'ማጣሪያውን አጥራ' : 'Reset'}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>
            {lang === 'am'
              ? `የተገኙ አባላት/አገልጋዮች፦ ${filteredMembers.length} ነፍሳት`
              : `Showing ${filteredMembers.length} servants and members`}
          </span>
          {activeSector !== 'all' && (
            <span className="font-medium text-teal-600 dark:text-teal-400">
              {lang === 'am'
                ? `ዘርፍ፦ ${sectors.find(s => s.id === activeSector)?.titleAm}`
                : `Sector: ${sectors.find(s => s.id === activeSector)?.titleEn}`}
            </span>
          )}
        </div>
      </div>

      {/* Servants and Spiritual Members Roster */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {lang === 'am' ? 'ምንም አገልጋይ ወይም አባል አልተገኘም' : 'No records match this spiritual filter'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {lang === 'am'
              ? 'ፍለጋዎን ያጥሩ ወይም የዘርፍ ማጣሪያውን በመቀየር እንደገና ይሞክሩ።'
              : 'Try clearing your search query or selecting a different spiritual ministry.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(m => {
            const hasMinistryRole = m.responsibility && m.responsibility.trim() !== '' && m.responsibility !== 'አባል';
            const hasSpEdu = m.spiritualEdu && m.spiritualEdu.trim() !== '';

            return (
              <div
                key={m.id}
                onClick={() => onSelectMember(m)}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 font-bold text-xs">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white hover:text-teal-600 transition-colors">
                          {m.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 block">
                          {m.roleInFamily === 'Head' ? (lang === 'am' ? 'የቤተሰብ ራስ' : 'Head') : m.roleInFamily} · {m.age ? `${m.age} ${lang === 'am' ? 'ዓመት' : 'yrs'}` : ''}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                      {m.chapelAmharic || m.chapel}
                    </span>
                  </div>

                  {/* Spiritual Responsibility Badge */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lang === 'am' ? 'አገልግሎት፦' : 'Ministry:'}
                      </span>
                      <span
                        className={`font-semibold text-xs px-2 py-0.5 rounded-md ${
                          hasMinistryRole
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {m.responsibility || (lang === 'am' ? 'አባል' : 'Member')}
                      </span>
                    </div>

                    {/* Spiritual Education */}
                    {hasSpEdu && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {lang === 'am' ? 'መንፈሳዊ ትምህርት፦' : 'Spiritual Edu:'}
                        </span>
                        <span className="font-semibold text-[11px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                          {m.spiritualEdu}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sacramental Indicators */}
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap text-[10px]">
                    <span
                      className={`px-1.5 py-0.5 rounded font-medium ${
                        m.baptism.includes('የተጠመቀ')
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {lang === 'am' ? 'ጥምቀት' : 'Baptism'}: {m.baptism.includes('የተጠመቀ') ? '✓' : '✗'}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-medium ${
                        m.lordSupper.includes('የሚካፈል')
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {lang === 'am' ? 'እራት' : 'Supper'}: {m.lordSupper.includes('የሚካፈል') ? '✓' : '✗'}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-medium ${
                        m.tithe.includes('የሚከፍል')
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {lang === 'am' ? 'አስራት' : 'Tithe'}: {m.tithe.includes('የሚከፍል') ? '✓' : '✗'}
                    </span>
                  </div>
                </div>

                {/* Footer with phone & quick edit */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  {m.phoneNumber ? (
                    <button
                      onClick={e => handleCopyPhone(e, m.phoneNumber)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors cursor-pointer"
                      title="Copy phone"
                    >
                      {copiedPhone === m.phoneNumber ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                            {lang === 'am' ? 'ተቀድቷል' : 'Copied'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className="font-mono">{m.phoneNumber}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      {lang === 'am' ? 'ስልክ የለም' : 'No phone'}
                    </span>
                  )}

                  {onUpdateMember && (
                    <button
                      onClick={e => handleOpenEdit(e, m)}
                      className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      {lang === 'am' ? 'አገልግሎት ቀይር' : 'Edit Ministry'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Ministry Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scaleUp">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {lang === 'am' ? 'የመንፈሳዊ አገልግሎት ምደባ' : 'Assign Spiritual Ministry'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {editingMember.name} · {editingMember.chapelAmharic}
                </p>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'am' ? 'የአገልግሎት ኃላፊነት (Ministry Responsibility)' : 'Ministry Responsibility'}
                </label>
                <input
                  type="text"
                  value={editResp}
                  onChange={e => setEditResp(e.target.value)}
                  placeholder="ምሳሌ፦ የቻፕል መሪ፣ ወንጌላዊ፣ ኳይር፣ ዲያቆን፣ ጸሎት፣ አባል..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {lang === 'am' ? 'መንፈሳዊ ትምህርት (Theological / Bible Training)' : 'Spiritual Education'}
                </label>
                <input
                  type="text"
                  value={editEdu}
                  onChange={e => setEditEdu(e.target.value)}
                  placeholder="ምሳሌ፦ ዲፕሎማ፣ ድግሪ፣ ቢቲሲፒ (BTCP)፣ ኤማሆስ..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Quick suggestions */}
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">
                  {lang === 'am' ? 'ፈጣን የአገልግሎት አማራጮች፦' : 'Quick Presets:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['የቻፕል መሪ', 'ወንጌላዊ', 'ኳይር / ዘማሪ', 'ዲያቆን', 'የጸሎት አባት/እናት', 'የነገረ መለኮት ምሩቅ'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditResp(preset)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 text-[10px] text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
