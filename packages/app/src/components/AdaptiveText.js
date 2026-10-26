import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

const VARIANT_PROPS = {
  singleLine: {
    numberOfLines: 1,
    adjustsFontSizeToFit: true,
    minimumFontScale: 0.78,
  },
  button: {
    numberOfLines: 2,
    adjustsFontSizeToFit: true,
    minimumFontScale: 0.82,
  },
  header: {
    numberOfLines: 2,
    adjustsFontSizeToFit: true,
    minimumFontScale: 0.82,
  },
  tab: {numberOfLines: 1, adjustsFontSizeToFit: true, minimumFontScale: 0.72},
  chip: {numberOfLines: 1, adjustsFontSizeToFit: true, minimumFontScale: 0.82},
  title: {numberOfLines: 2},
  body: {},
};

export const getAdaptiveTextProps = (language, variant = 'body') =>
  language === 'en' ? VARIANT_PROPS[variant] ?? VARIANT_PROPS.body : {};

const AdaptiveText = ({variant = 'body', style, ...props}) => {
  const {i18n} = useTranslation();
  const isEnglish = i18n.resolvedLanguage === 'en';
  const variantProps = getAdaptiveTextProps(isEnglish ? 'en' : 'ko', variant);

  return (
    <Text
      {...variantProps}
      {...props}
      style={[styles.base, isEnglish && styles.english, style]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    flexShrink: 1,
  },
  english: {
    includeFontPadding: false,
  },
});

export default AdaptiveText;
