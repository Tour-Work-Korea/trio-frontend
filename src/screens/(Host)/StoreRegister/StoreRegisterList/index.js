// 기존 import 문은 동일하게 유지합니다

import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  FlatList,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import styles from './StoreRegisterList.styles';
import Header from '@components/Header';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import ButtonScarlet from '@components/ButtonScarlet';
import {FONTS} from '@constants/fonts';

const StoreRegisterList = () => {
  const [storeRegisters, setStoreRegisters] = useState([]);

  useEffect(() => {
    tryFetchStoreRegister();
  }, []);

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
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="나의 입점신청서" />

      <ButtonScarlet title={'입점신청하기'} to={'StoreRegisterForm'} />

      <ScrollView>
        <FlatList
          data={storeRegisters}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default StoreRegisterList;
