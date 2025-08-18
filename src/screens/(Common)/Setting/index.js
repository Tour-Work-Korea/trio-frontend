import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import RightArrow from '@assets/images/chevron_right_gray.svg';
import ErrorModal from '@components/modals/ErrorModal';

const Settings = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{flex: 1, backgroundColor: COLORS.grayscale_100}}>
      <Header title={'설정'} />

      <View style={styles.container}>
        {/* 메뉴 */}
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
            <RightArrow width={24} height={24} />
          </TouchableOpacity>
          {/* 탈퇴 */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.menuText}>탈퇴하기</Text>
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
      <ErrorModal
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
  container: {paddingHorizontal: 20},
  menuContainer: {backgroundColor: COLORS.grayscale_0, borderRadius: 8},
  menuRow: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuText: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_800,
  },
  versionText: {
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_500,
  },
  detailContainer: {
    marginTop: 20,
  },
  detailText: {
    ...FONTS.fs_12_medium,
    color: COLORS.grayscale_500,
  },
});

export default Settings;
