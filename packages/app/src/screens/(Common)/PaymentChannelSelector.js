import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import AdaptiveText from '@components/AdaptiveText';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import RadioChecked from '@assets/images/radio_button_enabled.svg';
import RadioUnchecked from '@assets/images/radio_button_disabled.svg';

export default function PaymentChannelSelector({value, onChange, disabled, style}) {
  const {t} = useTranslation();

  return (
    <View style={[styles.container, style]}>
      <AdaptiveText style={[FONTS.fs_16_medium, styles.title]}>
        {t('payment.cardChannelTitle')}
      </AdaptiveText>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {['DOMESTIC', 'INTERNATIONAL_CARD'].map((channel, index) => {
          const selected = value === channel;
          return (
            <TouchableOpacity
              key={channel}
              accessibilityRole="radio"
              accessibilityState={{checked: selected, disabled: Boolean(disabled)}}
              disabled={disabled}
              activeOpacity={0.7}
              onPress={() => onChange(channel)}
              style={[styles.option, index > 0 && styles.separator]}>
              <View style={styles.copy}>
                <AdaptiveText style={[FONTS.fs_14_medium, styles.label]}>
                  {t(channel === 'DOMESTIC' ? 'payment.domesticCard' : 'payment.internationalCard')}
                </AdaptiveText>
                {channel === 'INTERNATIONAL_CARD' && selected ? (
                  <AdaptiveText style={[FONTS.fs_12_medium, styles.notice]}>
                    {t('payment.cardChannelKrwNotice')}
                  </AdaptiveText>
                ) : null}
              </View>
              <View style={styles.indicator}>
                {selected ? (
                  <RadioChecked width={22} height={22} />
                ) : (
                  <RadioUnchecked width={22} height={22} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {alignSelf: 'stretch', minWidth: 0, gap: 12, marginBottom: 24},
  title: {color: COLORS.grayscale_700},
  options: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  separator: {borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.grayscale_200},
  copy: {flex: 1, minWidth: 0, gap: 6},
  label: {color: COLORS.grayscale_700, lineHeight: 22},
  indicator: {width: 22, height: 22, flexShrink: 0},
  notice: {color: COLORS.grayscale_500, lineHeight: 18},
});
