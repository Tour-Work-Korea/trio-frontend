import api from './axiosInstance';

const userGuesthouseApi = {
  // 게하 키워드 검색
  searchGuesthouseByKeyword: keyword =>
    api.get('/guesthouse/keyword', {
      params: {keyword},
      withAuth: false,
    }),

  // 유저 게스트하우스 검색 조회
  getGuesthouseList: ({
    checkIn,
    checkOut,
    guestCount,
    keyword,
    keywordId,
    regionIds,
    page,
    size = 10,
    sortBy,
    minPrice,
    maxPrice,
    hashtagIds,
    amenityIds,
    availableOnly,
  }) =>
    api.get('/user/guesthouses', {
      params: {
        checkIn,
        checkOut,
        guestCount,
        keyword,
        keywordId,
        regionIds,
        page,
        size,
        sortBy,
        minPrice,
        maxPrice,
        hashtagIds,
        amenityIds,
        availableOnly,
      },
      withAuth: false,
    }),

  // 유저 게스트하우스 상세 조회
  getGuesthouseDetail: ({guesthouseId, checkIn, checkOut, guestCount}) =>
    api.get(`/user/guesthouses/${guesthouseId}`, {
      params: {
        checkIn,
        checkOut,
        guestCount,
      },
      withAuth: false,
    }),

  // 게스트하우스 좋아요
  favoriteGuesthouse: guesthouseId =>
    api.post(`/user/guesthouses/favorites/${guesthouseId}`),

  // 게스트하우스 좋아요 취소
  unfavoriteGuesthouse: guesthouseId =>
    api.delete(`/user/guesthouses/favorites/${guesthouseId}`),

  // 방 예약 생성
  reserveRoom: (roomId, body) =>
    api.post(`/order/reservation/room/${roomId}`, body),

  // 예약 임시 승인
  approveTempGuesthouseReservation: reservationId =>
    api.put(`/order/reservation/temp/guesthouse/approve/${reservationId}`),

  // 결제 검증 및 확정
  verifyPayment: (reservationId, body) =>
    api.post(`/order/payment/${reservationId}`, body),

  // 특정 게스트하우스의 리뷰 조회
  getGuesthouseReviews: ({guesthouseId, page, size, sort}) =>
    api.get(`/${guesthouseId}/reviews`, {
      params: {
        page,
        size,
        sort,
      },
      withAuth: false,
    }),

  // 인기 게스트하우스 조회
  getPopularGuesthouses: ({ page, size = 10 } = {}) =>
    api.get('/user/guesthouses/popular', {
      params: { page, size },
      withAuth: false,
    }),
};

export default userGuesthouseApi;
