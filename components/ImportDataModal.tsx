'use client';

import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Eye,
  Check,
  FileText,
  HelpCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MemberRecord } from '../lib/types';
import { CHAPELS } from '../lib/churchData';
import { Language, TRANSLATIONS } from '../lib/translations';
import { UpsertMode } from '../lib/deduplication';

interface ImportDataModalProps {
  lang: Language;
  onClose: () => void;
  onImportMembers: (newMembers: MemberRecord[], mode: UpsertMode) => void;
  onOpenAuditModal?: () => void;
}

interface ParsedSheetInfo {
  sheetName: string;
  detectedChapel: string;
  detectedChapelAmharic: string;
  chapelId: string;
  members: MemberRecord[];
  selected: boolean;
  error?: string;
}

// Normalize and clean strings
function cleanText(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (str.toLowerCase() === 'nan' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') return '';
  return str.replace(/^["']|["']$/g, '').trim();
}

// Clean and standardize gender
function cleanGender(val: any): 'Male' | 'Female' {
  const s = cleanText(val).toLowerCase();
  if (s.includes('female') || s.includes('ሴት') || s === 'f') return 'Female';
  return 'Male';
}

// Clean age
function cleanAge(val: any): number | null {
  const s = cleanText(val);
  if (!s) return null;
  const num = parseFloat(s);
  return isNaN(num) ? null : Math.round(num);
}

// Clean Ethiopian phone numbers
function cleanPhone(val: any): string {
  let s = cleanText(val).replace(/[\s\-\(\)]/g, '');
  if (!s) return '';
  if (s.startsWith('+251')) s = '0' + s.slice(4);
  else if (s.startsWith('251')) s = '0' + s.slice(3);
  else if (s.startsWith('9') && s.length === 9) s = '0' + s;
  return s;
}

// Clean baptism values
function cleanBaptism(val: any): string {
  const s = cleanText(val);
  if (!s) return '';
  if (s.includes('ያልተጠመቀ') || s.includes('አልተጠመቀ') || s.includes('ያልተጠመቀች')) return 'ያልተጠመቀ';
  if (s.includes('የተጠመቀ') || s.includes('የተጠመቀች') || s.toLowerCase() === 'yes') return 'የተጠመቀ';
  return s;
}

// Clean Lord's Supper values
function cleanLordSupper(val: any): string {
  const s = cleanText(val);
  if (!s) return '';
  if (s.includes('የማይካፈል') || s.includes('የማይጋፈል') || s.includes('አይካፈልም') || s.includes('አይጋፈልም')) {
    return 'የማይካፈል';
  }
  if (s.includes('የሚካፈል') || s.includes('የሚጋፈል') || s.toLowerCase() === 'yes') return 'የሚካፈል';
  return s;
}

// Clean Tithe values
function cleanTithe(val: any): string {
  const s = cleanText(val);
  if (!s) return '';
  if (s.includes('የማይከፍል') || s.includes('የማይከፊል') || s.includes('አይከፍልም')) return 'የማይከፍል';
  if (s.includes('የሚከፍል') || s.includes('የሚከፊል') || s.toLowerCase() === 'yes') return 'የሚከፍል';
  return s;
}

// Clean marriage status
function cleanMarriage(val: any): string {
  const s = cleanText(val);
  if (!s) return '';
  if (s.includes('ያገባ') && !s.includes('ያላገባ')) return 'ያገባ';
  if (s.includes('ያላገባ') || s.includes('አላገባም') || s.includes('ያላገባች')) return 'ያላገባ';
  if (s.includes('የሞተበት') || s.includes('ሚስት የሞተበት')) return 'የሞተበት';
  if (s.includes('የሞተባት') || s.includes('ባል የሌላት') || s.includes('ባልቴት')) return 'የሞተባት';
  if (s.includes('የፈታ') || s.includes('የፈታች')) return 'የፈታች';
  return s;
}

// Clean housing
function cleanHouse(val: any): string {
  const s = cleanText(val);
  if (!s) return '';
  if (s.includes('ክራይ') || s.includes('ኪራይ')) return 'ክራይ';
  if (s.includes('የግል') || s.includes('ግል')) return 'የግል';
  return s;
}

// Auto-detect chapel from text (sheet name or column contents)
export function detectChapelFromText(str: string): { id: string; chapel: string; chapelAmharic: string } | null {
  if (!str) return null;
  const s = str.toLowerCase();

  if (s.includes('አቤንኤዘር') || s.includes('አቤኔዘር') || s.includes('ebenezer') || s.includes('ebinezer')) {
    return { id: 'ebenezer', chapel: 'Ebenezer', chapelAmharic: 'አቤንኤዘር ቻፕል' };
  }
  if (s.includes('ርኆቦት') || s.includes('ሮሆቦት') || s.includes('ርሆቦት') || s.includes('rehoboth')) {
    return { id: 'rehoboth', chapel: 'Rehoboth', chapelAmharic: 'ርኆቦት ቻፕል' };
  }
  if (s.includes('ኤልሻዳይ') || s.includes('ኤልሻዳይ') || s.includes('elshaddai') || s.includes('elshadday')) {
    return { id: 'elshaddai', chapel: 'Elshaddai', chapelAmharic: 'ኤልሻዳይ ቻፕል' };
  }
  if (s.includes('ሩሐማ') || s.includes('ሩሀማ') || s.includes('ruhama')) {
    return { id: 'ruhama', chapel: 'Ruhama', chapelAmharic: 'ሩሐማ ቻፕል' };
  }
  if (s.includes('አዶናይ') || s.includes('adonai')) {
    return { id: 'adonai', chapel: 'Adonai', chapelAmharic: 'አዶናይ ቻፕል' };
  }
  if (s.includes('ኤልሮኢ') || s.includes('ኤልሮይ') || s.includes('eliroi')) {
    return { id: 'eliroi', chapel: 'Eliroi', chapelAmharic: 'ኤልሮኢ ቻፕል' };
  }
  if (s.includes('ሻሎም') || s.includes('shalom')) {
    return { id: 'shalom', chapel: 'Shalom', chapelAmharic: 'ሻሎም ቻፕል' };
  }
  if (s.includes('ቤቴል') || s.includes('betel')) {
    return { id: 'betel', chapel: 'Betel', chapelAmharic: 'ቤቴል ቻፕል' };
  }
  if (s.includes('ያህዌ') || s.includes('ያህዌህ') || s.includes('yahewe') || s.includes('yahweh')) {
    return { id: 'yahewe', chapel: 'Yahewe', chapelAmharic: 'ያህዌ ቻፕል' };
  }
  if (s.includes('ኤዴን') || s.includes('ኤደን') || s.includes('eden')) {
    return { id: 'eden', chapel: 'Eden', chapelAmharic: 'ኤዴን ቻፕል' };
  }
  return null;
}

// Robust table row parser supporting both Amharic and English headers
function parseRowsToMembers(
  rows: any[][],
  fallbackChapel: { id: string; chapel: string; chapelAmharic: string }
): MemberRecord[] {
  if (!rows || rows.length === 0) return [];

  // Search for header row in top 6 rows
  let headerRowIndex = -1;
  let colMap = {
    no: -1,
    fatherName: -1,
    childName: -1,
    age: -1,
    gender: -1,
    occupation: -1,
    education: -1,
    baptism: -1,
    lordSupper: -1,
    tithe: -1,
    marriage: -1,
    participation: -1,
    houseCondition: -1,
    share: -1,
    chapel: -1,
    responsibility: -1,
    spiritualEdu: -1,
    phone: -1,
    examination: -1,
  };

  for (let r = 0; r < Math.min(rows.length, 6); r++) {
    const row = rows[r];
    if (!row || !Array.isArray(row)) continue;

    const rowStrings = row.map(c => cleanText(c).toLowerCase());
    const rowJoin = rowStrings.join(' ');

    if (
      rowJoin.includes('father') ||
      rowJoin.includes('የአባት ስም') ||
      rowJoin.includes('child') ||
      rowJoin.includes('የልጆች ስም') ||
      rowJoin.includes('baptism') ||
      rowJoin.includes('ጥምቀት') ||
      rowJoin.includes('lord supper') ||
      rowJoin.includes('የጌታ እራት')
    ) {
      headerRowIndex = r;
      // Map column positions
      rowStrings.forEach((col, idx) => {
        if (col === 'no' || col === 'no.' || col === 'ተ.ቁ' || col === 'ቁጥር' || col === '#') colMap.no = idx;
        else if (col.includes('father') || col.includes('የአባት ስም') || col.includes('የአባወራ') || col === 'አባወራ' || (col.includes('ስም') && !col.includes('ልጅ'))) colMap.fatherName = idx;
        else if (col.includes('child') || col.includes('ልጅ')) colMap.childName = idx;
        else if (col.includes('age') || col.includes('እድሜ') || col.includes('ዕድሜ')) colMap.age = idx;
        else if (col.includes('gender') || col.includes('sex') || col.includes('ጾታ')) colMap.gender = idx;
        else if (col.includes('occupation') || col.includes('job') || col.includes('ስራ') || col.includes('ሥራ') || col.includes('ሙያ')) colMap.occupation = idx;
        else if (col.includes('education') || col.includes('ትምህርት') || col.includes('የት/ደረጃ')) colMap.education = idx;
        else if (col.includes('baptism') || col.includes('ጥምቀት')) colMap.baptism = idx;
        else if (col.includes('lord') || col.includes('supper') || col.includes('የጌታ እራት') || col.includes('እራት')) colMap.lordSupper = idx;
        else if (col.includes('tithe') || col.includes('አስራት') || col.includes('አሥራት')) colMap.tithe = idx;
        else if (col.includes('marriage') || col.includes('marital') || col.includes('ጋብቻ')) colMap.marriage = idx;
        else if (col.includes('participation') || col.includes('ተሳትፎ') || col.includes('አባልነት')) colMap.participation = idx;
        else if (col.includes('house') || col.includes('ቤት')) colMap.houseCondition = idx;
        else if (col.includes('share') || col.includes('ድርሻ')) colMap.share = idx;
        else if (col.includes('chapel') || col.includes('ቻፕል')) colMap.chapel = idx;
        else if (col.includes('responsibility') || col.includes('ኃላፊነት') || col.includes('ሀላፊነት') || col.includes('አገልግሎት')) colMap.responsibility = idx;
        else if (col.includes('spirit') || col.includes('መንፈሳዊ')) colMap.spiritualEdu = idx;
        else if (col.includes('phone') || col.includes('mobile') || col.includes('ስልክ')) colMap.phone = idx;
        else if (col.includes('exam') || col.includes('ምልከታ') || col.includes('ምርመራ') || col.includes('አስተያየት')) colMap.examination = idx;
      });
      break;
    }
  }

  // Fallback default index map if no header row found
  if (headerRowIndex === -1) {
    headerRowIndex = -1; // Process from row 0
    colMap = {
      no: 0,
      fatherName: 1,
      childName: 2,
      age: 3,
      gender: 4,
      occupation: 5,
      education: 6,
      baptism: 7,
      lordSupper: 8,
      tithe: 9,
      marriage: 10,
      participation: 11,
      houseCondition: 12,
      share: 13,
      chapel: 14,
      responsibility: 15,
      spiritualEdu: 16,
      phone: 17,
      examination: 18,
    };
  }

  const results: MemberRecord[] = [];
  let currentFamilyNo = 1;
  let currentFamilyId = '';
  let hasHead = false;

  const startRow = headerRowIndex + 1;

  for (let r = startRow; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !Array.isArray(row) || row.length === 0) continue;

    const noVal = colMap.no >= 0 ? cleanText(row[colMap.no]) : '';
    const fatherVal = colMap.fatherName >= 0 ? cleanText(row[colMap.fatherName]) : '';
    const childVal = colMap.childName >= 0 ? cleanText(row[colMap.childName]) : '';

    // Ignore completely empty rows or repeated headers
    if (!noVal && !fatherVal && !childVal) continue;
    if (fatherVal.includes('Father Name') || fatherVal.includes('የአባት ስም')) continue;

    let parsedNo: number | null = null;
    if (noVal) {
      const match = noVal.match(/\d+/);
      if (match) parsedNo = parseInt(match[0], 10);
    }

    let personName = '';
    let role: 'Head' | 'Spouse' | 'Child' = 'Head';

    if (childVal && !fatherVal) {
      personName = childVal;
      role = 'Child';
    } else if (fatherVal) {
      personName = fatherVal;
      if (parsedNo !== null) {
        currentFamilyNo = parsedNo;
        role = 'Head';
        hasHead = true;
      } else {
        if (!hasHead) {
          currentFamilyNo++;
          role = 'Head';
          hasHead = true;
        } else {
          role = 'Spouse';
        }
      }
    } else if (noVal && isNaN(Number(noVal))) {
      personName = noVal;
      role = hasHead ? 'Spouse' : 'Head';
      if (!hasHead) hasHead = true;
    } else {
      continue;
    }

    // Determine row-level chapel if specified in cell
    let rowChapel = fallbackChapel;
    if (colMap.chapel >= 0 && row[colMap.chapel]) {
      const inCellChapel = detectChapelFromText(cleanText(row[colMap.chapel]));
      if (inCellChapel) rowChapel = inCellChapel;
    }

    if (role === 'Head') {
      currentFamilyId = `fam-${rowChapel.id}-${currentFamilyNo}-${Date.now()}`;
    }

    const memberId = `mem-${rowChapel.id}-${Date.now()}-${results.length + 1}`;

    const age = colMap.age >= 0 ? cleanAge(row[colMap.age]) : null;
    const gender = colMap.gender >= 0 ? cleanGender(row[colMap.gender]) : 'Male';
    const occupation = colMap.occupation >= 0 ? cleanText(row[colMap.occupation]) : '';
    const education = colMap.education >= 0 ? cleanText(row[colMap.education]) : '';
    const baptism = colMap.baptism >= 0 ? cleanBaptism(row[colMap.baptism]) : '';
    const lordSupper = colMap.lordSupper >= 0 ? cleanLordSupper(row[colMap.lordSupper]) : '';
    const tithe = colMap.tithe >= 0 ? cleanTithe(row[colMap.tithe]) : '';
    const marriage = colMap.marriage >= 0 ? cleanMarriage(row[colMap.marriage]) : '';
    const participation = colMap.participation >= 0 ? cleanText(row[colMap.participation]) || 'አባል' : 'አባል';
    const houseCondition = colMap.houseCondition >= 0 ? cleanHouse(row[colMap.houseCondition]) || 'የግል' : 'የግል';
    const responsibility = colMap.responsibility >= 0 ? cleanText(row[colMap.responsibility]) : '';
    const spiritualEdu = colMap.spiritualEdu >= 0 ? cleanText(row[colMap.spiritualEdu]) : '';
    const phone = colMap.phone >= 0 ? cleanPhone(row[colMap.phone]) : '';
    const examination = colMap.examination >= 0 ? cleanText(row[colMap.examination]) : '';

    results.push({
      id: memberId,
      familyId: currentFamilyId || `fam-${rowChapel.id}-${currentFamilyNo}`,
      familyNo: currentFamilyNo,
      chapel: rowChapel.chapel,
      chapelAmharic: rowChapel.chapelAmharic,
      roleInFamily: role,
      name: personName,
      age,
      gender,
      occupation,
      education,
      baptism,
      lordSupper,
      tithe,
      marriage,
      participation,
      houseCondition,
      responsibility,
      spiritualEdu,
      phoneNumber: phone,
      examination,
    });
  }

  return results;
}

export default function ImportDataModal({
  lang,
  onClose,
  onImportMembers,
  onOpenAuditModal,
}: ImportDataModalProps) {
  const t = TRANSLATIONS[lang];

  // Active tab: 'excel' (file upload with multi-sheet detection) or 'paste' (raw text)
  const [activeMode, setActiveMode] = useState<'excel' | 'paste'>('excel');

  // Upsert / Merge mode: 'smart_update' | 'replace_chapels' | 'append_only'
  const [upsertMode, setUpsertMode] = useState<UpsertMode>('smart_update');

  // Excel multi-sheet parsed states
  const [parsedSheets, setParsedSheets] = useState<ParsedSheetInfo[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePreviewSheet, setActivePreviewSheet] = useState<string | null>(null);

  // Paste mode state
  const [rawText, setRawText] = useState('');
  const [pasteDefaultChapel, setPasteDefaultChapel] = useState('ebenezer');
  const [pastePreview, setPastePreview] = useState<MemberRecord[] | null>(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Excel (.xlsx, .xls, .csv) upload with sheet detection
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const buffer = await file.arrayBuffer();
      // Read Excel workbook with complete Unicode/Amharic support
      const workbook = XLSX.read(buffer, {
        type: 'array',
        cellDates: true,
        codepage: 65001, // UTF-8
      });

      const sheetsInfo: ParsedSheetInfo[] = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) continue;

        // Convert sheet to 2D array of rows
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          raw: false,
        });

        if (rawRows.length === 0) continue;

        // 1. First attempt: detect chapel from sheet name
        let detected = detectChapelFromText(sheetName);

        // 2. Second attempt: scan first 5 rows for chapel title (e.g. "አቤንኤዘር ቻፕል")
        if (!detected) {
          for (let r = 0; r < Math.min(rawRows.length, 5); r++) {
            const rowText = rawRows[r]?.map(c => cleanText(c)).join(' ') || '';
            const match = detectChapelFromText(rowText);
            if (match) {
              detected = match;
              break;
            }
          }
        }

        // 3. Fallback: default to Ebenezer or the first unpopulated chapel
        const fallback = detected || {
          id: 'ebenezer',
          chapel: 'Ebenezer',
          chapelAmharic: 'አቤንኤዘር ቻፕል',
        };

        const members = parseRowsToMembers(rawRows, fallback);

        sheetsInfo.push({
          sheetName,
          detectedChapel: fallback.chapel,
          detectedChapelAmharic: fallback.chapelAmharic,
          chapelId: fallback.id,
          members,
          selected: members.length > 0,
        });
      }

      if (sheetsInfo.length === 0) {
        setErrorMessage(
          lang === 'am'
            ? 'በተመረጠው የኤክሴል ሰነድ ውስጥ ምንም መረጃ ማግኘት አልተቻለም።'
            : 'No readable data found in the selected Excel workbook.'
        );
      } else {
        setParsedSheets(sheetsInfo);
        // Default preview to the first sheet with members
        const firstValid = sheetsInfo.find(s => s.members.length > 0);
        if (firstValid) setActivePreviewSheet(firstValid.sheetName);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        lang === 'am'
          ? `ኤክሴል ሰነዱን በማንበብ ወቅት ስህተት ተፈጥሯል: ${err?.message || ''}`
          : `Error reading Excel file: ${err?.message || ''}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Change detected chapel for a sheet
  const handleSheetChapelChange = (sheetName: string, newChapelId: string) => {
    const chapelMeta = CHAPELS.find(c => c.id === newChapelId);
    if (!chapelMeta) return;

    setParsedSheets(prev =>
      prev.map(s => {
        if (s.sheetName !== sheetName) return s;
        const updatedMembers = s.members.map(m => ({
          ...m,
          chapel: chapelMeta.nameEnglish.replace(' Chapel', ''),
          chapelAmharic: chapelMeta.nameAmharic,
          familyId: m.familyId.replace(/fam-[a-z]+-/, `fam-${chapelMeta.id}-`),
          id: m.id.replace(/mem-[a-z]+-/, `mem-${chapelMeta.id}-`),
        }));
        return {
          ...s,
          chapelId: chapelMeta.id,
          detectedChapel: chapelMeta.nameEnglish.replace(' Chapel', ''),
          detectedChapelAmharic: chapelMeta.nameAmharic,
          members: updatedMembers,
        };
      })
    );
  };

  // Toggle selection of a sheet
  const handleToggleSheet = (sheetName: string) => {
    setParsedSheets(prev =>
      prev.map(s => (s.sheetName === sheetName ? { ...s, selected: !s.selected } : s))
    );
  };

  // Parse raw text in Paste mode
  const handleParsePaste = () => {
    if (!rawText.trim()) {
      setErrorMessage(lang === 'am' ? 'እባክዎ መረጃውን እዚህ ይለጥፉ' : 'Please paste text table data');
      return;
    }

    setErrorMessage('');
    try {
      // 1. Detect chapel from pasted text if contains Amharic chapel title
      let targetMeta = detectChapelFromText(rawText);
      if (!targetMeta) {
        const found = CHAPELS.find(c => c.id === pasteDefaultChapel);
        targetMeta = found
          ? { id: found.id, chapel: found.nameEnglish.replace(' Chapel', ''), chapelAmharic: found.nameAmharic }
          : { id: 'ebenezer', chapel: 'Ebenezer', chapelAmharic: 'አቤንኤዘር ቻፕል' };
      }

      // Parse lines
      const lines = rawText.split('\n').filter(l => l.trim().length > 0);
      const rows = lines.map(line => (line.includes('\t') ? line.split('\t') : line.split(/\s{2,}/)));
      const members = parseRowsToMembers(rows, targetMeta);

      if (members.length === 0) {
        setErrorMessage(
          lang === 'am'
            ? 'ምንም ትክክለኛ የአባላት መረጃ ማግኘት አልተቻለም። እባክዎ የሰንጠረዡን አቀማመጥ ያረጋግጡ።'
            : 'No valid member rows could be parsed. Please check table formatting.'
        );
        return;
      }

      setPastePreview(members);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error parsing table text');
    }
  };

  // Import all selected sheets from Excel
  const handleImportExcelSheets = () => {
    const selected = parsedSheets.filter(s => s.selected && s.members.length > 0);
    if (selected.length === 0) {
      setErrorMessage(
        lang === 'am' ? 'እባክዎ ቢያንስ አንዱን ሸት ይምረጡ' : 'Please select at least one sheet with records'
      );
      return;
    }

    const allMembers: MemberRecord[] = [];
    selected.forEach(s => {
      allMembers.push(...s.members);
    });

    onImportMembers(allMembers, upsertMode);
    onClose();
  };

  // Import from Paste Mode
  const handleImportPaste = () => {
    if (!pastePreview || pastePreview.length === 0) return;
    onImportMembers(pastePreview, upsertMode);
    onClose();
  };

  // Total members across selected sheets
  const totalSelectedMembers = parsedSheets
    .filter(s => s.selected)
    .reduce((acc, s) => acc + s.members.length, 0);

  const activeSheetObj = parsedSheets.find(s => s.sheetName === activePreviewSheet);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center font-bold shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {lang === 'am'
                  ? 'ከኤክሴል (Excel) ቆጠራ መረጃ ማስገቢያ'
                  : 'Import Census from Excel (.xlsx / .xls)'}
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300">
                  {lang === 'am' ? 'አማርኛ / UTF-8' : 'Amharic UTF-8'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'am'
                  ? 'የየትኛውንም ቻፕል መረጃ ከኤክሴል ሽቶች (Sheets) በራስ-ሰር ለይቶ በአማርኛ ፊደላት ያነባል'
                  : 'Auto-detects chapel names from Excel sheet tabs and preserves Amharic Ethiopic fonts'}
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

        {/* Tab Navigation (Excel File vs Paste Text) */}
        <div className="px-5 pt-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveMode('excel');
              setErrorMessage('');
            }}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeMode === 'excel'
                ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>{lang === 'am' ? 'የኤክሴል ፋይል ጫን (.xlsx / .xls)' : 'Upload Excel File (.xlsx/.xls)'}</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('paste');
              setErrorMessage('');
            }}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeMode === 'paste'
                ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{lang === 'am' ? 'የሰንጠረዥ ጽሑፍ ለጥፍ (Paste Table)' : 'Paste Table Text'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* EXCEL FILE MODE */}
          {activeMode === 'excel' && (
            <div className="space-y-4">
              {/* Dropzone / Upload area */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl p-6 text-center bg-slate-50/60 dark:bg-slate-800/40 transition-colors">
                <input
                  type="file"
                  id="excel-file-input"
                  accept=".xlsx, .xls, .csv, .ods, .tsv"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
                <label
                  htmlFor="excel-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                      {lang === 'am'
                        ? 'የኤክሴል ሰነድዎን እዚህ ይጫኑ (Click to Browse)'
                        : 'Click to select your Excel file'}
                    </span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {lang === 'am'
                        ? '.xlsx, .xls, .csv ወይም .ods ፋይሎችን ይቀበላል'
                        : 'Supports .xlsx, .xls, .csv, and .ods formats'}
                    </p>
                  </div>
                  {fileName && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-mono text-xs font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      <span>{fileName}</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Processing Spinner */}
              {isProcessing && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-center flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
                  <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <span>
                    {lang === 'am'
                      ? 'የኤክሴል ሽቶቹን እና የአማርኛ ጽሑፎችን በማንበብ ላይ ነው...'
                      : 'Reading Excel sheets and parsing Amharic Ethiopic content...'}
                  </span>
                </div>
              )}

              {/* Sheets Detection View */}
              {parsedSheets.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {lang === 'am'
                          ? `በኤክሴል ሰነዱ ውስጥ የተገኙ ${parsedSheets.length} ሽቶች (Sheets)`
                          : `Detected ${parsedSheets.length} Sheets in Workbook`}
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {lang === 'am'
                        ? 'የእያንዳንዱ ሽት ቻፕል በራስ-ሰር ተለይቷል፤ ካስፈለገ ማስተካከል ይችላሉ'
                        : 'Chapels auto-detected; you can manually override below'}
                    </span>
                  </div>

                  {/* Sheets Cards */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {parsedSheets.map((sheet, index) => {
                      const isSelected = sheet.selected;
                      const hasMembers = sheet.members.length > 0;

                      return (
                        <div
                          key={sheet.sheetName}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-teal-300 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Sheet Name & Checkbox */}
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={`sheet-check-${index}`}
                                checked={isSelected}
                                onChange={() => handleToggleSheet(sheet.sheetName)}
                                disabled={!hasMembers}
                                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                              />
                              <label
                                htmlFor={`sheet-check-${index}`}
                                className="font-semibold text-slate-900 dark:text-white cursor-pointer flex items-center gap-2"
                              >
                                <span className="font-mono text-slate-400 text-xs">#{index + 1}</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                  {sheet.sheetName}
                                </span>
                              </label>
                            </div>

                            {/* Detected Chapel Selector */}
                            <div className="flex items-center gap-2 sm:gap-4">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-slate-500">
                                  {lang === 'am' ? 'የተለየው ቻፕል:' : 'Assigned Chapel:'}
                                </span>
                                <select
                                  value={sheet.chapelId}
                                  onChange={e => handleSheetChapelChange(sheet.sheetName, e.target.value)}
                                  className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs focus:ring-1 focus:ring-teal-500"
                                >
                                  {CHAPELS.filter(c => c.id !== 'all').map(c => (
                                    <option key={c.id} value={c.id}>
                                      {c.nameAmharic} ({c.nameEnglish})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Members Count Badge */}
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold whitespace-nowrap ${
                                  hasMembers
                                    ? 'bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400'
                                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                                }`}
                              >
                                {hasMembers
                                  ? `${sheet.members.length} ${lang === 'am' ? 'አባላት' : 'members'}`
                                  : lang === 'am'
                                  ? 'ባዶ ሽት'
                                  : 'Empty'}
                              </span>

                              {/* Preview Toggle */}
                              {hasMembers && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActivePreviewSheet(
                                      activePreviewSheet === sheet.sheetName ? null : sheet.sheetName
                                    )
                                  }
                                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                                  title="Preview Rows"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded Preview of this sheet */}
                          {activePreviewSheet === sheet.sheetName && hasMembers && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                                {lang === 'am'
                                  ? `የ"${sheet.sheetName}" ሽት የመጀመሪያዎቹ አባላት ቅድመ-እይታ:`
                                  : `Preview for sheet "${sheet.sheetName}":`}
                              </p>
                              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 font-semibold text-slate-600 dark:text-slate-300">
                                    <tr>
                                      <th className="py-1 px-2">#</th>
                                      <th className="py-1 px-3">ስም</th>
                                      <th className="py-1 px-2">ሚና</th>
                                      <th className="py-1 px-2 text-center">እድሜ</th>
                                      <th className="py-1 px-2">ጾታ</th>
                                      <th className="py-1 px-2">ጥምቀት</th>
                                      <th className="py-1 px-3">ስልክ</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {sheet.members.slice(0, 10).map((m, idx) => (
                                      <tr key={m.id}>
                                        <td className="py-1 px-2 text-slate-400 font-mono">{idx + 1}</td>
                                        <td className="py-1 px-3 font-medium text-slate-900 dark:text-white">
                                          {m.name}
                                        </td>
                                        <td className="py-1 px-2 text-slate-500">{m.roleInFamily}</td>
                                        <td className="py-1 px-2 text-center font-mono">{m.age ?? '—'}</td>
                                        <td className="py-1 px-2">{m.gender === 'Male' ? 'ወንድ' : 'ሴት'}</td>
                                        <td className="py-1 px-2">{m.baptism}</td>
                                        <td className="py-1 px-3 font-mono">{m.phoneNumber || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASTE TEXT MODE */}
          {activeMode === 'paste' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'am' ? 'ነባሪ ቻፕል ምረጥ (Fallback Chapel):' : 'Fallback Chapel:'}
                  </label>
                  <select
                    value={pasteDefaultChapel}
                    onChange={e => setPasteDefaultChapel(e.target.value)}
                    className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
                  >
                    {CHAPELS.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nameAmharic} ({c.nameEnglish})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-[11px] text-slate-400 max-w-sm">
                  {lang === 'am'
                    ? 'በሰንጠረዡ ውስጥ "አቤንኤዘር"፣ "ርኆቦት" ወዘተ የሚል ስም ካለ ሲስተሙ ራሱ በራስ-ሰር ይለየዋል'
                    : 'System will automatically identify chapel names written inside the text'}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    {lang === 'am' ? 'ከኤክሴል ኮፒ ያደረጉትን ሰንጠረዥ እዚህ ይለጥፉ:' : 'Paste Copied Excel Table:'}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {lang === 'am' ? 'ከExcel ወይም Word ሙሉውን ኮፒ አድርገው ይለጥፉ' : 'Copy and paste tabular text'}
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={e => {
                    setRawText(e.target.value);
                    setPastePreview(null);
                    setErrorMessage('');
                  }}
                  placeholder={`1\tመለሰ ዳኘ ቦጋለ\t\t39\tMale\tEmployee\tDegree\tየተጠመቀ\tየሚካፈል\tየሚከፍል...\n\tአልማዝ ፋንታ ሳዳ\t\t30\tFemale\tTeacher\tDiploma...\n\t\tሚክያስ መለሰ\t10\tMale\tStudent...`}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {!pastePreview && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleParsePaste}
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'am' ? 'ጽሑፉን ፈትሽና አዘጋጅ (Parse & Preview)' : 'Parse & Preview'}</span>
                  </button>
                </div>
              )}

              {/* Paste Preview Table */}
              {pastePreview && (
                <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {lang === 'am'
                          ? `በተሳካ ሁኔታ ${pastePreview.length} አባላት ተዘጋጅተዋል!`
                          : `Successfully parsed ${pastePreview.length} members!`}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      {lang === 'am' ? 'የተለየ ቻፕል:' : 'Chapel:'} {pastePreview[0]?.chapelAmharic}
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 font-semibold text-slate-600 dark:text-slate-300">
                        <tr>
                          <th className="py-1.5 px-2">#</th>
                          <th className="py-1.5 px-3">ስም</th>
                          <th className="py-1.5 px-2">ሚና</th>
                          <th className="py-1.5 px-2 text-center">እድሜ</th>
                          <th className="py-1.5 px-2">ጾታ</th>
                          <th className="py-1.5 px-2">ጥምቀት</th>
                          <th className="py-1.5 px-3">ስልክ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {pastePreview.slice(0, 15).map((m, idx) => (
                          <tr key={m.id}>
                            <td className="py-1 px-2 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="py-1 px-3 font-medium text-slate-900 dark:text-white">{m.name}</td>
                            <td className="py-1 px-2 text-slate-500">{m.roleInFamily}</td>
                            <td className="py-1 px-2 text-center font-mono">{m.age ?? '—'}</td>
                            <td className="py-1 px-2">{m.gender === 'Male' ? 'ወንድ' : 'ሴት'}</td>
                            <td className="py-1 px-2">{m.baptism}</td>
                            <td className="py-1 px-3 font-mono">{m.phoneNumber || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Smart Synchronization Strategy Section */}
          {(parsedSheets.some(s => s.selected && s.members.length > 0) || pastePreview) && (
            <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/50 dark:bg-teal-950/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>
                    {lang === 'am'
                      ? 'የመረጃ አያያዝና ማደሻ ዘዴ (Sync & Update Strategy):'
                      : 'Data Synchronization & Update Strategy:'}
                  </span>
                </span>
                <span className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold">
                  {upsertMode === 'smart_update'
                    ? lang === 'am'
                      ? 'ስማርት ማደስ (ቦታው ላይ ያድሳል)'
                      : 'Smart Upsert'
                    : upsertMode === 'replace_chapels'
                    ? lang === 'am'
                      ? 'የነባር ቻፕል መረጃን መተካት'
                      : 'Replace Chapels'
                    : lang === 'am'
                    ? 'አዳዲስ ብቻ መጨመር'
                    : 'Append Only'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label
                  onClick={() => setUpsertMode('smart_update')}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                    upsertMode === 'smart_update'
                      ? 'border-teal-500 bg-white dark:bg-slate-800 shadow-xs ring-1 ring-teal-500'
                      : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="upsertMode"
                      checked={upsertMode === 'smart_update'}
                      onChange={() => setUpsertMode('smart_update')}
                      className="text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                    />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {lang === 'am' ? 'ስማርት ማደስ' : 'Smart Update'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 pl-5">
                    {lang === 'am'
                      ? 'ቀድሞ ያሉትን አባላት ቦታቸው ላይ ያድሳል፤ አዳዲስ አባላትን ያክላል'
                      : 'Updates existing members in-place; adds new records'}
                  </p>
                </label>

                <label
                  onClick={() => setUpsertMode('replace_chapels')}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                    upsertMode === 'replace_chapels'
                      ? 'border-teal-500 bg-white dark:bg-slate-800 shadow-xs ring-1 ring-teal-500'
                      : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="upsertMode"
                      checked={upsertMode === 'replace_chapels'}
                      onChange={() => setUpsertMode('replace_chapels')}
                      className="text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                    />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {lang === 'am' ? 'ሙሉ መተካት' : 'Replace Chapels'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 pl-5">
                    {lang === 'am'
                      ? 'የተመረጡትን ቻፕሎች ቀድሞ የነበረውን ዳታ ሙሉ በሙሉ ይተካል'
                      : 'Replaces previous records of the imported chapels'}
                  </p>
                </label>

                <label
                  onClick={() => setUpsertMode('append_only')}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                    upsertMode === 'append_only'
                      ? 'border-teal-500 bg-white dark:bg-slate-800 shadow-xs ring-1 ring-teal-500'
                      : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="upsertMode"
                      checked={upsertMode === 'append_only'}
                      onChange={() => setUpsertMode('append_only')}
                      className="text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                    />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {lang === 'am' ? 'አዳዲስ ብቻ' : 'Append Only'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 pl-5">
                    {lang === 'am'
                      ? 'ነባር አባላትን ሳይነካ አዲስ የተገኙትን ብቻ ያክላል'
                      : 'Adds only new records without touching existing ones'}
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* Error Message banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer & Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/80">
          <div className="text-xs text-slate-500">
            {activeMode === 'excel' && parsedSheets.length > 0 && (
              <span className="font-medium">
                {lang === 'am'
                  ? `የተመረጡ ${parsedSheets.filter(s => s.selected).length} ሽቶች (${totalSelectedMembers} አባላት)`
                  : `${parsedSheets.filter(s => s.selected).length} sheets selected (${totalSelectedMembers} members)`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.cancel}
            </button>

            {/* Excel Mode Import Action */}
            {activeMode === 'excel' && parsedSheets.length > 0 && (
              <button
                type="button"
                onClick={handleImportExcelSheets}
                disabled={totalSelectedMembers === 0}
                className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {lang === 'am'
                    ? `ሁሉንም ${totalSelectedMembers} አባላት ወደ መረጃ ቋቱ አስገባ`
                    : `Merge all ${totalSelectedMembers} members to database`}
                </span>
              </button>
            )}

            {/* Paste Mode Import Action */}
            {activeMode === 'paste' && pastePreview && (
              <button
                type="button"
                onClick={handleImportPaste}
                className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {lang === 'am'
                    ? `ሁሉንም ${pastePreview.length} አባላት ወደ መረጃ ቋቱ አስገባ`
                    : `Merge all ${pastePreview.length} members to database`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
