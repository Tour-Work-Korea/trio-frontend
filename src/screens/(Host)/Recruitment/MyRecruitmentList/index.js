import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Header from '@components/Header';
import ButtonScarlet from '@components/ButtonScarlet';
import Person from '@assets/images/Person.svg';
import Trash from '@assets/images/Trash.svg';
import styles from './MyRecruitmentList.styles';
import {FONTS} from '@constants/fonts';
import hostEmployApi from '@utils/api/hostEmployApi';

/*
 * 공고 목록 페이지
 */

const MyRecruitmentList = () => {
  const navigation = useNavigation();

  // 샘플 데이터
  const postings = [
    {
      id: '1',
      guestHouseName: '게스트하우스 이름',
      title: '공고 제목',
      lastModified: '2025.04.13',
    },
    {
      id: '2',
      guestHouseName: '게스트하우스 이름',
      title: '공고 제목',
      lastModified: '2025.04.13',
    },
    {
      id: '3',
      guestHouseName: '게스트하우스 이름',
      title: '공고 제목',
      lastModified: '2025.04.13',
    },
    {
      id: '4',
      guestHouseName: '게스트하우스 이름',
      title: '공고 제목',
      lastModified: '2025.04.13',
    },
  ];
  const getMyRecruits = async () => {
    try {
      const response = await hostEmployApi.getMyRecruits();
    } catch (error) {}
  };

  const handleViewDetail = id => {
    navigation.navigate('RecruitmentDetail', {id});
  };

  const handleViewApplicants = id => {
    // 지원자 목록 페이지로 이동하는 로직
    navigation.navigate('ApplicantList', {id});
  };

  const handleDeletePosting = id => {
    // 공고 삭제 로직
    // 실제 구현 시 확인 다이얼로그 추가 필요
    console.log(`Delete posting ${id}`);
  };

  // 공고 아이템 렌더링
  const renderPostingItem = ({item}) => (
    <TouchableOpacity onPress={() => handleViewDetail(item.id)}>
      <View style={styles.postingCard}>
        <View style={styles.guestHouseTag}>
          <Text style={[styles.guestHouseText, FONTS.fs_body]}>
            {item.guestHouseName}
          </Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={[FONTS.fs_h2_bold]}>{item.title}</Text>
          <View style={styles.iconsContainer}>
            <TouchableOpacity onPress={() => handleViewApplicants(item.id)}>
              <Person />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeletePosting(item.id)}>
              <Trash />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Text style={[styles.dateLabel, FONTS.fs_body]}>최종수정일</Text>
          <Text style={[styles.date, FONTS.fs_body]}>{item.lastModified}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="나의 공고" />
      <View style={styles.body}>
        <ButtonScarlet title="새 공고" to="PostRecruitment" />
        <Text style={[styles.headerText, FONTS.fs_body]}>
          사람 아이콘을 누르면 해당 공고의 지원자를 확인할 수 있어요
        </Text>

        <FlatList
          data={postings}
          renderItem={renderPostingItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
};

export default MyRecruitmentList;
