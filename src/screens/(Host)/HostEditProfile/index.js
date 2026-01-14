import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import styles from './HostEditProfile.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonWhite from '@components/ButtonWhite';
import Header from '@components/Header';

import CameraIcon from '@assets/images/camera_fill_black.svg';
import EmptyImage from '@assets/images/wlogo_gray_up.svg';

import {uploadSingleImage} from '@utils/imageUploadHandler';
import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';
import hostMyApi from '@utils/api/hostMyApi';
import useUserStore from '@stores/userStore';

const HostEditProfile = () => {
  const navigation = useNavigation();
  const {scrollRef, contentContainerStyle, registerInput} =
    useKeyboardAwareScrollView({
      basePaddingBottom: 24,
      extraScrollOffset: -100,
      scrollDelay: 80,
      iosOnly: true,
    });

  const hostPhotoUrl = useUserStore(state => state.hostProfile.photoUrl);

  // ✅ 임시 데이터 (나중에 API 붙이면 여기만 교체하면 됨)
  const host = useMemo(
    () => ({
      name: '이상한밤 게스트하우스',
      intro:
        '잔잔하고 따뜻한 소규모 게스트하우스 ‘이상한밤’ 입니다.\n처음 만난 사람들과도 나눌 수 있는 또 다른 즐거움,\n이야깃거리가 되는 소소한 이벤트들을 통해 서로가 조금 더 편해지는 새로운 공간을 만들어가고 있습니다.',
      address: '제주시 흥운길 25-7 1층',
      photoUrl: null,
    }),
    [],
  );

  // 입력값
  const [hostName, setHostName] = useState(host?.name ?? '');
  const [hostIntro, setHostIntro] = useState(host?.intro ?? '');

  // 이미지
  const [bgImageUrl, setBgImageUrl] = useState(host?.photoUrl ?? null);
  const [profileImageUrl, setProfileImageUrl] = useState(hostPhotoUrl ?? null);

  const hasHeaderImage = Boolean(bgImageUrl);

  // 배경 이미지 변경
  const handleChangeBgImage = async () => {
    const uploadedUrl = await uploadSingleImage();
    if (!uploadedUrl) return;
    setBgImageUrl(uploadedUrl);
  };

  // 프로필 이미지 변경
  const handleChangeProfileImage = async () => {
    const uploadedUrl = await uploadSingleImage();
    if (!uploadedUrl) return;
    setProfileImageUrl(uploadedUrl);
  };
  const setHostProfile = useUserStore(state => state.setHostProfile);
  const [savedProfilePhotoUrl, setSavedProfilePhotoUrl] = useState(
    hostPhotoUrl ?? null,
  );
  const [isSaving, setIsSaving] = useState(false);

  // 프로필 사진 수정
  const handleSaveProfilePhoto = async () => {
    if (isSaving) return;

    const isPhotoChanged = profileImageUrl !== savedProfilePhotoUrl;
    if (!isPhotoChanged) return;
    if (!profileImageUrl) return;

    try {
      setIsSaving(true);
      await hostMyApi.updatePhoto({photoUrl: profileImageUrl});

      setSavedProfilePhotoUrl(profileImageUrl);

      // store 최신화 (photoUrl만)
      const currentHostProfile = useUserStore.getState().hostProfile;
      setHostProfile({...currentHostProfile, photoUrl: profileImageUrl});

      Toast.show({
        type: 'success',
        text1: '수정되었어요!',
        position: 'top',
        visibilityTime: 2000,
      });
      
    } catch (e) {
      console.log('프로필 사진 수정 실패:', e?.response?.data ?? e);
    } finally {
      setIsSaving(false);
    }
  };

  // 등록 (포커스 시 자동 스크롤)
  const introField = registerInput('hostIntro');

  const renderHeaderContent = () => (
    <>
      {hasHeaderImage && <View style={styles.headerOverlay} />}

      <TouchableOpacity 
        style={styles.bgEditBtn}
        onPress={handleChangeBgImage}
        activeOpacity={0.8}
      >
        <Text style={[FONTS.fs_14_medium, styles.bgEditBtnText]}>이미지 변경</Text>
      </TouchableOpacity>

      {/* 프로필 영역 */}
      <View style={styles.profileWrap}>
        <Text style={[FONTS.fs_20_bold, styles.guesthouseNameText]}>
          이상한밤 게스트하우스
        </Text>

        <View>
          <View style={styles.profileImageWrap}>
            {profileImageUrl ? (
              <Image source={{uri: profileImageUrl}} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImage}>
                <EmptyImage width={32} height={32} />
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.profiImgEditBtn}
            onPress={handleChangeProfileImage}
            activeOpacity={0.8}
          >
            <CameraIcon width={16} height={16}/>
          </TouchableOpacity>
        </View>

        <View style={styles.hostNameInputBox}>
          <TextInput
            value={hostName}
            onChangeText={setHostName}
            placeholder="호스트 이름"
            placeholderTextColor={COLORS.grayscale_400}
            style={[FONTS.fs_16_semibold, styles.hostNameText]}
          />
        </View>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      enabled
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={contentContainerStyle}
      >
        <Header title={'프로필 편집'}/>

        {/* 상단 배경 */}
        {hasHeaderImage ? (
          <ImageBackground
            source={{uri: bgImageUrl}}
            style={styles.headerBg}
            resizeMode="cover">
            {renderHeaderContent()}
          </ImageBackground>
        ) : (
          <View style={[styles.headerBg, styles.headerBgFallback]}>
            {renderHeaderContent()}
          </View>
        )}

        {/* 소개/주소 */}
        <View style={styles.contentContainer}>
          <View style={styles.section} onLayout={introField.onLayout}>
            <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>소개</Text>
            <View style={styles.introInputBox}>
              <TextInput
                value={hostIntro}
                onChangeText={setHostIntro}
                placeholder="간단한 소개 글을 작성해주세요"
                placeholderTextColor={COLORS.grayscale_400}
                multiline
                scrollEnabled 
                onFocus={introField.onFocus}
                style={[FONTS.fs_14_semibold, styles.introText]}
              />
            </View>
          </View>

          <View style={styles.bottomBtnRow}>
            <ButtonWhite
              title='업체정보 수정'
              to='MyGuesthouseList'
              style={{flex:1}}
            />
            <ButtonWhite
              title='프로필 수정하기'
              backgroundColor={COLORS.primary_orange}
              textColor={COLORS.grayscale_0}
              style={{flex:1}}
              onPress={handleSaveProfilePhoto}
              disabled={isSaving}
            />
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default HostEditProfile;
