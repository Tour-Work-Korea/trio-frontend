import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import styles from './UserEditProfile.styles';
import userMyApi from '@utils/api/userMyApi';
import useUserStore from '@stores/userStore';
import {uploadSingleImage} from '@utils/imageUploadHandler';
import ButtonScarlet from '@components/ButtonScarlet';
import ErrorModal from '@components/modals/ErrorModal';
import {calculateAge} from '@utils/auth/login';
import {Email} from '@components/Certificate/Email';
import Phone from '@components/Certificate/Phone';

import PlusIcon from '@assets/images/plus_gray.svg';
import EmptyImage from '@assets/images/wlogo_gray_up.svg';
import {FONTS} from '@constants/fonts';

const UserEditProfile = () => {
  const navigation = useNavigation();
  const userProfile = useUserStore(state => state.userProfile);
  const setUserProfile = useUserStore(state => state.setUserProfile);
  const [formData, setFormData] = useState({
    photoUrl: userProfile.photoUrl,
    name: userProfile.name,
    nickname: userProfile.nickname,
    phone: userProfile.phone,
    email: userProfile.email,
    mbti: userProfile.mbti,
    instagramId: userProfile.instagramId,
    gender: userProfile.gender,
    birthDate: userProfile.birthDate,
  });
  const [editEmail, setEditEmail] = useState(false);
  const [editPhone, setEditPhone] = useState(false);
  const [errorModal, setErrorModal] = useState({visible: false, title: ''});

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

  const handleEditEmail = email => {
    setEditEmail(false);
    setFormData(prev => ({...prev, email}));
  };

  const handleEditPhone = phone => {
    setEditPhone(false);
    setFormData(prev => ({...prev, phone}));
  };

  const updateMyProfile = async () => {
    try {
      await userMyApi.updateMyProfile(formData);
      setUserProfile({
        name: formData.name ?? '',
        nickname: formData.nickname ?? '',
        photoUrl:
          formData.photoUrl && formData.photoUrl !== '사진을 추가해주세요'
            ? formData.photoUrl
            : null,
        phone: formData.phone ?? '',
        email: formData.email ?? '',
        mbti: formData.mbti ?? '',
        instagramId: formData.instagramId ?? '',
        gender: formData.gender ?? 'F',
        birthDate: formData.birthDate ?? null,
        age: calculateAge(formData.birthDate),
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
    <>
      {!editEmail && !editPhone ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80} // 필요에 따라 조절
        >
          <View style={styles.outContainer}>
            <Header title="회원 정보 수정" />
            <ScrollView
              style={styles.container}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled">
              {/* 이미지 */}
              <View style={styles.profileImageContainer}>
                <View style={styles.profileImageWrapper}>
                  {formData.photoUrl ? (
                    <Image
                      source={{uri: formData.photoUrl}}
                      style={styles.profileImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.profileImage}>
                      <EmptyImage width={60} height={60} />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.plusButton}
                    onPress={handleEditProfileImage}>
                    <PlusIcon width={24} height={24} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 이름 */}
              <View style={styles.contentContainer}>
                <Text style={[FONTS.fs_16_medium, styles.label]}>이름</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nickname}
                  onChangeText={text =>
                    setFormData({...formData, nickname: text})
                  }
                />
                {/* 성별 */}
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      formData.gender === 'F' && styles.genderSelected,
                    ]}
                    onPress={() => setFormData({...formData, gender: 'F'})}>
                    <Text
                      style={[
                        styles.genderText,
                        FONTS.fs_14_medium,
                        formData.gender === 'F' && styles.genderSelectedText,
                        formData.gender === 'F' && FONTS.fs_14_semibold,
                      ]}>
                      여자
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      formData.gender === 'M' && styles.genderSelected,
                    ]}
                    onPress={() => setFormData({...formData, gender: 'M'})}>
                    <Text
                      style={[
                        styles.genderText,
                        FONTS.fs_14_medium,
                        formData.gender === 'M' && styles.genderSelectedText,
                        formData.gender === 'M' && FONTS.fs_14_semibold,
                      ]}>
                      남자
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 생일 */}
              <View style={styles.contentContainer}>
                <View style={styles.ageBirthYearRow}>
                  <View style={styles.row}>
                    <Text style={styles.label}>생일</Text>
                    <TextInput
                      style={[styles.input]}
                      value={formData.birthDate?.toString()}
                      keyboardType="numeric"
                      onChangeText={text =>
                        setFormData({...formData, birthDate: text})
                      }
                      placeholder="2000-01-01"
                    />
                  </View>
                </View>
              </View>

              {/* 연락처 */}
              <View style={styles.contentContainer}>
                <Text style={styles.label}>연락처</Text>
                <TouchableOpacity onPress={() => setEditPhone(true)}>
                  <TextInput
                    editable={false}
                    style={styles.input}
                    value={formData.phone}
                  />
                </TouchableOpacity>
              </View>

              {/* 이메일 */}
              <View style={styles.contentContainer}>
                <Text style={styles.label}>이메일</Text>
                <TouchableOpacity onPress={() => setEditEmail(true)}>
                  <TextInput
                    editable={false}
                    style={styles.input}
                    value={formData.email}
                  />
                </TouchableOpacity>
              </View>

              {/* MBTI */}
              <View style={styles.contentContainer}>
                <Text style={styles.label}>MBTI</Text>
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
                      onPress={() => setFormData({...formData, mbti: type})}>
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

              {/* 인스타 */}
              <View style={styles.contentContainer}>
                <Text style={styles.label}>insta</Text>
                <View style={styles.instagramRow}>
                  <Text style={[FONTS.fs_14_medium, styles.atSymbol]}>@</Text>
                  <TextInput
                    style={styles.instagramInput}
                    value={formData.instagramId}
                    onChangeText={text =>
                      setFormData({...formData, instagramId: text})
                    }
                  />
                </View>
              </View>

              <View style={styles.saveButton}>
                <ButtonScarlet
                  title={'정보 저장하기'}
                  onPress={updateMyProfile}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <></>
      )}
      {editEmail ? <Email onPress={handleEditEmail} user="USER" /> : <></>}
      {editPhone ? <Phone onPress={handleEditPhone} user="USER" /> : <></>}
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        buttonText={'확인'}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </>
  );
};

export default UserEditProfile;
