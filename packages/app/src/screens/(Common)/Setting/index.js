import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import Header from '@components/Header';
import AlertModal from '@components/modals/AlertModal';
import useUserStore from '@stores/userStore';

import authApi from '@utils/api/authApi';
import {tryLogout} from '@utils/auth/login';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import RightArrow from '@assets/images/chevron_right_gray.svg';
import {useTranslation} from 'react-i18next';
import useLocaleStore from '@stores/localeStore';

const LOGOUT_HOME_LOCK_KEY = '__TRIO_LOGOUT_HOME_LOCK__';

const Settings = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const language = useLocaleStore(state => state.language);
  const [modalVisible, setModalVisible] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const userProfile = useUserStore(state => state.userProfile);
  const accountProfile = userProfile;

  const accountName = accountProfile?.name;
  const accountEmail = accountProfile?.email;
  const accountPhone = accountProfile?.phone;
  const appVersion = DeviceInfo.getVersion();

  const handleLogout = async () => {
    await tryLogout();
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.sessionStorage.setItem(LOGOUT_HOME_LOCK_KEY, '1');
      window.history.replaceState({__trioLogoutHomeLock: true}, '', '/');
      window.history.pushState({__trioLogoutHomeLock: true}, '', '/');
    }
    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs', params: {screen: '홈'}}],
    });
  };

  const handleWithdrawal = async () => {
    if (isWithdrawing) return;
    setIsWithdrawing(true);
    setModalVisible(false);

    try {
      await authApi.withdrawal();
      await tryLogout();
    } catch (error) {
      console.warn('[Settings] withdrawal failed:', error?.message);
    } finally {
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
      setIsWithdrawing(false);
    }
  };

  return (
    <View style={styles.background}>
      <Header title={t('settings.title')} />

      <View style={styles.container}>
        <View>
          <Text style={styles.menuHeader}>
            {t('settings.accountInformation')}
          </Text>
          <View style={styles.menuContainer}>
            <View style={styles.menuRow}>
              <Text style={styles.menuText}>{t('common.name')}</Text>
              <Text style={styles.versionText}>{accountName || '-'}</Text>
            </View>
            <View style={styles.menuRow}>
              <Text style={styles.menuText}>{t('common.emailAddress')}</Text>
              <Text style={styles.versionText}>{accountEmail || '-'}</Text>
            </View>
            <View style={styles.menuRow}>
              <Text style={styles.menuText}>
                {t('common.phoneNumber_581698')}
              </Text>
              <Text style={styles.versionText}>{accountPhone || '-'}</Text>
            </View>
            <View style={styles.menuRow}>
              <Text style={styles.menuText}>{t('auth.password')}</Text>
              <View style={styles.menuButtonRow}>
                <Text style={styles.versionText}>**********</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('FindIntro', {
                      find: 'password',
                      userRole: 'USER',
                      originPhone: accountPhone,
                    })
                  }>
                  <Text style={styles.logoutText}>{t('common.change')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.menuHeader}>
            {t('settings.serviceInformation')}
          </Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              accessibilityLabel={t('language.title')}
              style={styles.menuRow}
              onPress={() => navigation.navigate('Language')}>
              <Text style={styles.menuText}>{t('language.title')}</Text>
              <View style={styles.menuButtonRow}>
                <Text style={styles.versionText}>
                  {t(
                    language === 'ko' ? 'language.korean' : 'language.english',
                  )}
                </Text>
                <RightArrow width={20} height={20} />
              </View>
            </TouchableOpacity>
            {Platform.OS !== 'web' ? (
              <View style={styles.menuRow}>
                <Text style={styles.menuText}>
                  {t('settings.versionInformation')}
                </Text>
                <Text style={styles.versionText}>ver.{appVersion}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => navigation.navigate('Terms')}>
              <Text style={styles.menuText}>{t('settings.termsOfUse')}</Text>
              <RightArrow width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
            <Text style={styles.logoutText}>{t('auth.logout')}</Text>
          </TouchableOpacity>
          <View style={styles.devide} />
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setModalVisible(true)}>
            <Text style={[styles.logoutText, {textDecorationLine: 'none'}]}>
              {t('settings.withdrawMembership')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailContainer}>
          <Text style={styles.detailText}>
            {t('common.companyNameWalkerway')}
          </Text>
          <Text style={styles.detailText}>
            {t('common.businessRegistrationNumber8882502003')}
          </Text>
          <Text style={styles.detailText}>
            {t('common.contactNumber01041230075')}
          </Text>
          <Text style={styles.detailText}>
            {t('common.mailOrderNumber2025SeoulYangcheon0825')}
          </Text>
          <Text style={styles.detailText}>
            {t('common.addressResidenceItas326313YeonDongJejuSi')}
          </Text>
          <Text style={styles.detailText}>
            {t('common.representativesLeeHaNeulJeongJaeWon')}
          </Text>
        </View>
      </View>
      <AlertModal
        visible={modalVisible}
        title={t('settings.areYouSureYouWantToWithdraw')}
        buttonText={t('common.cancel')}
        buttonText2={t('settings.unsubscribe')}
        onPress={() => setModalVisible(false)}
        onPress2={handleWithdrawal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {flex: 1, backgroundColor: COLORS.grayscale_100},
  container: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 40,
  },
  menuHeader: {
    ...FONTS.fs_18_semibold,
    marginBottom: 8,
  },
  menuContainer: {backgroundColor: COLORS.grayscale_0, borderRadius: 8},
  menuRow: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_800,
  },
  versionText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_500,
  },
  logoutContainer: {
    marginTop: -40,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
  },
  logoutText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
    textDecorationLine: 'underline',
  },
  devide: {
    backgroundColor: COLORS.grayscale_500,
    height: 12,
    width: 1,
  },
  detailContainer: {
    gap: 4,
  },
  detailText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
  },
});

export default Settings;
