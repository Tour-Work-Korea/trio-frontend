import {
  getReviewableItems,
  getReviewableReservationIds,
  mergeReviewableItemsWithReservations,
} from '@trio/app/src/utils/reviewEligibility';

describe('reviewEligibility', () => {
  const reviewPayload = {
    reviewableCount: 1,
    reviews: [
      {
        isReviewed: false,
        reservationId: 10,
        guesthouseId: 20,
        guesthouseName: '테스트 게하',
        roomName: '테스트 객실',
        reservationCheckIn: '2026-10-10',
        reservationCheckOut: '2026-10-11',
        checkIn: {hour: 15, minute: 0, second: 0},
        checkOut: '11:00:00',
      },
      {
        isReviewed: true,
        reservationId: 11,
      },
    ],
  };

  it('isReviewed가 false인 항목만 작성 가능 항목으로 반환한다', () => {
    expect(getReviewableItems(reviewPayload)).toHaveLength(1);
    expect(getReviewableItems(reviewPayload)[0].reservationId).toBe(10);
  });

  it('작성 가능 reservationId를 문자열 Set으로 반환한다', () => {
    expect(getReviewableReservationIds(reviewPayload)).toEqual(new Set(['10']));
  });

  it('예약 표시 필드를 결합하고 LocalTime 객체를 문자열로 변환한다', () => {
    const [result] = mergeReviewableItemsWithReservations(reviewPayload, [
      {
        reservationId: 10,
        guesthouseImage: 'image.jpg',
        guesthouseAddress: '제주특별자치도 제주시 테스트로 1',
        reviewed: true,
      },
    ]);

    expect(result).toMatchObject({
      reservationId: 10,
      checkIn: '2026-10-10',
      checkOut: '2026-10-11',
      guesthouseCheckIn: '15:00:00',
      guesthouseCheckOut: '11:00:00',
      guesthouseImage: 'image.jpg',
      guesthouseAddress: '제주특별자치도 제주시 테스트로 1',
      isReviewed: false,
    });
  });

  it('reviews 배열이 없는 응답은 빈 목록으로 처리한다', () => {
    expect(getReviewableItems({reviewableCount: 0})).toEqual([]);
    expect(mergeReviewableItemsWithReservations(null, [])).toEqual([]);
  });
});
