'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Phone, Check, Copy, User, ChevronLeft, ChevronRight, X, UploadCloud, Calendar } from 'lucide-react';
import { MemberRecord } from '../lib/types';
import { Language, TRANSLATIONS } from '../lib/translations';

interface DirectoryViewProps {
  members: MemberRecord[];
  lang: Language;
  onSelectMember: (member: MemberRecord) => void;
  onOpenImportModal?: () => void;
  onOpenBatchAgeModal?: () => void;
}

export default function DirectoryView({
  members,
  lang,
  onSelectMember,
  onOpenImportModal,
  onOpenBatchAgeModal,
}: DirectoryViewProps) {
  const t = TRANSLATIONS[lang];

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [baptismFilter, setBaptismFilter] = useState<'all' | 'baptized' | 'not_baptized'>('all');
  const [lordSupperFilter, setLordSupperFilter] = useState<'all' | 'participates' | 'does_not'>('all');
  const [titheFilter, setTitheFilter] = useState<'all' | 'gives' | 'does_not'>('all');
  const [ageFilter, setAgeFilter] = useState<'all' | 'child' | 'youth' | 'adult' | 'senior'>('all');
  const [housingFilter, setHousingFilter] = useState<'all' | 'owned' | 'rented'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesPhone = m.phoneNumber.includes(q);
        const matchesOcc = m.occupation.toLowerCase().includes(q);
        const matchesEdu = m.education.toLowerCase().includes(q);
        const matchesResp = m.responsibility.toLowerCase().includes(q);
        const matchesChapel = m.chapel.toLowerCase().includes(q) || m.chapelAmharic.includes(q);
        if (!matchesName && !matchesPhone && !matchesOcc && !matchesEdu && !matchesResp && !matchesChapel) {
          return false;
        }
      }

      // Gender
      if (genderFilter !== 'all' && m.gender !== genderFilter) {
        return false;
      }

      // Baptism
      if (baptismFilter === 'baptized' && m.baptism !== 'የተጠመቀ') return false;
      if (baptismFilter === 'not_baptized' && m.baptism !== 'ያልተጠመቀ') return false;

      // Lord's Supper
      if (lordSupperFilter === 'participates' && m.lordSupper !== 'የሚካፈል') return false;
      if (lordSupperFilter === 'does_not' && m.lordSupper !== 'የማይካፈል') return false;

      // Tithe
      if (titheFilter === 'gives' && m.tithe !== 'የሚከፍል') return false;
      if (titheFilter === 'does_not' && m.tithe !== 'የማይከፍል') return false;

      // Age group
      if (ageFilter !== 'all') {
        if (m.age === null) return false;
        if (ageFilter === 'child' && m.age >= 13) return false;
        if (ageFilter === 'youth' && (m.age < 13 || m.age >= 30)) return false;
        if (ageFilter === 'adult' && (m.age < 30 || m.age >= 60)) return false;
        if (ageFilter === 'senior' && m.age < 60) return false;
      }

      // Housing
      if (housingFilter === 'owned' && m.houseCondition !== 'የግል') return false;
      if (housingFilter === 'rented' && m.houseCondition !== 'ክራይ') return false;

      return true;
    });
  }, [
    members,
    search,
    genderFilter,
    baptismFilter,
    lordSupperFilter,
    titheFilter,
    ageFilter,
    housingFilter,
  ]);

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, page, pageSize]);

  const handleCopyPhone = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const activeFilterCount =
    (genderFilter !== 'all' ? 1 : 0) +
    (baptismFilter !== 'all' ? 1 : 0) +
    (lordSupperFilter !== 'all' ? 1 : 0) +
    (titheFilter !== 'all' ? 1 : 0) +
    (ageFilter !== 'all' ? 1 : 0) +
    (housingFilter !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setSearch('');
    setGenderFilter('all');
    setBaptismFilter('all');
    setLordSupperFilter('all');
    setTitheFilter('all');
    setAgeFilter('all');
    setHousingFilter('all');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle, Batch Age Modal, & Page Size */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenBatchAgeModal && (
              <button
                type="button"
                onClick={onOpenBatchAgeModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
                title="Update all member ages in batch"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{lang === 'am' ? 'በጅምላ ዕድሜ ማደሻ' : 'Batch Age Update'}</span>
              </button>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                activeFilterCount > 0
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{t.filterBy}</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline px-2 py-1"
              >
                {t.clearFilters}
              </button>
            )}

            <div className="text-xs text-slate-500 dark:text-slate-400 pl-2 border-l border-slate-200 dark:border-slate-700">
              <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                {filteredMembers.length}
              </span>{' '}
              {lang === 'am' ? 'አባላት ተገኝተዋል' : 'records found'}
            </div>
          </div>
        </div>

        {/* Filter Drawer / Accordion */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* Gender */}
            <div>
              <label className="block font-medium text-slate-500 dark:text-slate-400 mb-1">
                {t.gender}
              </label>
              <select
                value={genderFilter}
                onChange={e => {
                  setGenderFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">{lang === 'am' ? 'ሁሉም ጾታ' : 'All Genders'}</option>
                <option value="Male">{lang === 'am' ? 'ወንድ' : 'Male'}</option>
                <option value="Female">{lang === 'am' ? 'ሴት' : 'Female'}</option>
              </select>
            </div>

            {/* Baptism */}
            <div>
              <label className="block font-medium text-slate-500 dark:text-slate-400 mb-1">
                {t.baptismStatus}
              </label>
              <select
                value={baptismFilter}
                onChange={e => {
                  setBaptismFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">{lang === 'am' ? 'ሁሉም' : 'All'}</option>
                <option value="baptized">{lang === 'am' ? 'የተጠመቀ' : 'Baptized'}</option>
                <option value="not_baptized">{lang === 'am' ? 'ያልተጠመቀ' : 'Not Baptized'}</option>
              </select>
            </div>

            {/* Lord's Supper */}
            <div>
              <label className="block font-medium text-slate-500 dark:text-slate-400 mb-1">
                {t.lordSupperStatus}
              </label>
              <select
                value={lordSupperFilter}
                onChange={e => {
                  setLordSupperFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">{lang === 'am' ? 'ሁሉም' : 'All'}</option>
                <option value="participates">{lang === 'am' ? 'የሚካፈል' : 'Participates'}</option>
                <option value="does_not">{lang === 'am' ? 'የማይካፈል' : 'Does not participate'}</option>
              </select>
            </div>

            {/* Tithe */}
            <div>
              <label className="block font-medium text-slate-500 dark:text-slate-400 mb-1">
                {t.titheStatus}
              </label>
              <select
                value={titheFilter}
                onChange={e => {
                  setTitheFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">{lang === 'am' ? 'ሁሉም' : 'All'}</option>
                <option value="gives">{lang === 'am' ? 'የሚከፍል' : 'Gives Tithe'}</option>
                <option value="does_not">{lang === 'am' ? 'የማይከፍል' : 'Does not give'}</option>
              </select>
            </div>

            {/* Age Group */}
            <div>
              <label className="block font-medium text-slate-500 dark:text-slate-400 mb-1">
                {t.ageDistribution}
              </label>
              <select
                value={ageFilter}
                onChange={e => {
                  setAgeFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">{lang === 'am' ? 'ሁሉም እድሜ' : 'All Ages'}</option>
                <option value="child">{lang === 'am' ? 'ህፃናት (0-12)' : 'Children (0-12)'}</option>
                <option value="youth">{lang === 'am' ? 'ወጣቶች (13-29)' : 'Youth (13-29)'}</option>
                <option value="adult">{lang === 'am' ? 'ጎልማሶች (30-59)' : 'Adults (30-59)'}</option>
                <option value="senior">{lang === 'am' ? 'አረጋውያን (60+)' : 'Seniors (60+)'}</option>
              </select>
            </div>

            {/* Housing */}
            <div>
              <label className="block font-medium text-slate-500 dark:text-slate-400 mb-1">
                {t.houseOwnership}
              </label>
              <select
                value={housingFilter}
                onChange={e => {
                  setHousingFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">{lang === 'am' ? 'ሁሉም' : 'All'}</option>
                <option value="owned">{lang === 'am' ? 'የግል ቤት' : 'Homeowner'}</option>
                <option value="rented">{lang === 'am' ? 'የኪራይ ቤት' : 'Tenant'}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* High Density Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold tracking-wide">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-4">{t.name}</th>
                <th className="py-3 px-3">{t.chapel}</th>
                <th className="py-3 px-3 text-center">{t.age}</th>
                <th className="py-3 px-3">{t.gender}</th>
                <th className="py-3 px-3">{t.occupation}</th>
                <th className="py-3 px-3">{t.education}</th>
                <th className="py-3 px-3 text-center">{t.baptismStatus}</th>
                <th className="py-3 px-3 text-center">{t.lordSupperStatus}</th>
                <th className="py-3 px-3 text-center">{t.titheStatus}</th>
                <th className="py-3 px-3">{t.responsibility}</th>
                <th className="py-3 px-4">{t.phone}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-sm text-slate-700 dark:text-slate-300">
                      {members.length === 0
                        ? lang === 'am'
                          ? 'በዚህ ቻፕል ውስጥ እስካሁን የተመዘገበ አባል የለም'
                          : 'No members registered in this chapel yet'
                        : t.noResults}
                    </p>
                    <p className="text-xs mt-1 text-slate-500">
                      {members.length === 0
                        ? lang === 'am'
                          ? 'የዚህን ቻፕል የቆጠራ ሰንጠረዥ ዳታ በቀጥታ እዚህ መለጠፍ ወይም ፋይል መጫን ይችላሉ'
                          : 'You can paste the census records or upload a table file for this chapel'
                        : t.noResultsDesc}
                    </p>
                    {members.length === 0 && onOpenImportModal ? (
                      <button
                        onClick={onOpenImportModal}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>
                          {lang === 'am' ? 'የቻፕሉን መረጃ አስገባ (Import Data)' : 'Import Chapel Records'}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={resetFilters}
                        className="mt-3 px-3 py-1 text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                      >
                        {t.clearFilters}
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member, index) => {
                  const absoluteIndex = (page - 1) * pageSize + index + 1;
                  const isBaptized = member.baptism === 'የተጠመቀ';
                  const isLordSupper = member.lordSupper === 'የሚካፈል';
                  const isTithe = member.tithe === 'የሚከፍል';

                  return (
                    <tr
                      key={member.id}
                      onClick={() => onSelectMember(member)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      {/* Number */}
                      <td className="py-2.5 px-3 text-center text-slate-400 dark:text-slate-500 font-mono tabular-nums text-[11px]">
                        {absoluteIndex}
                      </td>

                      {/* Name & Role */}
                      <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {member.name}
                          </span>
                          {member.roleInFamily === 'Head' && (
                            <span className="text-[10px] text-teal-700 dark:text-teal-400 font-normal">
                              ({lang === 'am' ? 'ራስ' : 'Head'})
                            </span>
                          )}
                          {member.roleInFamily === 'Spouse' && (
                            <span className="text-[10px] text-purple-700 dark:text-purple-400 font-normal">
                              ({lang === 'am' ? 'አጋር' : 'Spouse'})
                            </span>
                          )}
                          {member.roleInFamily === 'Child' && (
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-normal">
                              ({lang === 'am' ? 'ልጅ' : 'Child'})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Chapel */}
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {lang === 'am' ? member.chapelAmharic : member.chapel}
                      </td>

                      {/* Age */}
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {member.age !== null ? member.age : '—'}
                      </td>

                      {/* Gender */}
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {member.gender === 'Male'
                          ? lang === 'am'
                            ? 'ወንድ'
                            : 'Male'
                          : lang === 'am'
                          ? 'ሴት'
                          : 'Female'}
                      </td>

                      {/* Occupation */}
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-[140px] truncate" title={member.occupation}>
                        {member.occupation || '—'}
                      </td>

                      {/* Education */}
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-[120px] truncate" title={member.education}>
                        {member.education || '—'}
                      </td>

                      {/* Baptism */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block text-[11px] font-medium ${
                            isBaptized
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {isBaptized ? (lang === 'am' ? 'የተጠመቀ' : 'Yes') : (lang === 'am' ? 'ያልተጠመቀ' : 'No')}
                        </span>
                      </td>

                      {/* Lord's Supper */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block text-[11px] font-medium ${
                            isLordSupper
                              ? 'text-blue-700 dark:text-blue-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {isLordSupper ? (lang === 'am' ? 'የሚካፈል' : 'Yes') : (lang === 'am' ? 'የማይካፈል' : 'No')}
                        </span>
                      </td>

                      {/* Tithe */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block text-[11px] font-medium ${
                            isTithe
                              ? 'text-teal-700 dark:text-teal-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {isTithe ? (lang === 'am' ? 'የሚከፍል' : 'Yes') : (lang === 'am' ? 'የማይከፍል' : 'No')}
                        </span>
                      </td>

                      {/* Responsibility */}
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 max-w-[130px] truncate">
                        {member.responsibility ? (
                          <span className="font-semibold text-teal-800 dark:text-teal-300">
                            {member.responsibility}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {member.phoneNumber ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${member.phoneNumber}`}
                              onClick={e => e.stopPropagation()}
                              className="text-slate-800 dark:text-slate-200 font-mono text-[11px] hover:text-teal-600 dark:hover:text-teal-400"
                            >
                              {member.phoneNumber}
                            </a>
                            <button
                              onClick={e => handleCopyPhone(e, member.phoneNumber)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                              title="Copy phone"
                            >
                              {copiedPhone === member.phoneNumber ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary Footer */}
        {filteredMembers.length > 0 && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>
                {lang === 'am' ? 'ገጽ' : 'Page'}{' '}
                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  {page}
                </span>{' '}
                {lang === 'am' ? 'ከ' : 'of'}{' '}
                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  {totalPages}
                </span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span>
                {lang === 'am' ? 'በአንድ ገጽ:' : 'Rows per page:'}
              </span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="py-1 px-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{lang === 'am' ? 'ቀዳሚ' : 'Prev'}</span>
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <span>{lang === 'am' ? 'ቀጣይ' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
