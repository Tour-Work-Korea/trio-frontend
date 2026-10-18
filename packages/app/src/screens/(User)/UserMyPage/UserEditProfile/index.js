import {useTranslation} from 'react-i18next';
import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import Header from '@components/Header';
import styles from './UserEditProfile.styles';
import userMyApi from '@utils/api/userMyApi';
import authApi from '@utils/api/authApi';
import useUserStore from '@stores/userStore';
import {uploadSingleImage} from '@utils/imageUploadHandler';
import AlertModal from '@components/modals/AlertModal';
import {calculateAge} from '@utils/auth/login';
import {
  hasNoSpecialChars,
  isNicknameLengthValid,
} from '@utils/validation/registerValidation';

import PlusIcon from '@assets/images/camera_black.svg';
import EditGray from '@assets/images/edit_gray.svg';
import Avatar from '@components/Avatar';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

const UserEditProfile = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const nicknameInputRef = useRef(null);
  const userProfile = useUserStore(state => state.userProfile);
  const setUserProfile = useUserStore(state => state.setUserProfile);
  const initialNickname = userProfile.nickname?.trim() ?? '';
  const [formData, setFormData] = useState({
    photoUrl: userProfile.photoUrl,
    nickname: userProfile.nickname,
    mbti: userProfile.mbti === 'DEFAULT' ? '' : userProfile.mbti,
    instagramId:
      userProfile.instagramId === t('common.pleaseAddYourId')
        ? ''
        : userProfile.instagramId,
  });
  const [errorModal, setErrorModal] = useState({visible: false, title: ''});
  const [lastCheckedNickname, setLastCheckedNickname] =
    useState(initialNickname);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(true);

  const basicInfoRows = [
    {label: t('common.name'), value: userProfile.name},
    {label: t('common.dateOfBirth'), value: userProfile.birthDate},
    {
      label: t('common.gender'),
      value: userProfile.gender === 'F' ? t('common.female') : t('common.male'),
    },
    {label: t('common.emailAddress'), value: userProfile.email},
  ];

  const handleEditProfileImage = async () => {
    try {
      const imageUrl = await uploadSingleImage();
      setFormData(prev => ({...prev, photoUrl: imageUrl}));
    } catch (error) {
      console.warn(
        '프로필 이미지 업로드 실패: ',
        error?.response?.data?.message || error,
      );
    }
  };

  const validateNicknameDuplicate = async nickname => {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      Toast.show({
        type: 'error',
        text1: t('common.pleaseEnterYourNickname'),
        position: 'top',
      });
      setIsNicknameAvailable(false);
      return false;
    }

    if (!hasNoSpecialChars(trimmedNickname)) {
      Toast.show({
        type: 'error',
        text1: t('myPage.nicknamesCanOnlyUseKoreanEnglishAndNumbers'),
        position: 'top',
      });
      setIsNicknameAvailable(false);
      return false;
    }

    if (!isNicknameLengthValid(trimmedNickname)) {
      Toast.show({
        type: 'error',
        text1: t('myPage.pleaseEnterANicknameOfAtLeast2CharactersAnd'),
        position: 'top',
      });
      setIsNicknameAvailable(false);
      return false;
    }

    if (trimmedNickname === initialNickname) {
      setLastCheckedNickname(trimmedNickname);
      setIsNicknameAvailable(true);
      return true;
    }

    if (trimmedNickname === lastCheckedNickname && isNicknameAvailable) {
      return true;
    }

    try {
      await authApi.checkNickname(trimmedNickname);
      setLastCheckedNickname(trimmedNickname);
      setIsNicknameAvailable(true);
      Toast.show({
        type: 'success',
        text1: t('myPage.availableNicknames'),
        position: 'top',
      });
      return true;
    } catch (error) {
      setLastCheckedNickname(trimmedNickname);
      setIsNicknameAvailable(false);
      Toast.show({
        type: 'error',
        text1:
          error?.response?.data?.message ??
          t('myPage.thisNicknameIsAlreadyInUsePleaseEnterADifferent'),

        position: 'top',
      });
      return false;
    }
  };

  const updateMyProfile = async () => {
    try {
      const trimmedNickname = formData.nickname.trim();
      const nextInstagramId =
        formData.instagramId.trim() === ''
          ? t('common.pleaseAddYourId')
          : formData.instagramId.trim();
      const requestList = [];

      if (trimmedNickname !== initialNickname) {
        const isValidNickname = await validateNicknameDuplicate(
          trimmedNickname,
        );
        if (!isValidNickname) {
          return;
        }
      }

      if (formData.photoUrl !== userProfile.photoUrl) {
        requestList.push(
          userMyApi.updateMyProfile({
            ...userProfile,
            photoUrl: formData.photoUrl,
          }),
        );
      }
      if (trimmedNickname !== initialNickname) {
        requestList.push(userMyApi.updateNickname({name: trimmedNickname}));
      }
      if ((formData.mbti || 'DEFAULT') !== userProfile.mbti) {
        requestList.push(
          userMyApi.updateMbti({mbti: formData.mbti || 'DEFAULT'}),
        );
      }
      if (nextInstagramId !== userProfile.instagramId) {
        requestList.push(
          userMyApi.updateInstagram({instagramId: nextInstagramId}),
        );
      }

      if (!requestList.length) {
        navigation.goBack();
        return;
      }

      await Promise.all(requestList);

      setUserProfile({
        ...userProfile,
        photoUrl:
          formData.photoUrl && formData.photoUrl !== t('common.pleaseAddAPhoto')
            ? formData.photoUrl
            : null,
        nickname: trimmedNickname || userProfile.nickname,
        mbti: formData.mbti || 'DEFAULT',
        instagramId: nextInstagramId,
        age: calculateAge(userProfile.birthDate),
      });
      navigation.goBack();
    } catch (error) {
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message ??
          t('common.anErrorOccurredWhileEditingYourProfile'),
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.outContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled">
        <Header title={t('common.myInformation')} />
        <View style={styles.body}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <Avatar
                uri={formData.photoUrl}
                size={116}
                iconSize={60}
                style={styles.profileImage}
              />

              <TouchableOpacity
                activeOpacity={1}
                style={styles.plusButton}
                onPress={handleEditProfileImage}>
                <PlusIcon width={20} height={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.nicknameSection}>
              <Text style={[FONTS.fs_12_medium, styles.nicknameTitle]}>
                {t('common.nickname')}
              </Text>
              <View style={styles.nicknameRow}>
                <TextInput
                  ref={nicknameInputRef}
                  style={[FONTS.fs_18_semibold, styles.nicknameInput]}
                  value={formData.nickname}
                  onChangeText={text => {
                    setFormData(prev => ({...prev, nickname: text}));
                    setIsNicknameAvailable(false);
                  }}
                  onBlur={() => validateNicknameDuplicate(formData.nickname)}
                  onSubmitEditing={() =>
                    validateNicknameDuplicate(formData.nickname)
                  }
                  placeholder={t('common.nickname')}
                  placeholderTextColor={COLORS.grayscale_400}
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.nicknameEditButton}
                  onPress={() => nicknameInputRef.current?.focus()}>
                  <EditGray width={18} height={18} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.sectionGroup}>
            <View style={styles.section}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                {t('myPage.basicInformation')}
              </Text>
              <View style={styles.card}>
                {basicInfoRows.map(item => (
                  <View key={item.label} style={styles.infoRow}>
                    <Text style={[FONTS.fs_16_medium, styles.infoLabel]}>
                      {item.label}
                    </Text>
                    <Text
                      style={[FONTS.fs_16_regular, styles.infoValue]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                {t('myPage.profileInformation')}
              </Text>
              <View style={styles.card}>
                <View style={styles.profileInfoRow}>
                  <Text style={[FONTS.fs_16_medium, styles.infoLabel]}>
                    MBTI
                  </Text>
                  <View style={styles.mbtiGrid}>
                    {[
                      'ISTJ',
                      'ISFJ',
                      'INTJ',
                      'INFJ',
                      'ISTP',
                      'ISFP',
                      'INTP',
                      'INFP',
                      'ESTJ',
                      'ESFJ',
                      'ENTJ',
                      'ENFJ',
                      'ESTP',
                      'ESFP',
                      'ENTP',
                      'ENFP',
                    ].map(type => (
                      <TouchableOpacity
                        activeOpacity={1}
                        key={type}
                        style={[
                          styles.mbtiButton,
                          formData.mbti === type && styles.mbtiSelected,
                        ]}
                        onPress={() =>
                          setFormData(prev => ({...prev, mbti: type}))
                        }>
                        <Text
                          style={[
                            styles.mbtiText,
                            FONTS.fs_14_medium,
                            formData.mbti === type && styles.mbtiSelectedText,
                            formData.mbti === type && FONTS.fs_14_semibold,
                          ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.instagramSection}>
                  <Text style={[FONTS.fs_16_medium, styles.infoLabel]}>
                    {t('myPage.instagramId')}
                  </Text>
                  <View style={styles.instagramRow}>
                    <Text style={[FONTS.fs_16_medium, styles.atSymbol]}>@</Text>
                    <TextInput
                      style={[FONTS.fs_16_regular, styles.instagramInput]}
                      value={formData.instagramId}
                      onChangeText={text =>
                        setFormData(prev => ({...prev, instagramId: text}))
                      }
                      placeholder="guesthouse_com"
                      placeholderTextColor={COLORS.grayscale_400}
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.saveButton}
        onPress={updateMyProfile}>
        <Text style={[FONTS.fs_16_semibold, styles.saveButtonText]}>
          {t('myPage.apply')}
        </Text>
      </TouchableOpacity>
      <AlertModal
        visible={errorModal.visible}
        title={errorModal.title}
        buttonText={t('common.confirm')}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </KeyboardAvoidingView>
  );
};

export default UserEditProfile;
