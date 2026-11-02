import fs from 'fs';
import path from 'path';

function cleanText(str) {
  if (!str) return '';
  return str.trim().replace(/^"|"$/g, '').replace(/nan/gi, '');
}

function cleanGender(g) {
  g = cleanText(g);
  if (!g) return 'Male';
  if (g.toLowerCase().includes('female') || g.includes('ሴት')) return 'Female';
  return 'Male';
}

function cleanAge(a) {
  a = cleanText(a);
  if (!a) return null;
  const num = parseFloat(a);
  return isNaN(num) ? null : Math.round(num);
}

function cleanPhone(p) {
  p = cleanText(p).replace(/\s+/g, '');
  if (!p) return '';
  if (p.startsWith('9') && p.length === 9) return '0' + p;
  if (p.startsWith('251')) return '0' + p.substring(3);
  return p;
}

function cleanBaptism(b) {
  b = cleanText(b);
  if (!b) return '';
  if (b.includes('ያልተጠመቀ') || b.includes('አልተጠመቀም') || b.includes('ያልተጠመቀች')) return 'ያልተጠመቀ';
  if (b.includes('የተጠመቀ')) return 'የተጠመቀ';
  return b;
}

function cleanLordSupper(ls) {
  ls = cleanText(ls);
  if (!ls) return '';
  if (ls.includes('የማይካፈል') || ls.includes('የማይጋፈል') || ls.includes('አይካፈልም')) return 'የማይካፈል';
  if (ls.includes('የሚካፈል')) return 'የሚካፈል';
  return ls;
}

function cleanTithe(t) {
  t = cleanText(t);
  if (!t) return '';
  if (t.includes('የማይከፍል') || t.includes('የማይከፊል') || t.includes('አይከፍልም')) return 'የማይከፍል';
  if (t.includes('የሚከፍል')) return 'የሚከፍል';
  return t;
}

function cleanMarriage(m) {
  m = cleanText(m);
  if (!m) return '';
  if (m.includes('ያገባ')) return 'ያገባ';
  if (m.includes('ያላገባ') || m.includes('አላገባም') || m.includes('አላገባችም') || m.includes('ያላገባች')) return 'ያላገባ';
  if (m.includes('የሞተበት') || m.includes('ሚስት የሞተበት')) return 'የሞተበት';
  if (m.includes('የሞተባት') || m.includes('ባል የሌላት') || m.includes('ባልቴት')) return 'የሞተባት';
  if (m.includes('የፈታች') || m.includes('የፈታ')) return 'የፈታች';
  return m;
}

function cleanHouse(h) {
  h = cleanText(h);
  if (!h) return '';
  if (h.includes('ክራይ')) return 'ክራይ';
  if (h.includes('የግል')) return 'የግል';
  return h;
}

const chapels = [
  { file: 'data/eliroi.tsv', name: 'Eliroi', nameAmharic: 'ኤልሮኢ ቻፕል' },
  { file: 'data/shalom.tsv', name: 'Shalom', nameAmharic: 'ሻሎም ቻፕል' },
  { file: 'data/betel.tsv', name: 'Betel', nameAmharic: 'ቤቴል ቻፕል' },
  { file: 'data/yahewe.tsv', name: 'Yahewe', nameAmharic: 'ያህዌ ቻፕል' },
  { file: 'data/eden.tsv', name: 'Eden', nameAmharic: 'ኤዴን ቻፕል' }
];

const allMembers = [];
const allHouseholds = [];

let memberIdCounter = 1;
let householdIdCounter = 1;

