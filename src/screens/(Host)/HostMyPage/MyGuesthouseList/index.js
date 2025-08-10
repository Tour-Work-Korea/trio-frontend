import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import Header from '@components/Header';
import styles from './MyGuesthouseList.styles';
import { FONTS } from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import EmptyState from '@components/EmptyState';

import ShowIcon from '@assets/images/show_password.svg';
import HideIcon from '@assets/images/hide_password.svg';
import EditIcon from '@assets/images/edit_gray.svg';
import DeleteIcon from '@assets/images/delete_gray.svg';
import PlusIcon from '@assets/images/plus_white.svg';
import EmptyIcon from '@assets/images/wlogo_blue_left.svg';

const MyGuesthouseList = () => {
  const navigation = useNavigation();
  const [guesthouses, setGuesthouses] = useState([]);

  // 게스트 하우스 임시 데이터 전체 목록 불러오기
// const fetchGuesthouses = async () => {
//   try {
//     // 임시 데이터 (디자인 확인용)
//     const tempData = [
//       {
//         id: 1,
//         guesthouseName: '서울 게스트하우스',
//         updatedAt: '2025-08-03T10:00:00',
//         thumbnailImg: 'https://cdn.pixabay.com/photo/2023/02/01/10/37/sunset-7760143_1280.jpg',
//       },
//       {
//         id: 2,
//         guesthouseName: '부산 오션뷰 게스트하우스',
//         updatedAt: '2025-08-05T15:30:00',
//         thumbnailImg: 'https://cdn.pixabay.com/photo/2023/02/01/10/37/sunset-7760143_1280.jpg',
//       },
//       {
//         id: 3,
//         guesthouseName: '제주 감성 게스트하우스',
//         updatedAt: '2025-08-04T09:15:00',
//         thumbnailImg: 'https://cdn.pixabay.com/photo/2023/02/01/10/37/sunset-7760143_1280.jpg',
//       },
//     ];

//     // 최신순 정렬
//     const sortedData = tempData.sort(
//       (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
//     );

//     setGuesthouses(sortedData);

//     // 실제 API 호출 (필요하면 주석 해제)
//     // const response = await hostGuesthouseApi.getMyGuesthouses();
//     // setGuesthouses(response.data);
//   } catch (error) {
//     console.error('사장님 게스트하우스 목록 불러오기 실패:', error);
//   }
// };

  // 게스트 하우스 전체 목록 불러오기
  const fetchGuesthouses = async () => {
    try {
      const response = await hostGuesthouseApi.getMyGuesthouses();
          // 최신순 정렬
          const sortedData = response.data.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );

          setGuesthouses(sortedData);
    } catch (error) {
      console.error('사장님 게스트하우스 목록 불러오기 실패:', error);
    }
  };

  // 화면 진입/복귀마다 호출
  useFocusEffect(
    useCallback(() => {
      fetchGuesthouses();
    }, [])
  );

  // 게하 삭제
  const handleDelete = (guesthouseId) => {
    Alert.alert(
      '삭제 확인',
      '정말 이 게스트하우스를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await hostGuesthouseApi.deleteGuesthouse(guesthouseId);
              Toast.show({
                type: 'success',
                text1: '게스트하우스가 삭제되었습니다',
                position: 'top',
                visibilityTime: 2000,
              });
              fetchGuesthouses(); // 목록 새로고침
            } catch (error) {
              console.error('게스트하우스 삭제 실패:', error);
              Alert.alert('삭제 실패', '잠시 후 다시 시도해주세요.');
            }
          },
        },
      ]
    );
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
          {/* <TouchableOpacity
            onPress={() => navigation.navigate('MyGuesthouseDetail', {
              id: item.id,
              name: item.guesthouseName,
            })}
          >
            <EditIcon width={24} height={24}/>
          </TouchableOpacity> */}
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

  return (
    <View style={styles.container}>
      <Header title="나의 게스트하우스" />
      
      <View style={styles.bodyContainer}>
        <FlatList
          data={guesthouses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={
            guesthouses.length === 0
              ? [styles.listContainer, { flex: 1, justifyContent: 'center' }]
              : styles.listContainer
          }
          ListEmptyComponent={
            <EmptyState
              icon={EmptyIcon}
              iconSize={{ width: 80, height: 80 }}
              title="등록된 게스트하우스가 없어요"
              description="게스트하우스를 등록해 주세요!"
            />
          }
        />

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('MyGuesthouseAdd')}
        >
          <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>게스트하우스 등록</Text>
          <PlusIcon width={24} height={24}/>
        </TouchableOpacity>
      </View>
      
    </View>
  );
};

export default MyGuesthouseList;
