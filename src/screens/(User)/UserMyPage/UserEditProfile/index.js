import React, {useCallback, useState} from 'react';
import {View, Text, TouchableOpacity, Image, Alert} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import PersonIcon from '@assets/images/Gray_Person.svg';
import PlusIcon from '@assets/images/plus.svg';
import RightArrow from '@assets/images/gray_chevron_right.svg';

import Header from '@components/Header';
import styles from './UserEditProfile.styles';
import {FONTS} from '@constants/fonts';
import userMyApi from '@utils/api/userMyApi';
import useUserStore from '@stores/userStore';
import {uploadSingleImage} from '@utils/imageUploadHandler';

const UserEditProfile = () => {
  const navigation = useNavigation();
  const userProfile = useUserStore(state => state.userProfile);
  const setUserProfile = useUserStore(state => state.setUserProfile);

  const [user, setUser] = useState(userProfile);

  useFocusEffect(
    useCallback(() => {
      setUser(userProfile);
    }, [userProfile]),
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
      await userMyApi.updateMyProfile('photoUrl', imageUrl);
      setUserProfile({...user, photoUrl: imageUrl});
    } catch (error) {
      console.warn(
        '프로필 이미지 업로드 실패: ',
        error?.response?.data?.message || error,
      );
    }
  };

  return (
    <View style={styles.outContainer}>
      <Header title="마이페이지" />
      <View style={styles.container}>
        {/* 프로필 영역 */}
        <View style={styles.profileContainer}>
          <View style={styles.profileImageWrapper}>
            {user.photoUrl ? (
              <Image
                source={{uri: user.photoUrl}}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profileImage}>
                <PersonIcon width={36} height={36} />
              </View>
            )}
            <TouchableOpacity
              style={styles.plusButton}
              onPress={handleEditProfileImage}>
              <PlusIcon width={20} height={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.nameButton}
            onPress={() => goToEditProfile('name', '이름', user.nickname)}>
            <Text style={[FONTS.fs_16_semibold, styles.nameText]}>
              {user.nickname}
            </Text>
            <RightArrow width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* 정보 수정 리스트 */}
        <View style={styles.infoContainer}>
          <InfoItem
            label="휴대폰 번호"
            value={user.phone}
            onPress={() => goToEditProfile('phone', '휴대폰 번호', user.phone)}
          />
          <InfoItem
            label="이메일 주소"
            value={user.email}
            onPress={() => goToEditProfile('email', '이메일 주소', user.email)}
          />
          <InfoItem
            label="MBTI"
            value={user.mbti}
            onPress={() => goToEditProfile('mbti', 'MBTI', user.mbti)}
          />
          <InfoItem
            label="인스타"
            value={user.instagramId}
            onPress={() =>
              goToEditProfile('instagramId', '인스타', user.instagramId)
            }
          />
        </View>
      </View>
    </View>
  );
};

const InfoItem = ({label, value, noArrow, onPress}) => (
  <TouchableOpacity
    disabled={noArrow}
    style={styles.infoItem}
    onPress={onPress}>
    <Text style={[FONTS.fs_h2_bold, styles.infoLabel]}>{label}</Text>
    <View style={styles.infoRight}>
      <Text style={[FONTS.fs_h2, styles.infoValue]}>{value}</Text>
      {!noArrow && <RightArrow width={20} height={20} />}
    </View>
  </TouchableOpacity>
);

export default UserEditProfile;
