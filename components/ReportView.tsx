'use client';

import React, { useState } from 'react';
import { Printer, Download, FileSpreadsheet, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MemberRecord, Household, CensusStats } from '../lib/types';
import { Language, TRANSLATIONS } from '../lib/translations';

interface ReportViewProps {
  members: MemberRecord[];
  households: Household[];
  stats: CensusStats;
  lang: Language;
  selectedChapelName: string;
}

export default function ReportView({
  members,
  households,
  stats,
  lang,
  selectedChapelName,
}: ReportViewProps) {
  const t = TRANSLATIONS[lang];
  const currentDate = new Date().toLocaleDateString(lang === 'am' ? 'am-ET' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // UTF-8 BOM to ensure Amharic Ge'ez characters display correctly in Excel
    const BOM = '\uFEFF';
    const headers = [
      'ID',
      'Chapel',
      'Family_No',
      'Role_In_Family',
      'Full_Name',
      'Age',
      'Gender',
      'Occupation',
      'Education',
      'Baptism',
      'Lord_Supper',
      'Tithe',
      'Marital_Status',
      'Membership',
      'Housing',
      'Responsibility',
      'Spiritual_Education',
      'Phone_Number',
    ];

    const rows = members.map(m => [
      m.id,
      m.chapel,
      m.familyNo,
      m.roleInFamily,
      `"${m.name.replace(/"/g, '""')}"`,
      m.age !== null ? m.age : '',
      m.gender,
      `"${m.occupation.replace(/"/g, '""')}"`,
      `"${m.education.replace(/"/g, '""')}"`,
      m.baptism,
      m.lordSupper,
      m.tithe,
      m.marriage,
      m.participation,
      m.houseCondition,
      `"${m.responsibility.replace(/"/g, '""')}"`,
      `"${m.spiritualEdu.replace(/"/g, '""')}"`,
      m.phoneNumber,
    ]);

    const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `church_census_${selectedChapelName.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar (Hidden when printing) */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t.officialReport}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'am'
              ? 'ይህ ሰነድ ለጉባዔ አስተዳደር፣ ለህትመት እና ለ Excel ኤክስፖርት የተዘጋጀ ነው'
              : 'Official formatted report for leadership review, physical print, or Excel export.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.exportCSV}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printReport}</span>
          </button>
        </div>
      </div>

      {/* Official Printable Report Document */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm transition-colors print:border-none print:shadow-none print:p-0">
        {/* Document Letterhead */}
        <div className="text-center pb-6 border-b-2 border-slate-900 dark:border-slate-700 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-teal-700 dark:text-teal-400">
              {lang === 'am' ? 'የኢትዮጵያ ቃለ ሕይወት ቤተክርስቲያን' : 'Ethiopian Kale Heywet Church'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {lang === 'am'
              ? 'ብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን - የቻፕሎች መረጃ ቋት'
              : 'Birbir Town Kale Heywet Church Membership Census Registry'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {selectedChapelName} · {t.reportDate}: {currentDate}
          </p>
        </div>

        {/* Statistical Summary Box */}
        <div className="mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">{t.totalMembers}</span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {stats.totalMembers}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              ({stats.males} ወንድ / {stats.females} ሴት)
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">{t.totalHouseholds}</span>
            <span className="text-xl font-bold font-mono text-teal-700 dark:text-teal-400 tabular-nums">
              {stats.totalHouseholds}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {stats.ownedHomes} የግል / {stats.rentedHomes} ኪራይ
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">{t.baptized}</span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {stats.baptizedCount} ({stats.baptizedPercentage}%)
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {stats.lordSupperCount} የጌታ እራት ተካፋዮች
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">{t.titheGivers}</span>
            <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
              {stats.titheCount} ({stats.tithePercentage}%)
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {stats.leadershipCount} አገልጋዮችና መሪዎች
            </span>
          </div>
        </div>

        {/* Chapel Comparison Table */}
        <div className="mb-6 overflow-x-auto">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            {t.chapelBreakdown}
          </h4>
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              <tr>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">ቻፕል (Chapel)</th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 text-center">ቤተሰቦች (Households)</th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 text-center">አባላት (Members)</th>
                <th className="py-2 px-3 text-center">ድርሻ (Share %)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-mono">
              {stats.chapelBreakdown.map(c => {
                const pct = stats.totalMembers > 0 ? ((c.count / stats.totalMembers) * 100).toFixed(1) : '0';
                return (
                  <tr key={c.chapel}>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 font-sans font-medium text-slate-800 dark:text-slate-200">
                      {lang === 'am' ? c.chapelAmharic : c.chapel}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 text-center tabular-nums">
                      {c.households}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 text-center tabular-nums font-bold">
                      {c.count}
                    </td>
                    <td className="py-2 px-3 text-center tabular-nums">
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Printable Sample Registry Rows */}
        <div className="overflow-x-auto mb-8">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            {lang === 'am' ? 'የተመረጡ አባላት ማውጫ ቅጽ' : 'Selected Members Sample Ledger'}
          </h4>
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
              <tr>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-center w-10">#</th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">{t.name}</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-center">{t.age}</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700">{t.gender}</th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">{t.occupation}</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-center">{t.baptismStatus}</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-center">{t.lordSupperStatus}</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-center">{t.titheStatus}</th>
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700">{t.responsibility}</th>
                <th className="py-2 px-3">{t.phone}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-[11px]">
              {members.slice(0, 50).map((m, i) => (
                <tr key={m.id} className="print-break-inside-avoid">
                  <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-700 text-center font-mono tabular-nums text-slate-500">
                    {i + 1}
                  </td>
                  <td className="py-1.5 px-3 border-r border-slate-200 dark:border-slate-700 font-medium">
                    {m.name}
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-700 text-center font-mono tabular-nums">
                    {m.age ?? '—'}
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-700">
                    {m.gender === 'Male' ? 'ወንድ' : 'ሴት'}
                  </td>
                  <td className="py-1.5 px-3 border-r border-slate-200 dark:border-slate-700">
                    {m.occupation || '—'}
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-700 text-center">
                    {m.baptism || '—'}
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-700 text-center">
                    {m.lordSupper || '—'}
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-700 text-center">
                    {m.tithe || '—'}
                  </td>
                  <td className="py-1.5 px-3 border-r border-slate-200 dark:border-slate-700 font-medium text-teal-800 dark:text-teal-300">
                    {m.responsibility || '—'}
                  </td>
                  <td className="py-1.5 px-3 font-mono text-[10px]">
                    {m.phoneNumber || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length > 50 && (
            <p className="text-[11px] text-slate-400 mt-2 text-center no-print">
              {lang === 'am'
                ? `(በዚህ ናሙና የመጀመሪያዎቹ 50 አባላት ብቻ ታይተዋል። ሁሉንም ${members.length} አባላት ወደ Excel አውርደው ማየት ይችላሉ)`
                : `(Showing first 50 members in print preview. Download Excel for full ${members.length} records)`}
            </p>
          )}
        </div>

        {/* Official Church Seal & Signatures */}
        <div className="pt-8 border-t border-slate-300 dark:border-slate-700 grid grid-cols-2 gap-8 text-xs">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-12">
              {lang === 'am' ? 'የቻፕል አስተዳዳሪ ፊርማ:' : 'Chapel Administrator Signature:'}
            </p>
            <div className="w-48 border-b border-slate-400 dark:border-slate-600 mb-1" />
            <span className="text-[11px] text-slate-500">
              {lang === 'am' ? 'ስም እና ቀን' : 'Name & Date'}
            </span>
          </div>

          <div className="text-right">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-12">
              {t.churchSeal}
            </p>
            <div className="w-32 h-20 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg ml-auto flex items-center justify-center text-[10px] text-slate-400">
              {lang === 'am' ? 'የማህተም ቦታ' : 'Official Seal'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
