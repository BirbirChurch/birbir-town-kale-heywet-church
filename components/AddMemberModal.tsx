'use client';

import React, { useState } from 'react';
import { X, Plus, UserPlus } from 'lucide-react';
import { MemberRecord } from '../lib/types';
import { CHAPELS } from '../lib/churchData';
import { Language, TRANSLATIONS } from '../lib/translations';

interface AddMemberModalProps {
  lang: Language;
  onClose: () => void;
  onAddMember: (newMember: Omit<MemberRecord, 'id' | 'familyId'>) => void;
}

export default function AddMemberModal({
  lang,
  onClose,
  onAddMember,
}: AddMemberModalProps) {
  const t = TRANSLATIONS[lang];

  const [chapel, setChapel] = useState('Eliroi');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [roleInFamily, setRoleInFamily] = useState<'Head' | 'Spouse' | 'Child' | 'Dependent'>('Head');
  const [familyNo, setFamilyNo] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [responsibility, setResponsibility] = useState('አባል');
  const [spiritualEdu, setSpiritualEdu] = useState('');
  const [baptism, setBaptism] = useState('የተጠመቀ');
  const [lordSupper, setLordSupper] = useState('የሚካፈል');
  const [tithe, setTithe] = useState('የሚከፍል');
  const [marriage, setMarriage] = useState('ያገባ');
  const [houseCondition, setHouseCondition] = useState('የግል');

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(lang === 'am' ? 'እባክዎ ሙሉ ስም ያስገቡ' : 'Please enter full name');
      return;
    }

    const selectedChapelObj = CHAPELS.find(c => c.id === chapel.toLowerCase());

    const newRecord: Omit<MemberRecord, 'id' | 'familyId'> = {
      familyNo: familyNo ? parseInt(familyNo, 10) : 1,
      chapel,
      chapelAmharic: selectedChapelObj?.nameAmharic || chapel,
      roleInFamily,
      name: name.trim(),
      age: age ? parseInt(age, 10) : null,
      gender,
      occupation: occupation.trim(),
      education: education.trim(),
      baptism,
      lordSupper,
      tithe,
      marriage,
      participation: 'አባል',
      houseCondition,
      responsibility: responsibility.trim(),
      spiritualEdu: spiritualEdu.trim(),
      phoneNumber: phoneNumber.trim(),
      examination: '',
    };

    onAddMember(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.newRegistration}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          {/* Chapel & Family No */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.chapel} *
              </label>
              <select
                value={chapel}
                onChange={e => setChapel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Eliroi">ኤልሮኢ ቻፕል (Eliroi)</option>
                <option value="Shalom">ሻሎም ቻፕል (Shalom)</option>
                <option value="Betel">ቤቴል ቻፕል (Betel)</option>
                <option value="Yahewe">ያህዌ ቻፕል (Yahewe)</option>
                <option value="Eden">ኤዴን ቻፕል (Eden)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'am' ? 'የቤተሰብ ቁጥር (Family #)' : 'Family No.'}
              </label>
              <input
                type="number"
                value={familyNo}
                onChange={e => setFamilyNo(e.target.value)}
                placeholder="1, 2, 3..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.name} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder={t.enterName}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.familyRole}
              </label>
              <select
                value={roleInFamily}
                onChange={e => setRoleInFamily(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Head">{t.head}</option>
                <option value="Spouse">{t.spouse}</option>
                <option value="Child">{t.child}</option>
                <option value="Dependent">{t.dependent}</option>
              </select>
            </div>
          </div>

          {/* Age & Gender & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.age}
              </label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="25"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.gender}
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Male">{t.males}</option>
                <option value="Female">{t.females}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.phone}
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="0911223344"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Occupation & Secular Education */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.occupation}
              </label>
              <input
                type="text"
                value={occupation}
                onChange={e => setOccupation(e.target.value)}
                placeholder={t.enterOccupation}
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
                placeholder={t.enterEducation}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Spiritual Status Pillars */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
              {lang === 'am' ? 'መንፈሳዊ አቋም (Spiritual Standing)' : 'Spiritual Standing'}
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">{t.baptismStatus}</label>
                <select
                  value={baptism}
                  onChange={e => setBaptism(e.target.value)}
                  className="w-full py-1.5 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="የተጠመቀ">የተጠመቀ</option>
                  <option value="ያልተጠመቀ">ያልተጠመቀ</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">{t.lordSupperStatus}</label>
                <select
                  value={lordSupper}
                  onChange={e => setLordSupper(e.target.value)}
                  className="w-full py-1.5 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="የሚካፈል">የሚካፈል</option>
                  <option value="የማይካፈል">የማይካፈል</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">{t.titheStatus}</label>
                <select
                  value={tithe}
                  onChange={e => setTithe(e.target.value)}
                  className="w-full py-1.5 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="የሚከፍል">የሚከፍል</option>
                  <option value="የማይከፍል">የማይከፍል</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">{t.responsibility}</label>
                <input
                  type="text"
                  value={responsibility}
                  onChange={e => setResponsibility(e.target.value)}
                  placeholder="አባል / የቻፕል መሪ / ኳይር..."
                  className="w-full py-1.5 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">{t.spiritualEdu}</label>
                <input
                  type="text"
                  value={spiritualEdu}
                  onChange={e => setSpiritualEdu(e.target.value)}
                  placeholder="ቢቲሲፒ / ድፕሎማ..."
                  className="w-full py-1.5 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Housing & Marital */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.houseOwnership}
              </label>
              <select
                value={houseCondition}
                onChange={e => setHouseCondition(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="የግል">የግል (Owned)</option>
                <option value="ክራይ">ክራይ (Rented)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.maritalStatus}
              </label>
              <select
                value={marriage}
                onChange={e => setMarriage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="ያገባ">ያገባ (Married)</option>
                <option value="ያላገባ">ያላገባ (Single)</option>
                <option value="የሞተበት">የሞተበት / የሞተባት (Widowed)</option>
                <option value="የፈታች">የፈታች (Divorced)</option>
              </select>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
