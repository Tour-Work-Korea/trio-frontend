import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import AlertModal from '@components/modals/AlertModal';
import useUserStore from '@stores/userStore';

import authApi from '@utils/api/authApi';
import {tryLogout} from '@utils/auth/login';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import RightArrow from '@assets/images/chevron_right_gray.svg';

const Settings = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const userRole = useUserStore(state => state.userRole);
  const userProfile = useUserStore(state => state.userProfile);
  const hostProfile = useUserStore(state => state.hostProfile);
  const accountProfile = userRole === 'HOST' ? hostProfile : userProfile;

  const accountName = accountProfile?.name;
  const accountEmail = accountProfile?.email;
  const accountPhone = accountProfile?.phone;

  const handleLogout = async () => {
    await tryLogout();
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
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
      <Header title={'설정'} />

      <View style={styles.container}>
        <View>
          <Text style={styles.menuHeader}>계정 정보</Text>
          <View style={styles.menuContainer}>
            <View style={styles.menuRow}>
              <Text style={styles.menuText}>이름</Text>
              <Text style={styles.versionText}>{accountName || '-'}</Text>
            </View>
            <View style={styles.menuRow}>
              <Text style={styles.menuText}>이메일 주소</Text>
              <Text style={styles.versionText}>{accountEmail || '-'}</Text>
            </View>
            <View style={styles.menuRow}>
              <Text style={styles.menuText}>휴대폰 번호</Text>
              <Text style={styles.versionText}>{accountPhone || '-'}</Text>
            </View>
            <View style={styles.menuRow}>
                <Text style={styles.menuText}>비밀번호</Text>
                <View style={styles.menuButtonRow}>
                  <Text style={styles.versionText}>**********</Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('FindIntro', {
                        find: 'password',
                        userRole,
                        originPhone: accountPhone,
                      })
                    }>
                    <Text style={styles.logoutText}>변경</Text>
                  </TouchableOpacity>
                </View>
              </View>
          </View>
        </View>

        <View>
          <Text style={styles.menuHeader}>서비스 정보</Text>
          <View style={styles.menuContainer}>
            <View style={styles.menuRow}>
              <Text style={styles.menuText}>버전 정보</Text>
              <Text style={styles.versionText}>ver.1</Text>
            </View>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => navigation.navigate('Terms')}>
              <Text style={styles.menuText}>이용 약관</Text>
              <RightArrow width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
          <View style={styles.devide} />
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setModalVisible(true)}>
            <Text style={[styles.logoutText, {textDecorationLine:'none'}]}>회원 탈퇴</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailContainer}>
          <Text style={styles.detailText}>상호명 : 워커웨이</Text>
          <Text style={styles.detailText}>사업자등록번호: 888-25-02003</Text>
          <Text style={styles.detailText}>연락처: 010-4123-0075</Text>
          <Text style={styles.detailText}>
            통신판매번호: 2025-서울양천-0825
          </Text>
          <Text style={styles.detailText}>주소: 제주시 연동 263-13 레지던스이타스3</Text>
          <Text style={styles.detailText}>대표자 : 이하늘, 정재원</Text>
        </View>
      </View>
      <AlertModal
        visible={modalVisible}
        title={'정말 탈퇴하시겠어요?'}
        buttonText={'취소'}
        buttonText2={'탈퇴하기'}
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
