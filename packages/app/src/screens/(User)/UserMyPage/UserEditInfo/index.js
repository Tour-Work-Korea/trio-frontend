import {useTranslation} from 'react-i18next';
import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import styles from './UserEditInfo.styles';
import useUserStore from '@stores/userStore';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

const UserEditInfo = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const userProfile = useUserStore(state => state.userProfile);

  return (
    <View style={styles.outContainer}>
      <Header title={t('myPage.editMemberInformation')} />
      <View style={styles.container}>
        <View
          style={{
            backgroundColor: COLORS.grayscale_0,
            borderRadius: 8,
            padding: 8,
          }}>
          <View style={styles.contentContainer}>
            <Text style={[FONTS.fs_16_medium, styles.label]}>
              {t('common.contactInformation')}
            </Text>
            <Text style={styles.input}>{userProfile.phone}</Text>
          </View>

          <View style={styles.contentRowContainer}>
            <Text style={[FONTS.fs_16_medium, styles.label]}>
              {t('auth.password')}
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('FindIntro', {
                  find: 'password',
                  userRole: 'USER',
                  originPhone: userProfile.phone,
                })
              }>
              <Text>{t('myPage.changeYourPassword')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default UserEditInfo;
