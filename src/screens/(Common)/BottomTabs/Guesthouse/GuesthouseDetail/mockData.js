// GuesthouseDetail/mockData.js

export const rooms = [
    {
      id: '1',
      type: '4인실 남자',
      price: 30000,
      checkin: '입실 16:00 퇴실 11:00',
      image: require('@assets/images/exphoto.jpeg'),
    },
    {
      id: '2',
      type: '4인실 여자',
      price: 30000,
      checkin: '입실 16:00 퇴실 11:00',
      image: require('@assets/images/exphoto.jpeg'),
    },
    {
      id: '3',
      type: '2인실 남자',
      price: 25000,
      checkin: '입실 16:00 퇴실 11:00',
      image: require('@assets/images/exphoto.jpeg'),
    },
    {
      id: '4',
      type: '2인실 여자',
      price: 25000,
      checkin: '입실 16:00 퇴실 11:00',
      image: require('@assets/images/exphoto.jpeg'),
    },
  ];
  
  export const reviews = Array.from({ length: 10 }).map((_, index) => ({
    id: index.toString(),
    name: '닉네임',
    rating: 5,
    comment: '숙소 깔끔하고 예쁘고 편했습니다. 의사소통도 빠르게 되고 재미있었어요.\n다음에 또 놀러 오고싶어요',
    images: [
      require('@assets/images/exphoto.jpeg'),
      require('@assets/images/exphoto.jpeg'),
    ],
}));
  