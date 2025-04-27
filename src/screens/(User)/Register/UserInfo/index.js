import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
  Button,
} from 'react-native';
import ButtonScarlet from '@components/ButtonScarlet';
import Header from '@components/Header';
import styles from './UserInfo.styles';
import {FONTS} from '@constants/fonts';

/*
 * 일반 유저 회원가입 정보 입력
 */

const UserInfo = () => {
  const [phone, setPhone] = useState(''); // 상태 관리: 휴대폰 번호
  const [authCode, setAuthCode] = useState(''); // 상태 관리: 인증번호
  const [birthDate, setBirthDate] = useState(''); // 상태 관리: 생년월일
  const [gender, setGender] = useState(null); // 상태 관리: 성별
  const [nickname, setNickname] = useState(''); // 상태 관리: 닉네임

  const handleGenderChange = selectedGender => {
    setGender(selectedGender); // 성별 변경
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={[styles.body, FONTS.fs_h2]}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>필수 입력 정보</Text>
        </View>
        {/* 본인 인증 */}
        <View>
          <Text style={styles.sectionTitle}>본인 인증</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="휴대폰 번호를 입력해주세요"
              value={phone}
              onChangeText={setPhone}
              keyboardType="number-pad"
            />
            <ButtonScarlet title="인증번호 발송" to="" />
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="인증번호 6자리"
              value={authCode}
              onChangeText={setAuthCode}
            />
            <ButtonScarlet title="인증하기" to="" />
          </View>
        </View>

        {/* 생년월일 입력 */}
        <View>
          <Text style={styles.sectionTitle}>생년월일</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="생년월일 8자리를 입력해주세요(ex. 20000101)"
              value={birthDate}
              onChangeText={setBirthDate}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* 성별 입력 */}
        <View style={'display:"flex"'}>
          <Text style={styles.sectionTitle}>성별</Text>
          <View style={styles.inputRow}>
            <Button
              title="남자"
              onPress={() => handleGenderChange('male')}
              style={gender === 'male' ? styles.selectedButton : null}
            />
            <Button
              title="여자"
              onPress={() => handleGenderChange('female')}
              style={gender === 'female' ? styles.selectedButton : null}
            />
          </View>
        </View>

        {/* 닉네임 */}
        <View>
          <Text style={styles.sectionTitle}>닉네임</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="닉네임을 입력해주세요"
              value={nickname}
              onChangeText={setNickname}
            />
            <ButtonScarlet title="중복확인" to="" />
          </View>
        </View>
      </ScrollView>

      <ButtonScarlet title="가입하기" to="" />
    </SafeAreaView>
  );
};

export default UserInfo;
