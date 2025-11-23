import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {View, ScrollView} from 'react-native';

import styles from './EmployDetail.styles';
import postApi from '@utils/api/postApi';
import {toggleFavorite} from '@utils/toggleFavorite';
import PostHeaderSection from './PostHeaderSection';
import PostProfileSection from './PostProfileSection';
import PostTapSection from './PostTapSection';
import Loading from '@components/Loading';
import useUserStore from '@stores/userStore';
import ErrorModal from '@components/modals/ErrorModal';

const dummyData = {
  introId: 12,
  guesthouseId: 1,
  title: '아늑하고 따뜻한 분위기의 제주 게스트하우스',
  guesthouseName: '제주 게스트하우스',
  hostProfileImageUrl:
    'https://workaway-image-bucket.s3.ap-northeast-2.amazonaws.com/uploads/image_1762404152387_825825.jpg',
  tags: '#제주시,#뚜벅이,#포틀럭,#바다근처',
  likeCount: 37,
  isLiked: true,
  sections: [
    {
      sectionId: 101,
      sectionType: 'GREETING',
      title: '사장님 자기소개',
      content:
        '안녕하세요! 여행과 사람을 좋아하는 호스트 민지입니다. 제주에서 느린 하루를 함께 나누고 싶어 이 공간을 시작했어요.',
      imgUrl:
        'https://workaway-image-bucket.s3.ap-northeast-2.amazonaws.com/uploads/image_1762404152387_825825.jpg',
      blockOrder: 1,
    },
    {
      sectionId: 102,
      sectionType: 'GREETING',
      title: '',
      content:
        '저희 게스트하우스는 처음 오시는 분도 편하게 어울릴 수 있도록 매주 포틀럭 파티를 열고 있어요.',
      imgUrl: null,
      blockOrder: 2,
    },
    {
      sectionId: 201,
      sectionType: 'SPACE',
      title: '공간 소개',
      content:
        '거실에는 커다란 원목 테이블과 빔프로젝터가 있어요. 낮에는 햇살이, 밤에는 따뜻한 조명이 분위기를 만들어줍니다.',
      imgUrl:
        'https://workaway-image-bucket.s3.ap-northeast-2.amazonaws.com/uploads/image_1762404152387_825825.jpg',
      blockOrder: 1,
    },
    {
      sectionId: 202,
      sectionType: 'SPACE',
      title: '공간 소개',
      content:
        '거실에는 커다란 원목 테이블과 빔프로젝터가 있어요. 낮에는 햇살이, 밤에는 따뜻한 조명이 분위기를 만들어줍니다.',
      imgUrl:
        'https://workaway-image-bucket.s3.ap-northeast-2.amazonaws.com/uploads/image_1762404152387_825825.jpg',
      blockOrder: 2,
    },
    {
      sectionId: 301,
      sectionType: 'LIFE',
      title: '생활',
      content:
        '아침에는 간단한 토스트와 커피를 제공해요. 저녁에는 자유롭게 모여 얘기하거나 산책을 나가기도 합니다.',
      imgUrl:
        'https://workaway-image-bucket.s3.ap-northeast-2.amazonaws.com/uploads/image_1762404152387_825825.jpg',
      blockOrder: 1,
    },
    {
      sectionId: 302,
      sectionType: 'LIFE',
      title: '생활',
      content:
        '아침에는 간단한 토스트와 커피를 제공해요. 저녁에는 자유롭게 모여 얘기하거나 산책을 나가기도 합니다.',
      imgUrl:
        'https://workaway-image-bucket.s3.ap-northeast-2.amazonaws.com/uploads/image_1762404152387_825825.jpg',
      blockOrder: 2,
    },
  ],
  images: [
    {
      imageId: 9001,
      imgUrl:
        'https://workaway-image-bucket.s3.ap-northeast-2.amazonaws.com/uploads/image_1762404152387_825825.jpg',
      isThumbnail: true,
    },
    {
      imageId: 9002,
      imgUrl:
        'https://workaway-image-bucket.s3.ap-northeast-2.amazonaws.com/uploads/image_1762404152387_825825.jpg',
      isThumbnail: false,
    },
  ],
  createdAt: '2025-11-01T14:22:10',
  updatedAt: '2025-11-15T09:40:33',
};

const GuesthousePost = ({route}) => {
  const navigation = useNavigation();
  const userRole = useUserStore.getState()?.userRole;
  const {guesthouseId} = route.params ?? {};

  const [post, setPost] = useState(dummyData);
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
        message: '게스트하우스 소개글 조회에 실패했습니다.',
        buttonText: '확인',
      });
    }
  };

  const handleFavorite = async isLiked => {
    toggleFavorite({
      type: 'intro',
      id: guesthouseId,
      isLiked,
      setItem: setPost,
    });
  };

  if (!post) {
    return <Loading title="소개글을 불러오고 있어요" />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더(썸네일, 태그) */}
        <PostHeaderSection
          tags={post?.tags}
          title={post?.title}
          images={post?.images}
        />

        <View style={styles.contentContainer}>
          {/* 상단 기본 정보(제목, 좋아요) */}
          <PostProfileSection
            title={post.title}
            guesthouseName={post.guesthouseName}
            guesthouseImgUrl={post.hostProfileImageUrl}
            toggleFavorite={handleFavorite}
            isLiked={post.isLiked}
          />
        </View>
        {/* 탭 */}
        <PostTapSection intro={post} />
      </ScrollView>

      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default GuesthousePost;
