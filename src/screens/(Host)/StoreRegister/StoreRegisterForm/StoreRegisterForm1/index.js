import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {useMemo, useState} from 'react';

import {validateStoreForm1} from '@utils/validation/storeRegisterValidation';
import {useNavigation} from '@react-navigation/native';
import ErrorModal from '@components/modals/ErrorModal';

import styles from '../StoreRegisterForm.styles';
import {FONTS} from '@constants/fonts';
import Logo from '@assets/images/logo_orange.svg';
import {COLORS} from '@constants/colors';
import NextIcon from '@assets/images/arrow_right_white.svg';
import NextDisabledIcon from '@assets/images/arrow_right_black.svg';

const StoreRegisterForm1 = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    employeeCount: 0,
    address: '',
    img: null,
    managerName: '',
    managerEmail: '',
    businessPhone: '',
    businessType: '',
    businessRegistrationNumber: '',
  });
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '확인',
  });

  const isNextEnabled = useMemo(() => {
    const errors = validateStoreForm1(formData);
    return errors.length === 0;
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    const validationErrors = validateStoreForm1(formData);

    if (validationErrors.length > 0) {
      setErrorModal({
        visible: true,
        title: validationErrors[0],
      });
      return;
    }
    navigation.navigate('StoreRegisterForm2', {prevData: formData});
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // 필요 시 조정
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.flexGrow}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.viewFlexBox}>
              {/* 상단+입력창 */}
              <View>
                {/* 로고 및 문구 */}
                <View style={styles.groupParent}>
                  <Logo width={60} height={29} />
                  <View>
                    <Text style={styles.titleText}>
                      workaway에 입점하기 위한,
                    </Text>
                    <Text style={styles.titleText}>
                      필수정보를 알려주세요 (1/2)
                    </Text>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  {/* 상호명 */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>
                      사업자 등록 상호명 or 법인명
                    </Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="상호명 또는 법인명을 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.name}
                        onChangeText={text => handleInputChange('name', text)}
                        maxLength={30}
                      />
                    </View>
                  </View>
                  {/* 사업장 유형 */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>사업장 유형</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={[styles.textInput]}
                        placeholder="사업장 유형을 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.businessType}
                        onChangeText={text =>
                          handleInputChange('businessType', text)
                        }
                      />
                    </View>
                  </View>
                  {/* 직원 수 */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>직원 수</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={[styles.textInput]}
                        value={formData.employeeCount}
                        onChangeText={text =>
                          handleInputChange('employeeCount', parseInt(text))
                        }
                        keyboardType="number-pad"
                        placeholder="직원 수를 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                      />
                    </View>
                  </View>
                  {/* 담당자 이름 */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>담당자 이름</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={[styles.textInput]}
                        value={formData.managerName}
                        onChangeText={text =>
                          handleInputChange('managerName', text)
                        }
                        placeholder="담당자명을 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                      />
                    </View>
                  </View>
                  {/* 담당자 이메일 */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>담당자 이메일</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={[styles.textInput]}
                        value={formData.managerEmail}
                        onChangeText={text =>
                          handleInputChange('managerEmail', text)
                        }
                        placeholder="담당자 이메일을 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.buttonLayout}>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    styles.addButtonLocation,
                    !isNextEnabled && styles.addButtonDisable,
                  ]}
                  disabled={!isNextEnabled}
                  onPress={handleSubmit}>
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      styles.addButtonText,
                      !isNextEnabled && styles.addButtonTextDisable,
                    ]}>
                    다음
                  </Text>
                  {isNextEnabled ? (
                    <NextIcon width={24} height={24} />
                  ) : (
                    <NextDisabledIcon width={24} height={24} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <ErrorModal
          visible={errorModal.visible}
          title={errorModal.title}
          buttonText={'확인'}
          onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default StoreRegisterForm1;
