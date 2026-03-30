import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import useUserStore from '@stores/userStore';

import styles from './HostEditInfo.styles';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

const HostEditInfo = () => {
  const navigation = useNavigation();
  const hostProfile = useUserStore(state => state.hostProfile);

  return (
    <View style={styles.outContainer}>
      <Header title="회원 정보 수정" />
      <View style={styles.container}>
        <View style={{backgroundColor: COLORS.grayscale_0, borderRadius: 8, padding: 8}}>
          <View style={styles.contentContainer}>
            <Text style={[FONTS.fs_16_medium, styles.label]}>연락처</Text>
            <Text style={styles.input}>{hostProfile.phone}</Text>
          </View>
          <View style={styles.contentRowContainer}>
            <Text style={[FONTS.fs_16_medium, styles.label]}>비밀번호</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('FindIntro', {
                  find: 'password',
                  userRole: 'HOST',
                  originPhone: hostProfile.phone,
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

export default HostEditInfo;
