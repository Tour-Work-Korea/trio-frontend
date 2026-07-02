import React, {useCallback, useEffect, useState} from 'react';
import {Image, ScrollView, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import Loading from '@components/Loading';
import ButtonScarlet from '@components/ButtonScarlet';
import AlertModal from '@components/modals/AlertModal';
import RecruitTapSection from '@screens/(Common)/Employ/EmployDetail/RecruitTapSection';
import userEmployApi from '@utils/api/userEmployApi';
import useUserStore from '@stores/userStore';
import {showErrorModal} from '@utils/loginModalHub';
import {FONTS} from '@constants/fonts';
import styles from './CommunityStaffDetail.styles';

const formatMonthDay = value => {
  if (!value) {
    return '';
  }

  const [datePart] = value.split('T');
  const [, month, day] = datePart.split('-');
  return `${month}/${day}`;
};

const CommunityStaffDetail = ({route}) => {
  const navigation = useNavigation();
  const userRole = useUserStore.getState()?.userRole;
  const {id} = route.params ?? {};
  const [recruit, setRecruit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
    buttonText: '',
  });

  const fetchRecruitDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userEmployApi.getRecruitById(id, true);
      setRecruit(response.data);
    } catch (error) {
      setErrorModal({
        visible: true,
        message: '스탭 공고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        buttonText: '확인',
      });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecruitDetail();
  }, [fetchRecruitDetail]);

  const renderTags = hashtags => {
    if (!hashtags?.length) {
      return null;
    }

    return (
      <View style={styles.tagRow}>
        {hashtags.slice(0, 3).map((tag, index) => {
          const tagLabel = tag?.hashtag ?? tag;

          return (
            <View key={`${tagLabel}-${index}`} style={styles.tag}>
              <Text style={[FONTS.fs_12_medium, styles.tagText]}>
                {tagLabel}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const imageUrl =
    recruit?.profileSummary?.profileImageUrl ||
    recruit?.recruitImages?.find(image => image.isThumbnail)?.recruitImageUrl ||
    recruit?.recruitImages?.[0]?.recruitImageUrl;
  const deadline = formatMonthDay(recruit?.recruitEnd);

  const handleApply = () => {
    if (userRole !== 'USER') {
      showErrorModal({
        message: '지원하기는\n알바 로그인 후 사용해주세요',
        buttonText: '로그인하기',
        buttonText2: '취소',
        onPress: () => navigation.navigate('Login'),
        onPress2: () => {},
      });
      return;
    }

    navigation.navigate('ApplicantForm', {
      recruitId: recruit?.recruitId,
      entryStartDate: recruit?.entryStartDate,
      entryEndDate: recruit?.entryEndDate,
    });
  };

  return (
    <View style={styles.container}>
      <Header title="스탭" onPress={() => navigation.goBack()} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Loading title="스탭 공고를 불러오는 중입니다..." />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <View style={styles.postHeader}>
            {imageUrl ? (
              <Image source={{uri: imageUrl}} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
            <Text
              style={[FONTS.fs_14_medium, styles.guesthouseName]}
              numberOfLines={1}>
              {recruit?.guesthouseName}
            </Text>
            {!!deadline && (
              <Text style={[FONTS.fs_14_regular, styles.deadline]}>
                {deadline} 마감
              </Text>
            )}
          </View>

          <Text style={[FONTS.fs_14_medium, styles.recruitTitle]}>
            {recruit?.recruitTitle}
          </Text>

          {!!recruit?.recruitShortDescription && (
            <Text style={[FONTS.fs_14_regular, styles.shortDescription]}>
              {recruit.recruitShortDescription}
            </Text>
          )}

          {renderTags(recruit?.hashtags)}

          <View style={styles.tabSection}>
            <RecruitTapSection recruit={recruit} />
          </View>

          {!!recruit?.recruitDetail && (
            <View style={styles.detailSection}>
              <Text style={[FONTS.fs_16_semibold, styles.detailTitle]}>
                상세 정보
              </Text>
              <Text style={[FONTS.fs_14_regular, styles.detailText]}>
                {recruit.recruitDetail}
              </Text>
            </View>
          )}

        </ScrollView>
      )}

      {!isLoading && (
        <View style={styles.applyButtonContainer}>
          <ButtonScarlet title="지원하기" onPress={handleApply} />
        </View>
      )}

      <AlertModal
        visible={errorModal.visible}
        title={errorModal.message}
        buttonText={errorModal.buttonText}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

export default CommunityStaffDetail;
