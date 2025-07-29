import React, {useCallback, useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import PersonIcon from '@assets/images/Gray_Person.svg';
import PlusIcon from '@assets/images/plus.svg';
import RightArrow from '@assets/images/gray_chevron_right.svg';

import Header from '@components/Header';
import styles from './HostEditProfile.styles';
import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';
import {uploadSingleImage} from '@utils/imageUploadHandler';
import hostMyApi from '@utils/api/hostMyApi';

const HostEditProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
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
      <Header title="마이페이지" />
      <View style={styles.container}>
        {/* 프로필 영역 */}
        <View style={styles.profileContainer}>
          <View style={styles.profileImageWrapper}>
            {host.photoUrl ? (
              <Image
                source={{uri: host.photoUrl}}
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
            onPress={() => goToEditProfile('name', '이름', host.name)}>
            <Text style={[FONTS.fs_16_semibold, styles.nameText]}>
              {host.name}
            </Text>
            <RightArrow width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* 정보 수정 리스트 */}
        <View style={styles.infoContainer}>
          <InfoItem
            label="휴대폰 번호"
            value={host.phone}
            onPress={() => goToEditProfile('phone', '휴대폰 번호', host.phone)}
          />
          <InfoItem
            label="이메일 주소"
            value={host.email}
            onPress={() => goToEditProfile('email', '이메일 주소', host.email)}
          />
          <InfoItem label="사업자 번호" value={host.businessNum} noArrow />
        </View>
      </View>
    </View>
  );
};

const InfoItem = ({label, value, noArrow, onPress}) => (
  <TouchableOpacity
    disabled={noArrow}
    onPress={onPress}
    style={styles.infoItem}>
    <Text style={[FONTS.fs_h2_bold, styles.infoLabel]}>{label}</Text>
    <View style={styles.infoRight}>
      <Text style={[FONTS.fs_h2, styles.infoValue]}>{value}</Text>
      {!noArrow && <RightArrow width={20} height={20} />}
    </View>
  </TouchableOpacity>
);

export default HostEditProfile;
