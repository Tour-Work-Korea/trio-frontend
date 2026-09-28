import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import ButtonScarlet from '@components/ButtonScarlet';
import LogoOrange from '@assets/images/logo_orange.svg';
import CheckOrange from '@assets/images/check20_orange.svg';
import styles from './SocialOriginSelect.styles';

const OPTIONS = [
  {
    value: 'DOMESTIC',
    title: '내국인',
    englishTitle: 'DOMESTIC RESIDENT',
    icon: '🇰🇷',
    description: '대한민국 휴대폰 번호로 본인 인증을 진행해요.',
  },
  {
    value: 'FOREIGN',
    title: '외국인',
    englishTitle: 'FOREIGNER',
    icon: '🌐',
    description: 'Registration process for non-Korean citizens.',
  },
];

const SocialOriginSelect = ({route}) => {
  const navigation = useNavigation();
  const [originType, setOriginType] = useState(null);
  const params = route.params || {};

  const handleNext = () => {
    if (originType === 'FOREIGN') {
      navigation.navigate('ForeignRegisterProfile', {
        ...params,
        user: 'USER',
        isSocial: true,
        isForeign: true,
      });
      return;
    }

    navigation.navigate('RegisterAgree', {
      ...params,
      user: 'USER',
      agreements: [],
      isSocial: true,
      isForeign: false,
    });
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.header}>
          <LogoOrange width={60} height={29} />
          <View>
            <Text style={styles.title}>Welcome! / 환영합니다!</Text>
            <Text style={styles.description}>
              가입을 계속하려면 사용자 유형을 선택해주세요.{'\n'}
              Registration steps vary depending on your selection.
            </Text>
          </View>
        </View>

        <View style={styles.optionGroup}>
          {OPTIONS.map(option => {
            const selected = originType === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{selected}}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => setOriginType(option.value)}>
                {selected && (
                  <View style={styles.selectedMark}>
                    <CheckOrange width={24} height={24} />
                  </View>
                )}
                <View
                  style={[
                    styles.optionIcon,
                    option.value === 'FOREIGN' && styles.foreignIcon,
                  ]}>
                  <Text style={styles.optionEmoji}>{option.icon}</Text>
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionEnglishTitle}>
                    {option.englishTitle}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.secureText}>안전한 가입 절차 · Secure registration</Text>
        <ButtonScarlet title="다음" onPress={handleNext} disabled={!originType} />
      </View>
    </View>
  );
};

export default SocialOriginSelect;
