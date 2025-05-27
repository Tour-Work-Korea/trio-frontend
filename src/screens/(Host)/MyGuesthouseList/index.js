import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './MyGuesthouseList.styles';
import { FONTS } from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import { formatDate } from '@utils/formatDate';

import fixedImage from '@assets/images/exphoto.jpeg'; // 임시 이미지 사용

const MyGuesthouseList = () => {
  const navigation = useNavigation();
  const [guesthouses, setGuesthouses] = useState([]);

  useEffect(() => { // 게스트 하우스 전체 목록 불러오기
    const fetchGuesthouses = async () => {
      try {
        const response = await hostGuesthouseApi.getMyGuesthouses();
        setGuesthouses(response.data);
      } catch (error) {
        console.error('사장님 게스트하우스 목록 불러오기 실패:', error);
      }
    };

    fetchGuesthouses();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* 실제 이미지 불러올 때 */}
      {/* <Image source={item.thumbnailImg} style={styles.image} /> */}
      <Image source={fixedImage} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={[FONTS.fs_h2_bold, styles.name]}>{item.guesthouseName}</Text>
        <Text style={[FONTS.fs_body, styles.date]}>{formatDate(item.updatedAt)}</Text>
      </View>
      <View style={styles.cardBtnContainer}>
        <ButtonScarlet
          title="방관리"
          marginHorizontal={0}
          onPress={() => navigation.navigate('MyGuesthouseDetail', {
            id: item.id,
            name: item.guesthouseName,
          })}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="마이페이지" />
      <View style={styles.buttonContainer}>
        <ButtonScarlet title="게스트 하우스 등록" marginHorizontal="0" to="MyGuesthouseAddEdit"/>
      </View>
      <FlatList
        data={guesthouses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default MyGuesthouseList;
