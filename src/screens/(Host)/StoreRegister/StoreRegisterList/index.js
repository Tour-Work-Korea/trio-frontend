// 기존 import 문은 동일하게 유지합니다

import React, {useState, useCallback} from 'react';
import {View, FlatList, Alert, Text, TouchableOpacity} from 'react-native';
import styles from './StoreRegisterList.styles';
import Header from '@components/Header';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import ButtonScarlet from '@components/ButtonScarlet';
import {FONTS} from '@constants/fonts';
import {formatDate} from '@utils/formatDate';
import {useFocusEffect} from '@react-navigation/native';

const StoreRegisterList = () => {
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
          <Text style={FONTS.fs_16_semibold} numberOfLines={1}>
            {item.businessName}
          </Text>
          <Text style={styles.detailText}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.detailText}>{item.address}</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.detailText}>{item.managerName}</Text>
          <Text style={styles.detailText}>{item.managerEmail}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="나의 입점신청서" />
      <View style={{paddingHorizontal: 20, paddingTop: 12}}>
        <ButtonScarlet title={'입점신청하기'} to={'StoreRegisterForm'} />

        <FlatList
          style={{marginTop: 20}}
          data={storeRegisters}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

export default StoreRegisterList;
