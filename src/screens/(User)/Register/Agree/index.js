import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import ButtonScarlet from '@components/ButtonScarlet';
import Header from '@components/Header';
import styles from './Agree.styles';
import {FONTS} from '@constants/fonts';
import CheckedIcon from '@assets/images/Scarlet_Radio_Btn_Checked.svg';
import UncheckedIcon from '@assets/images/Gray_Radio_Btn_Unchecked.svg';
import {useNavigation} from '@react-navigation/native';
import {userRegisterAgrees as initialAgrees} from '@data/agree';

const Agree = () => {
  const navigation = useNavigation();
  const [agreements, setAgreements] = useState(initialAgrees);
  const [isAllAgreed, setIsAllAgreed] = useState(false);
  const [isRequiredAgreed, setIsRequiredAgreed] = useState(false);

  useEffect(() => {
    const allRequired = agreements
      .filter(item => item.isRequired)
      .every(item => item.isAgree);
    setIsRequiredAgreed(allRequired);

    const all = agreements.every(item => item.isAgree);
    setIsAllAgreed(all);
  }, [agreements]);

  const handleAgreement = key => {
    if (key === 'all') {
      const newState = !isAllAgreed;
      const updated = agreements.map(item => ({
        ...item,
        isAgree: newState,
      }));
      setAgreements(updated);
    } else {
      const updated = agreements.map(item =>
        item.id === key ? {...item, isAgree: !item.isAgree} : item,
      );
      setAgreements(updated);
    }
  };

  const handleMoveNext = () => {
    if (isRequiredAgreed) {
      navigation.navigate('PhoneCertificate', {user: 'User'});
    } else {
      Alert.alert('필수 약관을 모두 동의해주세요');
    }
  };

  const renderCheckbox = (isChecked, onPress) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      {isChecked ? (
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

        <View style={styles.agreementContainer}>
          <TouchableOpacity
            style={styles.agreementTitleRow}
            onPress={() => handleAgreement('all')}>
            {renderCheckbox(isAllAgreed, () => handleAgreement('all'))}
            <Text style={[styles.agreementText, FONTS.fs_h2_bold]}>
              이용약관에 전체 동의
            </Text>
          </TouchableOpacity>

          {agreements.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.agreementRow}
              onPress={() => handleAgreement(item.id)}>
              {renderCheckbox(item.isAgree, () => handleAgreement(item.id))}
              <View style={styles.agreementText}>
                <Text style={styles.highlightText}>
                  [{item.isRequired ? '필수' : '선택'}]
                </Text>
                <Text>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <ButtonScarlet title="다음" onPress={handleMoveNext} />
    </SafeAreaView>
  );
};

export default Agree;
