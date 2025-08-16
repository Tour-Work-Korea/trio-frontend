// 기존 import 문은 동일하게 유지합니다

import React, {useState, useCallback} from 'react';
import {View, FlatList, Alert, Text, TouchableOpacity} from 'react-native';
import styles from './StoreRegisterList.styles';
import Header from '@components/Header';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import ButtonScarlet from '@components/ButtonScarlet';
import {FONTS} from '@constants/fonts';
import PlusIcon from '@assets/images/plus_white.svg';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {COLORS} from '@constants/colors';

const StoreRegisterList = () => {
  const navigation = useNavigation();
  const [storeRegisters, setStoreRegisters] = useState([]);
  useFocusEffect(
    useCallback(() => {
      tryFetchStoreRegister();
    }, []),
  );

  const tryFetchStoreRegister = async () => {
    try {
      const response = await hostGuesthouseApi.getHostApplications();
      setStoreRegisters(response.data);
    } catch (error) {
      console.warn('입점신청서 조회 실패: ', error);
      Alert.alert('입점 신청서 조회에 실패했습니다.');
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.postingCard}>
      <TouchableOpacity style={styles.jobItemContent}>
        <View style={styles.titleRow}>
          <Text
            style={[{...FONTS.fs_14_medium, color: COLORS.grayscale_800}]}
            numberOfLines={1}>
            {item.businessName}
          </Text>
          <Text style={styles.detailText}>{item.address}</Text>
        </View>

        <Text
          style={{
            ...FONTS.fs_14_semibold,
            color:
              item.status !== '승인 완료'
                ? COLORS.primary_orange
                : COLORS.grayscale_400,
          }}>
          {item.status === '승인 완료'
            ? '입점이 완료된 상태예요'
            : '입점 신청 중이에요!'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="나의 입점신청서" />
      <View style={{paddingHorizontal: 20, paddingTop: 12, flex: 1}}>
        <FlatList
          data={storeRegisters}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
        />
        <TouchableOpacity
          style={[styles.addButton, styles.addButtonLocation]}
          onPress={() => navigation.navigate('StoreRegisterForm')}>
          <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>
            입점 신청하기
          </Text>
          <PlusIcon width={24} height={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StoreRegisterList;
