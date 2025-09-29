import api from './axiosInstance';

const hostGuesthouseApi = {
  // 사장님 전체 게스트하우스 조회
  getMyGuesthouses: () => api.get('/host/guesthouses'),

  // 특정 게스트하우스 상세 조회
  getGuesthouseDetail: guesthouseId =>
    api.get(`/host/guesthouses/${guesthouseId}`),

  // 게스트하우스 등록
  registerGuesthouse: guesthouseData =>
    api.post('/host/guesthouses', guesthouseData),

  // 게스트하우스 수정

  /** 게스트하우스 기본정보 수정 (이름/주소/전화/소개/체크인아웃/규칙)
   * body {
   *  guesthouseName, guesthouseAddress, guesthousePhone,
   *  guesthouseDetailAddress, guesthouseShortIntro,
   *  guesthouseLongDescription, checkIn, checkOut, rules
   * }
   * 부분 수정 가능: 필요한 필드만 포함해서 보내면 됨
   */
  updateGuesthouseBasic: (guesthouseId, payload) =>
    api.put(`/host/guesthouses/${guesthouseId}`, payload),

  /** 게스트하우스 이미지 수정
   * body: [{ guesthouseImageUrl: string, isThumbnail: boolean }, ...]
   * 규칙: 썸네일은 정확히 1개, 기존 포함 모든 이미지의 url 전체 전달
   */
  updateGuesthouseImages: (guesthouseId, images) =>
    api.put(`/host/guesthouses/${guesthouseId}/images`, images),

  /** 게스트하우스 해시태그 수정
   * body: [1,2,3]  // 해시태그 id 배열 (최대 3개, 기존 포함 전체 전달)
   */
  updateGuesthouseHashtags: (guesthouseId, hashtagIds) =>
    api.put(`/host/guesthouses/${guesthouseId}/hashtags`, hashtagIds),

  /** 게스트하우스 편의시설 수정
   * body: [{ amenityId: number, count: number }, ...]
   * 규칙: 기존 포함 모든 편의시설을 전체 전달
   */
  updateGuesthouseAmenities: (guesthouseId, amenities) =>
    api.put(`/host/guesthouses/${guesthouseId}/amenities`, amenities),

  /** 객실 기본 정보 수정
   * body {
   *  roomName, roomType, roomCapacity, roomMaxCapacity,
   *  roomDescription, roomPrice
   * }
   * 부분 수정 가능
   */
  updateRoomBasic: (guesthouseId, roomId, payload) =>
    api.put(`/host/guesthouses/${guesthouseId}/rooms/${roomId}`, payload),

  /** 객실 이미지 수정
   * body: [{ roomImageUrl: string, isThumbnail: boolean }, ...]
   * 규칙: 썸네일은 정확히 1개, 기존 포함 모든 이미지의 url 전체 전달
   */
  updateRoomImages: (guesthouseId, roomId, images) =>
    api.put(
      `/host/guesthouses/${guesthouseId}/rooms/${roomId}/images`,
      images
    ),

  /** 객실 추가
   * body {
   *  roomName, roomType, roomCapacity, roomMaxCapacity,
   *  roomDescription, roomPrice,
   *  roomExtraFees: [{ startDate, endDate, addPrice }],
   *  roomImages: [{ roomImageUrl, isThumbnail }]
   * }
   */
  createRoom: (guesthouseId, roomPayload) =>
    api.post(`/host/guesthouses/${guesthouseId}/rooms`, roomPayload),

  // 객실 삭제
  deleteRoom: (guesthouseId, roomId) =>
    api.delete(`/host/guesthouses/${guesthouseId}/rooms/${roomId}`),

  // 게스트하우스 삭제
  deleteGuesthouse: guesthouseId =>
    api.delete(`/host/guesthouses/${guesthouseId}`),

  // 특정 게스트하우스 리뷰 목록 조회
  getGuesthouseReviews: ({guesthouseId, page, size, sort}) =>
    api.get(`/${guesthouseId}/reviews`, {
      params: {
        page,
        size,
        sort,
      },
    }),

  // 리뷰에 대한 답글 작성
  postReviewReply: (reviewId, reply) =>
    api.post(`/host/reviews/${reviewId}/replies`, {reply}),

  // 리뷰 삭제 요청
  deleteReview: (reviewId, reason) =>
    api.post(`/host/reviews/${reviewId}`, {
      reason,
    }),

  // 사장님 입점신청서 조회
  getHostApplications: () => api.get('/host/my/application'),

  // 사장님 입점 신청서 등록
  postHostApplication: formData =>
    api.post('/host/my/application', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // 게하 예약 현황 조회
  getGuesthouseReservations: (guesthouseId) =>
    api.get(`/order/host/reservation/${guesthouseId}`),
};

export default hostGuesthouseApi;
