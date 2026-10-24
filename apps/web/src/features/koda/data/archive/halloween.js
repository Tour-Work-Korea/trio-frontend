// Preserved local event content; reservation availability is handled by the repository.
export default {
  id: 'halloween',
  reviewSeriesId: 'halloween',
  title: {
    ko: '할로윈\n언어교환',
    en: 'Halloween\nLanguage Exchange',
  },
  intro: {
    ko: '한국어와 영어로 이야기하고,\n보드게임과 음악을 함께 즐기는 할로윈 모임.',
    en: 'Chat in Korean and English.\nEnjoy board games and music this Halloween.',
  },
  organizer: {
    ko: 'Koin × Ddakji',
    en: 'Koin × Ddakji',
  },
  edition: 'HALLOWEEN EDITION',
  cover: {
    url: '/koda-assets/halloween/poster.png',
    alt: 'KODA CLUB · Halloween Language Exchange · 31 October · Hongdae',
    width: 1080,
    height: 1350,
  },
  startsAt: '2026-10-31T17:00:00+09:00',
  endsAt: '2026-10-31T20:00:00+09:00',
  location: {
    name: {
      ko: '헥스 · 홍대',
      en: 'HEX · Hongdae',
    },
    address: {
      ko: '서울 마포구 성미산로 190-13, 지하 1층',
      en: 'B1, 190-13 Seongmisan-ro, Mapo-gu, Seoul',
    },
    mapUrl: 'https://naver.me/5fduP87G',
  },
  pricing: {
    amount: 30000,
    currency: 'KRW',
    displayLabel: {
      ko: '30,000원',
      en: '$22 USD',
    },
    note: {
      ko: '재참여 25,000원 · 동반 27,000원\n재참여·동반 할인은 중복 적용되지 않아요.',
      en: 'Returning guests $17 · With a friend $20\nDiscounts cannot be combined.',
    },
  },
  about: [
    {
      ko: '코스튬도 평상복도 모두 환영해요. 한국어와 영어로 편하게 대화하고, 보드게임과 음악을 함께 즐기며 새로운 친구를 만나요.',
      en: 'Costumes and everyday clothes are both welcome. Chat in Korean and English, enjoy board games and music, and meet new friends.',
    },
  ],
  program: {
    steps: [
      {
        ko: '드레스 코드 · 코스튬도 평상복도 환영해요.',
        en: 'Dress code · Costumes or casual clothes welcome.',
      },
      {
        ko: '언어교환 · 한국어와 영어로 이야기해요.',
        en: 'Language exchange · Chat in Korean and English.',
      },
      {
        ko: '보드게임 · 함께 놀며 새로운 친구를 만나요.',
        en: 'Board games · Play together and make new friends.',
      },
      {
        ko: '미니 이벤트 · 베스트 코스튬 상품과 1인 1회 초콜릿 뽑기. 행운의 음료권은 총 2–3개예요.',
        en: 'Mini events · Best costume prize and one chocolate draw each, with 2–3 drink vouchers in total.',
      },
      {
        ko: '음악과 어울림 · 자유롭게 대화를 나눠요.',
        en: 'Music & mingling · Relax and enjoy the conversation.',
      },
    ],
    image: {
      url: '/koda-assets/halloween/how-it-works.png',
      alt: {
        ko: '진행 안내',
        en: 'How it works',
      },
      width: 1080,
      height: 1350,
    },
  },
  faqs: [
    {
      question: {
        ko: '코스튬을 꼭 입어야 하나요?',
        en: 'Do I have to wear a costume?',
      },
      answer: {
        ko: '아니요! 코스튬도 평상복도 모두 환영해요. 베스트 코스튬 1등에게는 상품이 준비돼 있어요.',
        en: 'Not at all! Costumes and everyday clothes are both welcome. There’s a prize for the best costume.',
      },
    },
    {
      question: {
        ko: '영어나 한국어를 잘해야 하나요?',
        en: 'Do I need to be fluent?',
      },
      answer: {
        ko: '완벽하게 말하지 않아도 괜찮아요. 한국어와 영어로 편하게 대화하고, 보드게임을 함께 즐기며 서로 알아가요.',
        en: 'No need to be fluent. Chat in Korean and English and get to know each other over board games.',
      },
    },
    {
      question: {
        ko: '참가비와 할인은 어떻게 되나요?',
        en: 'What are the prices and discounts?',
      },
      answer: {
        ko: '기본 30,000원, 재참여 25,000원, 동반 27,000원입니다. 재참여 할인과 동반 할인은 중복 적용되지 않아요.',
        en: 'Standard admission is $22 USD, returning guests pay $17, and the bring-a-friend price is $20. Discounts cannot be combined.',
      },
    },
    {
      question: {
        ko: '초콜릿 뽑기는 어떻게 진행되나요?',
        en: 'How does the chocolate draw work?',
      },
      answer: {
        ko: '한 사람당 한 번 초콜릿을 뽑아요. 행운의 초콜릿에는 음료권이 들어 있어요.',
        en: 'Each person gets one chocolate draw. Lucky chocolates include a drink voucher.',
      },
    },
  ],
  gallery: [
    {
      src: '/koda-assets/media/hongdae-chicken-chat.jpg',
      caption: {
        ko: '치킨과 함께 나눈 이야기',
        en: 'Conversations over chicken',
      },
    },
    {
      src: '/koda-assets/media/hongdae-chicken-table.jpg',
      caption: {
        ko: '함께 즐긴 치킨',
        en: 'Chicken to share',
      },
    },
    {
      src: '/koda-assets/media/hongdae-chicken-venue.jpg',
      caption: {
        ko: '홍대 모임이 열린 공간',
        en: 'Our Chicken & Chat venue',
      },
    },
    {
      src: '/koda-assets/media/party-preview.mp4',
      poster: '/koda-assets/media/party-preview.jpg',
      type: 'video',
      caption: {
        ko: '홍대 치킨 언어교환',
        en: 'Chicken & Chat in Hongdae',
      },
    },
    {
      src: '/koda-assets/media/itaewon-group.jpg',
      caption: {
        ko: '이태원에서 함께한 사람들',
        en: 'Our gathering in Itaewon',
      },
    },
    {
      src: '/koda-assets/media/itaewon-meetup.mp4',
      poster: '/koda-assets/media/itaewon-meetup-poster.jpg',
      type: 'video',
      caption: {
        ko: '이태원 모임 현장',
        en: 'At our Itaewon meetup',
      },
    },
  ],
  relatedIds: ['regular', 'itaewon'],
};
