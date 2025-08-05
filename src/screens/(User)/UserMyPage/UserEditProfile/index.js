import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import PlusIcon from '@assets/images/plus_gray.svg';
import EmptyImage from '@assets/images/wlogo_gray_up.svg';

import Header from '@components/Header';
import styles from './UserEditProfile.styles';
import {FONTS} from '@constants/fonts';
import userMyApi from '@utils/api/userMyApi';
import useUserStore from '@stores/userStore';
import {uploadSingleImage} from '@utils/imageUploadHandler';
import ButtonScarlet from '@components/ButtonScarlet';

const UserEditProfile = () => {
  const userProfile = useUserStore(state => state.userProfile);
  const setUserProfile = useUserStore(state => state.setUserProfile);

  const [user, setUser] = useState(userProfile);
  const [draft, setDraft] = useState({
    ...userProfile,
    gender: userProfile.gender ?? 'FEMALE', // 기본 여자
    age: userProfile.age ?? '', // 숫자 아님 → 빈 문자열
    birthYear: userProfile.birthYear ?? '', // 숫자 아님 → 빈 문자열
  });

  useFocusEffect(
    useCallback(() => {
      setUser(userProfile);
      setDraft({
        ...userProfile,
        gender: userProfile.gender ?? 'FEMALE',
        age: userProfile.age ?? '',
        birthYear: userProfile.birthYear ?? '',
      }); // 수정 시 초기값 복사
    }, [userProfile]),
  );

  const handleEditProfileImage = async () => {
    try {
      const imageUrl = await uploadSingleImage();
      await userMyApi.updateMyProfile('photoUrl', imageUrl);
      setUserProfile({...user, photoUrl: imageUrl});
    } catch (error) {
      console.warn(
        '프로필 이미지 업로드 실패: ',
        error?.response?.data?.message || error,
      );
    }
  };

  const updateMyProfile = async () => {};

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80} // 필요에 따라 조절
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.outContainer}>
          <Header title="회원 정보 수정" />
          <ScrollView style={styles.container}>
            {/* 이미지 */}
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImageWrapper}>
                {user.photoUrl ? (
                  <Image
                    source={{uri: user.photoUrl}}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.profileImage}>
                    <EmptyImage width={60} height={60} />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.plusButton}
                  onPress={handleEditProfileImage}>
                  <PlusIcon width={24} height={24} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 이름 */}
            <View style={styles.contentContainer}>
              <Text style={[FONTS.fs_16_medium, styles.label]}>이름</Text>
              <TextInput
                style={styles.input}
                value={draft.nickname}
                onChangeText={text => setDraft({...draft, nickname: text})}
              />
              {/* 성별 */}
              <View style={styles.genderRow}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    draft.gender === 'FEMALE' && styles.genderSelected,
                  ]}
                  onPress={() => setDraft({...draft, gender: 'FEMALE'})}>
                  <Text
                    style={[
                      styles.genderText,
                      FONTS.fs_14_medium,
                      draft.gender === 'FEMALE' && styles.genderSelectedText,
                      draft.gender === 'FEMALE' && FONTS.fs_14_semibold,
                    ]}>
                    여자
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    draft.gender === 'MALE' && styles.genderSelected,
                  ]}
                  onPress={() => setDraft({...draft, gender: 'MALE'})}>
                  <Text
                    style={[
                      styles.genderText,
                      FONTS.fs_14_medium,
                      draft.gender === 'MALE' && styles.genderSelectedText,
                      draft.gender === 'MALE' && FONTS.fs_14_semibold,
                    ]}>
                    남자
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 나이 & 출생년도 */}
            <View style={styles.contentContainer}>
              <View style={styles.ageBirthYearRow}>
                <View style={styles.row}>
                  <Text style={styles.label}>나이</Text>
                  <TextInput
                    style={[styles.input]}
                    value={draft.age?.toString()}
                    keyboardType="numeric"
                    onChangeText={text => setDraft({...draft, age: text})}
                    placeholder="00"
                  />
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>출생연도</Text>
                  <TextInput
                    style={[styles.input]}
                    value={draft.birthYear?.toString()}
                    keyboardType="numeric"
                    onChangeText={text => setDraft({...draft, birthYear: text})}
                    placeholder="0000"
                  />
                </View>
              </View>
            </View>

            {/* 연락처 */}
            <View style={styles.contentContainer}>
              <Text style={styles.label}>연락처</Text>
              <TextInput
                style={styles.input}
                value={draft.phone}
                keyboardType="phone-pad"
                onChangeText={text => setDraft({...draft, phone: text})}
              />
            </View>

            {/* 이메일 */}
            <View style={styles.contentContainer}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                value={draft.email}
                keyboardType="email-address"
                onChangeText={text => setDraft({...draft, email: text})}
              />
            </View>

            {/* MBTI */}
            <View style={styles.contentContainer}>
              <Text style={styles.label}>MBTI</Text>
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
                      draft.mbti === type && styles.mbtiSelected,
                    ]}
                    onPress={() => setDraft({...draft, mbti: type})}>
                    <Text
                      style={[
                        styles.mbtiText,
                        FONTS.fs_14_medium,
                        draft.mbti === type && styles.mbtiSelectedText,
                        draft.mbti === type && FONTS.fs_14_semibold,
                      ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 인스타 */}
            <View style={styles.contentContainer}>
              <Text style={styles.label}>insta</Text>
              <View style={styles.instagramRow}>
                <Text style={[FONTS.fs_14_medium, styles.atSymbol]}>@</Text>
                <TextInput
                  style={styles.instagramInput}
                  value={draft.instagramId}
                  onChangeText={text => setDraft({...draft, instagramId: text})}
                />
              </View>
            </View>

            <View style={styles.saveButton}>
              <ButtonScarlet
                title={'정보 저장하기'}
                onPress={updateMyProfile}
              />
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default UserEditProfile;
