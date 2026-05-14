import React, {useCallback, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import dayjs from 'dayjs';

import AlertModal from '@components/modals/AlertModal';
import EmptyState from '@components/EmptyState';
import Loading from '@components/Loading';
import {FONTS} from '@constants/fonts';
import userMyApi from '@utils/api/userMyApi';
import {
  getCouponConditionText,
  getCouponId,
  getCouponTitle,
  getDiscountRateLabel,
  getExpiryDate,
  getRemainingDaysText,
} from '@utils/coupon/couponUtils';
import CouponIcon from '@assets/images/cancel_reservation.svg';
import DownloadIcon from '@assets/images/download_black.svg';

import styles from './MyCouponReceive.styles';

const formatValidUntil = coupon => {
  const expiryDate = getExpiryDate(coupon);

  if (!expiryDate) {
    return null;
  }

  const date = dayjs(expiryDate);
  return date.isValid() ? `${date.format('YY.MM.DD HH:mm')}까지 발급 가능` : expiryDate;
};

const MyCouponReceive = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [issuingCouponId, setIssuingCouponId] = useState(null);
  const [alertState, setAlertState] = useState({
    visible: false,
    message: '',
  });

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({...prev, visible: false}));
  }, []);

  const showAlert = useCallback(message => {
    setAlertState({
      visible: true,
      message,
    });
  }, []);

  const fetchAvailableCoupons = useCallback(async isActive => {
    try {
      setLoading(true);
      const response = await userMyApi.getAvailableCoupons();
      const nextCoupons = Array.isArray(response?.data?.coupons)
        ? response.data.coupons
        : Array.isArray(response?.data)
          ? response.data
          : [];
      const sortedCoupons = [...nextCoupons].sort(
        (a, b) => Number(Boolean(a?.isIssued)) - Number(Boolean(b?.isIssued)),
      );

      if (isActive()) {
        setCoupons(sortedCoupons);
      }
    } catch (error) {
      if (isActive()) {
        console.warn('다운로드 가능 쿠폰 조회 실패:', error);
        setCoupons([]);
      }
    } finally {
      if (isActive()) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      fetchAvailableCoupons(() => active);

      return () => {
        active = false;
      };
    }, [fetchAvailableCoupons]),
  );

  const handleIssueCoupon = async coupon => {
    const couponId = getCouponId(coupon);

    if (!couponId || issuingCouponId) {
      return;
    }

    if (coupon?.isIssued) {
      showAlert('이미 발급된 쿠폰입니다.');
      return;
    }

    setIssuingCouponId(couponId);

    try {
      await userMyApi.issueCouponByTemplate(couponId);
      setCoupons(prev =>
        prev.map(item =>
          getCouponId(item) === couponId ? {...item, isIssued: true} : item,
        ),
      );
      showAlert('쿠폰 발급이 완료되었습니다.');
    } catch (error) {
      const message =
        error?.response?.data?.message || '쿠폰 발급에 실패했습니다.';
      showAlert(message);
    } finally {
      setIssuingCouponId(null);
    }
  };

  if (loading) {
    return <Loading title="쿠폰을 불러오는 중이에요" />;
  }

  if (!coupons.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.topRow}>
          <Text style={[FONTS.fs_16_regular, styles.countText]}>
            쿠폰 {coupons.length}개
          </Text>
        </View>

        <View style={styles.emptyStateWrapper}>
          <EmptyState
            icon={CouponIcon}
            iconSize={{width: 160, height: 120}}
            title="준비 중인 쿠폰이 없어요"
            description="콘텐츠나 프로모션이 열리면 여기에서 받을 수 있어요."
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Text style={[FONTS.fs_16_regular, styles.countText]}>
            쿠폰 {coupons.length}개
          </Text>
        </View>

        {coupons.map((coupon, index) => {
          const couponId = getCouponId(coupon);
          const validUntilText = formatValidUntil(coupon);
          const remainingDaysText = getRemainingDaysText(coupon);
          const isIssued = Boolean(coupon?.isIssued);
          const isIssuing = issuingCouponId === couponId;

          return (
            <View
              key={couponId || `${getCouponTitle(coupon)}-${index}`}
              style={styles.couponCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTextArea}>
                  <Text style={[FONTS.fs_18_semibold, styles.discountText]}>
                    {getDiscountRateLabel(coupon)}
                  </Text>
                  <Text style={[FONTS.fs_16_semibold, styles.titleText]}>
                    {getCouponTitle(coupon)}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={1}
                  disabled={isIssued || isIssuing}
                  style={[
                    styles.issueButton,
                    isIssued && styles.issueButtonDisabled,
                  ]}
                  onPress={() => handleIssueCoupon(coupon)}>
                  {!isIssued ? <DownloadIcon width={18} height={18} /> : null}
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      styles.issueButtonText,
                      isIssued && styles.issueButtonTextDisabled,
                    ]}>
                    {isIssued ? '발급 완료' : isIssuing ? '발급중' : '쿠폰 받기'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[FONTS.fs_14_medium, styles.descriptionText]}>
                {getCouponConditionText(coupon) || '사용 조건이 없는 쿠폰입니다.'}
              </Text>

              {validUntilText ? (
                <Text style={[FONTS.fs_14_medium, styles.expiryText]}>
                  {validUntilText}
                </Text>
              ) : null}
              {remainingDaysText ? (
                <View style={styles.badge}>
                  <Text style={[FONTS.fs_14_medium, styles.badgeText]}>
                    {remainingDaysText}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <AlertModal
        visible={alertState.visible}
        message={alertState.message}
        buttonText="확인"
        onPress={closeAlert}
        onRequestClose={closeAlert}
      />
    </View>
  );
};

export default MyCouponReceive;
