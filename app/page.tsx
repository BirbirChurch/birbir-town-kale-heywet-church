'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar, { ActiveTab } from '../components/Navbar';
import ChapelFilterBar from '../components/ChapelFilterBar';
import ChapelPortalGateway from '../components/ChapelPortalGateway';
import SpiritualMinistryView from '../components/SpiritualMinistryView';
import SpiritualPlanView from '../components/SpiritualPlanView';
import DirectoryView from '../components/DirectoryView';
import HouseholdsView from '../components/HouseholdsView';
import AnalyticsView from '../components/AnalyticsView';
import LeadershipView from '../components/LeadershipView';
import ReportView from '../components/ReportView';
import MemberDetailModal from '../components/MemberDetailModal';
import AddMemberModal from '../components/AddMemberModal';
import ImportDataModal from '../components/ImportDataModal';
import CrossChapelAuditModal from '../components/CrossChapelAuditModal';
import BatchAgeUpdateModal from '../components/BatchAgeUpdateModal';
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, ArrowLeft } from 'lucide-react';

import { INITIAL_MEMBERS, INITIAL_HOUSEHOLDS, CHAPELS } from '../lib/churchData';
import { MemberRecord, Household, ChapelId } from '../lib/types';
import { calculateCensusStats } from '../lib/stats';
import { Language, TRANSLATIONS } from '../lib/translations';
import {
  findCrossChapelDuplicates,
  synchronizeMembers,
  CrossChapelConflict,
  UpsertMode,
} from '../lib/deduplication';

const STORAGE_KEY_MEMBERS = 'eliroi_church_census_members_v1';
const STORAGE_KEY_LANG = 'eliroi_church_census_lang';
const STORAGE_KEY_THEME = 'eliroi_church_census_theme';
const STORAGE_KEY_IGNORED_CONFLICTS = 'eliroi_church_census_ignored_conflicts_v1';

