import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Header from '@components/Header';
import ButtonScarlet from '@components/ButtonScarlet';
import Person from '@assets/images/Person.svg';
import Trash from '@assets/images/Trash.svg';
import styles from './MyRecruitmentList.styles';
import {FONTS} from '@constants/fonts';
import hostEmployApi from '@utils/api/hostEmployApi';
// 샘플 데이터
const postings = [
  {
    recruitId: 1,
    recruitTitle: '공고 제목',
    guesthouseId: 1,
    guesthouseName: '게스트하우스 이름',
  },
];
/*
 * 공고 목록 페이지
 */

const MyRecruitmentList = () => {
  const navigation = useNavigation();
  const [myRecruits, setMyRecruits] = useState([]);

  useEffect(() => {
    // getMyRecruits();
    setMyRecruits(postings);
  }, []);

  const getMyRecruits = async () => {
    try {
      const response = await hostEmployApi.getMyRecruits();
      setMyRecruits(response.data);
    } catch (error) {
      Alert('내 공고 조회에 실패했습니다.');
    }
  };

  const handleViewDetail = recruitId => {
    navigation.navigate('RecruitmentDetail', {recruitId});
  };

  const handleViewApplicants = recruitId => {
    // 지원자 목록 페이지로 이동하는 로직
    navigation.navigate('ApplicantList', {recruitId});
  };

  const handleDeletePosting = id => {
    // 공고 삭제 로직
    // 실제 구현 시 확인 다이얼로그 추가 필요
    console.log(`Delete posting ${id}`);
  };

  // 공고 아이템 렌더링
  const renderPostingItem = ({item}) => (
    <TouchableOpacity onPress={() => handleViewDetail(item.recruitId)}>
      <View style={styles.postingCard}>
        <View style={styles.guestHouseTag}>
          <Text style={[styles.guestHouseText, FONTS.fs_body]}>
            {item.guesthouseName}
          </Text>
        </View>

        <View style={styles.titleRow}>
          <Text style={[FONTS.fs_h2_bold]}>{item.recruitTitle}</Text>
          <View style={styles.iconsContainer}>
            <TouchableOpacity
              onPress={() => handleViewApplicants(item.recruitId)}>
              <Person />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeletePosting(item.recruitId)}>
              <Trash />
            </TouchableOpacity>
          </View>
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
          data={myRecruits}
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
