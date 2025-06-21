import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Header from '@components/Header';
import styles from './MyApplicantList.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import userEmployApi from '@utils/api/userEmployApi';

const MyApplicantList = () => {
  const navigation = useNavigation();
  const [postings, setPostings] = useState();

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        tryFetchMyResumes();
      }, 500);
    }, []),
  );

  const tryFetchMyResumes = async () => {
    try {
      const response = await userEmployApi.getMyApplications();
      setPostings(response.data);
    } catch (error) {
      Alert.alert('나의 지원서를 가져오는데 실패했습니다.');
    }
  };
  // 페이지 이동 함수
  const handleViewDetail = id => {
    navigation.navigate('MyApplicantDetail', {id});
  };
  // 공고 아이템 렌더링
  const renderApplyItem = ({item}) => (
    <TouchableOpacity onPress={() => handleViewDetail(item.id)}>
      <View style={styles.postingCard}>
        <View style={styles.titleRow}>
          <Text style={[FONTS.fs_h2_bold]}>{item.recruitTitle}</Text>
        </View>
        <View style={styles.dateRow}>
          {item.userHashtag.map(tag => (
            <Text key={tag.id} style={[FONTS.fs_body, {color: COLORS.scarlet}]}>
              #{tag.hashtag}
            </Text>
          ))}
        </View>
        <View style={styles.dateRow}>
          <Text style={[FONTS.fs_body]}>{item.resumeTitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="지원 현황" />
      <View style={styles.body}>
        <FlatList
          data={postings}
          renderItem={renderApplyItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
};

export default MyApplicantList;
