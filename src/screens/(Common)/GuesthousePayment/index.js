import React, { createRef, useEffect } from 'react';
import { Alert, BackHandler, SafeAreaView } from 'react-native';
import { Payment } from '@portone/react-native-sdk';
import { useRoute, useNavigation } from '@react-navigation/native';
import Config from 'react-native-config';

import userGuesthouseApi from '@utils/api/userGuesthouseApi';

const GuesthousePayment = () => {
  // PortOne 결제 컨트롤러 ref 생성
  const controller = createRef();

  const route = useRoute();
  const navigation = useNavigation();
  const { amount, reservationId } = route.params;

  // 고유한 paymentId 생성
  const uid = `guesthouse_${Date.now()}`;

  // Android 하드웨어 백버튼 처리: 결제창 내에서 뒤로가기 지원
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (controller.current?.canGoBack) {
          controller.current.webview?.goBack(); // WebView 내부에서 뒤로가기
          return true;
        }
        return false;
      },
    );
    return () => backHandler.remove(); // 언마운트 시 이벤트 제거
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Payment
        ref={controller} // 결제 컨트롤러 연결
        request={{
          storeId: Config.PORTONE_STORE_ID,
          channelKey: Config.PORTONE_CHANNEL_KEY,
          paymentId: uid,
          orderName: '게스트하우스 예약', // 결제 내역 이름
          totalAmount: amount,
          currency: 'CURRENCY_KRW', // 통화 단위 (원화)
          payMethod: 'CARD', // 결제 수단 (카드 결제)
        }}
        onError={error => {
          Alert.alert('결제 실패', error.message);
          navigation.goBack();
        }}
        onComplete={async complete => {
          try {
            console.log('💰결제 성공:', complete); // 응답 객체 출력
            console.log('reservationId:', reservationId);

            // 백엔드에 결제 검증 요청
            await userGuesthouseApi.verifyPayment(reservationId, {
              paymentId: complete.paymentId,
              reservationType: 'GUESTHOUSE',
            });

            navigation.replace('PaymentSuccess'); // 임시 추후 수정 예정
          } catch (err) {
            console.error('결제 검증 실패:', err);
            Alert.alert('검증 실패', '결제 검증 중 오류가 발생했습니다.');
            navigation.goBack();
          }
        }}
      />
    </SafeAreaView>
  );
};

export default GuesthousePayment;
