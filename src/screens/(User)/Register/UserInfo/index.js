import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styles from './UserInfo.styles';
import Header from '@components/Header';

const UserInfo = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState(''); // 'male' 또는 'female'
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // 생년월일 선택 함수
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setBirthdate(`${year}.${month}.${day}`);
    hideDatePicker();
  };

  // 닉네임 중복 확인 함수
  const checkNicknameDuplicate = () => {
    if (!nickname) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }

    // 닉네임 중복 확인 로직 (실제로는 API 호출)
    // 예시로 성공했다고 가정
    setIsNicknameChecked(true);
    Alert.alert('알림', '사용 가능한 닉네임입니다.');
  };

  // 폼 제출 함수
  const handleSubmit = () => {
    navigation.navigate('Result', {
      text: '성공적으로 가입되었습니다!',
      to: 'EXHome',
    });

    // 필수 입력 필드 검증
    if (!name) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    if (!birthdate) {
      Alert.alert('알림', '생년월일을 입력해주세요.');
      return;
    }

    if (!gender) {
      Alert.alert('알림', '성별을 선택해주세요.');
      return;
    }

    if (!nickname) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }

    if (!isNicknameChecked) {
      Alert.alert('알림', '닉네임 중복 확인을 해주세요.');
      return;
    }

    if (!password) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>필수 입력정보</Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>이름</Text>
            <TextInput
              style={styles.input}
              placeholder="이름"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>생년월일</Text>
            <TouchableOpacity style={styles.input} onPress={showDatePicker}>
              <Text
                style={birthdate ? styles.inputText : styles.placeholderText}>
                {birthdate || '생년월일'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === 'male' && styles.selectedGender,
                ]}
                onPress={() => setGender('male')}>
                <View
                  style={[
                    styles.radioButton,
                    gender === 'male' && styles.radioButtonSelected,
                  ]}>
                  {gender === 'male' && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.genderText}>남</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === 'female' && styles.selectedGender,
                ]}
                onPress={() => setGender('female')}>
                <View
                  style={[
                    styles.radioButton,
                    gender === 'female' && styles.radioButtonSelected,
                  ]}>
                  {gender === 'female' && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.genderText}>여</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>닉네임</Text>
            <View style={styles.nicknameContainer}>
              <TextInput
                style={styles.nicknameInput}
                placeholder="닉네임"
                value={nickname}
                onChangeText={text => {
                  setNickname(text);
                  setIsNicknameChecked(false);
                }}
              />
              <TouchableOpacity
                style={styles.checkButton}
                onPress={checkNicknameDuplicate}>
                <Text style={styles.checkButtonText}>중복확인</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 한번 더 입력해 주세요."
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UserInfo;
