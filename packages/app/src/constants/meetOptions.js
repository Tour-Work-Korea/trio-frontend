export const meetScales = [
  { id: 'small', name: '소규모\n(10명 미만)', isBigParty: false },
  { id: 'large', name: '대규모\n(10명 이상)', isBigParty: true },
];

export const stayTypes = [
  { id: 'only_guest', name: '숙박객만 참여', isGuest: true },
  { id: 'with_visitor', name: '비숙박객 참여', isGuest: false },
];

export const meetTags = [
  { id: 'Snack', name: '간식 제공' },
  { id: 'Food', name: '음식 제공' },
  { id: 'Drink', name: '술 제공' },
  { id: 'SelfFood', name: '개별 음식 지참' },
  { id: 'SmallTalk', name: '담소' },
  { id: 'NoSmoke', name: '금연' },
  { id: 'Karaoke', name: '노래방' },
];

export const meetSortOptions = [
  { id: 'RECOMMEND', name: '실시간 인기 순' },
  { id: 'LIKE_COUNT', name: '좋아요 순' },
  { id: 'LOW_PRICE', name: '낮은 가격 순' },
  { id: 'HIGH_PRICE', name: '높은 가격 순' },
];