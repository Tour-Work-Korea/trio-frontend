import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './MyGuesthouseReview.styles';
import { FONTS } from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

const MyGuesthouseReview = () => {
  const navigation = useNavigation();
  const [guesthouses, setGuesthouses] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const fetchGuesthouses = async () => {
    try {
      const response = await hostGuesthouseApi.getMyGuesthouses();
      setGuesthouses(response.data);
    } catch (error) {
      console.error('사장님 게스트하우스 목록 불러오기 실패:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGuesthouses();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Header title="게스트하우스 리뷰관리" />
      
      <View style={styles.selectContainer}>
        <Text style={[FONTS.fs_h2_bold, { marginBottom: 10 }]}>게스트하우스를 선택해주세요</Text>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 8,
            padding: 12,
          }}
          onPress={() => setDropdownVisible(true)}
        >
          <Text style={FONTS.fs_body}>
            {'선택하세요'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={dropdownVisible} transparent animationType="fade">
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setDropdownVisible(false)}>
          <View style={{
            position: 'absolute',
            top: '30%',
            left: '10%',
            right: '10%',
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 16
          }}>
            <FlatList
              data={guesthouses}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: '#ddd' }}
                  onPress={() => {
                    setDropdownVisible(false);
                    navigation.navigate('MyGuesthouseReviewList', { guesthouseId: item.id });
                  }}
                >
                  <Text style={FONTS.fs_body}>{item.guesthouseName}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MyGuesthouseReview;
