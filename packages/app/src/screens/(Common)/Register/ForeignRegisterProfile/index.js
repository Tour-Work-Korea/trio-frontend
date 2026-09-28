import React, {useMemo, useState} from 'react';
import {
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import AlertModal from '@components/modals/AlertModal';
import ButtonScarlet from '@components/ButtonScarlet';
import {userRegisterAgrees} from '@data/agree';
import authApi from '@utils/api/authApi';
import {storeLoginTokens} from '@utils/auth/login';
import {storeLastLoginProvider} from '@utils/auth/lastLoginProvider';
import {validateRegisterProfile} from '@utils/validation/registerValidation';
import {COLORS} from '@constants/colors';

import LogoOrange from '@assets/images/logo_orange.svg';
import CheckGray from '@assets/images/check20_gray.svg';
import CheckOrange from '@assets/images/check20_orange.svg';
import CalendarGray from '@assets/images/calendar_gray.svg';
import PersonGray from '@assets/images/person20_gray.svg';
import styles from './ForeignRegisterProfile.styles';

const LANGUAGE_OPTIONS = [
  ['KO', 'Korean'],
  ['EN', 'English'],
  ['JA', 'Japanese'],
  ['ZH', 'Chinese'],
];

const AGREEMENT_LABELS = {
  TERMS_OF_SERVICE: 'I agree to the Terms of Service',
  AGE_OVER_14_CONFIRMATION: 'I confirm that I am at least 14 years old',
  PRIVACY_POLICY: 'I agree to the Privacy Policy',
  LOCATION_BASED_SERVICE: 'I agree to the Location-Based Service Terms',
  MARKETING_NOTIFICATION: 'I agree to receive marketing notifications',
};

const ForeignRegisterProfile = ({route}) => {
  const navigation = useNavigation();
  const {
    provider = 'GOOGLE',
    socialSignupToken,
    socialProfile = {},
  } = route.params || {};
  const [form, setForm] = useState({
    name: socialProfile.name || '',
    nickname: socialProfile.nickname || '',
    birthday: socialProfile.birthday || '',
    gender: socialProfile.gender || '',
    nationalityCountryCode: '',
    preferredLanguage: '',
  });
  const [agreements, setAgreements] = useState(() =>
    userRegisterAgrees.map(item => ({...item})),
  );
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameDuplicated, setNicknameDuplicated] = useState(true);
  const [nicknameMessage, setNicknameMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const nicknameValidation = useMemo(
    () => validateRegisterProfile({...form, password: '', passwordConfirm: ''}).nickname,
    [form],
  );
  const requiredAgreementsAccepted = agreements
    .filter(item => item.isRequired)
    .every(item => item.isAgree);
  const allAgreementsAccepted = agreements.every(item => item.isAgree);
  const formValid =
    !!form.name.trim() &&
    /^\d{4}-\d{2}-\d{2}$/.test(form.birthday) &&
    ['M', 'F'].includes(form.gender) &&
    /^[A-Z]{2}$/.test(form.nationalityCountryCode) &&
    ['KO', 'EN', 'JA', 'ZH'].includes(form.preferredLanguage) &&
    nicknameValidation.hasNoSpecialChars &&
    nicknameValidation.isLengthValid &&
    requiredAgreementsAccepted;

  const updateForm = (key, value) => setForm(prev => ({...prev, [key]: value}));

  const handleNicknameChange = value => {
    updateForm('nickname', value);
    setNicknameChecked(false);
    setNicknameMessage('');
  };

  const handleBirthdayChange = value => {
    const formatted = value
      .replace(/[^0-9]/g, '')
      .slice(0, 8)
      .replace(/^(\d{4})(\d)/, '$1-$2')
      .replace(/^(\d{4}-\d{2})(\d)/, '$1-$2');
    updateForm('birthday', formatted);
  };

  const checkNickname = async () => {
    try {
      const response = await authApi.checkNickname(form.nickname);
      setNicknameChecked(true);
      setNicknameDuplicated(false);
      setNicknameMessage(response?.data || 'This nickname is available.');
      return true;
    } catch (error) {
      setNicknameChecked(true);
      setNicknameDuplicated(true);
      setNicknameMessage(
        error?.response?.data?.message || 'This nickname is already in use.',
      );
      return false;
    }
  };

  const toggleAgreement = id => {
    setAgreements(prev =>
      prev.map(item =>
        item.id === id ? {...item, isAgree: !item.isAgree} : item,
      ),
    );
  };

  const toggleAllAgreements = () => {
    const nextAgreed = !allAgreementsAccepted;
    setAgreements(prev =>
      prev.map(item => ({...item, isAgree: nextAgreed})),
    );
  };

  const handleSubmit = async () => {
    if (!formValid || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      if (!nicknameChecked || nicknameDuplicated) {
        const nicknameAvailable = await checkNickname();
        if (!nicknameAvailable) {
          return;
        }
      }

      const payload = {
        provider,
        socialSignupToken,
        userRole: 'USER',
        name: form.name.trim(),
        birthday: form.birthday,
        gender: form.gender,
        nickname: form.nickname.trim(),
        nationalityCountryCode: form.nationalityCountryCode,
        preferredLanguage: form.preferredLanguage,
        agreements: agreements.map(item => ({
          agreementType: item.id,
          agreed: item.isAgree,
        })),
      };
      const response = await authApi.completeForeignSocialSignUp(payload);
      const {accessToken, refreshToken} = response.data || {};

      if (!accessToken || !refreshToken) {
        throw new Error('The sign-up token response is empty.');
      }

      await storeLoginTokens({accessToken, refreshToken, userRole: 'USER'});
      await storeLastLoginProvider(provider);
      navigation.replace('ForeignSignupComplete', {
        name: payload.name,
        nickname: payload.nickname,
        nationalityCountryCode: payload.nationalityCountryCode,
        preferredLanguage: payload.preferredLanguage,
      });
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Registration failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = ({label, icon: Icon, children}) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputBox}>
        {Icon ? <Icon width={20} height={20} /> : null}
        {children}
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
        canCancelContentTouches
        directionalLockEnabled
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}>
          <LogoOrange width={60} height={29} />
          <View style={styles.heading}>
            <Text style={styles.title}>Complete Profile</Text>
            <Text style={styles.subtitle}>
              Please fill in your details below to register.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <View style={styles.divider} />
            {renderField({
              label: 'Full Name *',
              icon: PersonGray,
              children: (
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={value => updateForm('name', value)}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.grayscale_400}
                  maxLength={30}
                />
              ),
            })}
            <View style={styles.field}>
              <Text style={styles.label}>Nickname *</Text>
              <View style={styles.inputBox}>
                <PersonGray width={20} height={20} />
                <TextInput
                  style={styles.input}
                  value={form.nickname}
                  onChangeText={handleNicknameChange}
                  placeholder="Enter your nickname"
                  placeholderTextColor={COLORS.grayscale_400}
                  maxLength={10}
                />
                <TouchableOpacity
                  style={styles.smallButton}
                  disabled={
                    !nicknameValidation.hasNoSpecialChars ||
                    !nicknameValidation.isLengthValid
                  }
                  onPress={checkNickname}>
                  <Text style={styles.smallButtonText}>Check</Text>
                </TouchableOpacity>
              </View>
              {!!nicknameMessage && (
                <Text
                  style={[
                    styles.helper,
                    nicknameDuplicated ? styles.error : styles.success,
                  ]}>
                  {nicknameMessage}
                </Text>
              )}
            </View>
            {renderField({
              label: 'Date of Birth *',
              icon: CalendarGray,
              children: (
                <TextInput
                  style={styles.input}
                  value={form.birthday}
                  onChangeText={handleBirthdayChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.grayscale_400}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              ),
            })}
            <View style={styles.field}>
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.choiceRow}>
                {[
                  ['F', 'Female'],
                  ['M', 'Male'],
                ].map(([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.choice,
                      form.gender === value && styles.choiceSelected,
                    ]}
                    onPress={() => updateForm('gender', value)}>
                    <Text
                      style={[
                        styles.choiceText,
                        form.gender === value && styles.choiceTextSelected,
                      ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nationality & Language</Text>
            <View style={styles.divider} />
            {renderField({
              label: 'Nationality (ISO country code) *',
              children: (
                <TextInput
                  style={styles.input}
                  value={form.nationalityCountryCode}
                  onChangeText={value =>
                    updateForm(
                      'nationalityCountryCode',
                      value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2),
                    )
                  }
                  placeholder="e.g. US, JP, FR"
                  placeholderTextColor={COLORS.grayscale_400}
                  autoCapitalize="characters"
                  maxLength={2}
                />
              ),
            })}
            <View style={styles.field}>
              <Text style={styles.label}>Preferred Language *</Text>
              <View style={styles.languageGrid}>
                {LANGUAGE_OPTIONS.map(([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.languageChoice,
                      form.preferredLanguage === value && styles.choiceSelected,
                    ]}
                    onPress={() => updateForm('preferredLanguage', value)}>
                    <Text
                      style={[
                        styles.choiceText,
                        form.preferredLanguage === value &&
                          styles.choiceTextSelected,
                      ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Agreements</Text>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.allAgreementRow}
              onPress={toggleAllAgreements}>
              {allAgreementsAccepted ? (
                <CheckOrange width={24} height={24} />
              ) : (
                <CheckGray width={24} height={24} />
              )}
              <Text style={styles.allAgreementText}>Agree to all</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            {agreements.map(item => (
              <View key={item.id} style={styles.agreementRow}>
                <TouchableOpacity onPress={() => toggleAgreement(item.id)}>
                  {item.isAgree ? (
                    <CheckOrange width={24} height={24} />
                  ) : (
                    <CheckGray width={24} height={24} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.agreementLabel}
                  onPress={() => toggleAgreement(item.id)}>
                  <Text style={styles.agreementText}>
                    {AGREEMENT_LABELS[item.id] || item.title}
                    {item.isRequired ? ' *' : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('AgreeDetail', {id: item.id, who: 'USER'})
                  }>
                  <Text style={styles.viewText}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <ButtonScarlet
            title={submitting ? 'Registering...' : 'Complete Registration'}
            disabled={!formValid || submitting}
            onPress={handleSubmit}
            style={styles.submitButton}
          />
      </ScrollView>
      <AlertModal
        visible={!!errorMessage}
        title={errorMessage}
        buttonText="OK"
        onPress={() => setErrorMessage('')}
      />
    </View>
  );
};

export default ForeignRegisterProfile;