for (const chap of chapels) {
  if (!fs.existsSync(chap.file)) continue;
  const content = fs.readFileSync(chap.file, 'utf8');
  const lines = content.split('\n');

  let currentFamilyNo = 0;
  let currentFamilyId = '';
  let currentHousehold = null;
  let hasHead = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;

    // Skip header line
    if (rawLine.includes('Father Name') || rawLine.includes('Children Name')) continue;

    const parts = rawLine.split('\t').map(p => p.trim());
    
    // Column layout:
    // [0]: Family No / Chapel No
    // [1]: Father Name / Head / Spouse Name
    // [2]: Children Name
    // [3]: Age
    // [4]: Gender
    // [5]: Occupation
    // [6]: Education Level
    // [7]: Baptism
    // [8]: Lord Supper
    // [9]: Tithe
    // [10]: Marriage
    // [11]: Participation
    // [12]: House Condition
    // [13]: Share or extra
    // [14]: Chapel
    // [15]: Responsibility
    // [16]: Spritual Edu
    // [17]: Phone no
    // [18]: Examination

    let noField = cleanText(parts[0]);
    let fatherName = cleanText(parts[1]);
    let childName = cleanText(parts[2]);

    // Check if new household starts
    // Some lines have "1	ደበና ብርሃኑ" or "ቤቴል ቻፕል 1" or just a number in noField
    let parsedNo = null;
    if (noField) {
      const match = noField.match(/\d+/);
      if (match) {
        parsedNo = parseInt(match[0], 10);
      }
    }

    // Determine person's name and role
    let personName = '';
    let role = 'Head';

    if (childName && !fatherName) {
      personName = childName;
      role = 'Child';
    } else if (fatherName) {
      personName = fatherName;
      if (parsedNo !== null) {
        // Starts new household
        currentFamilyNo = parsedNo;
        role = 'Head';
      } else {
        // No family number: might be spouse or 2nd adult head
        if (!hasHead) {
          currentFamilyNo++;
          role = 'Head';
        } else {
          role = 'Spouse';
        }
      }
    } else {
      continue;
    }

    if (role === 'Head' || !currentHousehold) {
      if (currentHousehold) {
        allHouseholds.push(currentHousehold);
      }
      currentFamilyId = `fam-${chap.name.toLowerCase()}-${currentFamilyNo || householdIdCounter}`;
      householdIdCounter++;
      currentHousehold = {
        id: currentFamilyId,
        familyNo: currentFamilyNo || householdIdCounter,
        chapel: chap.name,
        chapelAmharic: chap.nameAmharic,
        headName: personName,
        spouseName: '',
        membersCount: 0,
        primaryPhone: '',
        houseCondition: cleanHouse(parts[12] || ''),
        head: null,
        spouse: null,
        children: [],
        allMembers: []
      };
      hasHead = true;
    }

    const memberId = `mem-${chap.name.toLowerCase()}-${memberIdCounter++}`;
    const phone = cleanPhone(parts[17] || parts[16] || parts[18] || '');
    const houseCond = cleanHouse(parts[12] || parts[11] || '');
    if (phone && !currentHousehold.primaryPhone) {
      currentHousehold.primaryPhone = phone;
    }
    if (houseCond && !currentHousehold.houseCondition) {
      currentHousehold.houseCondition = houseCond;
    }

    const member = {
      id: memberId,
      familyId: currentFamilyId,
      familyNo: currentFamilyNo,
      chapel: chap.name,
      chapelAmharic: chap.nameAmharic,
      roleInFamily: role,
      name: personName,
      age: cleanAge(parts[3]),
      gender: cleanGender(parts[4]),
      occupation: cleanText(parts[5]),
      education: cleanText(parts[6]),
      baptism: cleanBaptism(parts[7]),
      lordSupper: cleanLordSupper(parts[8]),
      tithe: cleanTithe(parts[9]),
      marriage: cleanMarriage(parts[10]),
      participation: cleanText(parts[11]) || 'አባል',
      houseCondition: houseCond || currentHousehold.houseCondition || 'የግል',
      responsibility: cleanText(parts[15] || parts[14] || ''),
      spiritualEdu: cleanText(parts[16] || parts[15] || ''),
      phoneNumber: phone,
      examination: cleanText(parts[18] || parts[17] || '')
    };

    allMembers.push(member);
    currentHousehold.allMembers.push(member);
    currentHousehold.membersCount++;

    if (role === 'Head') {
      currentHousehold.head = member;
      currentHousehold.headName = member.name;
    } else if (role === 'Spouse') {
      currentHousehold.spouse = member;
      currentHousehold.spouseName = member.name;
    } else if (role === 'Child') {
      currentHousehold.children.push(member);
    }
  }

  if (currentHousehold) {
    allHouseholds.push(currentHousehold);
  }
}

console.log(`Parsed total members: ${allMembers.length}, total households: ${allHouseholds.length}`);

// Generate TS file
const tsContent = `// Auto-generated church data module
import { MemberRecord, Household, ChapelInfo } from './types';

export const CHAPELS: ChapelInfo[] = [
  {
    id: 'all',
    nameAmharic: 'ሁሉም ቻፕሎች',
    nameEnglish: 'All Chapels',
    description: 'የሁሉም አምስቱ ቻፕሎች አጠቃላይ የአባላት እና ቤተሰቦች መረጃ ቋት',
    color: '#0284c7',
    bgLight: 'bg-sky-50 dark:bg-sky-950/40',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200'
  },
  {
    id: 'eliroi',
    nameAmharic: 'ኤልሮኢ ቻፕል',
    nameEnglish: 'Eliroi Chapel',
    description: 'ኤልሮኢ (የሚያየኝ ሕያው አምላክ) ቻፕል ማህበረሰብ',
    leader: 'መለሰ ዳኘ ቦጋለ',
    color: '#0d9488',
    bgLight: 'bg-teal-50 dark:bg-teal-950/40',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200'
  },
  {
    id: 'shalom',
    nameAmharic: 'ሻሎም ቻፕል',
    nameEnglish: 'Shalom Chapel',
    description: 'ሻሎም (ሰላም) ቻፕል ማህበረሰብ',
    leader: 'ሞግሴ ሞኮንን / ዘካሪያስ ሀጂሶ',
    color: '#3b82f6',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
  },
  {
    id: 'betel',
    nameAmharic: 'ቤቴል ቻፕል',
    nameEnglish: 'Betel Chapel',
    description: 'ቤቴል (የእግዚአብሔር ቤት) ቻፕል ማህበረሰብ',
    leader: 'ሰለሞን ሻንካ ሳቦሬ / ታደለች ታኪሶ',
    color: '#8b5cf6',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200'
  },
  {
    id: 'yahewe',
    nameAmharic: 'ያህዌ ቻፕል',
    nameEnglish: 'Yahewe Chapel',
    description: 'ያህዌ (ሁሉን ቻይ አምላክ) ቻፕል ማህበረሰብ',
    leader: 'ኡፋይሳ ሎራቶ / ያዕቆብ ዳዊት',
    color: '#f59e0b',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
  },
  {
    id: 'eden',
    nameAmharic: 'ኤዴን ቻፕል',
    nameEnglish: 'Eden Chapel',
    description: 'ኤዴን (ደስታና ሰላም) ቻፕል ማህበረሰብ',
    leader: 'ዳዊት ጫመቶ / እስራኤል ኢሳያስ',
    color: '#10b981',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
  }
];

export const INITIAL_MEMBERS: MemberRecord[] = ${JSON.stringify(allMembers, null, 2)};

export const INITIAL_HOUSEHOLDS: Household[] = ${JSON.stringify(allHouseholds, null, 2)};
`;

fs.writeFileSync('lib/churchData.ts', tsContent);
console.log('Successfully wrote lib/churchData.ts');
