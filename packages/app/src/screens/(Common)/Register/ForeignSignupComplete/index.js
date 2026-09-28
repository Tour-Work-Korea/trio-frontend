import React from 'react';
import {Text, View} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';

import ButtonScarlet from '@components/ButtonScarlet';
import LogoOrange from '@assets/images/logo_orange.svg';
import PersonBlack from '@assets/images/person20_black_filled.svg';
import styles from './ForeignSignupComplete.styles';

const ForeignSignupComplete = ({route}) => {
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
        <Text style={styles.title}>Welcome{'\n'}Aboard!</Text>
        <Text style={styles.description}>
          Your registration is complete.{'\n'}
          We're thrilled to have you join our community.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTitleRow}>
            <PersonBlack width={20} height={20} />
            <Text style={styles.summaryTitle}>Profile Summary</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>FULL NAME</Text>
            <Text style={styles.value}>{name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NICKNAME</Text>
            <Text style={styles.value}>{nickname}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NATIONALITY / LANGUAGE</Text>
            <Text style={styles.badge}>
              {nationalityCountryCode} / {preferredLanguage}
            </Text>
          </View>
        </View>
      </View>

      <ButtonScarlet
        title="Get Started →"
        onPress={moveToMain}
        style={styles.button}
      />
    </View>
  );
};

export default ForeignSignupComplete;
