'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Calendar,
  Save,
  Printer,
  Download,
  RotateCcw,
  Edit2,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Layers,
  ChevronDown,
  Building2,
  Filter,
  BarChart3,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { MemberRecord, Household, ChapelId } from '../lib/types';
import { Language, TRANSLATIONS } from '../lib/translations';
import { CHAPELS } from '../lib/churchData';
import {
  INITIAL_PLAN_TASKS,
  STRATEGIC_CATEGORIES,
  PlanTaskItem,
  ChapelPlanRecord,
} from '../lib/spiritualPlanData';

interface SpiritualPlanViewProps {
  members: MemberRecord[];
  households: Household[];
  lang: Language;
  selectedChapel: ChapelId;
  onSelectChapel: (chapelId: ChapelId) => void;
}

const PLAN_STORAGE_KEY_PREFIX = 'kale_heywet_2019_spiritual_plan_v1_';

export default function SpiritualPlanView({
  members,
  households,
  lang,
  selectedChapel,
  onSelectChapel,
}: SpiritualPlanViewProps) {
  const t = TRANSLATIONS[lang];
  const [selectedCategory, setSelectedCategory] = useState<number>(0); // 0 = all
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<PlanTaskItem | null>(null);

  // Edit form state
  const [formAnnual, setFormAnnual] = useState('');
  const [formSemiAnnual, setFormSemiAnnual] = useState('');
  const [formQ1, setFormQ1] = useState('');
  const [formQ2, setFormQ2] = useState('');
  const [formQ3, setFormQ3] = useState('');
  const [formQ4, setFormQ4] = useState('');
  const [formActual, setFormActual] = useState('');
  const [formStatus, setFormStatus] = useState<'planned' | 'in_progress' | 'achieved' | 'exceeded'>('planned');
  const [formRemarks, setFormRemarks] = useState('');

  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Chapel plan state
  const [planState, setPlanState] = useState<Record<string, {
    annual: string;
    semiAnnual: string;
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    actualProgress?: string;
    status: 'planned' | 'in_progress' | 'achieved' | 'exceeded';
    remarks: string;
  }>>({});

  // Current chapel object
  const chapelObj = useMemo(() => {
    return CHAPELS.find(c => c.id === selectedChapel) || CHAPELS[0];
  }, [selectedChapel]);

  // Compute live census statistics for Section 1 (Item 1.1 - 1.4)
  const censusCounts = useMemo(() => {
    // Filter members/households for selected chapel
    const targetMembers =
      selectedChapel === 'all'
        ? members
        : members.filter(m => m.chapel.toLowerCase() === selectedChapel.toLowerCase());

    const targetHouseholds =
      selectedChapel === 'all'
        ? households
        : households.filter(h => h.chapel.toLowerCase() === selectedChapel.toLowerCase());

    const headsCount = targetHouseholds.length;
    const youthCount = targetMembers.filter(m => m.age !== null && m.age >= 13 && m.age <= 29).length;
    const childrenCount = targetMembers.filter(m => m.age !== null && m.age <= 12).length;
    const totalCount = targetMembers.length;

    return {
      '1.1': `${headsCount} ቤተሰብ`,
      '1.2': `${youthCount} ወጣት`,
      '1.3': `${childrenCount} ልጅ`,
      '1.4': `${totalCount} አባል`,
    };
  }, [members, households, selectedChapel]);

  // Load custom saved plan for current chapel on chapel change
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const key = `${PLAN_STORAGE_KEY_PREFIX}${selectedChapel}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            setPlanState(parsed);
            return;
          }
        }
      } catch {
        // fallback
      }
      setPlanState({});
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedChapel]);

  // Save current chapel plan
  const handleSavePlan = () => {
    try {
      const key = `${PLAN_STORAGE_KEY_PREFIX}${selectedChapel}`;
      localStorage.setItem(key, JSON.stringify(planState));
      setSaveToast(
        lang === 'am'
          ? 'የ2019 ዓ.ም መንፈሳዊ ዕቅድ መረጃ በተሳካ ሁኔታ ተቀምጧል!'
          : '2019 Strategic Plan successfully saved!'
      );
      setTimeout(() => setSaveToast(null), 3000);
    } catch {
      alert(lang === 'am' ? 'መረጃውን ማስቀመጥ አልተቻለም' : 'Failed to save plan');
    }
  };

  // Reset to defaults
  const handleResetPlan = () => {
    if (
      window.confirm(
        lang === 'am'
          ? 'እርግጠኛ ነዎት የዚህን ቻፕል ዕቅድ ወደ ነባሪው መመለስ ይፈልጋሉ?'
          : 'Are you sure you want to reset this chapel plan to defaults?'
      )
    ) {
      setPlanState({});
      try {
        const key = `${PLAN_STORAGE_KEY_PREFIX}${selectedChapel}`;
        localStorage.removeItem(key);
      } catch {}
    }
  };

  // Open Edit Modal for a task item
  const handleOpenEdit = (item: PlanTaskItem) => {
    setEditingItem(item);
    const existing = planState[item.id];
    const isAuto = item.isAutoFromCensus && censusCounts[item.id as keyof typeof censusCounts];

    setFormAnnual(existing?.annual || (isAuto ? censusCounts[item.id as keyof typeof censusCounts] : item.defaultAnnual));
    setFormSemiAnnual(existing?.semiAnnual || (isAuto ? censusCounts[item.id as keyof typeof censusCounts] : item.defaultSemiAnnual));
    setFormQ1(existing?.q1 || (isAuto ? censusCounts[item.id as keyof typeof censusCounts] : item.defaultQ1));
    setFormQ2(existing?.q2 || (isAuto ? censusCounts[item.id as keyof typeof censusCounts] : item.defaultQ2));
    setFormQ3(existing?.q3 || (isAuto ? censusCounts[item.id as keyof typeof censusCounts] : item.defaultQ3));
    setFormQ4(existing?.q4 || (isAuto ? censusCounts[item.id as keyof typeof censusCounts] : item.defaultQ4));
    setFormActual(existing?.actualProgress || '');
    setFormStatus(existing?.status || 'planned');
    setFormRemarks(existing?.remarks || item.remarks);
  };

  // Save Modal Changes to state
  const handleSaveItemEdit = () => {
    if (!editingItem) return;
    setPlanState(prev => ({
      ...prev,
      [editingItem.id]: {
        annual: formAnnual.trim(),
        semiAnnual: formSemiAnnual.trim(),
        q1: formQ1.trim(),
        q2: formQ2.trim(),
        q3: formQ3.trim(),
        q4: formQ4.trim(),
        actualProgress: formActual.trim(),
        status: formStatus,
        remarks: formRemarks.trim(),
      },
    }));
    setEditingItem(null);
  };

  // Print view handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      'ተ.ቁ (Item)',
      'ምዕራፍ (Category)',
      'ዝርዝር ተግባራት (Activity Description)',
      'መለኪያ (Unit)',
      'የዓመት ዕቅድ (Annual Target)',
      'የግማሽ ዓመት ዕቅድ (Semi-Annual)',
      '1ኛ ሩብ ዓመት (Q1)',
      '2ኛ ሩብ ዓመት (Q2)',
      '3ኛ ሩብ ዓመት (Q3)',
      '4ኛ ሩብ ዓመት (Q4)',
      'አፈፃፀም/ምርመራ (Remarks & Status)',
    ];

    const rows = INITIAL_PLAN_TASKS.map(task => {
      const state = planState[task.id];
      const isAuto = task.isAutoFromCensus && censusCounts[task.id as keyof typeof censusCounts];
      const annual = state?.annual || (isAuto ? censusCounts[task.id as keyof typeof censusCounts] : task.defaultAnnual);
      const semi = state?.semiAnnual || (isAuto ? censusCounts[task.id as keyof typeof censusCounts] : task.defaultSemiAnnual);
      const q1 = state?.q1 || (isAuto ? censusCounts[task.id as keyof typeof censusCounts] : task.defaultQ1);
      const q2 = state?.q2 || (isAuto ? censusCounts[task.id as keyof typeof censusCounts] : task.defaultQ2);
      const q3 = state?.q3 || (isAuto ? censusCounts[task.id as keyof typeof censusCounts] : task.defaultQ3);
      const q4 = state?.q4 || (isAuto ? censusCounts[task.id as keyof typeof censusCounts] : task.defaultQ4);
      const rem = state?.remarks || task.remarks;

      return [
        `"${task.code}"`,
        `"${task.categoryTitleAm.replace(/"/g, '""')}"`,
        `"${task.taskDescriptionAm.replace(/"/g, '""')}"`,
        `"${task.unitAm.replace(/"/g, '""')}"`,
        `"${annual}"`,
        `"${semi}"`,
        `"${q1}"`,
        `"${q2}"`,
        `"${q3}"`,
        `"${q4}"`,
        `"${rem}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Kale_Heywet_Spiritual_Plan_2019_${selectedChapel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter tasks based on category and search
  const filteredTasks = useMemo(() => {
    return INITIAL_PLAN_TASKS.filter(task => {
      if (selectedCategory > 0 && task.categoryNumber !== selectedCategory) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCode = task.code.includes(q);
        const matchDescAm = task.taskDescriptionAm.toLowerCase().includes(q);
        const matchDescEn = task.taskDescriptionEn.toLowerCase().includes(q);
        const matchCat = task.categoryTitleAm.toLowerCase().includes(q);
        if (!matchCode && !matchDescAm && !matchDescEn && !matchCat) return false;
      }
      return true;
    });
  }, [selectedCategory, search]);

  // Group tasks by category number for clean rendering
  const groupedTasks = useMemo(() => {
    const groups: Record<number, PlanTaskItem[]> = {};
    filteredTasks.forEach(task => {
      if (!groups[task.categoryNumber]) {
        groups[task.categoryNumber] = [];
      }
      groups[task.categoryNumber].push(task);
    });
    return groups;
  }, [filteredTasks]);

  // Calculate overall completion count
  const statsSummary = useMemo(() => {
    let completedCount = 0;
    let totalTasks = INITIAL_PLAN_TASKS.length;

    INITIAL_PLAN_TASKS.forEach(t => {
      const st = planState[t.id]?.status;
      if (st === 'achieved' || st === 'exceeded') {
        completedCount++;
      }
    });

    return {
      completedCount,
      totalTasks,
      percentage: Math.round((completedCount / totalTasks) * 100),
    };
  }, [planState]);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header Banner - Printed & Display */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>የ2019 ዓ.ም - ብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {lang === 'am'
                ? `ብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን - በ2019 ዓ.ም የመንፈሳዊ ዘርፍ ዕቅድ`
                : `Birbir Town Kale Heywet Church - 2019 E.C. Spiritual Sector Strategic Plan`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === 'am'
                ? `የ${chapelObj.nameAmharic} እና የአስሩም ቻፕሎች አጠቃላይ የ1ኛ፣ 2ኛ፣ 3ኛ እና 4ኛ ሩብ ዓመት መንፈሳዊ አገልግሎቶች ማቀጃ እና መከታተያ ሰንጠረዥ`
                : `Annual, semi-annual, and quarterly spiritual execution matrix for ${chapelObj.nameEnglish} and all partner chapels.`}
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                <strong>{lang === 'am' ? 'የተመረጠው ቻፕል፦' : 'Chapel:'}</strong>{' '}
                {chapelObj.nameAmharic}
              </span>
              <span>·</span>
              <span>
                <strong>{lang === 'am' ? 'መጋቢ/መሪ፦' : 'Leader:'}</strong>{' '}
                {chapelObj.leader || (lang === 'am' ? 'የጋራ መጋቢ ቦርድ' : 'Leadership Board')}
              </span>
            </div>
          </div>

          {/* Action Tools */}
          <div className="no-print shrink-0 flex flex-wrap sm:flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <select
                value={selectedChapel}
                onChange={e => onSelectChapel(e.target.value as ChapelId)}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 font-semibold"
              >
                {CHAPELS.map(c => (
                  <option key={c.id} value={c.id}>
                    {lang === 'am' ? c.nameAmharic : c.nameEnglish}
                  </option>
                ))}
              </select>

              <button
                onClick={handleSavePlan}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{lang === 'am' ? 'ዕቅዱን አስቀምጥ' : 'Save Plan'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                title="Export to CSV"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                <span>{lang === 'am' ? 'ወደ Excel' : 'Export'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                title="Print Report"
              >
                <Printer className="w-3.5 h-3.5 text-purple-400" />
                <span>{lang === 'am' ? 'አትም (Print)' : 'Print'}</span>
              </button>

              <button
                onClick={handleResetPlan}
                className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors cursor-pointer"
                title="Reset to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 block font-medium">
              {lang === 'am' ? 'መሰረታዊ የመንፈሳዊ ዘርፎች' : 'Pillar Categories'}
            </span>
            <span className="font-mono text-lg font-bold text-white">8 {lang === 'am' ? 'ዘርፎች' : 'Pillars'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 block font-medium">
              {lang === 'am' ? 'ዝርዝር ተግባራት' : 'Total Planned Tasks'}
            </span>
            <span className="font-mono text-lg font-bold text-teal-300">
              42 {lang === 'am' ? 'ተግባራት' : 'tasks'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 block font-medium">
              {lang === 'am' ? 'የተከናወኑ / የተረጋገጡ' : 'Completed Tasks'}
            </span>
            <span className="font-mono text-lg font-bold text-emerald-300">
              {statsSummary.completedCount} / {statsSummary.totalTasks}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 block font-medium">
              {lang === 'am' ? 'የአፈፃፀም ደረጃ' : 'Completion Rate'}
            </span>
            <span className="font-mono text-lg font-bold text-amber-300">
              {statsSummary.percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar (No-print) */}
      <div className="no-print space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'am' ? 'በተግባር ቁጥር (ምሳሌ 2.1) ወይም በዝርዝር ተግባራት ፈልግ...' : 'Search activity by code (e.g. 3.1) or description...'}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {(selectedCategory !== 0 || search) && (
            <button
              onClick={() => {
                setSelectedCategory(0);
                setSearch('');
              }}
              className="text-xs text-slate-500 hover:text-red-600 transition-colors shrink-0"
            >
              {lang === 'am' ? 'ማጣሪያውን አጥራ' : 'Reset Filter'}
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategory(0)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors shrink-0 cursor-pointer ${
              selectedCategory === 0
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {lang === 'am' ? 'ሁሉንም 8 ዘርፎች አሳይ' : 'All 8 Pillars'} (42)
          </button>

          {STRATEGIC_CATEGORIES.map(cat => (
            <button
              key={cat.num}
              onClick={() => setSelectedCategory(cat.num)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors shrink-0 cursor-pointer ${
                selectedCategory === cat.num
                  ? 'bg-teal-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.num}. {lang === 'am' ? cat.titleAm.replace(/^\d+\.\s*/, '') : cat.titleEn.replace(/^\d+\.\s*/, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2019 Strategic Plan Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Printable Official Header */}
        <div className="hidden print:block p-8 border-b border-slate-200 text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">
            ብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን
          </h1>
          <h2 className="text-lg font-bold text-slate-800">
            በ2019 ዓ.ም የመንፈሳዊ ዘርፍ ስትራቴጂካዊ ዕቅድ
          </h2>
          <p className="text-xs text-slate-600">
            ቻፕል፦ <strong>{chapelObj.nameAmharic} ({chapelObj.nameEnglish})</strong> | የወጣበት ቀን፦ {new Date().toLocaleDateString('am-ET')}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold text-[11px] tracking-wider uppercase border-b border-slate-800">
                <th className="py-3 px-3 w-12 text-center">ተ.ቁ</th>
                <th className="py-3 px-3 min-w-[220px]">ዝርዝር ተግባራት</th>
                <th className="py-3 px-3 w-28 text-center">መለኪያ</th>
                <th className="py-3 px-2 text-center bg-teal-900/80">የዓመት ዕቅድ</th>
                <th className="py-3 px-2 text-center bg-slate-800">የግማሽ ዓመት</th>
                <th className="py-3 px-2 text-center border-l border-slate-700">1ኛ ሩብ</th>
                <th className="py-3 px-2 text-center">2ኛ ሩብ</th>
                <th className="py-3 px-2 text-center border-l border-slate-700">3ኛ ሩብ</th>
                <th className="py-3 px-2 text-center">4ኛ ሩብ</th>
                <th className="py-3 px-3 min-w-[160px]">ምርመራ / ሁኔታ</th>
                <th className="py-3 px-2 text-center w-16 no-print">ድርጊት</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {Object.keys(groupedTasks).length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>{lang === 'am' ? 'ምንም የተገኘ ዕቅድ አልተገኘም' : 'No matching activities found'}</span>
                  </td>
                </tr>
              ) : (
                Object.entries(groupedTasks).map(([catNumStr, tasks]) => {
                  const catNum = parseInt(catNumStr, 10);
                  const categoryMeta = STRATEGIC_CATEGORIES.find(c => c.num === catNum);

                  return (
                    <React.Fragment key={`cat-${catNum}`}>
                      {/* Section Category Header */}
                      <tr className={`font-bold text-xs ${categoryMeta?.color || 'bg-slate-100 dark:bg-slate-800'}`}>
                        <td colSpan={11} className="py-2.5 px-4 text-slate-900 dark:text-white">
                          <div className="flex items-center justify-between">
                            <span>{lang === 'am' ? categoryMeta?.titleAm : categoryMeta?.titleEn}</span>
                            <span className="text-[10px] font-normal text-slate-500 font-mono">
                              ({tasks.length} {lang === 'am' ? 'ተግባራት' : 'items'})
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Section Task Rows */}
                      {tasks.map(task => {
                        const savedState = planState[task.id];
                        const isAuto = task.isAutoFromCensus && censusCounts[task.id as keyof typeof censusCounts];

                        const annual = savedState?.annual || (isAuto ? censusCounts[task.id as keyof typeof censusCounts] : task.defaultAnnual);
                        const semi = savedState?.semiAnnual || (isAuto ? censusCounts[task.id as keyof typeof censusCounts] : task.defaultSemiAnnual);
                        const q1 = savedState?.q1 || (isAuto ? censusCounts[task.id as keyof typeof censusCounts] : task.defaultQ1);
                        const q2 = savedState?.q2 || (isAuto ? censusCounts[task.id as keyof typeof censusCounts] : task.defaultQ2);
                        const q3 = savedState?.q3 || (isAuto ? censusCounts[task.id as keyof typeof censusCounts] : task.defaultQ3);
                        const q4 = savedState?.q4 || (isAuto ? censusCounts[task.id as keyof typeof censusCounts] : task.defaultQ4);
                        const remarks = savedState?.remarks || task.remarks;
                        const status = savedState?.status || 'planned';

                        return (
                          <tr
                            key={task.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-slate-800 dark:text-slate-200"
                          >
                            {/* Code */}
                            <td className="py-2.5 px-3 font-mono font-bold text-center text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-850/50">
                              {task.code}
                            </td>

                            {/* Task Description */}
                            <td className="py-2.5 px-3 font-medium">
                              <div>
                                <span className="block text-slate-900 dark:text-white text-xs">
                                  {lang === 'am' ? task.taskDescriptionAm : task.taskDescriptionEn}
                                </span>
                                {task.isAutoFromCensus && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    {lang === 'am' ? 'ከቆጠራ ዳታቤዝ የቀረበ' : 'Live Census Auto-Feed'}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Measurement Unit */}
                            <td className="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 text-[11px]">
                              {lang === 'am' ? task.unitAm : task.unitEn}
                            </td>

                            {/* Annual Target */}
                            <td className="py-2.5 px-2 text-center font-bold font-mono text-teal-700 dark:text-teal-300 bg-teal-50/30 dark:bg-teal-950/20">
                              {annual}
                            </td>

                            {/* Semi-Annual Target */}
                            <td className="py-2.5 px-2 text-center font-semibold font-mono text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/20">
                              {semi}
                            </td>

                            {/* Q1 */}
                            <td className="py-2.5 px-2 text-center font-mono border-l border-slate-100 dark:border-slate-800">
                              {q1}
                            </td>

                            {/* Q2 */}
                            <td className="py-2.5 px-2 text-center font-mono">
                              {q2}
                            </td>

                            {/* Q3 */}
                            <td className="py-2.5 px-2 text-center font-mono border-l border-slate-100 dark:border-slate-800">
                              {q3}
                            </td>

                            {/* Q4 */}
                            <td className="py-2.5 px-2 text-center font-mono">
                              {q4}
                            </td>

                            {/* Status & Remarks */}
                            <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-400">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  {status === 'achieved' && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200">
                                      ✓ {lang === 'am' ? 'ተከናወነ' : 'Achieved'}
                                    </span>
                                  )}
                                  {status === 'exceeded' && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-200">
                                      ★ {lang === 'am' ? 'ከዕቅድ በላይ' : 'Exceeded'}
                                    </span>
                                  )}
                                  {status === 'in_progress' && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200">
                                      ⚡ {lang === 'am' ? 'በሂደት ላይ' : 'In Progress'}
                                    </span>
                                  )}
                                  {status === 'planned' && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                      ○ {lang === 'am' ? 'የታቀደ' : 'Planned'}
                                    </span>
                                  )}
                                </div>
                                <span className="block text-[11px] leading-tight text-slate-500 dark:text-slate-400 italic">
                                  {remarks}
                                </span>
                              </div>
                            </td>

                            {/* Edit Action */}
                            <td className="py-2.5 px-2 text-center no-print">
                              <button
                                onClick={() => handleOpenEdit(task)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit targets or progress"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Printable Official Signatures Footer */}
        <div className="hidden print:grid grid-cols-3 gap-8 p-8 pt-12 border-t border-slate-200 text-xs text-center text-slate-700">
          <div>
            <span className="block font-bold mb-10 text-slate-900">የቻፕሉ መጋቢ / መሪ ፊርማ</span>
            <div className="border-t border-slate-400 pt-1 font-mono">ስም፡ ____________________</div>
          </div>
          <div>
            <span className="block font-bold mb-10 text-slate-900">የመንፈሳዊ ዘርፍ ኃላፊ ፊርማ</span>
            <div className="border-t border-slate-400 pt-1 font-mono">ስም፡ ____________________</div>
          </div>
          <div>
            <span className="block font-bold mb-10 text-slate-900">የቤተክርስቲያን ማህተም እና ቀን</span>
            <div className="border-t border-slate-400 pt-1 font-mono">ቀን፡ ____/____/2019 ዓ.ም</div>
          </div>
        </div>
      </div>

      {/* Item Editing Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scaleUp">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/80 dark:text-teal-200">
                  ተግባር {editingItem.code}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {editingItem.taskDescriptionAm}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {chapelObj.nameAmharic} · መለኪያ፦ {editingItem.unitAm}
                </p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    የዓመት ዕቅድ (Annual Target)
                  </label>
                  <input
                    type="text"
                    value={formAnnual}
                    onChange={e => setFormAnnual(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    የግማሽ ዓመት ዕቅድ
                  </label>
                  <input
                    type="text"
                    value={formSemiAnnual}
                    onChange={e => setFormSemiAnnual(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* 4 Quarterly Targets */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-slate-500 text-[10px] font-semibold mb-1">
                    1ኛ ሩብ
                  </label>
                  <input
                    type="text"
                    value={formQ1}
                    onChange={e => setFormQ1(e.target.value)}
                    className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-semibold mb-1">
                    2ኛ ሩብ
                  </label>
                  <input
                    type="text"
                    value={formQ2}
                    onChange={e => setFormQ2(e.target.value)}
                    className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-semibold mb-1">
                    3ኛ ሩብ
                  </label>
                  <input
                    type="text"
                    value={formQ3}
                    onChange={e => setFormQ3(e.target.value)}
                    className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-semibold mb-1">
                    4ኛ ሩብ
                  </label>
                  <input
                    type="text"
                    value={formQ4}
                    onChange={e => setFormQ4(e.target.value)}
                    className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Execution Status */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  የአፈፃፀም ደረጃ (Execution Status)
                </label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="planned">○ የታቀደ (Planned Target)</option>
                  <option value="in_progress">⚡ በሂደት ላይ (In Progress)</option>
                  <option value="achieved">✓ በሙሉ ተከናወነ (Achieved 100%)</option>
                  <option value="exceeded">★ ከዕቅድ በላይ ተከናወነ (Exceeded Target)</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  ምርመራ / ማስታወሻ (Remarks)
                </label>
                <input
                  type="text"
                  value={formRemarks}
                  onChange={e => setFormRemarks(e.target.value)}
                  placeholder="ምሳሌ፦ በየሩብ ዓመቱ የሚገመገም"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveItemEdit}
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
