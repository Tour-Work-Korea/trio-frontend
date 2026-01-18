export const mockPaymentReceipt = {
  guesthouse: {
    name: '김군빌리지 게스트하우스',
    address: '제주 제주시 오현길 85',
    phone: '0507-1385-3800',
  },

  actions: {
    inquiry: true,
    copyAddress: true,
    openMap: true,
    findWay: true,
  },

  stay: {
    checkIn: '2025. 04. 15 (화)',
    checkInTime: '16:00',
    checkOut: '2025. 04. 17 (수)',
    checkOutTime: '11:00',
  },

  purchase: {
    title: '여자 4인실(1베드) / 2박',
    subTitle: '[4인 도미토리, 여성전용]',
  },

  reservation: {
    number: '26031235346C1sdf',
    name: '김서현',
    phone: '010-1234-5678',
  },

  payment: {
    paidAt: '2023.04.22 (토) 02:13',
    unitPriceLabel: '객실 가격 (1베드 당)',
    unitPrice: 25000,
    totalLabel: '총 가격 (베드 3개 X 2박)',
    totalPrice: 125000,
    finalLabel: '실 결제 금액',
    finalPrice: 125000,
    method: '카카오페이',
  },

  cancelPolicy: {
    notice:
      '예약 후 10분 이내에는 무료 취소 가능합니다.\n단, 체크인 시간 이후에는 취소가 불가능합니다.',
  },
};
