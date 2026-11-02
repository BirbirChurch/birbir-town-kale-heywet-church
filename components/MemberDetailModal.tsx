'use client';

import React, { useState } from 'react';
import { X, User, Phone, Home, BookOpen, Check, Copy, Award, Edit3, Save } from 'lucide-react';
import { MemberRecord, Household } from '../lib/types';
import { Language, TRANSLATIONS } from '../lib/translations';

interface MemberDetailModalProps {
  member: MemberRecord | null;
  household: Household | null;
  lang: Language;
  onClose: () => void;
  onSelectMember: (m: MemberRecord) => void;
  onUpdateMember: (updated: MemberRecord) => void;
}

export default function MemberDetailModal({
  member,
  household,
  lang,
  onClose,
  onSelectMember,
  onUpdateMember,
}: MemberDetailModalProps) {
  const t = TRANSLATIONS[lang];
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [name, setName] = useState(member?.name || '');
  const [age, setAge] = useState<string>(member?.age !== null ? String(member?.age) : '');
  const [occupation, setOccupation] = useState(member?.occupation || '');
  const [education, setEducation] = useState(member?.education || '');
  const [phoneNumber, setPhoneNumber] = useState(member?.phoneNumber || '');
  const [responsibility, setResponsibility] = useState(member?.responsibility || '');
  const [spiritualEdu, setSpiritualEdu] = useState(member?.spiritualEdu || '');
  const [baptism, setBaptism] = useState(member?.baptism || 'የተጠመቀ');
  const [lordSupper, setLordSupper] = useState(member?.lordSupper || 'የሚካፈል');
  const [tithe, setTithe] = useState(member?.tithe || 'የሚከፍል');
  const [houseCondition, setHouseCondition] = useState(member?.houseCondition || 'የግል');

  if (!member) return null;

  const handleCopyPhone = () => {
    if (!member.phoneNumber) return;
    navigator.clipboard.writeText(member.phoneNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSave = () => {
    const updated: MemberRecord = {
      ...member,
      name,
      age: age ? Number(age) : null,
      occupation,
      education,
      phoneNumber,
      responsibility,
      spiritualEdu,
      baptism,
      lordSupper,
      tithe,
      houseCondition,
    };
    onUpdateMember(updated);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {member.name}
                </h3>
                <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">
                  {lang === 'am' ? member.chapelAmharic : member.chapel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {member.roleInFamily === 'Head'
                  ? lang === 'am' ? 'የቤተሰብ ራስ' : 'Head of Family'
                  : member.roleInFamily === 'Spouse'
                  ? lang === 'am' ? 'የትዳር አጋር' : 'Spouse'
                  : lang === 'am' ? 'ልጅ' : 'Child'}
                {' · '}
                {lang === 'am' ? `የቤተሰብ ቁጥር #${member.familyNo}` : `Family #${member.familyNo}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isEditing ? 'Cancel Edit' : 'Edit Member'}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {isEditing ? (
            /* Edit Form */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.name}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.age}
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.phone}
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.occupation}
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={e => setOccupation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.education}
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.responsibility}
                </label>
                <input
                  type="text"
                  value={responsibility}
                  onChange={e => setResponsibility(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.spiritualEdu}
                </label>
                <input
                  type="text"
                  value={spiritualEdu}
                  onChange={e => setSpiritualEdu(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.houseOwnership}
                </label>
                <select
                  value={houseCondition}
                  onChange={e => setHouseCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="የግል">የግል (Owned)</option>
                  <option value="ክራይ">ክራይ (Rented)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.baptismStatus}
                </label>
                <select
                  value={baptism}
                  onChange={e => setBaptism(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="የተጠመቀ">የተጠመቀ (Baptized)</option>
                  <option value="ያልተጠመቀ">ያልተጠመቀ (Not Baptized)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.lordSupperStatus}
                </label>
                <select
                  value={lordSupper}
                  onChange={e => setLordSupper(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="የሚካፈል">የሚካፈል (Participates)</option>
                  <option value="የማይካፈል">የማይካፈል (Does not)</option>
                </select>
              </div>

              <div className="col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.save}</span>
                </button>
              </div>
            </div>
          ) : (
            /* View Details */
            <>
              {/* Demographics & Secular Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block">{t.age}</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {member.age !== null ? `${member.age} ዓመት` : '—'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">{t.gender}</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {member.gender === 'Male' ? (lang === 'am' ? 'ወንድ' : 'Male') : (lang === 'am' ? 'ሴት' : 'Female')}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">{t.occupation}</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {member.occupation || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">{t.education}</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {member.education || '—'}
                  </span>
                </div>
              </div>

              {/* Spiritual Life Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>{lang === 'am' ? 'መንፈሳዊ ሁኔታ እና አገልግሎት' : 'Spiritual Journey & Ministry'}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block">{t.baptismStatus}</span>
                    <span
                      className={`text-sm font-bold ${
                        member.baptism === 'የተጠመቀ' ? 'text-emerald-600' : 'text-slate-500'
                      }`}
                    >
                      {member.baptism || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">{t.lordSupperStatus}</span>
                    <span
                      className={`text-sm font-bold ${
                        member.lordSupper === 'የሚካፈል' ? 'text-blue-600' : 'text-slate-500'
                      }`}
                    >
                      {member.lordSupper || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">{t.titheStatus}</span>
                    <span
                      className={`text-sm font-bold ${
                        member.tithe === 'የሚከፍል' ? 'text-teal-600' : 'text-slate-500'
                      }`}
                    >
                      {member.tithe || '—'}
                    </span>
                  </div>
                </div>

                {/* Ministry & Spiritual Education */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block">{t.responsibility}</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {member.responsibility || 'አባል'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">{t.spiritualEdu}</span>
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      {member.spiritualEdu || (lang === 'am' ? 'አልተጠቀሰም' : 'None listed')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact & Housing */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block">{t.phone}</span>
                  {member.phoneNumber ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <a
                        href={`tel:${member.phoneNumber}`}
                        className="text-sm font-bold font-mono text-teal-700 dark:text-teal-400 hover:underline"
                      >
                        {member.phoneNumber}
                      </a>
                      <button
                        onClick={handleCopyPhone}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        title="Copy phone"
                      >
                        {copiedPhone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400">
                      {lang === 'am' ? 'ስልክ አልተመዘገበም' : 'No phone registered'}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block">{t.houseOwnership}</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {member.houseCondition || 'የግል'}
                  </span>
                </div>
              </div>

              {/* Household Family Members Connection */}
              {household && household.allMembers.length > 1 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {t.familyMembers} ({household.allMembers.length})
                  </h4>
                  <div className="space-y-1">
                    {household.allMembers.map(fm => {
                      const isCurrent = fm.id === member.id;
                      return (
                        <div
                          key={fm.id}
                          onClick={() => !isCurrent && onSelectMember(fm)}
                          className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                            isCurrent
                              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-semibold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{fm.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({fm.roleInFamily === 'Head' ? 'ራስ' : fm.roleInFamily === 'Spouse' ? 'አጋር' : 'ልጅ'})
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 tabular-nums font-mono">
                            {fm.age !== null ? `${fm.age} yrs` : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
