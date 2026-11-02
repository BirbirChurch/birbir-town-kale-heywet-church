'use client';

import React from 'react';
import { Users, Plus, Globe, Moon, Sun, UploadCloud, ShieldAlert } from 'lucide-react';
import { Language, TRANSLATIONS } from '../lib/translations';

export type ActiveTab = 'portals' | 'spiritual' | 'plan' | 'directory' | 'households' | 'analytics' | 'report';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  lang: Language;
  onLangToggle: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  conflictCount?: number;
  onOpenAuditModal?: () => void;
}

export default function Navbar({
  activeTab,
  onTabChange,
  lang,
  onLangToggle,
  darkMode,
  onDarkModeToggle,
  onOpenAddModal,
  onOpenImportModal,
  conflictCount = 0,
  onOpenAuditModal,
}: NavbarProps) {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <button
              onClick={() => onTabChange('portals')}
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap text-left hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              {t.brandName}
            </button>
          </div>

          {/* Zone 2: Clean Single-Line Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 sm:gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => onTabChange('portals')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'portals'
                  ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 font-semibold ring-1 ring-teal-500/30'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.navPortals}
            </button>
            <button
              onClick={() => onTabChange('spiritual')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'spiritual'
                  ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 font-semibold ring-1 ring-teal-500/30'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.navSpiritual}
            </button>
            <button
              onClick={() => onTabChange('plan')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'plan'
                  ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-amber-500/40'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.navPlan}
            </button>
            <button
              onClick={() => onTabChange('directory')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.navDirectory}
            </button>
            <button
              onClick={() => onTabChange('households')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'households'
                  ? 'bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.navHouseholds}
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.navAnalytics}
            </button>
            <button
              onClick={() => onTabChange('report')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.navReport}
            </button>
          </nav>

          {/* Zone 3: Primary Action & Toggles */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onLangToggle}
              title={lang === 'am' ? 'Switch to English' : 'ወደ አማርኛ ቀይር'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'am' ? 'English' : 'አማርኛ'}</span>
            </button>

            <button
              onClick={onDarkModeToggle}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {onOpenAuditModal && (
              <button
                onClick={onOpenAuditModal}
                title={lang === 'am' ? 'የተደጋገሙ ቤተሰቦች ማጣሪያ' : 'Cross-Chapel Duplicates & Audit'}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  conflictCount > 0
                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 hover:bg-amber-100'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldAlert
                  className={`w-3.5 h-3.5 ${
                    conflictCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                  }`}
                />
                <span>{lang === 'am' ? 'ማጣሪያ' : 'Audit'}</span>
                {conflictCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-mono font-bold">
                    {conflictCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenImportModal}
              title={lang === 'am' ? 'የቻፕሎች ቆጠራ ዳታ አስገባ' : 'Batch Import Data'}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <UploadCloud className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{lang === 'am' ? 'ዳታ አስገባ' : 'Import'}</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addMember}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800 gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onTabChange('portals')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'portals' ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold' : ''
            }`}
          >
            {t.navPortals}
          </button>
          <button
            onClick={() => onTabChange('spiritual')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'spiritual' ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold' : ''
            }`}
          >
            {t.navSpiritual}
          </button>
          <button
            onClick={() => onTabChange('plan')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'plan' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold' : ''
            }`}
          >
            {t.navPlan}
          </button>
          <button
            onClick={() => onTabChange('directory')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'directory' ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold' : ''
            }`}
          >
            {t.navDirectory}
          </button>
          <button
            onClick={() => onTabChange('households')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'households' ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold' : ''
            }`}
          >
            {t.navHouseholds}
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'analytics' ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold' : ''
            }`}
          >
            {t.navAnalytics}
          </button>
          <button
            onClick={() => onTabChange('report')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'report' ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold' : ''
            }`}
          >
            {t.navReport}
          </button>
        </div>
      </div>
    </header>
  );
}
