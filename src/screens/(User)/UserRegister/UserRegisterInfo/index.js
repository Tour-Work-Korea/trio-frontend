import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import styles from './UserInfo.styles';
import Logo from '@assets/images/logo_orange.svg';
import ButtonScarlet from '@components/ButtonScarlet';
import ButtonWhite from '@components/ButtonWhite';
import {COLORS} from '@constants/colors';
import {validateRegisterInfo} from '@utils/validation/registerValidation';

const UserRegisterInfo = () => {
  const route = useRoute();
  const {agreements, email, phoneNumber} = route.params;
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    userRole: 'USER',
    agreements: agreements || [],
    email: email || '',
    phoneNum: phoneNumber || '',
    name: '',
    birthday: '',
    gender: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
  });
  const [isValid, setIsValid] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFormData({
        userRole: 'USER',
        agreements: agreements || [],
        email: email || '',
        phoneNum: phoneNumber || '',
        name: '',
        birthday: '',
        gender: '',
        nickname: '',
        password: '',
        passwordConfirm: '',
      });
      setIsValid(false);
    }, [email, phoneNumber, agreements]),
  );

  useEffect(() => {
    const validationErrors = validateRegisterInfo(formData);
    if (validationErrors.length === 0) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [formData]);

  const updateField = (key, value) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const handleMoveNext = () => {
    navigation.navigate('UserRegisterProfile', {
      prevData: formData,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={[styles.viewFlexBox, {justifyContent: 'space-between'}]}>
          {/* 상단+입력창 */}
          <View>
            {/* 로고 및 문구 */}
            <View style={styles.groupParent}>
              <Logo width={60} height={29} />
              <View>
                <Text style={[styles.titleText]}>예약을 위한,</Text>
                <Text style={[styles.titleText]}>필수정보를 알려주세요</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이름</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="이름을 입력해주세요"
                    placeholderTextColor={COLORS.grayscale_400}
                    value={formData.name}
                    onChangeText={text => updateField('name', text)}
                    maxLength={30}
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>생년월일</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="예)20020321"
                    value={formData.birthday}
                    onChangeText={text => {
                      const onlyDigits = text.replace(/[^0-9]/g, '');

                      if (onlyDigits.length === 8) {
                        const year = onlyDigits.slice(0, 4);
                        const month = onlyDigits.slice(4, 6);
                        const day = onlyDigits.slice(6, 8);
                        const mm = parseInt(month, 10);
                        const dd = parseInt(day, 10);
                        if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
                          Alert.alert(
                            '날짜 형식 오류',
                            '올바른 날짜를 입력해주세요.',
                          );
                          return;
                        }
                        updateField('birthday', `${year}-${month}-${day}`);
                      } else {
                        updateField('birthday', onlyDigits);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={10}
                    placeholderTextColor={COLORS.grayscale_400}
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>성별</Text>
                <View style={[styles.rowBox]}>
                  <ButtonWhite
                    style={{flex: 1}}
                    title="남자"
                    backgroundColor={
                      formData.gender === 'M'
                        ? COLORS.primary_orange
                        : COLORS.grayscale_200
                    }
                    textColor={
                      formData.gender === 'M'
                        ? COLORS.white
                        : COLORS.grayscale_400
                    }
                    onPress={() => updateField('gender', 'M')}
                  />
                  <View style={{width: 4}} />
                  <ButtonWhite
                    style={{flex: 1}}
                    title="여자"
                    backgroundColor={
                      formData.gender === 'F'
                        ? COLORS.primary_orange
                        : COLORS.grayscale_200
                    }
                    textColor={
                      formData.gender === 'F'
                        ? COLORS.white
                        : COLORS.grayscale_400
                    }
                    onPress={() => updateField('gender', 'F')}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* 하단 버튼 */}
          <View>
            {isValid ? (
              <ButtonScarlet title="다음" onPress={handleMoveNext} />
            ) : (
              <ButtonWhite title="다음" disabled={!isValid} />
            )}
            {/* <ButtonScarlet
            title="다음"
            onPress={() => {
              setFormData({
                ...formData,
                name: 'tester',
                gender: 'F',
                birthday: '2000-01-01',
              });
              navigation.navigate('UserRegisterProfile', {
                prevData: formData,
              });
            }}
          /> */}
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default UserRegisterInfo;
