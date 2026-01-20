import api from './axiosInstance';

const reservationPaymentApi = {

  // 객실 예약 생성
  createRoomReservation: (roomId, data) =>
    api.post(
      `/payments/toss/reservation/room/${roomId}`,
      data,
    ),

  // 예약 ID 기반 결제 페이지 진입
  requestPayment: reservationId =>
    api.get('/payments/toss/request/reservation', {
      params: {reservationId},
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

  // 게스트하우스/모임 예약 취소
  // type: GUESTHOUSE, PARTY
  cancelReservation: (reservationId, type = 'GUESTHOUSE') =>
    api.delete(`/payments/toss/reservation/${reservationId}`, {
      data: {type},
    }),
};

export default reservationPaymentApi;
