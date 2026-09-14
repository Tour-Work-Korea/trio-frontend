import React from 'react';
import Renderer, {act} from 'react-test-renderer';
import {Platform} from 'react-native';
import api from '@utils/api/reservationPaymentApi';
import GuesthousePaymentReceipt from '@screens/(User)/Guesthouse/GuesthousePaymentReceipt';
import GuesthouseCancelledReceipt from '@screens/(User)/Guesthouse/GuesthouseCancelledReceipt';
import MeetPaymentReceipt from '@screens/(User)/Meet/MeetPaymentReceipt';
import UserPastReservations from '@screens/(User)/UserMyPage/UserMeetReservationCheck/UserPastReservations';

const originalPlatform = Platform.OS;
const mockRoute = {params: {reservationId: 1, isFromPaymentFlow: false}};
const mockNavigation = {navigate: jest.fn(), canGoBack: () => true, goBack: jest.fn()};
jest.mock('@react-navigation/native', () => ({
  useRoute: () => mockRoute,
  useNavigation: () => mockNavigation,
}));
jest.mock('@utils/api/reservationPaymentApi', () => ({
  getReservationPaymentDetail: jest.fn(),
  getRoomReservationDetail: jest.fn(),
  getPartyReservationDetail: jest.fn(),
}));
jest.mock('@components/modals/AlertModal', () => () => null);
jest.mock('@components/Header', () => 'Header');
jest.mock('@components/Loading', () => 'Loading');
jest.mock('@components/AppImage', () => 'AppImage');
jest.mock('@components/ButtonWhite', () => 'ButtonWhite');
jest.mock('@components/EmptyState', () => 'EmptyState');

const detail = {
  guesthouse: '테스트 숙소', address: '제주특별자치도 제주시 테스트길',
  guesthousePhoneNum: '0640000000', roomName: '테스트 객실',
  checkIn: '2026-10-01T15:00:00', checkOut: '2026-10-03T11:00:00',
  reservationCode: 'TEST-RESERVATION', userName: '테스트 예약자', phoneNum: '01000000000',
  reservationStatus: 'COMPLETED', approvedAt: '2026-09-01T12:30:00',
  amount: 50000, totalAmount: 43000, couponDiscountAmount: 5000,
  pointDiscountAmount: 2000, paymentType: 'CARD',
};
let screen;
const render = async element => {
  await act(async () => { screen = Renderer.create(element); });
  const text = node => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(text).join(' ');
    return node?.children ? text(node.children) : '';
  };
  return text(screen.toJSON());
};
beforeEach(() => {
  jest.clearAllMocks();
  mockRoute.params = {reservationId: 1, isFromPaymentFlow: false};
  api.getReservationPaymentDetail.mockResolvedValue({data: detail});
  api.getRoomReservationDetail.mockResolvedValue({data: {
    reservationUserName: '요약 이름', reservationAmount: 50000,
    roomCapacity: 2, roomMaxCapacity: 4,
  }});
});
afterEach(async () => {
  if (screen) await act(async () => screen.unmount());
  Platform.OS = originalPlatform;
});

test.each(['ios', 'android'])('%s: ID로 진입해도 예약번호·결제·할인과 객실 정원을 표시한다', async os => {
  Platform.OS = os;
  const output = await render(<GuesthousePaymentReceipt />);
  for (const value of ['TEST-RESERVATION', '테스트 예약자', '01000000000', '43,000원', '5,000원', '2,000P', '카드', '최대 4인']) {
    expect(output).toContain(value);
  }
  expect(output).toContain('2026. 10. 01');
  expect(output).toContain('2026.09.01');
});

test('결제 완료 경로는 추가 마이페이지 요청 없이 상세 정보를 표시한다', async () => {
  mockRoute.params.isFromPaymentFlow = true;
  expect(await render(<GuesthousePaymentReceipt />)).toContain('43,000원');
  expect(api.getRoomReservationDetail).not.toHaveBeenCalled();
});

test('연박 취소 상세는 서버의 최종 환불액을 자체 계산으로 덮어쓰지 않는다', async () => {
  api.getReservationPaymentDetail.mockResolvedValue({data: {
    ...detail, reservationStatus: 'CANCELLED', cancelledAt: '2026-09-30T12:00:00',
    cancelledAmount: 12345, refundRateApplied: 50,
    refundPolicy: {defaultRefundRate: 100, sameDayRefundRate: 0, policies: []},
  }});
  const output = await render(<GuesthouseCancelledReceipt />);
  expect(output).toContain('12,345원');
  expect(output).toContain('30,655원');
  expect(output).toContain('15:00');
  expect(output).toContain('11:00');
  expect(output).not.toContain('undefined');
});

test.each([0, 15000])('콘텐츠 실제 결제금액 %i원과 상세 안내를 표시한다', async amount => {
  api.getPartyReservationDetail.mockResolvedValue({data: {
    partyTitle: '테스트 콘텐츠', reservationStatus: 'COMPLETED',
    startDateTime: '2026-10-01T19:00:00', endDateTime: '2026-10-01T22:00:00',
    approvedAt: '2026-09-01T12:30:00', amount, paymentType: 'EASY_PAY',
    selectedPriceOptionName: '선택 항목', detailSchedule: '일정 안내',
    trafficInfo: '교통 안내 내용', parkingInfo: '주차 안내 내용',
  }});
  const output = await render(<MeetPaymentReceipt />);
  for (const value of ['결제 정보', `${amount.toLocaleString('ko-KR')}원`, '간편결제', '선택 항목', '일정 안내', '교통 안내 내용', '주차 안내 내용']) {
    expect(output).toContain(value);
  }
});

test('지난 콘텐츠는 실제 예약 상세 화면으로 연결한다', async () => {
  await render(<UserPastReservations data={[{
    reservationId: 7, partyId: 9, partyName: '지난 콘텐츠', startDateTime: '2026-09-01T19:00:00',
  }]} />);
  const card = screen.root.findAll(node => node.props.style?.borderRadius === 12 && typeof node.props.onPress === 'function')[0];
  await act(async () => card.props.onPress());
  expect(mockNavigation.navigate).toHaveBeenCalledWith('MeetPaymentReceipt', {reservationId: 7, partyId: 9});
});


test('객실 보충 정보 요청이 실패해도 결제 상세는 표시한다', async () => {
  api.getRoomReservationDetail.mockRejectedValue(new Error('보충 정보 조회 실패'));
  const output = await render(<GuesthousePaymentReceipt />);
  expect(output).toContain('TEST-RESERVATION');
  expect(output).toContain('43,000원');
});
