import React, {useEffect, useState} from 'react';
import {StyleSheet, Switch, Text, TouchableOpacity, View} from 'react-native';

import Header from '@components/Header';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import notificationApi from '@utils/api/notificationApi';
import CheckIcon from '@assets/images/check_white.svg';

const DEFAULT_SETTINGS = {
  isPushEnabled: true,
  isEventEnabled: true,
};

const NotificationSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const {data} = await notificationApi.getSettings();
        setSettings({
          isPushEnabled: data?.isPushEnabled ?? DEFAULT_SETTINGS.isPushEnabled,
          isEventEnabled:
            data?.isEventEnabled ?? DEFAULT_SETTINGS.isEventEnabled,
        });
      } catch (error) {
        console.warn(
          '[NotificationSettings] failed to fetch settings:',
          error?.message,
        );
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async nextSettings => {
    if (submitting) {
      return;
    }

    const previousSettings = settings;
    setSettings(nextSettings);
    setSubmitting(true);

    try {
      await notificationApi.updateSettings(nextSettings);
    } catch (error) {
      setSettings(previousSettings);
      console.warn(
        '[NotificationSettings] failed to save settings:',
        error?.message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSetting = key => {
    const nextSettings = {
      ...settings,
      [key]: !settings[key],
    };

    saveSettings(nextSettings);
  };

  return (
    <View style={styles.background}>
      <Header title="알림 설정" />

      <View style={styles.container}>
        <View style={styles.pushHeaderRow}>
          <Text style={styles.pushTitle}>푸시 알림 받기</Text>
          <View style={styles.pushControlRow}>
            <Text style={styles.pushStatusText}>
              {settings.isPushEnabled ? '받음' : '꺼짐'}
            </Text>
            <Switch
              value={settings.isPushEnabled}
              disabled={submitting}
              onValueChange={() => toggleSetting('isPushEnabled')}
              trackColor={{
                false: COLORS.grayscale_300,
                true: COLORS.primary_orange,
              }}
              thumbColor={COLORS.grayscale_0}
              style={styles.pushSwitch}
            />
          </View>
        </View>

        <Text style={styles.pushDescription}>
          소리와 진동으로 알려주는 알림입니다.
        </Text>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.benefitRow}
          activeOpacity={0.8}
          disabled={submitting}
          onPress={() => toggleSetting('isEventEnabled')}>
          <Text style={styles.benefitTitle}>이벤트/혜택 알림</Text>
          <View
            style={[
              styles.checkbox,
              settings.isEventEnabled && styles.checkboxActive,
            ]}>
            {settings.isEventEnabled ? (
              <CheckIcon width={16} height={16} />
            ) : null}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  pushHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pushTitle: {
    ...FONTS.fs_18_semibold,
    color: COLORS.grayscale_900,
  },
  pushControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 12,
  },
  pushStatusText: {
    ...FONTS.fs_16_medium,
    color: COLORS.primary_orange,
  },
  pushDescription: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_500,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginTop: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  benefitTitle: {
    ...FONTS.fs_16_medium,
    color: COLORS.grayscale_700,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: COLORS.primary_orange,
    backgroundColor: COLORS.primary_orange,
  },
});

export default NotificationSettings;
