import {useTranslation} from 'react-i18next';
import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import userMyApi from '@utils/api/userMyApi';
import useUserStore from '@stores/userStore';
import ButtonScarlet from '@components/ButtonScarlet';
import AlertModal from '@components/modals/AlertModal';
import {calculateAge} from '@utils/auth/login';

import styles from './ProfileUpdate.styles';
import {FONTS} from '@constants/fonts';

const ProfileUpdate = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const userProfile = useUserStore(state => state.userProfile);
  const setUserProfile = useUserStore(state => state.setUserProfile);
  const [formData, setFormData] = useState({
    photoUrl: userProfile.photoUrl,
    name: userProfile.name,
    nickname: userProfile.nickname,
    phone: userProfile.phone,
    email: userProfile.email,
    mbti: userProfile.mbti,
    instagramId:
      userProfile.instagramId === t('common.pleaseAddYourId')
        ? ''
        : userProfile.instagramId,
    gender: userProfile.gender,
    birthDate: userProfile.birthDate,
  });

  const [errorModal, setErrorModal] = useState({visible: false, title: ''});

  const canSave = useMemo(() => {
    const isMbtiValid =
      !!(formData.mbti ?? '').trim() && formData.mbti !== 'DEFAULT';
    return isMbtiValid;
  }, [formData.mbti]);

  const getInstagramIdForSubmit = () => {
    const nextInstagramId = (formData.instagramId ?? '')
      .replace(/^@+/, '')
      .trim();

    return nextInstagramId || t('common.pleaseAddYourId');
  };

  const updateMyProfile = async () => {
    if (!canSave) {
      setErrorModal({
        visible: true,
        title: t('employ.pleaseSelectMbtiFirst'),
      });
      return;
    }

    try {
      const instagramId = getInstagramIdForSubmit();

      await userMyApi.updateMyProfile({
        ...formData,
        instagramId,
      });
      setUserProfile({
        name: formData.name ?? '',
        nickname: formData.nickname ?? '',
        photoUrl:
          formData.photoUrl && formData.photoUrl !== t('common.pleaseAddAPhoto')
            ? formData.photoUrl
            : null,
        phone: formData.phone ?? '',
        email: formData.email ?? '',
        mbti: formData.mbti ?? '',
        instagramId,
        gender: formData.gender ?? 'F',
        birthDate: formData.birthDate ?? null,
        age: calculateAge(formData.birthDate),
      });
      navigation.replace('ResumeDetail', {
        isEditable: true,
        role: 'USER',
        isNew: true,
        headerTitle: t('employ.writeAResume'),
      });
    } catch (error) {
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message ??
          t('common.anErrorOccurredWhileEditingYourProfile'),
      });
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80} // 필요에 따라 조절
      >
        <View style={styles.outContainer}>
          <Header title={t('employ.addYourInformation')} />
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollViewContent}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled">
            <View>
              {/* MBTI */}
              <View style={styles.contentContainer}>
                <Text style={styles.label}>{t('employ.pleaseSelectMbti')}</Text>
                <View style={styles.divide} />
                <View style={styles.mbtiGrid}>
                  {[
                    'ISTJ',
                    'ISFJ',
                    'INTJ',
                    'INFJ',
                    'ISTP',
                    'ISFP',
                    'INTP',
                    'INFP',
                    'ESTJ',
                    'ESFJ',
                    'ENTJ',
                    'ENFJ',
                    'ESTP',
                    'ESFP',
                    'ENTP',
                    'ENFP',
                  ].map(type => (
                    <TouchableOpacity
                      activeOpacity={1}
                      key={type}
                      style={[
                        styles.mbtiButton,
                        formData.mbti === type && styles.mbtiSelected,
                      ]}
                      onPress={() => setFormData({...formData, mbti: type})}>
                      <Text
                        style={[
                          styles.mbtiText,
                          FONTS.fs_14_medium,
                          formData.mbti === type && styles.mbtiSelectedText,
                          formData.mbti === type && FONTS.fs_14_semibold,
                        ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 인스타 */}
              <View style={styles.contentContainer}>
                <Text style={styles.label}>
                  {t('employ.pleaseEnterYourInstagramId')}
                </Text>
                <View style={styles.divide} />
                <View style={styles.instagramRow}>
                  <Text style={[FONTS.fs_14_medium, styles.atSymbol]}>@</Text>
                  <TextInput
                    style={styles.instagramInput}
                    value={formData.instagramId}
                    onChangeText={text =>
                      setFormData({
                        ...formData,
                        instagramId: text.replace(/^@+/, ''), // 입력 중 @ 제거
                      })
                    }
                    placeholder={t('common.pleaseAddYourId')}
                  />
                </View>
              </View>
            </View>

            <View style={styles.saveButton}>
              <ButtonScarlet
                title={t('employ.addYourInformation')}
                onPress={updateMyProfile}
                disabled={!canSave}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <AlertModal
        visible={errorModal.visible}
        title={errorModal.title}
        buttonText={t('common.confirm')}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </>
  );
};

export default ProfileUpdate;
