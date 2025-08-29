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
import styles from './ProfileUpdate.styles';
import {FONTS} from '@constants/fonts';
import userMyApi from '@utils/api/userMyApi';
import useUserStore from '@stores/userStore';
import ButtonScarlet from '@components/ButtonScarlet';
import ErrorModal from '@components/modals/ErrorModal';
import {calculateAge} from '@utils/auth/login';

const ProfileUpdate = () => {
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
    instagramId: userProfile.instagramId,
    gender: userProfile.gender,
    birthDate: userProfile.birthDate,
  });

  const [errorModal, setErrorModal] = useState({visible: false, title: ''});

  const canSave = useMemo(() => {
    const rawId = (formData.instagramId ?? '').trim();
    const id = rawId.replace(/^@+/, ''); // 혹시 @ 입력하면 제거
    const isIdValid = id.length > 0 && id !== 'ID를 추가해주세요';
    const isMbtiValid = !!(formData.mbti ?? '').trim();
    return isIdValid && isMbtiValid;
  }, [formData.instagramId, formData.mbti]);
  const updateMyProfile = async () => {
    if (!canSave) {
      setErrorModal({
        visible: true,
        title: 'MBTI와 Insta 아이디를 먼저 입력/선택해주세요.',
      });
      return;
    }

    try {
      await userMyApi.updateMyProfile({
        ...formData,
        instagramId: (formData.instagramId ?? '').replace(/^@+/, '').trim(),
      });
      setUserProfile({
        name: formData.name ?? '',
        nickname: formData.nickname ?? '',
        photoUrl:
          formData.photoUrl && formData.photoUrl !== '사진을 추가해주세요'
            ? formData.photoUrl
            : null,
        phone: formData.phone ?? '',
        email: formData.email ?? '',
        mbti: formData.mbti ?? '',
        instagramId: (formData.instagramId ?? '').replace(/^@+/, '').trim(),
        gender: formData.gender ?? 'F',
        birthDate: formData.birthDate ?? null,
        age: calculateAge(formData.birthDate),
      });
      navigation.navigate('ResumeDetail', {
        isEditable: true,
        role: 'USER',
        isNew: true,
        headerTitle: '이력서 작성',
      });
    } catch (error) {
      setErrorModal({
        visible: true,
        title:
          error?.response?.data?.message ?? '프로필 수정 중 오류가 발생했어요',
      });
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80} // 필요에 따라 조절
      >
        <View style={styles.outContainer}>
          <Header title="내 정보 추가하기" />
          <ScrollView
            style={styles.container}
            contentContainerStyle={{
              justifyContent: 'space-between',
            }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled">
            <View>
              {/* MBTI */}
              <View style={styles.contentContainer}>
                <Text style={styles.label}>MBTI를 선택해주세요</Text>
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
                <Text style={styles.label}>insta 아이디를 입력해주세요</Text>
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
                    placeholder="ID를 추가해주세요"
                  />
                </View>
              </View>
            </View>

            <View style={styles.saveButton}>
              <ButtonScarlet
                title={'내 정보 추가하기'}
                onPress={updateMyProfile}
                disabled={!canSave}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        buttonText={'확인'}
        onPress={() => setErrorModal(prev => ({...prev, visible: false}))}
      />
    </>
  );
};

export default ProfileUpdate;
