export type Gender = 'Male' | 'Female';

export type BaptismStatus = 'የተጠመቀ' | 'ያልተጠመቀ' | 'Baptized' | 'Not Baptized';
export type LordSupperStatus = 'የሚካፈል' | 'የማይካፈል' | 'Participates' | 'Does not participate';
export type TitheStatus = 'የሚከፍል' | 'የማይከፍል' | 'Gives Tithe' | 'Does not give';
export type MarriageStatus = 'ያገባ' | 'ያላገባ' | 'የሞተበት' | 'የሞተባት' | 'የፈታች' | 'የፈታ' | 'Married' | 'Single' | 'Widowed' | 'Divorced';
export type MembershipStatus = 'አባል' | 'አባል ያልሆነ' | 'Member' | 'Non-Member';
export type HouseCondition = 'የግል' | 'ክራይ' | 'Owned' | 'Rented';

export type ChapelId =
  | 'all'
  | 'eliroi'
  | 'shalom'
  | 'betel'
  | 'yahewe'
  | 'eden'
  | 'ebenezer'
  | 'rehoboth'
  | 'elshaddai'
  | 'ruhama'
  | 'adonai';

export interface ChapelInfo {
  id: ChapelId;
  nameAmharic: string;
  nameEnglish: string;
  description: string;
  leader?: string;
  mottoAmharic?: string;
  mottoEnglish?: string;
  scriptureVerse?: string;
  color: string;
  bgLight: string;
  badgeClass: string;
}


export interface MemberRecord {
  id: string;
  familyId: string;
  familyNo: number;
  chapel: string; // 'Eliroi' | 'Shalom' | 'Betel' | 'Yahewe' | 'Eden'
  chapelAmharic: string;
  roleInFamily: 'Head' | 'Spouse' | 'Child' | 'Dependent';
  name: string;
  age: number | null;
  gender: Gender;
  occupation: string;
  education: string;
  baptism: string; // 'የተጠመቀ' | 'ያልተጠመቀ'
  lordSupper: string; // 'የሚካፈል' | 'የማይካፈል'
  tithe: string; // 'የሚከፍል' | 'የማይከፍል'
  marriage: string; // 'ያገባ' | 'ያላገባ' | etc.
  participation: string; // 'አባል' | 'አባል ያልሆነ'
  houseCondition: string; // 'የግል' | 'ክራይ'
  responsibility: string; // 'የቻፕል መሪ', 'አባል', 'ኳይር', 'ዲያቆን', etc.
  spiritualEdu: string; // 'መጽሐፍ ቅዱስ ድፕሎማ', 'ቢቲሲፒ', 'ድግሪ', etc.
  phoneNumber: string;
  examination: string;
}

export interface Household {
  id: string;
  familyNo: number;
  chapel: string;
  chapelAmharic: string;
  headName: string;
  spouseName?: string;
  membersCount: number;
  primaryPhone: string;
  houseCondition: string;
  head: MemberRecord;
  spouse?: MemberRecord | null;
  children: MemberRecord[];
  allMembers: MemberRecord[];
}

export interface CensusStats {
  totalMembers: number;
  totalHouseholds: number;
  males: number;
  females: number;
  baptizedCount: number;
  baptizedPercentage: number;
  lordSupperCount: number;
  lordSupperPercentage: number;
  titheCount: number;
  tithePercentage: number;
  ownedHomes: number;
  rentedHomes: number;
  childrenCount: number; // age < 13
  youthCount: number; // 13 - 29
  adultCount: number; // 30 - 59
  elderlyCount: number; // 60+
  withSpiritualEdu: number;
  leadershipCount: number;
  chapelBreakdown: {
    chapel: string;
    chapelAmharic: string;
    count: number;
    households: number;
  }[];
}
