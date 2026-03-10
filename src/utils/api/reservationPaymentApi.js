import api from './axiosInstance';

const reservationPaymentApi = {

  // 객실 예약 생성
  createRoomReservation: (roomId, data) =>
    api.post(
      `/payments/toss/reservation/room/${roomId}`,
      data,
    ),

  // 모임 예약 생성
  createPartyReservation: (partyId, data) =>
    api.post(
      `/payments/toss/reservation/party/${partyId}`,
      data,
    ),

  // 예약 ID 기반 결제 페이지 진입
  // reservationType: GUESTHOUSE, PARTY
  requestPayment: (reservationId, reservationType = 'GUESTHOUSE') =>
    api.get('/payments/toss/request/reservation', {
      params: {reservationId, reservationType},
    }),

  // 토스 결제 성공 콜백
  confirmPaymentSuccess: ({paymentKey, orderId, amount}) =>
    api.get('/payments/toss/success', {
      params: {paymentKey, orderId, amount},
    }),

  // 게하 예약 완료 상세
  getReservationPaymentDetail: reservationId =>
    api.get(
      `/payments/toss/reservation/detail/${reservationId}`,
    ),

  // 파티 예약 내역 조회
  getPartyReservationList: () =>
    api.get('/payments/toss/reservation/party'),

  // 파티 예약 완료 상세
  getPartyReservationDetail: reservationId =>
    api.get(
      `/payments/toss/reservation/detail/party/${reservationId}`,
    ),

  // 게스트하우스/모임 예약 취소
  // type: GUESTHOUSE, PARTY
  cancelReservation: (reservationId, type = 'GUESTHOUSE', cancelReason = '') =>
    api.delete(`/payments/toss/reservation/${reservationId}`, {
      data: {type, cancelReason},
    }),

  
};

export default reservationPaymentApi;
