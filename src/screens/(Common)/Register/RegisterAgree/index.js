import React, {useState, useEffect} from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import ButtonScarlet from '@components/ButtonScarlet';
import {userRegisterAgrees, hostRegisterAgrees} from '@data/agree';
import ButtonWhite from '@components/ButtonWhite';

import LogoOrange from '@assets/images/logo_orange.svg';
import LogoBlue from '@assets/images/logo_blue.svg';
import CheckGray from '@assets/images/check20_gray.svg';
import CheckOrange from '@assets/images/check20_orange.svg';
import styles from './Agree.styles';
import { COLORS } from '@constants/colors';

const RegisterAgree = ({route}) => {
  const {user} = route.params;
  const [agreements, setAgreements] = useState(
    user === 'USER' ? userRegisterAgrees : hostRegisterAgrees,
  );
  const [isAllAgreed, setIsAllAgreed] = useState(false);
  const [isRequiredAgreed, setIsRequiredAgreed] = useState(false);
  const navigation = useNavigation();

  // 사장님 분기
  const isHost = user === 'HOST';
  const MainLogo = isHost ? LogoBlue : LogoOrange;
  const mainColor = isHost
    ? COLORS.primary_blue
    : COLORS.primary_orange;

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

  const getAgreementPayload = () => {
    return agreements.map(item => ({
      agreementType: item.id,
      agreed: item.isAgree,
    }));
  };

  const handleAgreeDetail = id => {
    navigation.navigate('AgreeDetail', {id, who: user});
  };

  const handleMoveNext = () => {
    const agreementPayload = getAgreementPayload();
    navigation.navigate('EmailCertificate', {
      user,
      agreements: agreementPayload,
    });
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
    <View style={styles.signin}>
      <View style={[styles.viewFlexBox]}>
        {/* 로고 및 문구 */}
        <View style={styles.groupParent}>
          <MainLogo style={styles.frameChild} width={60} height={29} />
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
              <View style={[styles.parentWrapperFlexBox]} key={item.id}>
                <View
                  style={[styles.checkboxGroup, styles.parentWrapperFlexBox]}>
                  {renderCheckbox(item.isAgree, () => handleAgreement(item.id))}
                  <View
                    style={[
                      styles.frameContainer,
                      styles.parentWrapperFlexBox,
                    ]}>
                    <View style={[styles.parent, styles.parentWrapperFlexBox]}>
                      {item.isRequired ? (
                        <Text style={[styles.textRequired, styles.textBlue]}>
                          [필수]
                        </Text>
                      ) : null}
                      <Text style={styles.textAgreeTitle}>{item.title}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAgreeDetail(item.id)}>
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
            <ButtonWhite 
              title="다음" 
              onPress={handleMoveNext} 
              backgroundColor={mainColor}
              textColor={COLORS.grayscale_0}
            />
          ) : (
            <ButtonWhite title="다음" disabled={true} />
          )}
        </View>
      </View>
    </View>
  );
};

export default RegisterAgree;