export default function ChurchCensusPage() {
  const [members, setMembers] = useState<MemberRecord[]>(INITIAL_MEMBERS);
  const [selectedChapel, setSelectedChapel] = useState<ChapelId>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('portals');
  const [lang, setLang] = useState<Language>('am');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showBatchAgeModal, setShowBatchAgeModal] = useState<boolean>(false);

  const [ignoredConflictIds, setIgnoredConflictIds] = useState<string[]>([]);
  const [importNotice, setImportNotice] = useState<{
    updatedCount: number;
    addedCount: number;
    mode: UpsertMode;
  } | null>(null);

  // Client-side hydration load effect to prevent SSR mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_MEMBERS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) setMembers(parsed);
        }

        const storedLang = localStorage.getItem(STORAGE_KEY_LANG) as Language;
        if (storedLang === 'am' || storedLang === 'en') setLang(storedLang);

        const storedTheme = localStorage.getItem(STORAGE_KEY_THEME);
        const isDark =
          storedTheme === 'dark' ||
          (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
          setDarkMode(true);
          document.documentElement.classList.add('dark');
        }

        const storedIgnored = localStorage.getItem(STORAGE_KEY_IGNORED_CONFLICTS);
        if (storedIgnored) setIgnoredConflictIds(JSON.parse(storedIgnored));
      } catch {}
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Sync dark mode changes to DOM
  const handleDarkModeToggle = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  };

  // Sync language toggle
  const handleLangToggle = () => {
    const nextLang = lang === 'am' ? 'en' : 'am';
    setLang(nextLang);
    localStorage.setItem(STORAGE_KEY_LANG, nextLang);
  };

  // Derive households from members
  const households = useMemo(() => {
    const map = new Map<string, Household>();

    for (const m of members) {
      if (!map.has(m.familyId)) {
        map.set(m.familyId, {
          id: m.familyId,
          familyNo: m.familyNo,
          chapel: m.chapel,
          chapelAmharic: m.chapelAmharic,
          headName: m.roleInFamily === 'Head' ? m.name : '',
          spouseName: m.roleInFamily === 'Spouse' ? m.name : '',
          membersCount: 0,
          primaryPhone: m.phoneNumber || '',
          houseCondition: m.houseCondition || 'የግል',
          head: m.roleInFamily === 'Head' ? m : (null as any),
          spouse: m.roleInFamily === 'Spouse' ? m : undefined,
          children: [],
          allMembers: [],
        });
      }

      const hh = map.get(m.familyId)!;
      hh.allMembers.push(m);
      hh.membersCount++;

      if (m.phoneNumber && !hh.primaryPhone) {
        hh.primaryPhone = m.phoneNumber;
      }
      if (m.houseCondition && !hh.houseCondition) {
        hh.houseCondition = m.houseCondition;
      }

      if (m.roleInFamily === 'Head') {
        hh.head = m;
        hh.headName = m.name;
      } else if (m.roleInFamily === 'Spouse') {
        hh.spouse = m;
        hh.spouseName = m.name;
      } else if (m.roleInFamily === 'Child') {
        hh.children.push(m);
      }
    }

    // Ensure all households have a fallback head if none marked
    for (const hh of map.values()) {
      if (!hh.head && hh.allMembers.length > 0) {
        hh.head = hh.allMembers[0];
        hh.headName = hh.head.name;
      }
    }

    return Array.from(map.values());
  }, [members]);

  // Counts for each chapel button
  const countsByChapel = useMemo(() => {
    const record: Record<string, { members: number; households: number }> = {
      all: { members: members.length, households: households.length },
    };

    for (const c of CHAPELS) {
      if (c.id === 'all') continue;
      const mCount = members.filter(m => m.chapel.toLowerCase() === c.id).length;
      const hCount = households.filter(h => h.chapel.toLowerCase() === c.id).length;
      record[c.id] = { members: mCount, households: hCount };
    }

    return record;
  }, [members, households]);

  // Filtered members & households for current chapel
  const chapelMembers = useMemo(() => {
    if (selectedChapel === 'all') return members;
    return members.filter(m => m.chapel.toLowerCase() === selectedChapel);
  }, [members, selectedChapel]);

  const chapelHouseholds = useMemo(() => {
    if (selectedChapel === 'all') return households;
    return households.filter(h => h.chapel.toLowerCase() === selectedChapel);
  }, [households, selectedChapel]);

  // Active chapel statistics
  const activeStats = useMemo(() => {
    return calculateCensusStats(chapelMembers, chapelHouseholds);
  }, [chapelMembers, chapelHouseholds]);

  // Cross-chapel duplicate and conflict detection
  const crossChapelConflicts = useMemo(() => {
    return findCrossChapelDuplicates(members, households, ignoredConflictIds);
  }, [members, households, ignoredConflictIds]);

  // Keep in one chapel only, removing duplicate from other chapels
  const handleKeepInChapelOnly = (conflict: CrossChapelConflict, chosenChapelId: string) => {
    const removeIds = new Set(
      conflict.members
        .filter(m => m.chapel.toLowerCase() !== chosenChapelId.toLowerCase())
        .map(m => m.id)
    );

    const updated = members.filter(m => !removeIds.has(m.id));
    setMembers(updated);
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(updated));
    } catch {}
  };

  // Merge family records into target chapel
  const handleMergeFamiliesToChapel = (conflict: CrossChapelConflict, targetChapelId: string) => {
    const targetChapelObj = CHAPELS.find(c => c.id === targetChapelId.toLowerCase()) || {
      id: targetChapelId as any,
      nameEnglish: targetChapelId,
      nameAmharic: `${targetChapelId} ቻፕል`,
      description: '',
      color: '#0d9488',
      bgLight: 'bg-teal-50',
      badgeClass: 'bg-teal-100',
    };

    const targetHh = conflict.households.find(h => h.chapel.toLowerCase() === targetChapelId.toLowerCase());
    const targetFamilyId = targetHh ? targetHh.id : `fam-${targetChapelId.toLowerCase()}-${Date.now()}`;
    const targetFamilyNo = targetHh ? targetHh.familyNo : 999;
    const hasTargetHead = targetHh?.head != null;

    const membersToReassign = conflict.members.filter(
      m => m.chapel.toLowerCase() !== targetChapelId.toLowerCase()
    );

    const reassignMap = new Map<string, Partial<MemberRecord>>();
    for (const m of membersToReassign) {
      if (m.roleInFamily === 'Head' && hasTargetHead) {
        if (!targetHh?.spouse) {
          reassignMap.set(m.id, {
            chapel: targetChapelObj.nameEnglish.replace(' Chapel', ''),
            chapelAmharic: targetChapelObj.nameAmharic,
            familyId: targetFamilyId,
            familyNo: targetFamilyNo,
            roleInFamily: 'Spouse',
          });
        } else {
          reassignMap.set(m.id, {
            chapel: targetChapelObj.nameEnglish.replace(' Chapel', ''),
            chapelAmharic: targetChapelObj.nameAmharic,
            familyId: targetFamilyId,
            familyNo: targetFamilyNo,
            roleInFamily: 'Dependent',
          });
        }
      } else {
        reassignMap.set(m.id, {
          chapel: targetChapelObj.nameEnglish.replace(' Chapel', ''),
          chapelAmharic: targetChapelObj.nameAmharic,
          familyId: targetFamilyId,
          familyNo: targetFamilyNo,
        });
      }
    }

    const updated = members.map(m => {
      if (reassignMap.has(m.id)) {
        return {
          ...m,
          ...reassignMap.get(m.id)!,
        };
      }
      return m;
    });

    setMembers(updated);
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(updated));
    } catch {}
  };

  // Ignore a conflict as distinct people
  const handleIgnoreConflict = (conflictId: string) => {
    const updated = [...ignoredConflictIds, conflictId];
    setIgnoredConflictIds(updated);
    try {
      localStorage.setItem(STORAGE_KEY_IGNORED_CONFLICTS, JSON.stringify(updated));
    } catch {}
  };

  // Add Member Handler
  const handleAddMember = (newRecord: Omit<MemberRecord, 'id' | 'familyId'>) => {
    const newId = `mem-custom-${Date.now()}`;
    const familyId = `fam-${newRecord.chapel.toLowerCase()}-${newRecord.familyNo}`;
    const fullMember: MemberRecord = {
      ...newRecord,
      id: newId,
      familyId,
    };

    const updated = [fullMember, ...members];
    setMembers(updated);
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Batch Import Members with Smart Synchronization
  const handleImportMembers = (newMembers: MemberRecord[], mode: UpsertMode = 'smart_update') => {
    const result = synchronizeMembers(members, newMembers, mode);
    setMembers(result.updatedList);
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(result.updatedList));
    } catch {
      // ignore
    }
    setImportNotice({
      updatedCount: result.updatedCount,
      addedCount: result.addedCount,
      mode,
    });
  };

  // Update Member Handler
  const handleUpdateMember = (updated: MemberRecord) => {
    const updatedList = members.map(m => (m.id === updated.id ? updated : m));
    setMembers(updatedList);
    setSelectedMember(updated);
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(updatedList));
    } catch {
      // ignore
    }
  };

  // Save All Batch Updated Members Handler
  const handleSaveAllBatchMembers = (updatedMembersList: MemberRecord[]) => {
    setMembers(updatedMembersList);
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(updatedMembersList));
    } catch {}
  };

  const selectedChapelObj = CHAPELS.find(c => c.id === selectedChapel);
  const selectedChapelDisplayName =
    lang === 'am'
      ? selectedChapelObj?.nameAmharic || 'ሁሉም ቻፕሎች'
      : selectedChapelObj?.nameEnglish || 'All Chapels';

  const t = TRANSLATIONS[lang];

  const handleEnterChapel = (chapelId: ChapelId, destination: ActiveTab = 'spiritual') => {
    setSelectedChapel(chapelId);
    setActiveTab(destination);
  };

  // Find household for selected member
  const currentHousehold = useMemo(() => {
    if (!selectedMember) return null;
    return households.find(h => h.id === selectedMember.familyId) || null;
  }, [selectedMember, households]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Navbar with 3-Zone Contract */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lang={lang}
        onLangToggle={handleLangToggle}
        darkMode={darkMode}
        onDarkModeToggle={handleDarkModeToggle}
        onOpenAddModal={() => setShowAddModal(true)}
        onOpenImportModal={() => setShowImportModal(true)}
        conflictCount={crossChapelConflicts.length}
        onOpenAuditModal={() => setShowAuditModal(true)}
      />

      {/* Hero Strip / Title Area */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {lang === 'am' ? 'ብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን - የቻፕሎች መረጃ ቋት' : 'Birbir Town Kale Heywet Church - Chapels Registry'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {lang === 'am'
                  ? 'የ10ሩ ቻፕሎች (ኤልሮኢ፣ ሻሎም፣ ቤቴል፣ ያህዌ፣ ኤዴን፣ አቤንኤዘር፣ ርኆቦት፣ ኤልሻዳይ፣ ሩሐማ፣ አዶናይ) የቆጠራና የመንፈሳዊ ዘርፍ ዕቅድ መቆጣጠሪያ'
                  : 'Official census records, demographics, and strategic plan database across all 10 church chapels'}
              </p>
            </div>

            {/* Quick Unboxed Census Summary */}
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div>
                <span className="block text-[11px] text-slate-400">{t.totalMembers}</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  {members.length.toLocaleString()}
                </span>
              </div>
              <span className="text-slate-200 dark:text-slate-700 text-xl" aria-hidden="true">|</span>
              <div>
                <span className="block text-[11px] text-slate-400">{t.totalHouseholds}</span>
                <span className="font-mono text-base font-bold text-teal-700 dark:text-teal-400 tabular-nums">
                  {households.length.toLocaleString()}
                </span>
              </div>
              <span className="text-slate-200 dark:text-slate-700 text-xl" aria-hidden="true">|</span>
              <div>
                <span className="block text-[11px] text-slate-400">{lang === 'am' ? 'ቻፕሎች' : 'Chapels'}</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  {new Set(members.map(m => m.chapel.toLowerCase())).size}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Success / Status Banner */}
      {importNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/80 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {lang === 'am'
                  ? `የመረጃ ማዋሃድ ተጠናቋል፦ ${importNotice.updatedCount} ነባር አባላት ቦታቸው ላይ ታድሰዋል፤ ${importNotice.addedCount} አዳዲስ አባላት ተካተዋል።`
                  : `Synchronization complete: ${importNotice.updatedCount} existing records updated in-place, ${importNotice.addedCount} new members added.`}
              </span>
            </div>
            <button
              onClick={() => setImportNotice(null)}
              className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Cross-Chapel Duplicate Conflict Banner */}
      {crossChapelConflicts.length > 0 && (
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/80 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {lang === 'am'
                  ? `ማስታወሻ፦ በተለያዩ ቻፕሎች ውስጥ የተገኙ ${crossChapelConflicts.length} ተመሳሳይ ቤተሰቦች ወይም ስልክ ቁጥሮች አሉ።`
                  : `Notice: Found ${crossChapelConflicts.length} potential duplicate families or phone numbers across chapels.`}
              </span>
            </div>
            <button
              onClick={() => setShowAuditModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lang === 'am' ? 'አጣራና ወስን (Audit)' : 'Review & Reconcile'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Consecrated Chapel Portal Entrance Ribbon when entered into a specific chapel */}
      {selectedChapel !== 'all' && (
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border-b border-teal-800/80 text-white px-4 py-3 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span
                className="w-3.5 h-3.5 rounded-full ring-2 ring-white/30 shrink-0"
                style={{ backgroundColor: selectedChapelObj?.color || '#0d9488' }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {lang === 'am' ? selectedChapelObj?.nameAmharic : selectedChapelObj?.nameEnglish}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                    {lang === 'am' ? 'የተገባበት ቻፕል' : 'Active Chapel Portal'}
                  </span>
                </div>
                {selectedChapelObj?.mottoAmharic && (
                  <p className="text-teal-200/80 text-[11px] italic mt-0.5">
                    &ldquo;{lang === 'am' ? selectedChapelObj.mottoAmharic : selectedChapelObj.mottoEnglish}&rdquo;
                    {selectedChapelObj.scriptureVerse && ` — ${selectedChapelObj.scriptureVerse}`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('spiritual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'spiritual'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {lang === 'am' ? 'የቻፕሉ መንፈሳዊ ዘርፍ' : 'Spiritual Sector'}
              </button>
              <button
                onClick={() => setActiveTab('plan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'plan'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-800 text-amber-300 hover:text-white'
                }`}
              >
                {lang === 'am' ? 'የ2019 ዓ.ም ዕቅድ' : '2019 Strategic Plan'}
              </button>
              <button
                onClick={() => setActiveTab('directory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'directory'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {lang === 'am' ? 'አባላት' : 'Members'}
              </button>
              <button
                onClick={() => {
                  setSelectedChapel('all');
                  setActiveTab('portals');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'am' ? 'ወደ ቻፕሎች መግቢያ በር ተመለስ' : 'Back to Portals Gateway'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapel Filter Tabs Bar (shown when not on portals view) */}
      {activeTab !== 'portals' && (
        <ChapelFilterBar
          selectedChapel={selectedChapel}
          onSelectChapel={setSelectedChapel}
          lang={lang}
          counts={countsByChapel}
        />
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'portals' && (
          <ChapelPortalGateway
            members={members}
            households={households}
            lang={lang}
            onEnterChapel={handleEnterChapel}
          />
        )}

        {activeTab === 'spiritual' && (
          <SpiritualMinistryView
            members={chapelMembers}
            allMembers={members}
            households={chapelHouseholds}
            lang={lang}
            selectedChapel={selectedChapel}
            onSelectMember={setSelectedMember}
            onUpdateMember={handleUpdateMember}
            onSwitchChapel={setSelectedChapel}
          />
        )}

        {activeTab === 'plan' && (
          <SpiritualPlanView
            members={members}
            households={households}
            lang={lang}
            selectedChapel={selectedChapel}
            onSelectChapel={setSelectedChapel}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryView
            members={chapelMembers}
            lang={lang}
            onSelectMember={setSelectedMember}
            onOpenImportModal={() => setShowImportModal(true)}
            onOpenBatchAgeModal={() => setShowBatchAgeModal(true)}
          />
        )}

        {activeTab === 'households' && (
          <HouseholdsView
            households={chapelHouseholds}
            lang={lang}
            onSelectMember={setSelectedMember}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            stats={activeStats}
            lang={lang}
          />
        )}


        {activeTab === 'report' && (
          <ReportView
            members={chapelMembers}
            households={chapelHouseholds}
            stats={activeStats}
            lang={lang}
            selectedChapelName={selectedChapelDisplayName}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            {lang === 'am'
              ? '© 2026 ብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን - የቻፕሎች መረጃ ቋትና የአገልግሎት አስተዳደር'
              : '© 2026 Birbir Town Kale Heywet Church - Chapels Census & Ministry Management'}
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span>Eliroi · Shalom · Betel · Yahewe · Eden · Ebenezer · Rehoboth · Elshaddai · Ruhama · Adonai</span>
          </div>
        </div>
      </footer>

      {/* Member Details Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          household={currentHousehold}
          lang={lang}
          onClose={() => setSelectedMember(null)}
          onSelectMember={setSelectedMember}
          onUpdateMember={handleUpdateMember}
        />
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <AddMemberModal
          lang={lang}
          onClose={() => setShowAddModal(false)}
          onAddMember={handleAddMember}
        />
      )}

      {/* Batch Import Modal */}
      {showImportModal && (
        <ImportDataModal
          lang={lang}
          onClose={() => setShowImportModal(false)}
          onImportMembers={handleImportMembers}
          onOpenAuditModal={() => {
            setShowImportModal(false);
            setShowAuditModal(true);
          }}
        />
      )}

      {/* Batch Age Update Modal */}
      {showBatchAgeModal && (
        <BatchAgeUpdateModal
          members={members}
          lang={lang}
          onClose={() => setShowBatchAgeModal(false)}
          onSaveAll={handleSaveAllBatchMembers}
          onOpenImportModal={() => setShowImportModal(true)}
        />
      )}

      {/* Cross-Chapel Duplicate Audit Modal */}
      {showAuditModal && (
        <CrossChapelAuditModal
          conflicts={crossChapelConflicts}
          lang={lang}
          onClose={() => setShowAuditModal(false)}
          onKeepInChapelOnly={handleKeepInChapelOnly}
          onMergeFamiliesToChapel={handleMergeFamiliesToChapel}
          onIgnoreConflict={handleIgnoreConflict}
          onSelectMember={setSelectedMember}
        />
      )}
    </div>
  );
}
