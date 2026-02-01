import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {formatLocalDateTimeToDotAndTimeWithDay} from '@utils/formatDate';
import {getRefundPolicyModalContent, REFUND_POLICY_RESULT} from '@utils/refundPolicy';
import SearchEmpty from '@assets/images/search_empty.svg';
import EmptyState from '@components/EmptyState';
import AlertModal from '@components/modals/AlertModal';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';

export default function UserUpcomingReservations({data, onRefresh}) {
  const navigation = useNavigation();

  // 예약 취소 모달
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundModalContent, setRefundModalContent] = useState({
    title: '',
    message: '',
    highlightText: '',
    buttonText: '확인',
    buttonText2: null,
  });
  const [refundReservationId, setRefundReservationId] = useState(null);

  const handleRefundlessCancel = async reservationId => {
    if (!reservationId) return;
    try {
      await reservationPaymentApi.cancelReservation(
        reservationId,
        'PARTY',
        '사용자 요청 취소',
      );
      Toast.show({
        type: 'success',
        text1: '취소 되었어요!',
        position: 'top',
        visibilityTime: 2000,
      });
      await onRefresh?.();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '예약 취소에 실패했습니다.',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  const renderItem = ({item, index}) => {
    const startFormatted = formatLocalDateTimeToDotAndTimeWithDay(
      item.startDateTime,
    );

    const imageSource =
      typeof item.partyImage === 'string'
        ? {uri: item.partyImage}
        : item.partyImage;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate('MeetPaymentReceipt', {
              reservationId: item.reservationId,
            })
          }
        >
          {/* 상단 날짜/시간 */}
          <Text style={[FONTS.fs_14_medium, styles.dateTimeText]}>
            {startFormatted.date} {startFormatted.time}
          </Text>

          <View style={styles.divide} />

          {/* 파티명 */}
          <Text
            style={[FONTS.fs_18_medium, styles.partyTitle]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.partyName}
          </Text>

          {/* 주소 */}
          <Text
            style={[FONTS.fs_12_medium, styles.addressText]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.guesthouseAddress || '주소 정보 없음'}
          </Text>

          {/* 썸네일 */}
          <View style={styles.imageWrap}>
            <Image source={imageSource} style={styles.image} resizeMode="cover" />
          </View>

          {/* 예약취소 */}
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.7}
            onPress={() => {
              const {
                result,
                message,
                description,
                title,
                buttonText,
                buttonText2,
                highlightText,
              } = getRefundPolicyModalContent({
                checkInDate: startFormatted.date,
                checkInTime: startFormatted.time,
              });

              if (result && result !== REFUND_POLICY_RESULT.OK) {
                setRefundModalContent({
                  title: title || '',
                  message: message || description || '',
                  highlightText: highlightText || '',
                  buttonText: buttonText || '확인',
                  buttonText2: buttonText2 || null,
                });
                setRefundReservationId(item.reservationId);
                setRefundModalOpen(true);
                return;
              }

              navigation.navigate('MeetCancelConfirm', {
                reservationId: item.reservationId,
                cancelContext: {
                  partyTitle: item.partyName,
                  partyImage: item.partyImage,
                  guesthouseName: item.guesthouseName,
                  startDateTime: item.startDateTime,
                  partyLocation: item.guesthouseAddress,
                  ...(typeof item.amount === 'number'
                    ? {paidAmount: item.amount}
                    : {}),
                  ...(typeof item.cancelFee === 'number'
                    ? {cancelFee: item.cancelFee}
                    : {}),
                  ...(typeof item.refundAmount === 'number'
                    ? {refundAmount: item.refundAmount}
                    : {}),
                  ...(item.refundMethod
                    ? {refundMethod: item.refundMethod}
                    : {}),
                },
              });
            }}>
            <Text style={[FONTS.fs_12_medium, styles.cancelBtnText]}>
              예약취소
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

      </View>
    );
  };

  return (
    <>
      <FlatList
        data={data}
        keyExtractor={item => item.reservationId.toString()}
        renderItem={renderItem}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: data.length === 0 ? 'center' : 'flex-start',
          paddingVertical: 24,
        }}
        ListEmptyComponent={
          <EmptyState
            icon={SearchEmpty}
            iconSize={{width: 120, height: 120}}
            title="예약내역이 없어요"
            description="이벤트 예약하러 가볼까요?"
            buttonText="이벤트 찾아보기"
            onPressButton={() =>
              navigation.navigate('MainTabs', {screen: '이벤트'})
            }
          />
        }
      />

      {/* 환불 없이 취소 모달 */}
      <AlertModal
        visible={refundModalOpen}
        title={refundModalContent.title}
        message={refundModalContent.message}
        highlightText={refundModalContent.highlightText}
        buttonText={refundModalContent.buttonText}
        buttonText2={refundModalContent.buttonText2}
        onPress={async () => {
          await handleRefundlessCancel(refundReservationId);
          setRefundModalOpen(false);
          setRefundReservationId(null);
        }}
        onPress2={() => setRefundModalOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },

  // 리스트
  card: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 12,
    padding: 16,

    // iOS shadow
    shadowColor: COLORS.grayscale_900,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 0},

    // Android shadow
    elevation: 3,
  },

  dateTimeText: {
    color: COLORS.grayscale_700,
    marginBottom: 8,
  },
  divide: {
    height: 0.4,
    backgroundColor: COLORS.grayscale_300,
    marginBottom: 8,
  },
  partyTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 4,
  },
  addressText: {
    color: COLORS.grayscale_500,
    marginBottom: 16,
  },
  imageWrap: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },

  // 예약취소
  cancelBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  cancelBtnText: {
    color: COLORS.grayscale_400,
  },
});
