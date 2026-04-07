import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import styles from './UserEditInfo.styles';
import useUserStore from '@stores/userStore';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

const UserEditInfo = () => {
  const navigation = useNavigation();
  const userProfile = useUserStore(state => state.userProfile);

  return (
    <View style={styles.outContainer}>
      <Header title="회원 정보 수정" />
      <View style={styles.container}>
        <View
          style={{
            backgroundColor: COLORS.grayscale_0,
            borderRadius: 8,
            padding: 8,
          }}>
          <View style={styles.contentContainer}>
            <Text style={[FONTS.fs_16_medium, styles.label]}>연락처</Text>
            <Text style={styles.input}>{userProfile.phone}</Text>
          </View>

          <View style={styles.contentRowContainer}>
            <Text style={[FONTS.fs_16_medium, styles.label]}>비밀번호</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('FindIntro', {
                  find: 'password',
                  userRole: 'USER',
                  originPhone: userProfile.phone,
                })
              }>
              <Text>비밀번호 변경하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default UserEditInfo;
