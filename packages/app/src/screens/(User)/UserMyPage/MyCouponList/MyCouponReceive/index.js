import i18n from '@trio/app/src/i18n';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import dayjs from 'dayjs';

import AlertModal from '@components/modals/AlertModal';
import EmptyState from '@components/EmptyState';
import ScreenSkeleton from './LoadingSkeleton';
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
  return date.isValid()
    ? i18n.t('coupon.upToValueCanBeIssued', {
        value1: date.format('YY.MM.DD HH:mm'),
      })
    : expiryDate;
};

const MyCouponReceive = () => {
  const {t} = useTranslation();
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
      const receivableCoupons = nextCoupons.filter(coupon => !coupon?.isIssued);

      if (isActive()) {
        setCoupons(receivableCoupons);
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
      showAlert(t('coupon.thisCouponHasAlreadyBeenIssued'));
      return;
    }

    setIssuingCouponId(couponId);

    try {
      await userMyApi.issueCouponByTemplate(couponId);
      setCoupons(prev => prev.filter(item => getCouponId(item) !== couponId));
      showAlert(t('coupon.couponIssuanceHasBeenCompleted'));
    } catch (error) {
      const message =
        error?.response?.data?.message || t('coupon.couponIssuanceFailed');
      showAlert(message);
    } finally {
      setIssuingCouponId(null);
    }
  };

  if (loading) {
    return <ScreenSkeleton layout={styles} title={t('common.loadingCoupons')} />;
  }

  if (!coupons.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.topRow}>
          <Text style={[FONTS.fs_16_regular, styles.countText]}>
            {t('coupon.count', {count: coupons.length})}
          </Text>
        </View>

        <View style={styles.emptyStateWrapper}>
          <EmptyState
            icon={CouponIcon}
            iconSize={{width: 160, height: 120}}
            title={t('coupon.thereAreNoCouponsReady')}
            description={t(
              'coupon.whenActivityOrPromotionsOpenYouCanReceiveThemHere',
            )}
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
            {t('coupon.count', {count: coupons.length})}
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
                  {!isIssued ? <DownloadIcon width={14} height={14} /> : null}
                  <Text
                    style={[
                      FONTS.fs_12_medium,
                      styles.issueButtonText,
                      isIssued && styles.issueButtonTextDisabled,
                    ]}>
                    {isIssued
                      ? t('coupon.issuedCompleted')
                      : isIssuing
                      ? t('coupon.issuing')
                      : t('common.getCoupon')}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[FONTS.fs_14_medium, styles.descriptionText]}>
                {getCouponConditionText(coupon) ||
                  t('common.thisIsACouponWithNoUsageConditions')}
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
        buttonText={t('common.confirm')}
        onPress={closeAlert}
        onRequestClose={closeAlert}
      />
    </View>
  );
};

export default MyCouponReceive;
