import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import styles from '../../../(Common)/Register/Register.styles';
import Logo from '@assets/images/logo_orange.svg';
import authApi from '@utils/api/authApi';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';
import {COLORS} from '@constants/colors';

const UserRegisterProfile = () => {
  const route = useRoute();
  const {prevData} = route.params;
  const navigation = useNavigation();
  const [formData, setFormData] = useState(prevData);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  const updateField = (key, value) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const checkNicknameDuplicate = () => {
    if (!formData.nickname) {
      Alert.alert('닉네임을 입력해주세요.');
      return;
    }
    setIsNicknameChecked(true);
    Alert.alert('사용 가능한 닉네임입니다.');
  };

  const handleSubmit = () => {
    if (!formData.name) {
      return Alert.alert('이름을 입력해주세요.');
    }
    if (!formData.birthday) {
      return Alert.alert('생년월일을 입력해주세요.');
    }

    if (!formData.gender) {
      return Alert.alert('성별을 선택해주세요.');
    }
    if (!formData.nickname) {
      return Alert.alert('닉네임을 입력해주세요.');
    }
    if (!isNicknameChecked) {
      return Alert.alert('닉네임 중복 확인을 해주세요.');
    }
    if (!formData.password) {
      return Alert.alert('비밀번호를 입력해주세요.');
    }
    if (formData.password !== formData.passwordConfirm) {
      return Alert.alert('비밀번호가 일치하지 않습니다.');
    }
    const tryUserSignUp = async () => {
      try {
        console.log(formData);
        await authApi.userSignUp(formData);
        navigation.navigate('Result', {
          text: '성공적으로 가입되었습니다!',
          to: 'EXHome',
        });
      } catch (error) {
        Alert.alert('회원가입에 실패했습니다.', error.message);
      }
    };
    tryUserSignUp();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.viewFlexBox]}>
        {/* 상단+입력창 */}
        <View>
          {/* 로고 및 문구 */}
          <View style={styles.groupParent}>
            <Logo width={60} height={29} />
            <View>
              <Text style={[styles.titleText]}>
                workaway에서 활동하기 위한,
              </Text>
              <Text style={[styles.titleText]}>필수정보를 알려주세요</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.title}>필수 입력정보</Text>

      <View style={styles.inputSection}>
        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          placeholder="이름"
          value={formData.name}
          onChangeText={text => updateField('name', text)}
        />
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>생년월일</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 19990101"
          keyboardType="numeric"
          maxLength={8}
          value={formData.birthday.replace(/-/g, '')}
          onChangeText={text => {
            const onlyDigits = text.replace(/[^0-9]/g, '');

            if (onlyDigits.length === 8) {
              const year = onlyDigits.slice(0, 4);
              const month = onlyDigits.slice(4, 6);
              const day = onlyDigits.slice(6, 8);
              const mm = parseInt(month, 10);
              const dd = parseInt(day, 10);
              if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
                Alert.alert('날짜 형식 오류', '올바른 날짜를 입력해주세요.');
                return;
              }
              updateField('birthday', `${year}-${month}-${day}`);
            } else {
              updateField('birthday', onlyDigits);
            }
          }}
        />
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>성별</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderOption,
              formData.gender === 'M' && styles.selectedGender,
            ]}
            onPress={() => updateField('gender', 'M')}>
            <View
              style={[
                styles.radioButton,
                formData.gender === 'M' && styles.radioButtonSelected,
              ]}>
              {formData.gender === 'M' && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
            <Text style={styles.genderText}>남</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderOption,
              formData.gender === 'F' && styles.selectedGender,
            ]}
            onPress={() => updateField('gender', 'F')}>
            <View
              style={[
                styles.radioButton,
                formData.gender === 'F' && styles.radioButtonSelected,
              ]}>
              {formData.gender === 'F' && (
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
            value={formData.nickname}
            onChangeText={text => {
              updateField('nickname', text);
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
          placeholder="비밀번호는 대소문자, 숫자, 특수문자를 포함한 8~20자리여야 합니다."
          value={formData.password}
          onChangeText={text => updateField('password', text)}
          secureTextEntry
        />
      </View>

      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 한번 더 입력해 주세요."
          value={formData.passwordConfirm}
          onChangeText={text => updateField('passwordConfirm', text)}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
        <Text style={styles.nextButtonText}>다음</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default UserRegisterProfile;
