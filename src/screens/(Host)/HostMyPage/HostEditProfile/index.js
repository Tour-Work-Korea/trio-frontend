import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import PersonIcon from '@assets/images/Gray_Person.svg';
import PlusIcon from '@assets/images/plus.svg';
import RightArrow from '@assets/images/gray_chevron_right.svg';

import Header from '@components/Header';
import styles from './HostEditProfile.styles';
import { FONTS } from '@constants/fonts';

const HostEditProfile = () => {
  const navigation = useNavigation();

  const goToEditProfile = (field, label, value) => {
    navigation.navigate('EditProfileFieldScreen', {
      field,
      label,
      value,
    });
  };

  return (
    <View style={styles.outContainer}>
      <Header title="마이페이지" />
      <View style={styles.container}>

        {/* 프로필 영역 */}
        <View style={styles.profileContainer}>
          <View style={styles.profileImageWrapper}>
            <View style={styles.profileImage}>
              <PersonIcon width={36} height={36} />
            </View>
            <TouchableOpacity style={styles.plusButton}>
              <PlusIcon width={20} height={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.nameButton} onPress={() => goToEditProfile('name', '이름', '김사장')}>
            <Text style={[FONTS.fs_h2_bold, styles.nameText]}>김사장</Text>
            <RightArrow width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* 정보 수정 리스트 */}
        <View style={styles.infoContainer}>
          <InfoItem
            label="휴대폰 번호"
            value="010-0000-0000"
            onPress={() => goToEditProfile('phone', '휴대폰 번호', '010-0000-0000')}
          />
          <InfoItem
            label="이메일 주소"
            value="1234@gmail.com"
            onPress={() => goToEditProfile('email', '이메일 주소', '1234@gmail.com')}
          />
          <InfoItem label="사업자 번호" value="0000000000" noArrow />
        </View>

      </View>
    </View>
  );
};

const InfoItem = ({ label, value, noArrow, onPress }) => (
  <TouchableOpacity disabled={noArrow} onPress={onPress} style={styles.infoItem}>
    <Text style={[FONTS.fs_h2_bold, styles.infoLabel]}>{label}</Text>
    <View style={styles.infoRight}>
      <Text style={[FONTS.fs_h2, styles.infoValue]}>{value}</Text>
      {!noArrow && <RightArrow width={20} height={20} />}
    </View>
  </TouchableOpacity>
);

export default HostEditProfile;
