import React, {useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';

import styles from './EmployDetail.styles';
import postApi from '@utils/api/postApi';
import {toggleFavorite} from '@utils/toggleFavorite';
import PostHeaderSection from './PostHeaderSection';
import PostProfileSection from './PostProfileSection';
import PostTapSection from './PostTapSection';
import AlertModal from '@components/modals/AlertModal';

const GuesthousePost = ({route}) => {
  const {guesthouseId} = route.params ?? {};
  const [post, setPost] = useState();
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  useEffect(() => {
    if (!guesthouseId) return;
    fetchIntroDetail();
  }, [guesthouseId]);

  const fetchIntroDetail = async () => {
    try {
      const res = await postApi.getIntroDetailPublic(guesthouseId);
      setPost(res.data);
    } catch (error) {
      setErrorModal({
        visible: true,
        message:
          '해당 게스트하우스 소개글을 찾을 수 없습니다.' ||
          error?.response?.data?.message,
        buttonText: '확인',
      });
    }
  };

  const handleFavorite = async isLiked => {
    toggleFavorite({
      type: 'post',
      id: guesthouseId,
      isLiked,
      setItem: setPost,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더(썸네일, 태그) */}
        <PostHeaderSection tags={post?.tags} images={post?.images} />

        <View style={styles.contentContainer}>
          {/* 상단 기본 정보(제목, 좋아요) */}
          <PostProfileSection
            title={post?.title}
            tags={post?.tags}
            guesthouseName={post?.guesthouseName}
            guesthouseImgUrl={post?.hostProfileImageUrl}
            toggleFavorite={handleFavorite}
            isLiked={post?.isLiked}
          />
        </View>
        {/* 탭 */}
        <PostTapSection intro={post} />
      </ScrollView>

      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default GuesthousePost;
