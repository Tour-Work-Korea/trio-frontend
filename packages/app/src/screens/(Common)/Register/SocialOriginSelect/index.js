import i18n from '@trio/app/src/i18n';
import {useTranslation} from 'react-i18next';
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
    title: i18n.t('auth.korean'),
    englishTitle: i18n.t('auth.domesticResident'),
    icon: '🇰🇷',
    description: i18n.t(
      'auth.verifyYourIdentityUsingYourKoreanMobilePhoneNumber',
    ),
  },
  {
    value: 'FOREIGN',
    title: i18n.t('auth.foreigner'),
    englishTitle: 'FOREIGNER',
    icon: '🌐',
    description: i18n.t('auth.registrationProcessForNonKoreanCitizens'),
  },
];

const SocialOriginSelect = ({route}) => {
  const {t} = useTranslation();
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
            <Text style={styles.title}>{t('auth.welcomeWelcome')}</Text>
            <Text style={styles.description}>
              {t('auth.pleaseSelectYourUserTypeToContinueSigningUp')}
              {'\n'}
              {t('auth.registrationStepsVaryDependingOnYourSelection')}
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
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.secureText}>
          {t('auth.secureRegistrationProcessSecureRegistration')}
        </Text>
        <ButtonScarlet
          title={t('common.next')}
          onPress={handleNext}
          disabled={!originType}
        />
      </View>
    </View>
  );
};

export default SocialOriginSelect;
