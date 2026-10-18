import {useTranslation} from 'react-i18next';
import React from 'react';
import {Text, View} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';

import ButtonScarlet from '@components/ButtonScarlet';
import LogoOrange from '@assets/images/logo_orange.svg';
import PersonBlack from '@assets/images/person20_black_filled.svg';
import styles from './ForeignSignupComplete.styles';

const ForeignSignupComplete = ({route}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {name, nickname, nationalityCountryCode, preferredLanguage} =
    route.params || {};

  const moveToMain = () => {
    navigation.dispatch(
      CommonActions.reset({index: 0, routes: [{name: 'MainTabs'}]}),
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.main}>
        <LogoOrange width={112} height={112} />
        <Text style={styles.title}>
          {t('auth.welcome')}
          {'\n'}
          {t('auth.aboard')}
        </Text>
        <Text style={styles.description}>
          {t('auth.yourRegistrationIsComplete')}
          {'\n'}
          {t('auth.weReThrilledToHaveYouJoinOurCommunity')}
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTitleRow}>
            <PersonBlack width={20} height={20} />
            <Text style={styles.summaryTitle}>{t('auth.profileSummary')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>{t('auth.fullName')}</Text>
            <Text style={styles.value}>{name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NICKNAME</Text>
            <Text style={styles.value}>{nickname}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t('auth.nationalityLanguage')}</Text>
            <Text style={styles.badge}>
              {nationalityCountryCode} / {preferredLanguage}
            </Text>
          </View>
        </View>
      </View>

      <ButtonScarlet
        title={t('auth.getStarted')}
        onPress={moveToMain}
        style={styles.button}
      />
    </View>
  );
};

export default ForeignSignupComplete;
