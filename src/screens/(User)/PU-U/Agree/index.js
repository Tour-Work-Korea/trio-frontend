import {View, Text, SafeAreaView, ScrollView} from 'react-native';
import ButtonScarlet from '@components/ButtonScarlet';
import Header from '@components/Header';
import styles from './Agree.styles';
import {FONTS} from '@constants/fonts';

// 유저 회원가입 초기 페이지
const Agree = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={[styles.body, FONTS.fs_h2]}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>초면에 실례지만</Text>
          <Text style={styles.title}>약관동의 필요해요</Text>
        </View>

        {/* 이용약관 동의 섹션 */}
        <View style={styles.agreementContainer}>
          <View style={styles.agreementTitleRow}>
            <View style={styles.checkboxContainer}>
              {/* 체크박스 아이콘 자리 */}
            </View>
            <Text style={[styles.agreementText, FONTS.fs_h2_bold]}>
              이용약관에 전체 동의
            </Text>
          </View>

          <View style={styles.agreementRow}>
            <View style={styles.checkboxContainer}>
              {/* 체크박스 아이콘 자리 */}
            </View>
            <Text style={styles.agreementText}>
              <Text style={styles.highlightText}>[필수]</Text> 서비스 이용약관
              동의
            </Text>
          </View>

          <View style={styles.agreementRow}>
            <View style={styles.checkboxContainer}>
              {/* 체크박스 아이콘 자리 */}
            </View>
            <Text style={styles.agreementText}>
              <Text style={styles.highlightText}>[필수]</Text> 만 14세 이상확인
            </Text>
          </View>

          <View style={styles.agreementRow}>
            <View style={styles.checkboxContainer}>
              {/* 체크박스 아이콘 자리 */}
            </View>
            <Text style={styles.agreementText}>
              <Text style={styles.highlightText}>[필수]</Text> 개인정보 수집 및
              이용 동의
            </Text>
          </View>
          <View style={styles.agreementRow}>
            <View style={styles.checkboxContainer}>
              {/* 체크박스 아이콘 자리 */}
            </View>
            <Text style={styles.agreementText}>
              <Text style={styles.highlightText}>[선택]</Text> 위치기반 서비스
              이용약관 동의
            </Text>
          </View>
          <View style={styles.agreementRow}>
            <View style={styles.checkboxContainer}>
              {/* 체크박스 아이콘 자리 */}
            </View>
            <Text style={styles.agreementText}>
              <Text style={styles.highlightText}>[선택]</Text> 마케팅 알림 수신
              동의
            </Text>
          </View>
        </View>
      </ScrollView>
      <ButtonScarlet title="다음" to="EXHome" />
    </SafeAreaView>
  );
};

export default Agree;
