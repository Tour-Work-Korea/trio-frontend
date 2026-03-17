import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
} from 'react-native';
import Toast from 'react-native-toast-message';

import styles from './HostEditProfile.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import Header from '@components/Header';
import Avatar from '@components/Avatar';

import CameraIcon from '@assets/images/camera_fill_black.svg';

import {uploadSingleImage} from '@utils/imageUploadHandler';
import guesthouseProfileApi from '@utils/api/guesthouseProfileApi';
import useUserStore from '@stores/userStore';

const HostEditProfile = () => {
  const hostProfile = useUserStore(state => state.hostProfile);
  const selectedHostGuesthouseId = useUserStore(
    state => state.selectedHostGuesthouseId,
  );
  const setHostProfile = useUserStore(state => state.setHostProfile);

  const selectedGuesthouse = useMemo(() => {
    const profiles = Array.isArray(hostProfile?.guesthouseProfiles)
      ? hostProfile.guesthouseProfiles
      : [];

    if (!profiles.length) {
      return null;
    }

    const current =
      profiles.find(
        (item, index) =>
          String(item?.guesthouseId ?? `guesthouse-${index}`) ===
          String(selectedHostGuesthouseId),
      ) || profiles[0];

    return {
      guesthouseId: current?.guesthouseId ?? null,
      guesthouseName: current?.guesthouseName || '이름 없음',
      profileImageUrl: current?.profileImageUrl || null,
    };
  }, [hostProfile?.guesthouseProfiles, selectedHostGuesthouseId]);
  const hostId = hostProfile?.hostId ?? hostProfile?.id ?? undefined;
  const resolvedGuesthouseId = Number(
    selectedGuesthouse?.guesthouseId ?? selectedHostGuesthouseId,
  );

  const initialProfileImageUrl =
    selectedGuesthouse?.profileImageUrl ?? hostProfile?.photoUrl ?? null;
  const initialGuesthouseName = selectedGuesthouse?.guesthouseName || '';

  const [profileImageUrl, setProfileImageUrl] = useState(initialProfileImageUrl);
  const [guesthouseName, setGuesthouseName] = useState(initialGuesthouseName);
  const [savedProfilePhotoUrl, setSavedProfilePhotoUrl] = useState(
    initialProfileImageUrl,
  );
  const [savedGuesthouseName, setSavedGuesthouseName] = useState(
    initialGuesthouseName,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProfileImageUrl(initialProfileImageUrl);
    setGuesthouseName(initialGuesthouseName);
    setSavedProfilePhotoUrl(initialProfileImageUrl);
    setSavedGuesthouseName(initialGuesthouseName);
  }, [initialProfileImageUrl, initialGuesthouseName]);

  const handleChangeProfileImage = async () => {
    const uploadedUrl = await uploadSingleImage();
    if (!uploadedUrl) return;
    setProfileImageUrl(uploadedUrl);
  };

  const handleSaveProfile = async () => {
    if (isSaving) return;
    if (!Number.isFinite(resolvedGuesthouseId) || resolvedGuesthouseId < 1) {
      Toast.show({
        type: 'error',
        text1: '게스트하우스 정보를 불러오지 못했어요',
        position: 'top',
        visibilityTime: 2000,
      });
      return;
    }

    const trimmedName = guesthouseName.trim();
    const isNameChanged = trimmedName !== savedGuesthouseName;
    const isPhotoChanged = profileImageUrl !== savedProfilePhotoUrl;
    if (!isNameChanged && !isPhotoChanged) return;

    if (!trimmedName) {
      Toast.show({
        type: 'error',
        text1: '게스트하우스 이름을 입력해주세요',
        position: 'top',
        visibilityTime: 2000,
      });
      return;
    }

    try {
      setIsSaving(true);
      const body = {};
      if (isNameChanged) body.guesthouseName = trimmedName;
      if (isPhotoChanged) body.profileImageUrl = profileImageUrl;

      await guesthouseProfileApi.updateGuesthouseProfile({
        guesthouseId: resolvedGuesthouseId,
        hostId,
        body,
      });

      setSavedProfilePhotoUrl(profileImageUrl);
      setSavedGuesthouseName(trimmedName);

      const currentHostProfile = useUserStore.getState().hostProfile;
      const nextGuesthouseProfiles = Array.isArray(
        currentHostProfile?.guesthouseProfiles,
      )
        ? currentHostProfile.guesthouseProfiles.map(profile =>
            String(profile?.guesthouseId) ===
            String(resolvedGuesthouseId)
              ? {
                  ...profile,
                  guesthouseName: isNameChanged
                    ? trimmedName
                    : profile?.guesthouseName,
                  profileImageUrl: isPhotoChanged
                    ? profileImageUrl
                    : profile?.profileImageUrl,
                }
              : profile,
          )
        : [];

      setHostProfile({
        ...currentHostProfile,
        guesthouseProfiles: nextGuesthouseProfiles,
      });

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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Header title='프로필 편집'/>

        <View style={styles.contentArea}>
          <View style={[styles.headerBg, styles.headerBgFallback]}>
            <View style={styles.profileWrap}>
              <View style={styles.avatarEditWrap}>
                <View style={styles.profileImageWrap}>
                  <Avatar uri={profileImageUrl} size={80} iconSize={32} />
                </View>
                <TouchableOpacity
                  style={styles.profiImgEditBtn}
                  onPress={handleChangeProfileImage}
                  activeOpacity={0.8}>
                  <CameraIcon width={16} height={16} />
                </TouchableOpacity>
              </View>

              <View style={styles.guesthouseNameInputBox}>
                <TextInput
                  value={guesthouseName}
                  onChangeText={setGuesthouseName}
                  placeholder="게스트하우스 이름"
                  placeholderTextColor={COLORS.grayscale_400}
                  style={[FONTS.fs_16_semibold, styles.guesthouseNameText]}
                  maxLength={50}
                />
              </View>
            </View>
          </View>
        </View>
        <View style={styles.fixedBottomBar}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={handleSaveProfile}
          >
            <Text style={[FONTS.fs_14_medium, styles.applyBtnText]}>적용하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default HostEditProfile;
