import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './MyGuesthouseList.styles';
import { FONTS } from '@constants/fonts';
import ButtonScarlet from '@components/ButtonScarlet';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import { formatDate } from '@utils/formatDate';

import fixedImage from '@assets/images/exphoto.jpeg'; // 임시 이미지 사용

// 임시 모달 높이
const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.6);

const MyGuesthouseList = () => {
  const navigation = useNavigation();
  const [guesthouses, setGuesthouses] = useState([]);
  // 테스트용 입점신청서 리스트 상태
  const [applicationList, setApplicationList] = useState([]);
  const [showAppList, setShowAppList] = useState(false);

  // 게스트 하우스 전체 목록 불러오기
  useEffect(() => { 
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

  // 입점신청서 조회
  const handleRegisterPress = async () => {
    try {
      const res = await hostGuesthouseApi.getHostApplications();
      setApplicationList(res.data || []);
      setShowAppList(true);
    } catch (error) {
      setApplicationList([]);
      setShowAppList(true);
      console.error('입점신청서 목록 불러오기 실패:', error);
    }
  };

  // 입점신청서 선택
  const handleAppSelect = (item) => {
    setShowAppList(false);
    navigation.navigate('MyGuesthouseAddEdit', { applicationId: item.id, application: item });
  };

  // 게스트 하우스 삭제
  const handleDelete = async (guesthouseId) => {
    try {
      await hostGuesthouseApi.deleteGuesthouse(guesthouseId);
      console.log('삭제 성공:', guesthouseId);

      // 삭제 후 목록 새로고침
      setGuesthouses(prev => prev.filter(item => item.id !== guesthouseId));
    } catch (error) {
      console.error('삭제 실패:', error.response?.data || error.message);
    }
  };

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
        {/* 임시 삭제 버튼 */}
        <TouchableOpacity
          style={[styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={[FONTS.fs_body, { color: 'red' }]}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 임의로 입점신청서 리스트만 간단히 표시
  const renderApplicationListModal = () => (
    <Modal
      visible={showAppList}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAppList(false)}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          width: '85%',
          height: MODAL_HEIGHT,
          backgroundColor: 'white',
          borderRadius: 14,
          paddingTop: 36,
          paddingHorizontal: 18,
          paddingBottom: 18,
        }}>
          <TouchableOpacity onPress={() => setShowAppList(false)} style={{ position: 'absolute', top: 10, right: 16, zIndex: 1 }}>
            <Text style={{ fontSize: 22, color: '#999' }}>✕</Text>
          </TouchableOpacity>
          <Text style={[FONTS.fs_h2_bold, { marginBottom: 18, alignSelf: 'center' }]}>입점신청서 목록</Text>
          {applicationList.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={[FONTS.fs_body, { textAlign: 'center', marginVertical: 30 }]}>입점신청서가 없습니다.</Text>
            </View>
          ) : (
            <FlatList
              data={applicationList}
              keyExtractor={item => item.id.toString()}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleAppSelect(item)}
                  style={{ paddingVertical: 14, borderBottomWidth: 1, borderColor: '#eee' }}
                >
                  <Text style={FONTS.fs_body_bold}>사업장명: {item.businessName} (ID: {item.id})</Text>
                  <Text style={FONTS.fs_body}>대표자: {item.managerName}</Text>
                  <Text style={FONTS.fs_body}>상태: {item.status}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Header title="마이페이지" />
      <View style={styles.buttonContainer}>
        <ButtonScarlet
          title="게스트 하우스 등록"
          marginHorizontal="0"
          onPress={handleRegisterPress}
        />
      </View>
      <FlatList
        data={guesthouses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
      {/* 입점신청서 모달 */}
      {renderApplicationListModal()}
    </View>
  );
};

export default MyGuesthouseList;
