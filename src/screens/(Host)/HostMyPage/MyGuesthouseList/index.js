import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Header from '@components/Header';
import styles from './MyGuesthouseList.styles';
import { FONTS } from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import ShowIcon from '@assets/images/show_password.svg';
import HideIcon from '@assets/images/hide_password.svg';
import EditIcon from '@assets/images/edit_gray.svg';
import DeleteIcon from '@assets/images/delete_gray.svg';
import PlusIcon from '@assets/images/plus_white.svg';

// 임시 모달 높이
const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.6);

const MyGuesthouseList = () => {
  const navigation = useNavigation();
  const [guesthouses, setGuesthouses] = useState([]);
  // 테스트용 입점신청서 리스트 상태
  const [applicationList, setApplicationList] = useState([]);
  const [showAppList, setShowAppList] = useState(false);

  // 게스트 하우스 전체 목록 불러오기
const fetchGuesthouses = async () => {
  try {
    // 임시 데이터 (디자인 확인용)
    const tempData = [
      {
        id: 1,
        guesthouseName: '서울 게스트하우스',
        updatedAt: '2025-08-03T10:00:00',
        thumbnailImg: 'https://cdn.pixabay.com/photo/2023/02/01/10/37/sunset-7760143_1280.jpg',
      },
      {
        id: 2,
        guesthouseName: '부산 오션뷰 게스트하우스',
        updatedAt: '2025-08-05T15:30:00',
        thumbnailImg: 'https://cdn.pixabay.com/photo/2023/02/01/10/37/sunset-7760143_1280.jpg',
      },
      {
        id: 3,
        guesthouseName: '제주 감성 게스트하우스',
        updatedAt: '2025-08-04T09:15:00',
        thumbnailImg: 'https://cdn.pixabay.com/photo/2023/02/01/10/37/sunset-7760143_1280.jpg',
      },
    ];

    // 최신순 정렬
    const sortedData = tempData.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    setGuesthouses(sortedData);

    // 실제 API 호출 (필요하면 주석 해제)
    // const response = await hostGuesthouseApi.getMyGuesthouses();
    // setGuesthouses(response.data);
  } catch (error) {
    console.error('사장님 게스트하우스 목록 불러오기 실패:', error);
  }
};

  // 게스트 하우스 전체 목록 불러오기
  // const fetchGuesthouses = async () => {
  //   try {
  //     const response = await hostGuesthouseApi.getMyGuesthouses();
          // 최신순 정렬
          // const sortedData = response.data.sort(
          //   (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          // );

          // setGuesthouses(sortedData);
  //   } catch (error) {
  //     console.error('사장님 게스트하우스 목록 불러오기 실패:', error);
  //   }
  // };

  // 화면 진입/복귀마다 호출
  useFocusEffect(
    useCallback(() => {
      fetchGuesthouses();
    }, [])
  );

  // 입점신청서 조회
  const handleRegisterPress = async () => {
    try {
      const res = await hostGuesthouseApi.getHostApplications();

      // 게하 등록 안된 입점신청서만 출력
      const unregisteredApplications = (res.data || []).filter(app => !app.registered);
      setApplicationList(unregisteredApplications);
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
    navigation.navigate('MyGuesthouseAddEdit', { applicationId: item.id });
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

  const renderItem = ({ item, index }) => (
    <>
    <View style={styles.card}>
      <Image source={{ uri: item.thumbnailImg }} style={styles.image} />
      <View style={styles.cardContent}>
        <View style={styles.infoContent}>
          <Text style={[FONTS.fs_16_semibold, styles.name]}>{item.guesthouseName}</Text>
          <Text style={[FONTS.fs_12_medium, styles.adress]}>주소</Text>
        </View>
        <View style={styles.cardBtnContainer}>
          <TouchableOpacity>
            <ShowIcon width={24} height={24}/>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('MyGuesthouseDetail', {
              id: item.id,
              name: item.guesthouseName,
            })}
          >
            <EditIcon width={24} height={24}/>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton]}
            onPress={() => handleDelete(item.id)}
          >
            <DeleteIcon width={24} height={24}/>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    {index < guesthouses.length - 1 && <View style={styles.devide} />}
    </>
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
      <Header title="나의 게스트하우스" />
      
      <View style={styles.bodyContainer}>
        <FlatList
          data={guesthouses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />

        <TouchableOpacity style={styles.addButton}>
          <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>게스트하우스 등록</Text>
          <PlusIcon width={24} height={24}/>
        </TouchableOpacity>
      </View>
      {/* 입점신청서 모달 */}
      {renderApplicationListModal()}
    </View>
  );
};

export default MyGuesthouseList;
