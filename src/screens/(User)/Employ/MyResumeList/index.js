import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import Header from '@components/Header';
import ButtonScarlet from '@components/ButtonScarlet';
import Trash from '@assets/images/Trash.svg';
import styles from './MyResumeList.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import userEmployApi from '@utils/api/userEmployApi';

/*
 * 나의 이력서 목록 페이지
 */
const MyResumeList = () => {
  const navigation = useNavigation();
  const [postings, setPostings] = useState();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      tryFetchMyResumes();
    }
  }, [isFocused]);

  const tryFetchMyResumes = async () => {
    try {
      const response = await userEmployApi.getResumes();
      setPostings(response.data);
    } catch (error) {
      Alert.alert('나의 이력서를 가져오는데 실패했습니다.');
    }
  };

  const tryDeleteResumeById = async id => {
    try {
      await userEmployApi.deleteResume(id);
    } catch (error) {
      Alert.alert('알림', '삭제되었습니다.');
      navigation.navigate('MyResumeList');
    }
  };

  // 페이지 이동 함수
  const handleViewDetail = id => {
    navigation.navigate('MyResumeDetail', {id});
  };

  const handleDeletePosting = id => {
    Alert.alert('정말 삭제하시겠어요?', '삭제한 이력서는 복구할 수 없습니다.', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          tryDeleteResumeById(id);
        },
      },
    ]);
  };

  // 공고 아이템 렌더링
  const renderPostingItem = ({item}) => (
    <TouchableOpacity onPress={() => handleViewDetail(item.resumeId)}>
      <View style={styles.postingCard}>
        <View style={styles.titleRow}>
          <Text style={[FONTS.fs_h2_bold]}>{item.resumeTitle}</Text>
          <TouchableOpacity onPress={() => handleDeletePosting(item.resumeId)}>
            <Trash />
          </TouchableOpacity>
        </View>
        <View style={styles.dateRow}>
          {item.hashtags.map((tag, idx) => (
            <Text key={idx} style={[FONTS.fs_body, {color: COLORS.scarlet}]}>
              #{tag.hashtag}
            </Text>
          ))}
        </View>
        <View style={styles.dateRow}>
          <Text style={[styles.dateLabel, FONTS.fs_body]}>
            최종수정일 {'  '}
            {new Date(item.updatedAt).toISOString().split('T')[0]}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="나의 이력서" />
      <View style={styles.body}>
        <ButtonScarlet title="새 이력서" to="ResumeForm" />

        <FlatList
          data={postings}
          renderItem={renderPostingItem}
          keyExtractor={item => item.resumeId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
};

export default MyResumeList;
