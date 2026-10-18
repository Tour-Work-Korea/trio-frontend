import {useTranslation} from 'react-i18next';
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
  const {t} = useTranslation();
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
          t('guesthouse.anIntroductionToTheGuesthouseCouldNotBeFound') ||
          error?.response?.data?.message,
        buttonText: t('common.confirm'),
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
            guesthouseId={post?.guesthouseId ?? guesthouseId}
            guesthouseName={post?.guesthouseName}
            guesthouseImgUrl={
              post?.profileSummary?.profileImageUrl ?? post?.hostProfileImageUrl
            }
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
