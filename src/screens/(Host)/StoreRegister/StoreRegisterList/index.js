import React, {useState, useCallback} from 'react';
import {View, FlatList, Alert, Text, TouchableOpacity} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import EmptyState from '@components/EmptyState';

import styles from './StoreRegisterList.styles';
import {FONTS} from '@constants/fonts';
import PlusIcon from '@assets/images/plus_white.svg';
import {COLORS} from '@constants/colors';
import EmptyIcon from '@assets/images/wa_blue_apply.svg';

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
          <Text style={styles.titleText} numberOfLines={1}>
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
      <View style={styles.body}>
        <FlatList
          data={storeRegisters}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
          ListEmptyComponent={
            <EmptyState
              icon={EmptyIcon}
              iconSize={{width: 188, height: 84}}
              title="입점된 게스트하우스가 없어요"
              description="지금 입점신청을 해보세요!"
            />
          }
        />
        <TouchableOpacity
          style={[styles.addButton, styles.addButtonLocation]}
          onPress={() => navigation.navigate('StoreRegisterForm1')}>
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
