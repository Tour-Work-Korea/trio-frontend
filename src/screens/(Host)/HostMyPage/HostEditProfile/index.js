import React, {useCallback, useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import EmptyImage from '@assets/images/wlogo_gray_up.svg';
import PlusIcon from '@assets/images/plus_gray.svg';

import Header from '@components/Header';
import styles from './HostEditProfile.styles';
import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';
import {uploadSingleImage} from '@utils/imageUploadHandler';
import hostMyApi from '@utils/api/hostMyApi';

const HostEditProfile = () => {
  const navigation = useNavigation();
  const hostProfile = useUserStore(state => state.hostProfile);
  const setHostProfile = useUserStore(state => state.setHostProfile);

  const [host, setHost] = useState(hostProfile);

  useFocusEffect(
    useCallback(() => {
      setHost(hostProfile);
    }, [hostProfile]),
  );
  const goToEditProfile = (field, label, value) => {
    navigation.navigate('EditProfileFieldScreen', {
      field,
      label,
      value,
    });
  };

  const handleEditProfileImage = async () => {
    try {
      const imageUrl = await uploadSingleImage();
      await hostMyApi.updateMyProfile('photoUrl', imageUrl);
      setHostProfile({...host, photoUrl: imageUrl});
    } catch (error) {
      console.warn(
        '프로필 이미지 업로드 실패: ',
        error?.response?.data?.message || error,
      );
    }
  };

  return (
    <View style={styles.outContainer}>
      <Header title="회원 정보 수정" />
      <View style={styles.container}>
        {/* 이미지 */}
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImageWrapper}>
            {host.photoUrl ? (
              <Image
                source={{uri: host.photoUrl}}
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
          <TouchableOpacity
            onPress={() => goToEditProfile('name', '이름', host.name)}>
            <Text style={styles.input}>{host.name}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.contentContainer}>
          <Text style={[FONTS.fs_16_medium, styles.label]}>휴대폰 번호</Text>
          <TouchableOpacity
            onPress={() => goToEditProfile('phone', '휴대폰 번호', host.phone)}>
            <Text style={styles.input}>{host.phone}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.contentContainer}>
          <Text style={[FONTS.fs_16_medium, styles.label]}>이메일 주소</Text>
          <TouchableOpacity
            onPress={() => goToEditProfile('email', '이메일 주소', host.email)}>
            <Text style={styles.input}>{host.email}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HostEditProfile;
