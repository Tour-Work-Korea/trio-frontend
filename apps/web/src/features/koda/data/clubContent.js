// Club copy stays separate from event data and can grow independently.
export const clubCopy = {
  ko: {
    about: '유창하지 않아도,\n혼자여도 괜찮아요.',
    aboutText:
      'Koin과 게딱지가 함께 만드는 언어교환, KODA CLUB. 서로의 언어로 일상과 문화를 나누며, 낯선 사람이 친구가 되는 시간을 만들어요.',
    nameMeaning: 'Koda, 친구라는 뜻.',
    nameStory:
      '다코타어에서 ‘친구’를 뜻하는 Koda. 우리도 서로 다른 언어로 만나, 친구가 되어가는 곳이고 싶어요.',
  },
  en: {
    about: 'Come on your own.\nCome as you are.',
    aboutText:
      'KODA CLUB is a language exchange brought to you by Koin and Ddakji. We share our languages, everyday stories, and cultures, making room for strangers to become friends.',
    nameMeaning: 'Koda, a word for friend.',
    nameStory:
      'Koda means “friend” in Dakota. That’s the kind of place we want to be: where different languages bring us together, and conversations become friendships.',
  },
};

export const clubPartners = [
  {
    id: 'koin',
    name: {ko: 'Koin', en: 'Koin'},
    website: 'https://www.koreainsider.kr/',
    domain: 'koreainsider.kr',
    image: {
      src: '/koda-assets/partners/koin-app.png',
      width: 786,
      height: 1214,
      alt: {
        ko: 'Koin 앱의 한국 여행·문화 콘텐츠 화면',
        en: 'Koin app showing travel and culture guides for Korea',
      },
      caption: {
        ko: 'Koin · 한국을 알아가는 일상',
        en: 'Koin · Discover everyday Korea',
      },
    },
    description: {
      ko: '외국인을 위한 한국 생활·여행 가이드와 커뮤니티',
      en: 'A guide and community for life and travel in Korea',
    },
  },
  {
    id: 'ddakji',
    name: {ko: '게딱지', en: 'Ddakji'},
    nameNote: {ko: '(게스트하우스 딱, 지금!)'},
    website: 'https://ddakji.kr/',
    domain: 'ddakji.kr',
    image: {
      src: '/koda-assets/partners/ddakji-app.png',
      hasDeviceChrome: true,
      width: 375,
      height: 925,
      alt: {
        ko: '게딱지 앱의 게스트하우스와 여행 콘텐츠 화면',
        en: 'Ddakji app showing guesthouses and travel experiences',
      },
      caption: {
        ko: '게딱지 · 여행에서 시작되는 만남',
        en: 'Ddakji · Connections that begin with travel',
      },
    },
    description: {
      ko: '게스트하우스 중심 여행 소셜 플랫폼',
      en: 'A social travel platform centered on guesthouses',
    },
  },
];
