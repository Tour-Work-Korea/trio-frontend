import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import styles from '../StoreRegisterForm.styles';
import Photo from '@assets/images/Photo.svg';
import NextIcon from '@assets/images/arrow_right_white.svg';
import NextDisabledIcon from '@assets/images/arrow_right_black.svg';
import Logo from '@assets/images/logo_orange.svg';
import CheckGray from '@assets/images/check20_gray.svg';
import CheckOrange from '@assets/images/check20_orange.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {useEffect, useMemo, useState} from 'react';
import {
  validateStoreForm,
  validateStoreForm2,
} from '@utils/validation/storeRegisterValidation';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import {useNavigation} from '@react-navigation/native';
import ErrorModal from '@components/modals/ErrorModal';
import AddressSearchModal from '@components/modals/AddressSearchModal';
import {hostStorRegisterAgrees} from '@data/agree';
import authApi from '@utils/api/authApi';
import {adaptiveCompressToJPEG} from '@utils/imageUploadHandler';

/*
 * 입점 등록 신청 페이지
 */

const StoreRegisterForm2 = ({route}) => {
  const navigation = useNavigation();

  const {prevData} = route.params;
  const [formData, setFormData] = useState({
    ...prevData,
    img: prevData?.img ?? {uri: ''},
  });
  const [detailAddress, setDetailAddress] = useState('');
  const [isAllAgreed, setIsAllAgreed] = useState(false);
  const [agreements, setAgreements] = useState(hostStorRegisterAgrees);
  const [addressSearchVisible, setAddressSearchVisible] = useState(false);
  const [isBussinessNumChecked, setIsBussinessNumChecked] = useState(false);
  const [isBussinessNumbVerified, setIsBussinessNumVerified] = useState(false);

  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    buttonText: '확인',
  });
  const isNextEnabled = useMemo(() => {
    const errors = validateStoreForm2(formData);
    return errors.length === 0;
  }, [formData]);

  useEffect(() => {
    const all = agreements.every(item => item.isAgree);
    setIsAllAgreed(all);
  }, [agreements]);

  //input 핸들러
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  //사업자 등록증 파일 업로드
  const pickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (!result.didCancel && result.assets?.length > 0) {
      const selected = result.assets[0];
      const originalUri = selected.uri;

      // 📌 압축 시도
      let compressedUri = originalUri;
      try {
        compressedUri = await adaptiveCompressToJPEG(originalUri, {
          targetBytes: 1.8 * 1024 * 1024, // 서버 한도 2MB라고 가정
          startMax: 1600,
          minMax: 800,
          startQuality: 0.8,
          minQuality: 0.55,
          stepQuality: 0.1,
        });
      } catch (e) {
        console.warn('[pickImage] compress failed -> fallback to original:', e);
      }

      setFormData({
        ...formData,
        img: {
          uri: compressedUri,
          type: 'image/jpeg', // 압축 후 항상 JPEG
          name: selected.fileName ?? 'business_cert.jpg',
        },
      });
    }
  };
  //약관동의 항목 렌더링
  const renderCheckbox = (isChecked, onPress) => (
    <View>
      {isChecked ? (
        <TouchableOpacity
          style={[styles.checkbox, styles.checked]}
          onPress={onPress}>
          <CheckOrange width={24} height={24} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.checkbox} onPress={onPress}>
          <CheckGray width={24} height={24} />
        </TouchableOpacity>
      )}
    </View>
  );
  //약관동의 핸들러
  const handleAgreement = key => {
    const updated = agreements.map(item =>
      item.id === key ? {...item, isAgree: !item.isAgree} : item,
    );
    setAgreements(updated);
  };

  const handleBussinessNumChange = text => {
    handleInputChange('businessRegistrationNumber', text);
    setIsBussinessNumChecked(false);
  };
  // 사업자등록번호 확인
  const verifybussinessNum = async () => {
    try {
      await authApi.verifyBusiness(formData.businessRegistrationNumber);
      setIsBussinessNumChecked(true);
      setIsBussinessNumVerified(true);
    } catch (error) {
      setIsBussinessNumChecked(true);
      setIsBussinessNumVerified(false);
    }
  };
  //입점신청서 제출
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
      navigation.navigate('StoreRegisterList');
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{flexGrow: 1}}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View
              style={[
                styles.viewFlexBox,
                {justifyContent: 'space-between', gap: 20},
              ]}>
              {/* 상단+입력창 */}
              <View>
                {/* 로고 및 문구 */}
                <View style={styles.groupParent}>
                  <Logo width={60} height={29} />
                  <View>
                    <Text style={[styles.titleText]}>
                      workaway에 입점하기 위한,
                    </Text>
                    <Text style={[styles.titleText]}>
                      필수정보를 알려주세요 (2/2)
                    </Text>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  {/* 사업장 전화번호 */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>사업장 전화번호</Text>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        value={formData.businessPhone}
                        placeholder="-없이 입력해주세요"
                        onChangeText={text =>
                          handleInputChange('businessPhone', text)
                        }
                        keyboardType="number-pad"
                        placeholderTextColor={COLORS.grayscale_400}
                      />
                    </View>
                  </View>

                  {/* 사업장 주소 */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>사업장 주소</Text>
                    <View style={[styles.inputBox, {position: 'relative'}]}>
                      <TextInput
                        style={[styles.textInput, {flex: 1}]}
                        placeholder="주소를 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.address}
                        onChangeText={text =>
                          handleInputChange('address', text)
                        }
                      />
                      <TouchableOpacity
                        style={[
                          styles.inputButtonAbsolute,
                          {
                            backgroundColor: COLORS.primary_orange,
                          },
                        ]}
                        onPress={() => {
                          setAddressSearchVisible(true);
                        }}>
                        <Text
                          style={{
                            ...FONTS.fs_14_medium,
                            color: COLORS.white,
                          }}>
                          주소 검색
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="상세 주소를 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={detailAddress}
                        onChangeText={text => setDetailAddress(text)}
                      />
                    </View>
                  </View>

                  {/* 사업자 등록번호 */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>사업자 등록번호</Text>
                    <View style={[styles.inputBox, {position: 'relative'}]}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="사업자 등록번호를 입력해주세요"
                        placeholderTextColor={COLORS.grayscale_400}
                        value={formData.businessRegistrationNumber}
                        onChangeText={text => {
                          const filtered = text.replace(/[^0-9]/g, '');
                          handleBussinessNumChange(filtered);
                        }}
                        keyboardType="number-pad"
                        maxLength={10}
                      />
                      <TouchableOpacity
                        style={[
                          styles.inputButtonAbsolute,
                          {
                            backgroundColor: COLORS.primary_orange,
                          },
                        ]}
                        onPress={verifybussinessNum}>
                        <Text
                          style={{
                            ...FONTS.fs_14_medium,
                            color: COLORS.white,
                          }}>
                          확인
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {isBussinessNumChecked ? (
                      <View style={styles.validBox}>
                        <Text
                          style={[
                            styles.validDefaultText,
                            isBussinessNumbVerified
                              ? styles.validText
                              : styles.invalidText,
                          ]}>
                          {isBussinessNumbVerified
                            ? '유효한 사업자번호입니다'
                            : '유효하지 않은 사업자번호입니다.'}
                        </Text>
                      </View>
                    ) : (
                      ''
                    )}
                  </View>

                  {/* 사업자 등록증 */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>사업자 등록증</Text>
                    <View style={[styles.inputBox, styles.imageBox]}>
                      <TouchableOpacity
                        style={{width: '100%', height: '100%'}}
                        onPress={pickImage}>
                        {formData?.img?.uri ? (
                          <Image
                            source={{uri: formData?.img?.uri}}
                            style={{width: '100%', height: '100%'}}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={{
                              flex: 1,
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: 8,
                            }}>
                            <Photo width={30} height={30} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 동의 목록 */}
                  <View style={{gap: 12}}>
                    {agreements.map(item => (
                      <View style={[styles.parentWrapperFlexBox]} key={item.id}>
                        <View
                          style={[
                            styles.checkboxGroup,
                            styles.parentWrapperFlexBox,
                          ]}>
                          {renderCheckbox(item.isAgree, () =>
                            handleAgreement(item.id),
                          )}
                          <View
                            style={[
                              styles.frameContainer,
                              styles.parentWrapperFlexBox,
                            ]}>
                            <View
                              style={[
                                styles.parent,
                                styles.parentWrapperFlexBox,
                              ]}>
                              {item.isRequired ? (
                                <Text
                                  style={[
                                    styles.textRequired,
                                    styles.textBlue,
                                  ]}>
                                  [필수]
                                </Text>
                              ) : null}
                              <Text style={styles.textAgreeTitle}>
                                {item.title}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate('AgreeDetail', {
                                  title: item.title,
                                  detail: item.description,
                                })
                              }>
                              <Text style={[styles.textSmall, styles.textBlue]}>
                                보기
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* 하단 버튼 */}
              <View style={{alignItems: 'flex-end'}}>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    styles.addButtonLocation,
                    (!isNextEnabled ||
                      !isAllAgreed ||
                      !isBussinessNumbVerified) &&
                      styles.addButtonDisable,
                  ]}
                  disabled={
                    !isNextEnabled || !isAllAgreed || !isBussinessNumbVerified
                  }
                  onPress={handleSubmit}>
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      styles.addButtonText,
                      (!isNextEnabled ||
                        !isAllAgreed ||
                        !isBussinessNumbVerified) &&
                        styles.addButtonTextDisable,
                    ]}>
                    다음
                  </Text>
                  {isNextEnabled && isAllAgreed && isBussinessNumbVerified ? (
                    <NextIcon width={24} height={24} />
                  ) : (
                    <NextDisabledIcon width={24} height={24} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        {/* 주소 검색 모달 */}
        <AddressSearchModal
          visible={addressSearchVisible}
          onClose={() => setAddressSearchVisible(false)}
          onSelected={data =>
            setFormData(prev => ({...prev, address: data.address}))
          }
        />

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

export default StoreRegisterForm2;
