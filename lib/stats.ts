import { MemberRecord, Household, CensusStats } from './types';

export function calculateCensusStats(
  members: MemberRecord[],
  households: Household[]
): CensusStats {
  const totalMembers = members.length;
  const totalHouseholds = households.length;

  let males = 0;
  let females = 0;
  let baptizedCount = 0;
  let lordSupperCount = 0;
  let titheCount = 0;
  let ownedHomes = 0;
  let rentedHomes = 0;
  let childrenCount = 0;
  let youthCount = 0;
  let adultCount = 0;
  let elderlyCount = 0;
  let withSpiritualEdu = 0;
  let leadershipCount = 0;

  const countedHomes = new Set<string>();

  for (const m of members) {
    if (m.gender === 'Male') males++;
    else if (m.gender === 'Female') females++;

    if (m.baptism === 'የተጠመቀ') baptizedCount++;
    if (m.lordSupper === 'የሚካፈል') lordSupperCount++;
    if (m.tithe === 'የሚከፍል') titheCount++;

    if (m.age !== null) {
      if (m.age < 13) childrenCount++;
      else if (m.age < 30) youthCount++;
      else if (m.age < 60) adultCount++;
      else elderlyCount++;
    }

    if (m.spiritualEdu && m.spiritualEdu.trim() !== '') {
      withSpiritualEdu++;
    }

    if (m.responsibility && m.responsibility !== 'አባል' && m.responsibility.trim() !== '') {
      leadershipCount++;
    }

    // Housing count per family
    if (!countedHomes.has(m.familyId)) {
      countedHomes.add(m.familyId);
      if (m.houseCondition === 'የግል') ownedHomes++;
      else if (m.houseCondition === 'ክራይ') rentedHomes++;
    }
  }

  const chapelList = [
    { chapel: 'Eliroi', chapelAmharic: 'ኤልሮኢ ቻፕል' },
    { chapel: 'Shalom', chapelAmharic: 'ሻሎም ቻፕል' },
    { chapel: 'Betel', chapelAmharic: 'ቤቴል ቻፕል' },
    { chapel: 'Yahewe', chapelAmharic: 'ያህዌ ቻፕል' },
    { chapel: 'Eden', chapelAmharic: 'ኤዴን ቻፕል' },
    { chapel: 'Ebenezer', chapelAmharic: 'አቤንኤዘር ቻፕል' },
    { chapel: 'Rehoboth', chapelAmharic: 'ርኆቦት ቻፕል' },
    { chapel: 'Elshaddai', chapelAmharic: 'ኤልሻዳይ ቻፕል' },
    { chapel: 'Ruhama', chapelAmharic: 'ሩሐማ ቻፕል' },
    { chapel: 'Adonai', chapelAmharic: 'አዶናይ ቻፕል' },
  ];

  const chapelBreakdown = chapelList.map(c => {
    const chapMembers = members.filter(m => m.chapel === c.chapel);
    const chapHouseholds = households.filter(h => h.chapel === c.chapel);
    return {
      chapel: c.chapel,
      chapelAmharic: c.chapelAmharic,
      count: chapMembers.length,
      households: chapHouseholds.length,
    };
  });

  return {
    totalMembers,
    totalHouseholds,
    males,
    females,
    baptizedCount,
    baptizedPercentage: totalMembers > 0 ? Math.round((baptizedCount / totalMembers) * 100) : 0,
    lordSupperCount,
    lordSupperPercentage: totalMembers > 0 ? Math.round((lordSupperCount / totalMembers) * 100) : 0,
    titheCount,
    tithePercentage: totalMembers > 0 ? Math.round((titheCount / totalMembers) * 100) : 0,
    ownedHomes,
    rentedHomes,
    childrenCount,
    youthCount,
    adultCount,
    elderlyCount,
    withSpiritualEdu,
    leadershipCount,
    chapelBreakdown,
  };
}
