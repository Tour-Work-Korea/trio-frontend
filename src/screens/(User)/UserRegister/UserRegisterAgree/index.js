import React, {useState, useEffect} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import Logo from '@assets/images/logo_orange.svg';
import CheckGray from '@assets/images/check20_gray.svg';
import CheckOrange from '@assets/images/check20_orange.svg';
import styles from './Agree.styles';
import ButtonScarlet from '@components/ButtonScarlet';
import {userRegisterAgrees as initialAgrees} from '@data/agree';
import ButtonWhite from '@components/ButtonWhite';
import {useNavigation} from '@react-navigation/native';

const UserRegisterAgree = () => {
  const [agreements, setAgreements] = useState(initialAgrees);
  const [isAllAgreed, setIsAllAgreed] = useState(false);
  const [isRequiredAgreed, setIsRequiredAgreed] = useState(false);
  const navigation = useNavigation();

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

  const handleAgreeDetail = (title, detail) => {
    navigation.navigate('AgreeDetail', {title, detail});
  };

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

  return (
    <SafeAreaView style={styles.signin}>
      <View style={[styles.viewFlexBox]}>
        {/* 로고 및 문구 */}
        <View style={styles.groupParent}>
          <Logo style={styles.frameChild} width={60} height={29} />
          <View>
            <Text style={[styles.titleText]}>서비스 이용을 위한</Text>
            <Text style={[styles.titleText]}>약관 동의가 필요해요</Text>
          </View>
        </View>

        <View style={styles.frameParent}>
          <View style={styles.frameGroup}>
            {/* 전체 동의 */}
            <View style={[styles.checkboxParent, styles.parentWrapperFlexBox]}>
              {renderCheckbox(isAllAgreed, () => handleAgreement('all'))}
              <View style={styles.parentWrapperFlexBox}>
                <Text style={[styles.textAllAgree]}>전체동의</Text>
              </View>
            </View>
            {/* 동의 목록 */}
            <View style={styles.horizontalLine} />
            {agreements.map(item => (
              <View style={[styles.parentWrapperFlexBox]}>
                <View
                  style={[styles.checkboxGroup, styles.parentWrapperFlexBox]}>
                  {renderCheckbox(item.isAgree, () => handleAgreement(item.id))}
                  <View
                    style={[
                      styles.frameContainer,
                      styles.parentWrapperFlexBox,
                    ]}>
                    <View style={[styles.parent, styles.parentWrapperFlexBox]}>
                      [
                      {item.isRequired ? (
                        <Text style={[styles.textRequired, styles.textBlue]}>
                          [필수]
                        </Text>
                      ) : (
                        ''
                      )}
                      ]<Text style={styles.textAgreeTitle}>{item.title}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleAgreeDetail(item.title, item.description)
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
          {isRequiredAgreed ? (
            <ButtonScarlet title="다음" />
          ) : (
            <ButtonWhite title="다음" disabled={true} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UserRegisterAgree;
