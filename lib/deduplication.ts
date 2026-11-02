// lib/deduplication.ts
// Utility for Cross-Chapel duplicate detection and smart data synchronization

import { MemberRecord, Household } from './types';

export interface CrossChapelConflict {
  id: string;
  type: 'same_phone' | 'same_head_name' | 'same_member_name';
  titleAmharic: string;
  titleEnglish: string;
  descriptionAmharic: string;
  descriptionEnglish: string;
  chapels: { id: string; nameAmharic: string; nameEnglish: string }[];
  households: Household[];
  members: MemberRecord[];
  commonValue: string; // The phone or name that caused the match
}

// Normalize name for matching (removes extra spaces, punctuation)
export function normalizeName(name?: string): string {
  if (!name) return '';
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

// Normalize phone
export function normalizePhone(phone?: string): string {
  if (!phone) return '';
  let p = phone.replace(/[\s\-\(\)\+]/g, '');
  if (p.startsWith('251')) p = '0' + p.slice(3);
  if (p.startsWith('9') && p.length === 9) p = '0' + p;
  return p;
}

/**
 * Scan all members and households to find cross-chapel duplicates:
 * 1. Same phone number registered in different chapels
 * 2. Same household head name registered in different chapels
 * 3. Same member full name + age registered in different chapels
 */
export function findCrossChapelDuplicates(
  members: MemberRecord[],
  households: Household[],
  ignoredConflictIds: string[] = []
): CrossChapelConflict[] {
  const conflicts: CrossChapelConflict[] = [];
  const ignoredSet = new Set(ignoredConflictIds);

  // 1. Check Household Heads with identical names in different chapels
  const headNameMap = new Map<string, Household[]>();
  for (const hh of households) {
    if (!hh.headName || hh.headName.trim().length < 3) continue;
    const norm = normalizeName(hh.headName);
    if (!headNameMap.has(norm)) {
      headNameMap.set(norm, []);
    }
    headNameMap.get(norm)!.push(hh);
  }

  headNameMap.forEach((hhList, normName) => {
    // Check if these households belong to different chapels
    const chapelsInList = new Set(hhList.map(h => h.chapel.toLowerCase()));
    if (chapelsInList.size > 1) {
      const cleanNameSlug = normName.trim().replace(/\s+/g, '-');
      const sortedChapels = Array.from(chapelsInList).sort().join('-');
      const conflictId = `conflict-head-${cleanNameSlug}-${sortedChapels}`;

      if (!ignoredSet.has(conflictId) && !conflicts.some(c => c.id === conflictId)) {
        const involvedChapels = Array.from(
          new Map(
            hhList.map(h => [
              h.chapel.toLowerCase(),
              { id: h.chapel.toLowerCase(), nameAmharic: h.chapelAmharic, nameEnglish: h.chapel },
            ])
          ).values()
        );

        conflicts.push({
          id: conflictId,
          type: 'same_head_name',
          titleAmharic: `ተመሳሳይ የቤተሰብ ራስ ስም፦ ${hhList[0].headName}`,
          titleEnglish: `Identical Family Head Name: ${hhList[0].headName}`,
          descriptionAmharic: `ይህ የቤተሰብ ራስ ስም በ ${involvedChapels.length} የተለያዩ ቻፕሎች ውስጥ ተመዝግቧል (${involvedChapels.map(c => c.nameAmharic).join('፣ ')})።`,
          descriptionEnglish: `This family head name appears in ${involvedChapels.length} different chapels (${involvedChapels.map(c => c.nameEnglish).join(', ')}).`,
          chapels: involvedChapels,
          households: hhList,
          members: hhList.flatMap(h => h.allMembers),
          commonValue: hhList[0].headName,
        });
      }
    }
  });

  // 2. Check identical phone numbers registered in different chapels
  const phoneMap = new Map<string, MemberRecord[]>();
  for (const m of members) {
    const normP = normalizePhone(m.phoneNumber);
    if (!normP || normP.length < 9) continue;
    if (!phoneMap.has(normP)) {
      phoneMap.set(normP, []);
    }
    phoneMap.get(normP)!.push(m);
  }

  phoneMap.forEach((mList, normPhone) => {
    const chapelsInList = new Set(mList.map(m => m.chapel.toLowerCase()));
    if (chapelsInList.size > 1) {
      const sortedChapels = Array.from(chapelsInList).sort().join('-');
      const conflictId = `conflict-phone-${normPhone}-${sortedChapels}`;

      if (!ignoredSet.has(conflictId) && !conflicts.some(c => c.id === conflictId)) {
        // Avoid adding duplicate if head name already covered exact same conflict
        const alreadyCovered = conflicts.some(
          c => c.type === 'same_head_name' && c.households.some(h => normalizePhone(h.primaryPhone) === normPhone)
        );

        if (!alreadyCovered) {
          const involvedChapels = Array.from(
            new Map(
              mList.map(m => [
                m.chapel.toLowerCase(),
                { id: m.chapel.toLowerCase(), nameAmharic: m.chapelAmharic, nameEnglish: m.chapel },
              ])
            ).values()
          );

          // Find associated households
          const involvedHouseholdIds = new Set(mList.map(m => m.familyId));
          const involvedHouseholds = households.filter(h => involvedHouseholdIds.has(h.id));

          conflicts.push({
            id: conflictId,
            type: 'same_phone',
            titleAmharic: `ተመሳሳይ ስልክ ቁጥር፦ ${normPhone}`,
            titleEnglish: `Identical Phone Number: ${normPhone}`,
            descriptionAmharic: `ስልክ ቁጥር ${normPhone} በ ${involvedChapels.length} የተለያዩ ቻፕሎች ውስጥ ለተለያዩ አባላት ተመዝግቧል (${mList.map(m => `${m.name} - ${m.chapelAmharic}`).join('፤ ')})።`,
            descriptionEnglish: `Phone ${normPhone} appears across ${involvedChapels.length} different chapels (${mList.map(m => `${m.name} in ${m.chapel}`).join('; ')}).`,
            chapels: involvedChapels,
            households: involvedHouseholds,
            members: mList,
            commonValue: normPhone,
          });
        }
      }
    }
  });

  return conflicts;
}

export type UpsertMode = 'smart_update' | 'replace_chapels' | 'append_only';

export interface UpsertResult {
  updatedList: MemberRecord[];
  updatedCount: number;
  addedCount: number;
  replacedChapels: string[];
}

/**
 * Smart Upsert and Synchronization logic:
 * Updates existing records in place, or adds new records, or replaces specific chapels.
 */
export function synchronizeMembers(
  existingMembers: MemberRecord[],
  incomingMembers: MemberRecord[],
  mode: UpsertMode = 'smart_update'
): UpsertResult {
  if (incomingMembers.length === 0) {
    return {
      updatedList: existingMembers,
      updatedCount: 0,
      addedCount: 0,
      replacedChapels: [],
    };
  }

  // Which chapels are in the incoming payload?
  const incomingChapelIds = Array.from(new Set(incomingMembers.map(m => m.chapel.toLowerCase())));

  if (mode === 'replace_chapels') {
    // Keep members from untouched chapels, replace incoming chapels completely
    const untouched = existingMembers.filter(
      m => !incomingChapelIds.includes(m.chapel.toLowerCase())
    );
    return {
      updatedList: [...untouched, ...incomingMembers],
      updatedCount: existingMembers.length - untouched.length,
      addedCount: incomingMembers.length,
      replacedChapels: incomingChapelIds,
    };
  }

  if (mode === 'append_only') {
    // Only add members whose full name + chapel is not in existing
    const existingKeys = new Set(
      existingMembers.map(m => `${m.chapel.toLowerCase()}::${normalizeName(m.name)}`)
    );
    const toAdd = incomingMembers.filter(
      m => !existingKeys.has(`${m.chapel.toLowerCase()}::${normalizeName(m.name)}`)
    );
    return {
      updatedList: [...existingMembers, ...toAdd],
      updatedCount: 0,
      addedCount: toAdd.length,
      replacedChapels: [],
    };
  }

  // Default: 'smart_update' (Upsert - Updates existing in-place, adds new)
  let updatedCount = 0;
  let addedCount = 0;

  // Build a lookup map of existing members by Chapel + Name, and by Chapel + FamilyNo + Role
  const existingMapByName = new Map<string, MemberRecord>();
  const existingMapByFamily = new Map<string, MemberRecord>();

  for (const m of existingMembers) {
    const keyName = `${m.chapel.toLowerCase()}::${normalizeName(m.name)}`;
    const keyFam = `${m.chapel.toLowerCase()}::${m.familyNo}::${m.roleInFamily}::${normalizeName(m.name)}`;
    existingMapByName.set(keyName, m);
    existingMapByFamily.set(keyFam, m);
  }

  const resultList: MemberRecord[] = [...existingMembers];
  const matchedExistingIds = new Set<string>();

  for (const incoming of incomingMembers) {
    const keyFam = `${incoming.chapel.toLowerCase()}::${incoming.familyNo}::${incoming.roleInFamily}::${normalizeName(incoming.name)}`;
    const keyName = `${incoming.chapel.toLowerCase()}::${normalizeName(incoming.name)}`;

    const match = existingMapByFamily.get(keyFam) || existingMapByName.get(keyName);

    if (match) {
      // Update in-place!
      matchedExistingIds.add(match.id);
      const index = resultList.findIndex(m => m.id === match.id);
      if (index !== -1) {
        resultList[index] = {
          ...match,
          ...incoming,
          id: match.id, // Preserve existing ID
          familyId: match.familyId, // Preserve existing family grouping
        };
        updatedCount++;
      }
    } else {
      // New record
      resultList.push(incoming);
      addedCount++;
    }
  }

  return {
    updatedList: resultList,
    updatedCount,
    addedCount,
    replacedChapels: incomingChapelIds,
  };
}
