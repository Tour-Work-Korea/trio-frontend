import React, {useState, useCallback} from 'react';
import {View, Text, Image, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import Header from '@components/Header';
import styles from './MyGuesthouseIntroList.styles';
import {FONTS} from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import EmptyState from '@components/EmptyState';

import EditIcon from '@assets/images/edit_gray.svg';
import DeleteIcon from '@assets/images/delete_gray.svg';
import PlusIcon from '@assets/images/plus_white.svg';
import EmptyIcon from '@assets/images/wlogo_blue_left.svg';
import postApi from '@utils/api/postApi';
import ErrorModal from '@components/modals/ErrorModal';

const MyGuesthouseIntroList = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    onPress: null,
    onPress2: null,
    buttonText: '',
    buttonText2: '',
  });

  // 게스트 하우스 포스트 전체 목록 불러오기
  const fetchMyPosts = async () => {
    try {
      const response = await hostGuesthouseApi.getMyGuesthouses();
      // 최신순 정렬
      const sortedData = response.data.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );

      setPosts(sortedData);
    } catch (error) {
      console.error('사장님 게스트하우스 포스트 목록 불러오기 실패:', error);
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message ??
          '나의 게스트하우스 포스트 조회 중 오류가 발생했습니다',
        onPress: () => setErrorModal(prev => ({...prev, visible: false})),
        onPress2: null,
        buttonText: '확인',
        buttonText2: null,
      });
    }
  };

  // 화면 진입/복귀마다 호출
  useFocusEffect(
    useCallback(() => {
      fetchMyPosts();
    }, []),
  );

  // 게하 삭제
  const handleDelete = postId => {
    setErrorModal({
      visible: true,
      title: '삭제 요청은 되돌릴 수 없는 작업이에요\n계속 진행하시겠어요?',
      onPress: async () => {
        try {
          await postApi.deletePost(postId);
          fetchMyPosts(); // 목록 새로고침
        } catch (error) {
          setErrorModal({
            visible: true,
            title:
              error?.response?.data?.message ?? '삭제 중 오류가 발생했습니다',
            onPress: () => setErrorModal(prev => ({...prev, visible: false})),
            onPress2: null,
            buttonText: '확인',
            buttonText2: null,
          });
        }
      },
      onPress2: () => setErrorModal(prev => ({...prev, visible: false})),
      buttonText: '요청할래요',
      buttonText2: '보류할게요',
    });
  };

  const renderItem = ({item, index}) => (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('GuesthousePost', {id: item.id})}>
        <Image source={{uri: item.thumbnailImg}} style={styles.image} />
        <View style={styles.cardContent}>
          <View style={styles.infoContent}>
            <Text style={[FONTS.fs_16_semibold, styles.name]}>
              {item.guesthouseName}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.adress]}>
              {item.guesthouseAddress} {'\n'} {item.guesthouseDetailAddress}
            </Text>
          </View>
          <View style={styles.cardBtnContainer}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('MyGuesthouseIntroForm', {
                  id: item.id,
                })
              }>
              <EditIcon width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton]}
              onPress={() => handleDelete(item.id)}>
              <DeleteIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
      {index < posts.length - 1 && <View style={styles.devide} />}
    </>
  );

  return (
    <View style={styles.container}>
      <Header title="나의 게스트하우스 소개" />

      <View style={styles.bodyContainer}>
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={
            posts.length === 0
              ? [styles.listContainer, {flex: 1, justifyContent: 'center'}]
              : styles.listContainer
          }
          ListEmptyComponent={
            <EmptyState
              icon={EmptyIcon}
              iconSize={{width: 80, height: 80}}
              title="등록된 게스트하우스 소개가 없어요"
              description="게스트하우스 소개를 등록해 주세요!"
            />
          }
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('MyGuesthouseIntroForm')}>
          <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>
            게스트하우스 소개 등록
          </Text>
          <PlusIcon width={24} height={24} />
        </TouchableOpacity>
        <ErrorModal
          title={errorModal.title ?? null}
          message={errorModal.message ?? null}
          buttonText={errorModal.buttonText}
          buttonText2={errorModal.buttonText2}
          onPress={errorModal.onPress}
          onPress2={errorModal.onPress2}
          visible={errorModal.visible}
        />
      </View>
    </View>
  );
};

export default MyGuesthouseIntroList;
