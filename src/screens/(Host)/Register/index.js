import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import ButtonScarlet from '@components/ButtonScarlet';
import Header from '@components/Header';
import styles from './Register.styles';
import {FONTS} from '@constants/fonts';

/*
 * 사장님 회원가입
 *
 */

const Register = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={[styles.body, FONTS.fs_h2]}>
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
            <Text style={styles.agreementText}>
              <Text style={styles.highlightText}>[필수]</Text> 서비스 이용약관
              동의
            </Text>
          </View>

          <View style={styles.agreementRow}>
            <Text style={styles.agreementText}>
              <Text style={styles.highlightText}>[필수]</Text> 개인정보 수집 및
              이용 동의
            </Text>
          </View>
        </View>

        {/* 본인 인증 */}
        <View>
          <Text style={styles.sectionTitle}>본인 인증</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="휴대폰 번호를 입력해주세요"
            />
            <ButtonScarlet title="인증번호 발송" to="" />
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="인증번호 6자리"
            />
            <ButtonScarlet title="인증하기" to="" />
          </View>
        </View>

        {/* 비밀번호 입력 및 확인*/}
        <View>
          <Text style={styles.sectionTitle}>비밀번호</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="비밀번호를 입력해주세요"
              secureTextEntry
            />
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="비밀번호를 한번 더 입력해주세요"
              secureTextEntry
            />
          </View>
        </View>

        {/* 이름 입력 */}
        <View>
          <Text style={styles.sectionTitle}>이름</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="이름을 입력해주세요"
            />
          </View>
        </View>

        {/* 사업자등록번호 입력 */}
        <View>
          <Text style={styles.sectionTitle}>사업자등록번호</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="-없이 숫자만 입력해주세요"
            />
            <ButtonScarlet title="확인" to="" />
          </View>
        </View>
      </ScrollView>

      <ButtonScarlet title="가입하기" to="EXHome" />
    </SafeAreaView>
  );
};

export default Register;
