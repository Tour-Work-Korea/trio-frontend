// Local catalog in the proposed API shape. No reservation or payment authority.
// displayLabel preserves original KRW/USD editorial copy; it is not a currency conversion.
import {reviews} from './reviews.js';
import itaewon from './archive/itaewon.js';
import chickenChat from './archive/chicken-chat.js';
import halloween from './archive/halloween.js';
export const eventCatalog = {
  reviews,
  events: [itaewon, chickenChat, halloween],
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
};
