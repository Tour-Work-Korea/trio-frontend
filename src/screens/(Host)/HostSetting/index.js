import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import AlertModal from '@components/modals/AlertModal';
import useUserStore from '@stores/userStore';
import {tryLogout} from '@utils/auth/login';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import RightArrow from '@assets/images/chevron_right_gray.svg';

const HostSetting = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const host = useUserStore(state => state.hostProfile);

  const goToEditProfile = () => {
    navigation.navigate('HostEditInfo', {hostInfo: host});
  };

  return (
    <View style={styles.background}>
      <Header title={'설정'} />

      <View style={styles.container}>
        {/* 사용자 정보 메뉴 */}
        <View>
          <Text style={styles.menuHeader}>계정 정보</Text>
          <View style={styles.menuContainer}>
            <View style={styles.menuRow}>
              <Text style={styles.menuText}>이름</Text>
              <Text style={styles.versionText}>{host.name}</Text>
            </View>
            <View style={styles.menuRow}>
              <Text style={styles.menuText}>이메일 주소</Text>
              <Text style={styles.versionText}>{host.email}</Text>
            </View>
            <View style={styles.menuRow}>
              <Text style={styles.menuText}>휴대폰 번호</Text>
              <View style={styles.menuButtonRow}>
                <Text style={styles.versionText}>{host.phone}</Text>
                <TouchableOpacity
                  onPress={goToEditProfile}
                >
                  <RightArrow width={20} height={20} /> 
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.menuRow}>
              <Text style={styles.menuText}>비밀번호</Text>
              <View style={styles.menuButtonRow}>
                <Text style={styles.versionText}>**********</Text>
                <TouchableOpacity
                  onPress={goToEditProfile}
                >
                  <RightArrow width={20} height={20} /> 
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.menuHeader}>서비스 정보</Text>
          <View style={styles.menuContainer}>
          {/* 버전정보 */}
          <View style={styles.menuRow}>
            <Text style={styles.menuText}>버전 정보</Text>
            <Text style={styles.versionText}>ver.1</Text>
          </View>
          {/* 이용약관 */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Terms')}>
            <Text style={styles.menuText}>이용 약관</Text>
            <RightArrow width={20} height={20} />
          </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logoutContainer}>
          {/* 로그아웃 */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={async () => {
              await tryLogout();
              navigation.reset({
                index: 0,
                routes: [{name: 'Login'}],
              });
            }}
          >
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
          <View style={styles.devide}/>
          {/* 탈퇴 */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.logoutText}>WA 회원 탈퇴</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailContainer}>
          <Text style={styles.detailText}>상호명 : 워커웨이</Text>
          <Text style={styles.detailText}>사업자등록번호: 888-25-02003</Text>
          <Text style={styles.detailText}>연락처: 010-4123-0075</Text>
          <Text style={styles.detailText}>
            통신판매번호: 2025-서울양천-0825
          </Text>
          <Text style={styles.detailText}>주소: 서울특별시 중앙로 36길 15</Text>
          <Text style={styles.detailText}>대표자 : 이하늘, 정재원</Text>
        </View>
      </View>
      <AlertModal
        visible={modalVisible}
        title={'정말 탈퇴하시겠어요?'}
        buttonText={'취소'}
        buttonText2={'탈퇴하기'}
        onPress={() => setModalVisible(false)}
        onPress2={() => {}}
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
    gap: 4,
  },
  menuText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_800,
  },
  versionText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_500,
  },

  // 로그아웃, 탈퇴
  logoutContainer: {
    marginTop: -40,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
  },
  logoutText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
  },
  devide: {
    backgroundColor: COLORS.grayscale_500,
    height: 12,
    width: 1,
  },

  // 상세정보
  detailContainer: {
    gap: 4,
  },
  detailText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
  },
});

export default HostSetting;
