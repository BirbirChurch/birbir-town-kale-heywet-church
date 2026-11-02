'use client';

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Users,
  Phone,
  CheckCircle2,
  ArrowRight,
  Trash2,
  ShieldAlert,
  GitMerge,
  Eye,
  Check,
  Search,
} from 'lucide-react';
import { MemberRecord, Household } from '../lib/types';
import { CrossChapelConflict } from '../lib/deduplication';
import { Language, TRANSLATIONS } from '../lib/translations';

interface CrossChapelAuditModalProps {
  conflicts: CrossChapelConflict[];
  lang: Language;
  onClose: () => void;
  onKeepInChapelOnly: (conflict: CrossChapelConflict, chosenChapelId: string) => void;
  onMergeFamiliesToChapel: (conflict: CrossChapelConflict, targetChapelId: string) => void;
  onIgnoreConflict: (conflictId: string) => void;
  onSelectMember?: (member: MemberRecord) => void;
}

export default function CrossChapelAuditModal({
  conflicts,
  lang,
  onClose,
  onKeepInChapelOnly,
  onMergeFamiliesToChapel,
  onIgnoreConflict,
  onSelectMember,
}: CrossChapelAuditModalProps) {
  const t = TRANSLATIONS[lang];
  const [filterType, setFilterType] = useState<'all' | 'same_head_name' | 'same_phone'>('all');
  const [search, setSearch] = useState('');
  const [activeConflictId, setActiveConflictId] = useState<string | null>(
    conflicts.length > 0 ? conflicts[0].id : null
  );

  const filteredConflicts = conflicts.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.titleAmharic.toLowerCase().includes(q) ||
        c.titleEnglish.toLowerCase().includes(q) ||
        c.commonValue.toLowerCase().includes(q) ||
        c.chapels.some(ch => ch.nameAmharic.includes(q) || ch.nameEnglish.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeConflict = conflicts.find(c => c.id === activeConflictId) || filteredConflicts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 dark:bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {lang === 'am'
                    ? 'የተመሳሳይ ቤተሰቦችና አባላት ማጣሪያ (Cross-Chapel Audit)'
                    : 'Cross-Chapel Duplicates & Family Reconciliation'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  {conflicts.length} {lang === 'am' ? 'ጉዳዮች' : 'conflicts'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'am'
                  ? 'በተለያዩ ቻፕሎች ውስጥ የተደገሙ ተመሳሳይ የቤተሰብ ራሶች ወይም ስልክ ቁጥሮች ማጣሪያና ውሳኔ መስጫ'
                  : 'Identify and reconcile duplicate families or phone numbers registered in multiple chapels'}
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

        {/* Filters Strip */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {lang === 'am' ? `ሁሉም (${conflicts.length})` : `All (${conflicts.length})`}
            </button>
            <button
              onClick={() => setFilterType('same_head_name')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'same_head_name'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {lang === 'am' ? 'ተመሳሳይ የቤተሰብ ራስ' : 'Same Family Head'}
            </button>
            <button
              onClick={() => setFilterType('same_phone')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'same_phone'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {lang === 'am' ? 'ተመሳሳይ ስልክ' : 'Same Phone'}
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'am' ? 'በስም ወይም በስልክ ፈልግ...' : 'Search by name or phone...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Content Body (Split view: list on left, detail resolution on right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left List of conflicts */}
          <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-800 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 shrink-0 max-h-60 md:max-h-full">
            {filteredConflicts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                  {lang === 'am'
                    ? 'ምንም የተደራረበ ወይም ግጭት ያለበት መረጃ የለም!'
                    : 'No conflicts or duplicates found!'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === 'am'
                    ? 'ሁሉም ቤተሰቦች በትክክለኛ ቻፕላቸው ተመዝግበዋል።'
                    : 'All records are cleanly separated across chapels.'}
                </p>
              </div>
            ) : (
              filteredConflicts.map((c, index) => {
                const isActive = activeConflict?.id === c.id;
                return (
                  <button
                    key={`${c.id}-${index}`}
                    onClick={() => setActiveConflictId(c.id)}
                    className={`w-full text-left p-3.5 transition-colors ${
                      isActive
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-l-4 border-amber-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {c.commonValue}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        {c.type === 'same_head_name'
                          ? lang === 'am'
                            ? 'የራስ ስም'
                            : 'Head'
                          : lang === 'am'
                          ? 'ስልክ'
                          : 'Phone'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {c.chapels.map((ch, chIdx) => (
                        <span
                          key={`${ch.id}-${chIdx}`}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300"
                        >
                          {lang === 'am' ? ch.nameAmharic : ch.nameEnglish}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Resolution Panel */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {activeConflict ? (
              <div className="space-y-6">
                {/* Conflict Notice Card */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                        {lang === 'am' ? activeConflict.titleAmharic : activeConflict.titleEnglish}
                      </h4>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      {lang === 'am'
                        ? activeConflict.descriptionAmharic
                        : activeConflict.descriptionEnglish}
                    </p>
                  </div>
                  <button
                    onClick={() => onIgnoreConflict(activeConflict.id)}
                    className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-[11px] font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors whitespace-nowrap shrink-0"
                  >
                    {lang === 'am' ? 'የተለያዩ ሰዎች ናቸው (አሳልፍ)' : 'Ignore (Mark as Separate)'}
                  </button>
                </div>

                {/* Side-by-side comparison of households in each chapel */}
                <div>
                  <h5 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    <span>
                      {lang === 'am'
                        ? 'በእያንዳንዱ ቻፕል ውስጥ የተመዘገቡት ቤተሰቦች ንጽጽር:'
                        : 'Comparison of Records in Each Chapel:'}
                    </span>
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeConflict.households.map((hh, idx) => (
                      <div
                        key={`${hh.id || 'hh'}-${hh.chapel}-${idx}`}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 space-y-3.5 shadow-xs"
                      >
                        {/* Chapel & Family Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2.5">
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                            {lang === 'am' ? hh.chapelAmharic : hh.chapel}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {lang === 'am' ? 'ቤተሰብ #' : 'Family #'}{hh.familyNo}
                          </span>
                        </div>

                        {/* Head & Spouse details */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">{lang === 'am' ? 'የቤተሰብ ራስ:' : 'Head:'}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{hh.headName}</span>
                          </div>
                          {hh.spouseName && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">{lang === 'am' ? 'አጋር:' : 'Spouse:'}</span>
                              <span className="font-medium text-slate-700 dark:text-slate-200">{hh.spouseName}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-400">{lang === 'am' ? 'ስልክ:' : 'Phone:'}</span>
                            <span className="font-mono text-slate-800 dark:text-slate-200">{hh.primaryPhone || '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">{lang === 'am' ? 'ቤት:' : 'Housing:'}</span>
                            <span>{hh.houseCondition}</span>
                          </div>
                        </div>

                        {/* Children List */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                            {lang === 'am'
                              ? `ልጆች (${hh.children.length}):`
                              : `Children (${hh.children.length}):`}
                          </span>
                          {hh.children.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {hh.children.map((ch, chIdx) => (
                                <span
                                  key={`${ch.id || 'ch'}-${chIdx}`}
                                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                                >
                                  {ch.name} {ch.age ? `(${ch.age})` : ''}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {lang === 'am' ? 'ምንም ልጅ አልተመዘገበም' : 'No children registered'}
                            </span>
                          )}
                        </div>

                        {/* Individual Action for this chapel */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onKeepInChapelOnly(activeConflict, hh.chapel.toLowerCase())
                            }
                            className="w-full py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {lang === 'am'
                                ? `በ${hh.chapelAmharic} ብቻ አስቀር (ከሌላው ሰርዝ)`
                                : `Keep in ${hh.chapel} only (Delete from other)`}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onMergeFamiliesToChapel(activeConflict, hh.chapel.toLowerCase())
                            }
                            className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <GitMerge className="w-3.5 h-3.5 text-teal-600" />
                            <span>
                              {lang === 'am'
                                ? `ሁሉንም አባላት ወደ ${hh.chapelAmharic} አዋህድ`
                                : `Merge all members into ${hh.chapel}`}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-60" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                  {lang === 'am'
                    ? 'ሁሉም የቻፕል መረጃዎች ንጹህ ናቸው!'
                    : 'All chapel records are clean!'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'am'
                    ? 'በተለያዩ ቻፕሎች ውስጥ የተደጋገመ ቤተሰብ ወይም ስልክ አልተገኘም።'
                    : 'No cross-chapel duplicates or conflicts detected.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80">
          <span className="text-xs text-slate-500">
            {lang === 'am'
              ? 'ማስታወሻ፦ አንድ ቤተሰብ ወደ አንዱ ቻፕል ሲዋሃድ የልጆቹ እና የቤተሰቡ መረጃዎች ሙሉ በሙሉ ተጠብቀው ይዘዋወራሉ።'
              : 'Note: Merging families transfers all children and spouse records to the destination chapel.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition-opacity"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
