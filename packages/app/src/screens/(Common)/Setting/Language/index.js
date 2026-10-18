import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';

import Header from '@components/Header';
import SelectedRadio from '@assets/images/radio_button_enabled.svg';
import UnselectedRadio from '@assets/images/radio_button_disabled.svg';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import useLocaleStore from '@stores/localeStore';
import {changeLanguageForCurrentUser} from '@utils/languageSync';

const OPTIONS = [
  {value: 'ko', labelKey: 'language.korean'},
  {value: 'en', labelKey: 'language.english'},
];

const Language = () => {
  const {t} = useTranslation();
  const language = useLocaleStore(state => state.language);
  const selectLanguage = async nextLanguage => {
    if (nextLanguage === language) {
      return;
    }

    const result = await changeLanguageForCurrentUser(nextLanguage);

    if (!result.localOnly && !result.synced) {
      Toast.show({
        type: 'error',
        text1: t('errors.languageSaveFailed'),
      });
    }
  };

  return (
    <View style={styles.screen}>
      <Header title={t('language.title')} />
      <View style={styles.card}>
        {OPTIONS.map(({value, labelKey}, index) => {
          const selected = language === value;
          const Radio = selected ? SelectedRadio : UnselectedRadio;

          return (
            <TouchableOpacity
              key={value}
              accessibilityRole="radio"
              accessibilityState={{checked: selected}}
              accessibilityLabel={t(labelKey)}
              onPress={() => selectLanguage(value)}
              style={[styles.row, index > 0 && styles.divider]}>
              <Text style={styles.label}>{t(labelKey)}</Text>
              <Radio width={24} height={24} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.grayscale_100,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
  },
  row: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale_200,
  },
  label: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_800,
  },
});

export default Language;
