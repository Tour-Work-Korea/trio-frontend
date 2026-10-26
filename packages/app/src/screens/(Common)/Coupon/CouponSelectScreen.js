import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import EmptyState from '@components/EmptyState';
import Header from '@components/Header';
import ButtonScarlet from '@components/ButtonScarlet';
import {FONTS} from '@constants/fonts';
import styles from './CouponSelect.styles';
import userMyApi from '@utils/api/userMyApi';
import {
  getCouponConditionText,
  getCouponId,
  getCouponTitle,
  getDiscountAmount,
  getDiscountRateLabel,
  getRemainingDaysText,
  getUsableCouponCount,
  isCouponDisabled,
} from '@utils/coupon/couponUtils';
import CouponEmptyIcon from '@assets/images/cancel_reservation.svg';
import CheckIcon from '@assets/images/check_white.svg';

const CouponSelectScreen = ({route}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {
    totalPrice = 0,
    selectedCouponId: initialSelectedCouponId = null,
    targetScreen = 'GuesthouseReservation',
    title = t('common.couponDiscount'),
  } = route.params || {};
  const [coupons, setCoupons] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState(
    initialSelectedCouponId,
  );

  useEffect(() => {
    setSelectedCouponId(initialSelectedCouponId);
  }, [initialSelectedCouponId]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchCoupons = async () => {
        try {
          const response = await userMyApi.getMyCoupons();
          if (!isActive) return;
          setCoupons(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
          if (!isActive) return;
          console.warn('쿠폰 목록 조회 실패:', error);
          setCoupons([]);
        }
      };

      fetchCoupons();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const usableCouponCount = getUsableCouponCount(coupons, totalPrice);
  const selectedCoupon =
    coupons.find(coupon => getCouponId(coupon) === selectedCouponId) || null;
  const selectedDiscountAmount = selectedCoupon
    ? getDiscountAmount(selectedCoupon, totalPrice)
    : 0;

  const handleSelectCoupon = coupon => {
    if (isCouponDisabled(coupon, totalPrice)) return;

    const couponId = getCouponId(coupon);
    setSelectedCouponId(prev => (prev === couponId ? null : couponId));
  };

  const getDiscountDisplayText = (coupon, discountAmount) => {
    const discountType = coupon?.discountType || coupon?.couponType;

    if (discountType === 'PERCENTAGE' || discountType === 'PERCENT') {
      return t('coupon.valueWonValue', {
        value1: discountAmount.toLocaleString('ko-KR'),
        value2: getDiscountRateLabel(coupon),
      });
    }

    return getDiscountRateLabel(coupon);
  };

  const handleApplyCoupon = () => {
    const nextSelectedCoupon = selectedCoupon
      ? {
          userCouponId: getCouponId(selectedCoupon),
          title: getCouponTitle(selectedCoupon),
          discountAmount: selectedDiscountAmount,
          discountLabel: t('common.valueWon', {
            value1: selectedDiscountAmount.toLocaleString('ko-KR'),
          }),
        }
      : null;

    const state = navigation.getState();
    const previousRoute =
      state?.routes?.[Math.max((state?.index ?? 0) - 1, 0)] || null;

    if (previousRoute?.name === targetScreen) {
      navigation.dispatch({
        ...CommonActions.setParams({
          selectedCoupon: nextSelectedCoupon,
        }),
        source: previousRoute.key,
      });
      navigation.goBack();
      return;
    }

    navigation.navigate({
      name: targetScreen,
      params: {
        selectedCoupon: nextSelectedCoupon,
      },
      merge: true,
    });
  };

  return (
    <View style={styles.container}>
      <Header title={title} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[FONTS.fs_14_medium, styles.summaryText]}>
          {t('coupon.selectionSummary', {
            usable: usableCouponCount,
            total: coupons.length,
          })}
        </Text>

        {coupons.length > 0 ? (
          coupons.map((coupon, index) => {
            const couponId = getCouponId(coupon);
            const isSelected = couponId === selectedCouponId;
            const isDisabled = isCouponDisabled(coupon, totalPrice);
            const remainingDaysText = getRemainingDaysText(coupon);
            const discountAmount = getDiscountAmount(coupon, totalPrice);

            return (
              <TouchableOpacity
                key={couponId || `${getCouponTitle(coupon)}-${index}`}
                style={[
                  styles.couponCard,
                  isSelected && styles.selectedCouponCard,
                ]}
                activeOpacity={1}
                onPress={() => handleSelectCoupon(coupon)}>
                <View style={styles.cardTopRow}>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkedCheckbox,
                      isDisabled && styles.disabledCheckbox,
                    ]}>
                    {isSelected ? <CheckIcon height={16} width={16} /> : null}
                  </View>
                  <View style={styles.cardContent}>
                    <Text
                      style={[
                        FONTS.fs_18_semibold,
                        styles.discountAmountText,
                        isDisabled && styles.disabledTitleText,
                      ]}>
                      {getDiscountDisplayText(coupon, discountAmount)}
                    </Text>
                    <Text
                      style={[
                        FONTS.fs_16_semibold,
                        styles.couponTitle,
                        isDisabled && styles.disabledTitleText,
                      ]}>
                      {getCouponTitle(coupon)}
                    </Text>
                    <Text
                      style={[
                        FONTS.fs_14_medium,
                        styles.conditionText,
                        isDisabled && styles.disabledBodyText,
                      ]}>
                      {getCouponConditionText(coupon)}
                    </Text>
                    {remainingDaysText ? (
                      <View style={styles.remainingBadge}>
                        <Text
                          style={[
                            FONTS.fs_14_medium,
                            styles.remainingBadgeText,
                          ]}>
                          {remainingDaysText}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyStateWrapper}>
            <EmptyState
              icon={CouponEmptyIcon}
              iconSize={{width: 160, height: 120}}
              title={t('common.iDonTHaveAnyCoupons')}
              description={t('common.youCanUseTheCouponAfterRegisteringIt')}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <ButtonScarlet
          title={t('coupon.applyValueWon', {
            value1: selectedDiscountAmount.toLocaleString('ko-KR'),
          })}
          onPress={handleApplyCoupon}
        />
      </View>
    </View>
  );
};

export default CouponSelectScreen;
