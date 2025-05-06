import React from 'react';
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
import Trash from '@assets/images/Trash.svg';
import styles from './MyApplicantList.styles';
import {FONTS} from '@constants/fonts';

/*
 * 공고 목록 페이지
 */

const MyApplicantList = () => {
  const navigation = useNavigation();

  // 샘플 데이터
  const postings = [
    {
      id: '1',
      title: '이력서 제목',
      lastModified: '2025.04.13',
    },
    {
      id: '2',
      title: '이력서 제목',
      lastModified: '2025.04.13',
    },
    {
      id: '3',
      title: '이력서 제목',
      lastModified: '2025.04.13',
    },
    {
      id: '4',
      title: '이력서 제목',
      lastModified: '2025.04.13',
    },
  ];

  // 페이지 이동 함수
  const handleViewDetail = id => {
    navigation.navigate('RecruitmentDetail', {id});
  };

  const handleDeletePosting = id => {
    Alert.alert('정말 삭제하시겠어요?', '삭제한 이력서는 복구할 수 없습니다.', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => console.log(`Delete posting ${id}`),
      },
    ]);
  };

  // 공고 아이템 렌더링
  const renderPostingItem = ({item}) => (
    <TouchableOpacity onPress={() => handleViewDetail(item.id)}>
      <View style={styles.postingCard}>
        <View style={styles.titleRow}>
          <Text style={[FONTS.fs_h2_bold]}>{item.title}</Text>
          <TouchableOpacity onPress={() => handleDeletePosting(item.id)}>
            <Trash />
          </TouchableOpacity>
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
      <Header title="나의 이력서" />
      <View style={styles.body}>
        <ButtonScarlet title="새 이력서" to="PostRecruitment" />

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

export default MyApplicantList;
