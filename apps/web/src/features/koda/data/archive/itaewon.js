// Preserved local event content; reservation availability is handled by the repository.
export default {
  id: 'itaewon',
  reviewSeriesId: 'itaewon',
  title: {
    ko: '이태원에서 시작한\n첫 언어교환',
    en: 'Our First Meetup\nin Itaewon',
  },
  intro: {
    ko: '우리의 첫 인사가 시작된 이태원.\n한국어와 영어로 문화와 일상을 나눴던 첫 모임이에요.',
    en: 'Our first hello, in Itaewon.\nAn evening of sharing cultures and everyday stories in Korean and English.',
  },
  organizer: {ko: 'Koin × Ddakji', en: 'Koin × Ddakji'},
  edition: 'OUR FIRST HELLO · ITAEWON',
  cover: {
    url: '/koda-assets/itaewon-poster.png',
    alt: 'Koin × Ddakji · Language Exchange in Itaewon · September 10 · Hans',
    width: 1440,
    height: 1800,
  },
  // Source archive says Thursday, September 10; 2026 matches the other migrated events.
  startsAt: '2026-09-10T19:00:00+09:00',
  endsAt: '2026-09-10T21:00:00+09:00',
  location: {
    name: {ko: '이태원한스', en: 'Itaewon Hans'},
    address: {
      ko: '서울 용산구 이태원로19길 6-5 1층',
      en: '1F, 6-5 Itaewon-ro 19-gil, Yongsan-gu, Seoul',
    },
    mapUrl: 'https://naver.me/5OQwCwSQ',
  },
  pricing: {
    amount: 10000,
    currency: 'KRW',
    note: {
      ko: '당시 참가비 · 음료 별도 주문',
      en: 'Entry fee at the time · Drinks ordered separately',
    },
  },
  about: [
    {
      ko: '언어를 연습하는 것을 넘어 서로의 문화와 일상을 나누며 자연스럽게 가까워질 수 있는 자리를 만들었습니다. 이태원한스에서 시작한 우리의 첫 언어교환 모임입니다.',
      en: 'We created a relaxed place to practise languages, share cultures and everyday stories, and make connections. This was our first language exchange, at Itaewon Hans.',
    },
    {
      ko: '네 명이 한 테이블에 앉고, 라운드가 끝나면 자리를 바꾸는 방식으로 진행했어요. 대화 주제 카드와 진행자의 안내에 따라 한국어와 영어로 이야기를 나눴습니다. 당시 모집 정원은 외국인 15명, 한국인 10명으로 총 25명이었어요.',
      en: 'Guests sat in groups of four and changed tables between rounds, with conversation prompts and a host guiding the evening in Korean and English. The event offered 25 places: 15 for internationals and 10 for Koreans.',
    },
  ],
  program: {
    steps: [
      {
        ko: '19:00–19:10 · 체크인 — 이름표를 받고 자리에 앉아요.',
        en: '19:00–19:10 · Check-in — Grab a name tag and settle in.',
      },
      {
        ko: '19:10–19:20 · 아이스브레이킹 — 같은 테이블 사람들과 인사해요.',
        en: '19:10–19:20 · Icebreaker — Say hello to your table.',
      },
      {
        ko: '19:20–19:50 · 라운드 1 — 한국어로 대화해요.',
        en: '19:20–19:50 · Round 1 — Conversation in Korean.',
      },
      {
        ko: '19:50–20:20 · 라운드 2 — 자리를 바꾸고 영어로 대화해요.',
        en: '19:50–20:20 · Round 2 — Switch tables and chat in English.',
      },
      {
        ko: '20:20–20:30 · 미니 이벤트 — 작은 게임과 선물을 즐겨요.',
        en: '20:20–20:30 · Mini event — A short game with prizes.',
      },
      {
        ko: '20:30–20:55 · 라운드 3 — 언어 제한 없이 편하게 이야기해요.',
        en: '20:30–20:55 · Round 3 — Open conversation in either language.',
      },
      {
        ko: '20:55–21:00 · 마무리 — 원하는 분들과 단체 사진을 찍어요.',
        en: '20:55–21:00 · Wrap-up — An optional group photo to close the evening.',
      },
    ],
  },
  faqs: [
    {
      question: {
        ko: '언어가 서툴러도 괜찮나요?',
        en: 'What if my level is low?',
      },
      answer: {
        ko: '테이블마다 두 언어를 모두 쓸 수 있는 사람이 최소 한 명 앉도록 배치하고, 초급자용 주제 카드를 준비했어요.',
        en: 'Every table had at least one person comfortable in both languages, with separate conversation prompts for beginners.',
      },
    },
    {
      question: {
        ko: '혼자 참가해도 괜찮았나요?',
        en: 'Could I come alone?',
      },
      answer: {
        ko: '혼자 오셔도 괜찮아요. 진행자가 자리를 배치하고 대화가 자연스럽게 이어지도록 도왔습니다.',
        en: 'Yes. The host assigned seats and helped conversations get started, whether or not guests knew anyone.',
      },
    },
  ],
  gallery: [
    {
      src: '/koda-assets/media/itaewon-group.jpg',
      caption: {
        ko: '이태원한스에서 함께한 첫 모임',
        en: 'Our first gathering at Itaewon Hans',
      },
    },
    {
      src: '/koda-assets/media/itaewon-meetup.mp4',
      poster: '/koda-assets/media/itaewon-meetup-poster.jpg',
      type: 'video',
      caption: {
        ko: '첫 언어교환의 순간들',
        en: 'Moments from our first language exchange',
      },
    },
  ],
  relatedIds: ['regular', 'halloween'],
};
