import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
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

/*
 * 입점 등록 신청 페이지
 */
const dummyFormData = {
  name: '바다의집 게스트하우스',
  employeeCount: 5,
  address: '부산광역시 해운대구 우동 123-45',
  imgUrl: 'https://example.com/business-license.jpg', // 로컬 이미지 선택 후 uri 사용 가능
  managerName: '김사장',
  managerEmail: 'manager@example.com',
  businessPhone: '01012345678',
  businessType: '숙박업',
  businessRegistrationNumber: '1234567890',
};
const StoreRegister = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    employeeCount: 0,
    address: '',
    imgUrl: '',
    managerName: '',
    managerEmail: '',
    businessPhone: '',
    businessType: '',
    businessRegistrationNumber: '',
  });
  const [detailAddress, setDetailAddress] = useState('');

  useEffect(() => {
    setFormData(dummyFormData);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
        includeBase64: false,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          setFormData({
            ...formData,
            imgUrl: uri,
          });
        }
      },
    );
  };

  const handleSubmit = async () => {
    const validationErrors = validateStoreForm(formData);

    if (validationErrors.length > 0) {
      Alert.alert('입력값을 확인해주세요', validationErrors[0]);
      return;
    }

    setFormData({...formData, address: formData.address + ' ' + detailAddress});
    tryPostStoreRegister(formData);
  };

  // 입점신청서 POST
  const tryPostStoreRegister = async data => {
    try {
      await hostGuesthouseApi.postHostApplication(data);
      Alert.alert('성공적으로 등록되었습니다.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('입점신청서 등록에 실패했습니다.');
      console.warn('입점신청서 등록 실패: ', error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.body}>
        {/* 입점 등록 안내 */}
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>입점 등록 신청</Text>
          <Text style={FONTS.fs_body}>입점신청 안내문구</Text>
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
              onChangeText={text => handleInputChange('employeeCount', text)}
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
              onChangeText={text => handleInputChange('businessPhone', text)}
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
            <ButtonScarlet title="주소 검색" to="" />
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
          <Text style={FONTS.fs_body}>사업자 등록증 사진 등록 안내문구</Text>
          {/* 이미지 업로드 */}
          <View style={styles.imageUploadContainer}>
            <TouchableOpacity style={styles.imageUploadBox} onPress={pickImage}>
              <Photo width={100} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <ButtonScarlet title="신청하기" onPress={handleSubmit} />
    </SafeAreaView>
  );
};

export default StoreRegister;
