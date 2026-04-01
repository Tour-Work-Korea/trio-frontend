import React, {useState} from 'react';
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
  const navigation = useNavigation();
  const userProfile = useUserStore(state => state.userProfile);
  const setUserProfile = useUserStore(state => state.setUserProfile);
  const initialNickname = userProfile.nickname?.trim() ?? '';
  const [formData, setFormData] = useState({
    photoUrl: userProfile.photoUrl,
    nickname: userProfile.nickname,
    mbti: userProfile.mbti === 'DEFAULT' ? '' : userProfile.mbti,
    instagramId:
      userProfile.instagramId === 'ID를 추가해주세요'
        ? ''
        : userProfile.instagramId,
  });
  const [errorModal, setErrorModal] = useState({visible: false, title: ''});
  const [lastCheckedNickname, setLastCheckedNickname] = useState(initialNickname);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(true);

  const basicInfoRows = [
    {label: '이름', value: userProfile.name},
    {label: '생년월일', value: userProfile.birthDate},
    {label: '성별', value: userProfile.gender === 'F' ? '여성' : '남성'},
    {label: '이메일 주소', value: userProfile.email},
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
        text1: '닉네임을 입력해주세요',
        position: 'top',
      });
      setIsNicknameAvailable(false);
      return false;
    }

    if (!hasNoSpecialChars(trimmedNickname)) {
      Toast.show({
        type: 'error',
        text1: '닉네임은 한글, 영문, 숫자만 사용할 수 있어요',
        position: 'top',
      });
      setIsNicknameAvailable(false);
      return false;
    }

    if (!isNicknameLengthValid(trimmedNickname)) {
      Toast.show({
        type: 'error',
        text1: '닉네임은 2자 이상 10자 이하로 입력해주세요',
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
        text1: '사용 가능한 닉네임입니다',
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
          '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.',
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
          ? 'ID를 추가해주세요'
          : formData.instagramId.trim();
      const requestList = [];

      if (trimmedNickname !== initialNickname) {
        const isValidNickname = await validateNicknameDuplicate(trimmedNickname);
        if (!isValidNickname) return;
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
        requestList.push(
          userMyApi.updateNickname({name: trimmedNickname}),
        );
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
          formData.photoUrl && formData.photoUrl !== '사진을 추가해주세요'
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
          error?.response?.data?.message ?? '프로필 수정 중 오류가 발생했어요',
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
        keyboardShouldPersistTaps="handled"
      >
        <Header title="내 정보" />
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
                style={styles.plusButton}
                onPress={handleEditProfileImage}>
                <PlusIcon width={20} height={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.nicknameSection}>
              <Text style={[FONTS.fs_12_medium, styles.nicknameTitle]}>닉네임</Text>
              <View style={styles.nicknameRow}>
                <TextInput
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
                  placeholder="닉네임"
                  placeholderTextColor={COLORS.grayscale_400}
                />
                <View style={{position: 'absolute', right: '-8%'}}>
                  <EditGray width={18} height={18} />
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.sectionGroup}>
            <View style={styles.section}>
              <Text style={[FONTS.fs_18_semibold, styles.sectionTitle]}>
                기본 정보
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
                프로필 정보
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
                    인스타 ID
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
      <TouchableOpacity style={styles.saveButton} onPress={updateMyProfile}>
        <Text style={[FONTS.fs_16_medium, styles.saveButtonText]}>
          적용
        </Text>
      </TouchableOpacity>
      <AlertModal
        visible={errorModal.visible}
        title={errorModal.title}
        buttonText={'확인'}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </KeyboardAvoidingView>
  );
};

export default UserEditProfile;
