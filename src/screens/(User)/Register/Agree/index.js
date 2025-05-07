import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import ButtonScarlet from '@components/ButtonScarlet';
import Header from '@components/Header';
import styles from './Agree.styles';
import {FONTS} from '@constants/fonts';
import CheckedIcon from '@assets/images/Scarlet_Radio_Btn_Checked.svg';
import UncheckedIcon from '@assets/images/Gray_Radio_Btn_Unchecked.svg';
import {useNavigation} from '@react-navigation/native';

// 유저 회원가입 초기 페이지
const Agree = () => {
  const navigation = useNavigation();
  // 약관 동의 상태 관리
  const [agreements, setAgreements] = useState({
    all: false,
    service: false,
    age: false,
    privacy: false,
    location: false,
    marketing: false,
  });

  // 필수 약관 동의 여부 확인
  const [isRequiredAgreed, setIsRequiredAgreed] = useState(false);

  // 필수 약관 동의 여부 체크
  useEffect(() => {
    const {service, age, privacy} = agreements;
    setIsRequiredAgreed(service && age && privacy);
  }, [agreements]);

  // 개별 약관 동의 처리
  const handleAgreement = key => {
    const newAgreements = {...agreements, [key]: !agreements[key]};

    // 전체 동의 상태 업데이트
    if (key === 'all') {
      const allValue = !agreements.all;
      newAgreements.service = allValue;
      newAgreements.age = allValue;
      newAgreements.privacy = allValue;
      newAgreements.location = allValue;
      newAgreements.marketing = allValue;
    } else {
      // 개별 약관 체크 시 전체 동의 상태 확인
      const {service, age, privacy, location, marketing} = newAgreements;
      newAgreements.all = service && age && privacy && location && marketing;
    }

    setAgreements(newAgreements);
  };

  // 체크박스 렌더링 함수
  const renderCheckbox = key => (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={() => handleAgreement(key)}>
      {agreements[key] ? (
        <CheckedIcon width={24} height={24} />
      ) : (
        <UncheckedIcon width={24} height={24} />
      )}
    </TouchableOpacity>
  );

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
          <TouchableOpacity
            style={styles.agreementTitleRow}
            onPress={() => handleAgreement('all')}>
            {renderCheckbox('all')}
            <Text style={[styles.agreementText, FONTS.fs_h2_bold]}>
              이용약관에 전체 동의
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => handleAgreement('service')}>
            {renderCheckbox('service')}
            <Text style={styles.agreementText}>
              <Text style={styles.highlightText}>[필수]</Text> 서비스 이용약관
              동의
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => handleAgreement('age')}>
            {renderCheckbox('age')}
            <Text style={styles.agreementText}>
              <Text style={styles.highlightText}>[필수]</Text> 만 14세 이상확인
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => handleAgreement('privacy')}>
            {renderCheckbox('privacy')}
            <Text style={styles.agreementText}>
              <Text style={styles.highlightText}>[필수]</Text> 개인정보 수집 및
              이용 동의
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => handleAgreement('location')}>
            {renderCheckbox('location')}
            <Text style={styles.agreementText}>
              <Text style={styles.highlightText}>[선택]</Text> 위치기반 서비스
              이용약관 동의
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => handleAgreement('marketing')}>
            {renderCheckbox('marketing')}
            <Text style={styles.agreementText}>
              <Text style={styles.highlightText}>[선택]</Text> 마케팅 알림 수신
              동의
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ButtonScarlet
        title="다음"
        onPress={() => {
          navigation.navigate('UserPhoneCertificate', {user: 'User'});
        }}
      />
    </SafeAreaView>
  );
};

export default Agree;
