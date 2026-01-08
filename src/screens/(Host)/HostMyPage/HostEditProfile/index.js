import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Button,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import useUserStore from '@stores/userStore';
import {uploadSingleImage} from '@utils/imageUploadHandler';
import hostMyApi from '@utils/api/hostMyApi';
import ButtonScarlet from '@components/ButtonScarlet';
import {Email} from '@components/Certificate/Email';
import Phone from '@components/Certificate/UserPhone';
import ErrorModal from '@components/modals/ErrorModal';

import styles from './HostEditProfile.styles';
import {FONTS} from '@constants/fonts';
import EmptyImage from '@assets/images/wlogo_gray_up.svg';
import PlusIcon from '@assets/images/plus_gray.svg';

const HostEditProfile = () => {
  const navigation = useNavigation();
  const hostProfile = useUserStore(state => state.hostProfile);
  const setHostProfile = useUserStore(state => state.setHostProfile);
  const [formData, setFormData] = useState({
    photoUrl: hostProfile.photoUrl,
    name: hostProfile.name,
    phoneNumber: hostProfile.phone,
    email: hostProfile.email,
    businessNum: hostProfile.businessNum,
  });
  const [editEmail, setEditEmail] = useState(false);
  const [editPhone, setEditPhone] = useState(false);
  const [errorModal, setErrorModal] = useState({
    title: '',
    onPress: null,
    buttonText: '',
    visible: '',
  });

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

  const handleEditPhone = phoneNumber => {
    setEditPhone(false);
    setFormData(prev => ({...prev, phoneNumber}));
  };

  const handleUpdateProfile = async () => {
    try {
      await hostMyApi.updateMyProfile(formData);
      setHostProfile({
        phone: formData.phoneNumber,
        photoUrl: formData.photoUrl,
        name: formData.name,
        email: formData.email,
        businessNum: formData.businessNum,
      });
      navigation.goBack();
    } catch (error) {
      setErrorModal({
        title:
          error?.response?.data?.message ||
          '프로필 수정 중 오류가 발생했습니다',
        buttonText: '확인',
        onPress: () => setErrorModal(prev => ({...prev, visible: false})),
        visible: true,
      });
    }
  };

  return (
    <>
      {!editEmail && !editPhone ? (
        <View style={styles.outContainer}>
          <Header title="회원 정보 수정" />
          <View style={styles.container}>
            <View>
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

              <View style={styles.contentContainer}>
                <Text style={[FONTS.fs_16_medium, styles.label]}>이름</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={text =>
                    setFormData(prev => ({...prev, name: text}))
                  }
                />
              </View>
              <View style={styles.contentContainer}>
                <Text style={[FONTS.fs_16_medium, styles.label]}>연락처</Text>
                <TouchableOpacity onPress={() => setEditPhone(true)}>
                  <Text style={styles.input}>{formData.phoneNumber}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.contentContainer}>
                <Text style={[FONTS.fs_16_medium, styles.label]}>이메일</Text>
                <TouchableOpacity onPress={() => setEditEmail(true)}>
                  <Text style={styles.input}>{formData.email}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.contentRowContainer}>
                <Text style={[FONTS.fs_16_medium, styles.label]}>비밀번호</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('FindIntro', {
                      find: 'password',
                      userRole: 'HOST',
                      originPhone: formData.phoneNumber,
                    })
                  }>
                  <Text>비밀번호 변경하기</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <ButtonScarlet title={'적용하기'} onPress={handleUpdateProfile} />
            </View>
          </View>
        </View>
      ) : (
        <></>
      )}

      {editEmail ? <Email onPress={handleEditEmail} user="HOST" /> : <></>}
      {editPhone ? <Phone onPress={handleEditPhone} user="HOST" /> : <></>}
      <ErrorModal
        title={errorModal.title}
        buttonText={errorModal.buttonText}
        onPress={errorModal.onPress}
        visible={errorModal.visible}
      />
    </>
  );
};

export default HostEditProfile;
