import React, {useCallback, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';

import EmptyState from '@components/EmptyState';
import Loading from '@components/Loading';
import {FONTS} from '@constants/fonts';
import userMyApi from '@utils/api/userMyApi';
import {
  getCouponConditionText,
  getCouponId,
  getCouponTitle,
  getDiscountRateLabel,
  getRemainingDaysText,
  getExpiryDate,
} from '@utils/coupon/couponUtils';
import CouponIcon from '@assets/images/cancel_reservation.svg';
import PlusIcon from '@assets/images/plus_white.svg';

import styles from './MyCouponOwnList.styles';

const formatExpiryDate = coupon => {
  const expiryDate = getExpiryDate(coupon);

  if (!expiryDate) {
    return null;
  }

  const date = dayjs(expiryDate);
  return date.isValid() ? date.format('YY.MM.DD HH:mm까지') : expiryDate;
};

const MyCouponOwnList = () => {
  const navigation = useNavigation();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchCoupons = async () => {
        try {
          setLoading(true);
          const response = await userMyApi.getMyCoupons();
          if (!isActive) return;
          setCoupons(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
          if (!isActive) return;
          console.warn('내 쿠폰 조회 실패:', error);
          setCoupons([]);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchCoupons();

      return () => {
        isActive = false;
      };
    }, []),
  );

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
          <TouchableOpacity
            style={styles.registerButton}
            activeOpacity={1}
            onPress={() => navigation.navigate('MyCouponRegister')}
          >
            <PlusIcon width={16} height={16}/>
            <Text style={[FONTS.fs_14_medium, styles.registerButtonText]}>
              쿠폰 등록
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyStateWrapper}>
          <EmptyState
            icon={CouponIcon}
            iconSize={{width: 160, height: 120}}
            title="보유한 쿠폰이 없어요"
            description="쿠폰 등록 후 사용할 수 있어요."
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Text style={[FONTS.fs_16_regular, styles.countText]}>
          쿠폰 {coupons.length}개
        </Text>
        <TouchableOpacity
          style={styles.registerButton}
          activeOpacity={1}
          onPress={() => navigation.navigate('MyCouponRegister')}
        >
          <PlusIcon width={16} height={16}/>
          <Text style={[FONTS.fs_14_medium, styles.registerButtonText]}>
            쿠폰 등록
          </Text>
        </TouchableOpacity>
      </View>

      {coupons.map((coupon, index) => {
        const couponId = getCouponId(coupon);
        const remainingDaysText = getRemainingDaysText(coupon);
        const expiryDateText = formatExpiryDate(coupon);

        return (
          <View
            key={couponId || `${getCouponTitle(coupon)}-${index}`}
            style={styles.couponCard}>
            <Text style={[FONTS.fs_18_semibold, styles.discountText]}>
              {getDiscountRateLabel(coupon)}
            </Text>
            <Text style={[FONTS.fs_16_semibold, styles.titleText]}>
              {getCouponTitle(coupon)}
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.descriptionText]}>
              {getCouponConditionText(coupon) || '사용 조건이 없는 쿠폰입니다.'}
            </Text>
            {expiryDateText ? (
              <Text style={[FONTS.fs_14_medium, styles.expiryText]}>
                {expiryDateText}
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
  );
};

export default MyCouponOwnList;
