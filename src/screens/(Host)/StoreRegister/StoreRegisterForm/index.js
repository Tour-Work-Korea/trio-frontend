import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  Platform,
} from 'react-native';
import ButtonScarlet from '@components/ButtonScarlet';
import {launchImageLibrary} from 'react-native-image-picker';
import Header from '@components/Header';
import styles from './StoreRegister.styles';
import Photo from '@assets/images/Photo.svg';
import {FONTS} from '@constants/fonts';
import {useEffect, useState} from 'react';
import {validateStoreForm} from '@utils/validation/storeRegisterValidation';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import {useNavigation} from '@react-navigation/native';
import ErrorModal from '@components/modals/ErrorModal';

/*
 * 입점 등록 신청 페이지
 */
const dummy = {
  name: '바다 게스트하우스',
  employeeCount: 5,
  address: '제주도 서귀포시 123-123',
  managerName: '김매니저',
  managerEmail: 'manager@mail.com',
  businessPhone: '01012341234',
  businessType: '숙박업',
  businessRegistrationNumber: '7024100943',
};
const StoreRegister = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '바다 게스트하우스',
    employeeCount: 5,
    address: '제주도 서귀포시 123-123',
    managerName: '김매니저',
    managerEmail: 'manager@mail.com',
    businessPhone: '01012341234',
    businessType: '숙박업',
    businessRegistrationNumber: '7024100943',
    img: null,
    // name: '',
    // employeeCount: 0,
    // address: '',
    // img: null,
    // managerName: '',
    // managerEmail: '',
    // businessPhone: '',
    // businessType: '',
    // businessRegistrationNumber: '',
  });
  const [detailAddress, setDetailAddress] = useState('');
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '확인',
  });

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (!result.didCancel && result.assets?.length > 0) {
      const selected = result.assets[0];
      setFormData({
        ...formData,
        img: {
          uri: selected.uri,
          type: selected.type,
          name: selected.fileName ?? 'image.jpg',
        },
      });
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateStoreForm(formData);

    if (validationErrors.length > 0) {
      setErrorModal({
        visible: true,
        title: validationErrors[0],
      });
      return;
    }

    const fullForm = {
      ...formData,
      address: formData.address + ' ' + detailAddress,
    };

    const form = new FormData();

    // 1. dto를 Blob으로 감싸기
    const dto = {
      name: fullForm.name,
      employeeCount: parseInt(fullForm.employeeCount),
      address: fullForm.address,
      managerName: fullForm.managerName,
      managerEmail: fullForm.managerEmail,
      businessPhone: fullForm.businessPhone,
      businessType: fullForm.businessType,
      businessRegistrationNumber: fullForm.businessRegistrationNumber,
    };

    form.append('dto', {
      string: JSON.stringify(dto),
      type: 'application/json',
    });
    // 2. 이미지 파일 추가
    if (fullForm.img) {
      form.append('img', {
        uri: fullForm.img.uri,
        name: fullForm.img.name,
        type: fullForm.img.type,
      });
    }

    try {
      await hostGuesthouseApi.postHostApplication(form);
      setErrorModal({
        visible: true,
        title: '성공적으로 입점신청이 완료되었습니다',
      });
      navigation.goBack();
    } catch (error) {
      console.warn('입점신청서 등록 실패:', error);
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message ??
          '입점신청서 등록 중 오류가 발생했습니다',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}>
      <View style={{flex: 1}}>
        <View style={styles.container}>
          <Header title={'입점 등록'} />
          <ScrollView
            style={styles.body}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'space-between',
            }}
            keyboardShouldPersistTaps="handled">
            {/* 입점 등록 안내 */}
            <View style={styles.headerContainer}>
              <Text style={styles.sectionTitle}>입점 등록 신청</Text>
              <Text style={FONTS.fs_body}>
                입점 신청 후 게스트하우스를 등록할 수 있어요 .
              </Text>
            </View>

            {/* 사업자 등록 상호명, 법인명 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>사업자 등록 상호명/법인명</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="상호명 또는 법인명을 입력해주세요"
                  value={formData.name}
                  onChangeText={text => handleInputChange('name', text)}
                />
              </View>
            </View>
            {/* 사업장 유형 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>사업장 유형</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="ex) 숙박업"
                  value={formData.businessType}
                  onChangeText={text => handleInputChange('businessType', text)}
                />
              </View>
            </View>
            {/* 직원 수 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>직원 수</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={formData.employeeCount}
                  onChangeText={text =>
                    handleInputChange('employeeCount', text)
                  }
                  keyboardType="number-pad"
                />
              </View>
            </View>
            {/* 담당자 이름 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>담당자 이름</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={formData.managerName}
                  onChangeText={text => handleInputChange('managerName', text)}
                />
              </View>
            </View>
            {/* 담당자 이메일 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>담당자 이메일</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={formData.managerEmail}
                  onChangeText={text => handleInputChange('managerEmail', text)}
                />
              </View>
            </View>
            {/* 사업장 전화번호 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>사업장 전화번호</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={formData.businessPhone}
                  placeholder="-없이 입력해주세요"
                  onChangeText={text =>
                    handleInputChange('businessPhone', text)
                  }
                  keyboardType="number-pad"
                />
              </View>
            </View>
            {/* 사업자 주소 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>사업장 주소</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="주소를 입력해주세요"
                  value={formData.address}
                  onChangeText={text => handleInputChange('address', text)}
                />
                <View style={{flex: 1}}>
                  <ButtonScarlet title="주소 검색" to="" />
                </View>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="상세 주소를 입력해주세요"
                  value={detailAddress}
                  onChangeText={text => setDetailAddress(text)}
                />
              </View>
            </View>
            {/* 사업자 등록번호 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>사업자 등록번호</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder=""
                  value={formData.businessRegistrationNumber}
                  onChangeText={text =>
                    handleInputChange('businessRegistrationNumber', text)
                  }
                  keyboardType="number-pad"
                />
              </View>
            </View>
            {/* 사업자 등록증 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>사업자 등록증</Text>
              <Text style={FONTS.fs_body}>
                사업자 등록증 사진 등록 안내문구
              </Text>
              {/* 이미지 업로드 */}
              <View style={styles.imageUploadContainer}>
                <TouchableOpacity
                  style={styles.imageUploadBox}
                  onPress={pickImage}>
                  {formData?.img ? (
                    <Image
                      source={{uri: formData?.img?.uri}}
                      resizeMode="cover"
                    />
                  ) : (
                    <Photo width={100} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            {/* 하단 버튼 */}
            <View style={[styles.sectionContainer, {marginBottom: 60}]}>
              <ButtonScarlet title="신청하기" onPress={handleSubmit} />
            </View>
          </ScrollView>

          <ErrorModal
            visible={errorModal.visible}
            title={errorModal.title}
            buttonText={'확인'}
            onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default StoreRegister;
