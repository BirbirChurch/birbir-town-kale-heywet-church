'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Save,
  Download,
  UploadCloud,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  Filter,
  RefreshCw,
  UserCheck,
  Calendar,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MemberRecord, ChapelId } from '../lib/types';
import { Language, TRANSLATIONS } from '../lib/translations';
import { CHAPELS } from '../lib/churchData';

interface BatchAgeUpdateModalProps {
  members: MemberRecord[];
  lang: Language;
  onClose: () => void;
  onSaveAll: (updatedMembers: MemberRecord[]) => void;
  onOpenImportModal?: () => void;
}

export default function BatchAgeUpdateModal({
  members,
  lang,
  onClose,
  onSaveAll,
  onOpenImportModal,
}: BatchAgeUpdateModalProps) {
  const t = TRANSLATIONS[lang];

  // Local working copy of members so user can edit multiple ages before saving
  const [editedMembersMap, setEditedMembersMap] = useState<Record<string, MemberRecord>>(() => {
    const map: Record<string, MemberRecord> = {};
    members.forEach(m => {
      map[m.id] = { ...m };
    });
    return map;
  });

  const [chapelFilter, setChapelFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [ageCategoryFilter, setAgeCategoryFilter] = useState<'all' | 'unspecified' | 'child' | 'youth' | 'adult'>('all');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // List of members derived from editedMembersMap
  const allEditedMembers = useMemo(() => {
    return Object.values(editedMembersMap);
  }, [editedMembersMap]);

  // Filtered members list
  const filteredList = useMemo(() => {
    return allEditedMembers.filter(m => {
      // Chapel filter
      if (chapelFilter !== 'all' && m.chapel.toLowerCase() !== chapelFilter.toLowerCase()) {
        return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesPhone = (m.phoneNumber || '').includes(q);
        const matchesChapel = m.chapel.toLowerCase().includes(q) || m.chapelAmharic.includes(q);
        if (!matchesName && !matchesPhone && !matchesChapel) return false;
      }

      // Age category filter
      if (ageCategoryFilter === 'unspecified' && m.age !== null) return false;
      if (ageCategoryFilter === 'child' && (m.age === null || m.age > 12)) return false;
      if (ageCategoryFilter === 'youth' && (m.age === null || m.age < 13 || m.age > 35)) return false;
      if (ageCategoryFilter === 'adult' && (m.age === null || m.age <= 35)) return false;

      return true;
    });
  }, [allEditedMembers, chapelFilter, search, ageCategoryFilter]);

  // Statistics on age completeness
  const stats = useMemo(() => {
    const total = allEditedMembers.length;
    let specified = 0;
    let children = 0;
    let youth = 0;
    let adults = 0;

    allEditedMembers.forEach(m => {
      if (m.age !== null && !isNaN(m.age)) {
        specified++;
        if (m.age <= 12) children++;
        else if (m.age <= 35) youth++;
        else adults++;
      }
    });

    return { total, specified, unspecified: total - specified, children, youth, adults };
  }, [allEditedMembers]);

  // Handle individual age edit
  const handleAgeChange = (id: string, newAgeVal: string) => {
    const trimmed = newAgeVal.trim();
    const parsed = trimmed === '' ? null : parseInt(trimmed, 10);
    const validAge = parsed === null || isNaN(parsed) ? null : Math.max(0, Math.min(120, parsed));

    setEditedMembersMap(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        age: validAge,
      },
    }));
    setHasChanges(true);
  };

  // Quick increment / decrement age
  const handleAdjustAge = (id: string, delta: number) => {
    setEditedMembersMap(prev => {
      const current = prev[id];
      const currentAge = current?.age ?? 0;
      const nextAge = Math.max(0, currentAge + delta);
      return {
        ...prev,
        [id]: {
          ...current,
          age: nextAge,
        },
      };
    });
    setHasChanges(true);
  };

  // Bulk operation: Increment all members' ages by +1 (Annual Age Roll-Forward)
  const handleBulkAgeIncrement = () => {
    const confirmText =
      lang === 'am'
        ? 'በዝርዝሩ ውስጥ ያሉትን ሁሉንም አባላት ዕድሜ በ1 ዓመት ለመጨመር እርግጠኛ ነዎት?'
        : 'Are you sure you want to increment everyone’s age by +1 year?';

    if (!window.confirm(confirmText)) return;

    setEditedMembersMap(prev => {
      const updated: Record<string, MemberRecord> = {};
      Object.keys(prev).forEach(id => {
        const m = prev[id];
        // Only increment for filtered list or selected chapel
        const inFiltered = filteredList.some(f => f.id === id);
        if (inFiltered && m.age !== null) {
          updated[id] = { ...m, age: m.age + 1 };
        } else {
          updated[id] = { ...m };
        }
      });
      return updated;
    });
    setHasChanges(true);
  };

  // Export Current Roster as Age Update Template Excel File
  const handleExportAgeTemplate = () => {
    const rows = filteredList.map((m, idx) => ({
      'ተ.ቁ (#)': idx + 1,
      'የአባሉ ሙሉ ስም (Name)': m.name,
      'ቻፕል (Chapel)': m.chapelAmharic,
      'የቤተሰብ ቁጥር (Family No)': m.familyNo,
      'የቤተሰብ ሚና (Family Role)':
        m.roleInFamily === 'Head' ? 'የቤተሰብ ራስ' : m.roleInFamily === 'Spouse' ? 'አጋር' : 'ልጅ',
      'ዕድሜ (Age)': m.age ?? '',
      'ጾታ (Gender)': m.gender === 'Male' ? 'ወንድ' : 'ሴት',
      'ስልክ ቁጥር (Phone)': m.phoneNumber || '',
      'አገልግሎት/ኃላፊነት (Ministry)': m.responsibility || 'አባል',
      'መንፈሳዊ ትምህርት (Spiritual Edu)': m.spiritualEdu || '',
      'ጥምቀት (Baptism)': m.baptism,
      'የጌታ እራት (Lord Supper)': m.lordSupper,
      'አስራት (Tithe)': m.tithe,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 25 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
      { wch: 10 },
      { wch: 10 },
      { wch: 16 },
      { wch: 20 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'የአባላት ዕድሜና መረጃ');

    const fileName = `ብርብር_ከተማ_ቃለ_ሕይወት_የአባላት_ዕድሜ_ማደሻ_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Save all edits to parent state
  const handleSave = () => {
    onSaveAll(allEditedMembers);
    setHasChanges(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {lang === 'am'
                  ? 'የአባላት ዕድሜና መረጃ በጅምላ ማደሻ (Batch Age & Profile Editor)'
                  : 'Batch Member Age & Profile Update Tool'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'am'
                  ? 'የሁሉንም አባላት ዕድሜ ቀጥታ እዚህ ያስተካክሉ፤ ወይም በኤክሴል ኤክስፖርት አድርገው አድሰው ይመልሱ'
                  : 'Update all member ages directly in place, or export to Excel and re-upload with Smart Update'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar & Stats Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
          {/* Stats Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                {lang === 'am' ? 'ጠቅላላ አባላት፦' : 'Total Members:'}{' '}
                <strong className="text-teal-600 dark:text-teal-400 font-mono">{stats.total}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                {lang === 'am' ? 'ዕድሜያቸው የተገለጸ፦' : 'Age Specified:'}{' '}
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{stats.specified}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                {lang === 'am' ? 'ያልተገለጸ፦' : 'Unspecified Age:'}{' '}
                <strong className="text-amber-600 dark:text-amber-400 font-mono">{stats.unspecified}</strong>
              </span>
            </div>

            {/* Excel Download & Re-upload Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportAgeTemplate}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'am' ? 'የዕድሜ ማደሻ ኤክሴል አውርድ' : 'Export Excel Template'}</span>
              </button>

              {onOpenImportModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenImportModal();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{lang === 'am' ? 'የተስተካከለ ኤክሴል ጫን (Smart Upsert)' : 'Import Updated Excel'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Filters & Actions Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={lang === 'am' ? 'በስም ወይም በስልክ ፈልግ...' : 'Search member by name or phone...'}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={chapelFilter}
                onChange={e => setChapelFilter(e.target.value)}
                className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
              >
                <option value="all">{lang === 'am' ? 'ሁሉም ቻፕሎች' : 'All Chapels'}</option>
                {CHAPELS.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameAmharic}
                  </option>
                ))}
              </select>

              <select
                value={ageCategoryFilter}
                onChange={e => setAgeCategoryFilter(e.target.value as any)}
                className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
              >
                <option value="all">{lang === 'am' ? 'ሁሉም ዕድሜዎች' : 'All Ages'}</option>
                <option value="unspecified">{lang === 'am' ? 'ዕድሜ ያልተጻፈላቸው ብቻ' : 'Unspecified Only'}</option>
                <option value="child">{lang === 'am' ? 'ህፃናት (0-12)' : 'Children (0-12)'}</option>
                <option value="youth">{lang === 'am' ? 'ወጣቶች (13-35)' : 'Youth (13-35)'}</option>
                <option value="adult">{lang === 'am' ? 'ጎልማሶች (>35)' : 'Adults (>35)'}</option>
              </select>
            </div>

            {/* Quick Bulk Increment Button */}
            <button
              type="button"
              onClick={handleBulkAgeIncrement}
              className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-100/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Add 1 year to everyone (Annual Roll-Forward)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'am' ? 'ለሁሉም +1 ዓመት ጨምር (ለአመታዊ ቆጠራ)' : '+1 Year to All (Annual Shift)'}</span>
            </button>
          </div>
        </div>

        {/* High Density High-Speed Table Editor */}
        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 font-semibold text-slate-600 dark:text-slate-300 z-10">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-4">{lang === 'am' ? 'የአባሉ ስም' : 'Member Name'}</th>
                <th className="py-2.5 px-3">{lang === 'am' ? 'ቻፕል' : 'Chapel'}</th>
                <th className="py-2.5 px-3">{lang === 'am' ? 'የቤተሰብ ሚና' : 'Family Role'}</th>
                <th className="py-2.5 px-3 w-44 text-center">{lang === 'am' ? 'ዕድሜ (Age)' : 'Age (Years)'}</th>
                <th className="py-2.5 px-3">{lang === 'am' ? 'የዕድሜ ምድብ' : 'Age Category'}</th>
                <th className="py-2.5 px-3">{lang === 'am' ? 'ስልክ' : 'Phone'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {lang === 'am' ? 'ምንም አባል አልተገኘም' : 'No members found matching filter'}
                  </td>
                </tr>
              ) : (
                filteredList.map((m, idx) => {
                  const currentAge = m.age;
                  let categoryBadge = (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                      {lang === 'am' ? 'ያልተገለጸ' : 'Unspecified'}
                    </span>
                  );

                  if (currentAge !== null) {
                    if (currentAge <= 12) {
                      categoryBadge = (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                          {lang === 'am' ? 'ልጅ (0-12)' : 'Child'}
                        </span>
                      );
                    } else if (currentAge <= 35) {
                      categoryBadge = (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                          {lang === 'am' ? 'ወጣት (13-35)' : 'Youth'}
                        </span>
                      );
                    } else {
                      categoryBadge = (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200">
                          {lang === 'am' ? 'አባወራ/እማወራ (>35)' : 'Adult'}
                        </span>
                      );
                    }
                  }

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-4 font-semibold text-slate-900 dark:text-white">
                        {m.name}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        {m.chapelAmharic}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">
                        {m.roleInFamily === 'Head'
                          ? lang === 'am' ? 'የቤተሰብ ራስ' : 'Head'
                          : m.roleInFamily === 'Spouse'
                          ? lang === 'am' ? 'አጋር' : 'Spouse'
                          : lang === 'am' ? 'ልጅ' : 'Child'}
                      </td>

                      {/* Fast Age Editor Cell */}
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjustAge(m.id, -1)}
                            className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                            title="Minus 1 Year"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <input
                            type="number"
                            min={0}
                            max={120}
                            value={currentAge !== null ? currentAge : ''}
                            onChange={e => handleAgeChange(m.id, e.target.value)}
                            placeholder="—"
                            className="w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                          />

                          <button
                            type="button"
                            onClick={() => handleAdjustAge(m.id, 1)}
                            className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                            title="Plus 1 Year"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="py-2 px-3">{categoryBadge}</td>
                      <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                        {m.phoneNumber || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80">
          <div className="text-xs text-slate-500">
            {hasChanges && (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span>●</span> {lang === 'am' ? 'ያልተቀመጡ ማስተካከያዎች አሉ!' : 'You have unsaved age updates'}
              </span>
            )}
            {saveSuccess && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'am' ? 'የአባላት ዕድሜ በተሳካ ሁኔታ ተቀይሯል!' : 'Ages saved successfully!'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.cancel}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{lang === 'am' ? 'ሁሉንም ማስተካከያዎች መዝግብ (Save All Ages)' : 'Save All Age Updates'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
