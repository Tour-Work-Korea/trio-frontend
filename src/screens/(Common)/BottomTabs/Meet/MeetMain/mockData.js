import { meetTags } from '@data/meetOptions';

const getTag = (id) => meetTags.find(tag => tag.id === id);
const getTags = (ids) => ids.map(getTag).filter(Boolean);

export const MOCK_MEETS = [
  {
    id: 1,
    placeName: '막내네 게스트하우스',
    title: '남성 스탭 모집',
    address: '제주시 애월리 20002-7',
    thumbnail: require('@assets/images/exphoto.jpeg'),
    price: 55000,
    startAt: getTodayIsoWithTime(9, 0),
    capacity: 10,
    joined: 1,
    tags: getTags(['alcohol']),
  },
  {
    id: 2,
    placeName: '막내네 게스트하우스',
    title: '게하 파티 모집',
    address: '제주시 애월리 20002-7',
    thumbnail: require('@assets/images/exphoto.jpeg'),
    price: 45000,
    startAt: getTodayIsoWithTime(15, 0),
    capacity: 12,
    joined: 5,
    tags: getTags(['meal', 'karaoke']),
  },
  {
    id: 3,
    placeName: '막내네 게스트하우스',
    title: '혼술모임',
    address: '제주시 애월리 20002-7',
    thumbnail: require('@assets/images/exphoto.jpeg'),
    price: 30000,
    startAt: getIsoPlusDays(1, 10, 0),
    capacity: 6,
    joined: 4,
    tags: getTags(['alcohol', 'snack']),
  },
  {
    id: 4,
    placeName: '막내네 게스트하우스',
    title: '게임 & 노래방 번개',
    address: '제주시 애월리 20002-7',
    thumbnail: require('@assets/images/exphoto.jpeg'),
    price: 20000,
    startAt: getIsoPlusDays(2, 20, 0),
    capacity: 8,
    joined: 3,
    tags: getTags(['karaoke']),
  },
  {
    id: 5,
    placeName: '삼다수 게하',
    title: '음식 지참 모임',
    address: '서귀포시 표선면 110-3',
    thumbnail: require('@assets/images/exphoto.jpeg'),
    price: 0,
    startAt: getIsoPlusDays(2, 18, 30),
    capacity: 15,
    joined: 7,
    tags: getTags(['no_meal']),
  },
  {
    id: 6,
    placeName: '제주 숲속 게스트하우스',
    title: '힐링 토크 술자리',
    address: '제주시 조천읍 숲길 123',
    thumbnail: require('@assets/images/exphoto.jpeg'),
    price: 35000,
    startAt: getIsoPlusDays(3, 20, 0),
    capacity: 10,
    joined: 6,
    tags: getTags(['alcohol']),
  },
  {
    id: 7,
    placeName: '바닷가 게하',
    title: '바다 보며 담소 나누기',
    address: '제주시 구좌읍 해변로 45',
    thumbnail: require('@assets/images/exphoto.jpeg'),
    price: 25000,
    startAt: getIsoPlusDays(3, 17, 30),
    capacity: 8,
    joined: 4,
    tags: getTags(['snack']),
  },
  {
    id: 8,
    placeName: '도심 속 노래방 파티',
    title: '90년대 노래 부르기',
    address: '제주시 연동 100-1',
    thumbnail: require('@assets/images/exphoto.jpeg'),
    price: 40000,
    startAt: getIsoPlusDays(4, 21, 0),
    capacity: 10,
    joined: 9,
    tags: getTags(['karaoke', 'alcohol']),
  },
  {
    id: 9,
    placeName: '제주 흡연자 친목모임',
    title: '흡연자 모여라',
    address: '제주시 노형동 200-7',
    thumbnail: require('@assets/images/exphoto.jpeg'),
    price: 30000,
    startAt: getIsoPlusDays(5, 22, 0),
    capacity: 5,
    joined: 2,
    tags: getTags(['smoke']),
  },
];

function getTodayIsoWithTime(hour, minute) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function getIsoPlusDays(days, hour, minute) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
