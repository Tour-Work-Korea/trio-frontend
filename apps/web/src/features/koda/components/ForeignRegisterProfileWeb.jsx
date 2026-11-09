import {useTranslation} from 'react-i18next';
import React, {useMemo, useRef, useState} from 'react';
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
import {storeWebSessionInfo} from '@utils/auth/login';
import {signupCredential} from '../auth/signupCredential.js';
import {googleAuthOutcome} from '../auth/googleAuthModel.js';
import {readAuthReturn} from '../auth/authReturn.js';
import {storeLastLoginProvider} from '@utils/auth/lastLoginProvider';
import {validateRegisterProfile} from '@utils/validation/registerValidation';
import {COLORS} from '@constants/colors';

import LogoOrange from '@assets/images/logo_orange.svg';
import CheckGray from '@assets/images/check20_gray.svg';
import CheckOrange from '@assets/images/check20_orange.svg';
import CalendarGray from '@assets/images/calendar_gray.svg';
import PersonGray from '@assets/images/person20_gray.svg';
import sharedStyles from '@trio/app/src/screens/(Common)/Register/ForeignRegisterProfile/ForeignRegisterProfile.styles';
import {countryOptions} from '../data/countryOptions.js';

// Web-only adapter for the existing social-signup API. Native screens stay unchanged.
const styles = {
  ...sharedStyles,
  input: [sharedStyles.input, {minWidth: 0, flexShrink: 1, fontSize: 16}],
  smallButton: [sharedStyles.smallButton, {flexShrink: 0}],
};

const ForeignRegisterProfile = ({route}) => {
  const {t, i18n} = useTranslation();
  const ko = i18n.language?.startsWith('ko');
  const countries = useMemo(() => countryOptions(ko ? 'ko' : 'en'), [ko]);
  const LANGUAGE_OPTIONS = [
    ['KO', t('language.korean')],
    ['EN', t('language.english')],
    ['JA', t('auth.japanese')],
    ['ZH', t('auth.chinese')],
  ];
  const AGREEMENT_LABELS = {
    TERMS_OF_SERVICE: t('auth.iAgreeToTheTermsOfService'),
    AGE_OVER_14_CONFIRMATION: t('auth.iConfirmThatIAmAtLeast14YearsOld'),
    PRIVACY_POLICY: t('auth.iAgreeToThePrivacyPolicy'),
    LOCATION_BASED_SERVICE: t('auth.iAgreeToTheLocationBasedServiceTerms'),
    MARKETING_NOTIFICATION: t('auth.iAgreeToReceiveMarketingNotifications'),
  };

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
  const [signupStage, setSignupStage] = useState('form');
  const submissionInFlight = useRef(false);
  const accountCreated = useRef(false);
  const [errorMessage, setErrorMessage] = useState('');

  const nicknameValidation = useMemo(
    () =>
      validateRegisterProfile({...form, password: '', passwordConfirm: ''})
        .nickname,
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
      setNicknameMessage(response?.data || t('auth.thisNicknameIsAvailable'));
      return true;
    } catch (error) {
      setNicknameChecked(true);
      setNicknameDuplicated(true);
      setNicknameMessage(
        error?.response?.data?.message || t('auth.thisNicknameIsAlreadyInUse'),
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
    setAgreements(prev => prev.map(item => ({...item, isAgree: nextAgreed})));
  };

  const handleSubmit = async () => {
    if (!formValid || submitting || submissionInFlight.current || accountCreated.current) {
      return;
    }

    submissionInFlight.current = true;
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
      await authApi.completeForeignSocialSignUp(payload);
      accountCreated.current = true;
      setSignupStage('signing-in');
      // The existing signup API returns native tokens, not a browser cookie session.
      // Reuse the verified Google credential with the existing web login endpoint.
      const credential = signupCredential.take(socialSignupToken);
      if (!credential || provider !== 'GOOGLE') {
        setSignupStage('needs-login');
        return;
      }
      const login = await authApi.loginGoogle(credential);
      if (googleAuthOutcome(login.data) !== 'login') {
        setSignupStage('needs-login');
        return;
      }
      await storeWebSessionInfo(login.data.session || login.data, 'USER');
      try {
        await storeLastLoginProvider(provider);
      } catch {
        // Preference storage is optional after successful authentication.
      }
      let destination;
      try { destination = readAuthReturn(window.sessionStorage)?.target; } catch { /* Optional. */ }
      if (destination) {
        window.location.replace(destination);
      } else {
        navigation.replace('ForeignSignupComplete', {
          name: payload.name,
          nickname: payload.nickname,
          nationalityCountryCode: payload.nationalityCountryCode,
          preferredLanguage: payload.preferredLanguage,
        });
      }
    } catch (error) {
      if (accountCreated.current) {
        setSignupStage('needs-login');
      } else {
        setErrorMessage(error?.response?.data?.message || error?.message || t('auth.registrationFailedPleaseTryAgain'));
      }
    } finally {
      submissionInFlight.current = false;
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

  if (signupStage !== 'form') {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <LogoOrange width={60} height={29} />
          <View style={styles.heading}>
            <Text style={styles.title}>{ko ? '가입이 완료됐어요!' : 'You’re registered!'}</Text>
            <Text style={styles.subtitle} accessibilityLiveRegion="polite">
              {signupStage === 'signing-in'
                ? (ko ? '로그인을 연결하고 있어요. 잠시만 기다려 주세요.' : 'Signing you in. Just a moment…')
                : (ko ? '가입 정보는 저장됐어요. Google로 계속하면 모임 신청을 이어갈 수 있어요.' : 'Your details are saved. Continue with Google to finish signing in and join the meetup.')}
            </Text>
          </View>
          {signupStage === 'needs-login' && (
            <ButtonScarlet
              title={ko ? 'Google로 계속하기' : 'Continue with Google'}
              onPress={() => navigation.replace('SocialLogin', {provider: 'GOOGLE', koda: true})}
            />
          )}
        </ScrollView>
      </View>
    );
  }

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
          <Text style={styles.title}>{t('auth.completeProfile')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.pleaseFillInYourDetailsBelowToRegister')}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('auth.personalInformation')}</Text>
          <View style={styles.divider} />
          {renderField({
            label: t('auth.fullName_9e2a35'),
            icon: PersonGray,
            children: (
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={value =>
                  updateForm('name', value)
                }
                placeholder={t('auth.enterYourFullName')}
                placeholderTextColor={COLORS.grayscale_400}
                maxLength={30}
              />
            ),
          })}
          <View style={styles.field}>
            <Text style={styles.label}>{t('auth.nickname_a34f2c')}</Text>
            <View style={styles.inputBox}>
              <PersonGray width={20} height={20} />
              <TextInput
                style={styles.input}
                value={form.nickname}
                onChangeText={handleNicknameChange}
                placeholder={t('auth.enterYourNickname')}
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
                <Text style={styles.smallButtonText}>
                  {t('common.confirm_468266')}
                </Text>
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
            label: t('auth.dateOfBirth'),
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
            <Text style={styles.label}>{t('auth.gender')}</Text>
            <View style={styles.choiceRow}>
              {[
                ['F', t('auth.female')],
                ['M', t('auth.male')],
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
          <Text style={styles.cardTitle}>
            {t('auth.nationalityLanguage_89be5b')}
          </Text>
          <View style={styles.divider} />
          <View style={styles.field}>
            <Text style={styles.label} nativeID="foreign-nationality-label">
              {ko ? '국적 *' : 'Nationality *'}
            </Text>
            <select
              aria-labelledby="foreign-nationality-label"
              value={form.nationalityCountryCode}
              onChange={event => updateForm('nationalityCountryCode', event.target.value)}
              required
              style={{width: '100%', minWidth: 0, boxSizing: 'border-box', height: 46,
                border: `1px solid ${COLORS.grayscale_300}`, borderRadius: 10,
                padding: '0 12px', fontSize: 16, backgroundColor: COLORS.grayscale_100,
                color: COLORS.grayscale_900}}>
              <option value="" disabled>{ko ? '국적을 선택해 주세요' : 'Select your nationality'}</option>
              {countries.map(({code, name}) => <option key={code} value={code}>{name}</option>)}
            </select>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t('auth.preferredLanguage')}</Text>
            <View style={styles.languageGrid}>
              {LANGUAGE_OPTIONS.map(([value, label]) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.languageChoice,
                    form.preferredLanguage === value && styles.choiceSelected,
                  ]}
                  onPress={() =>
                    updateForm('preferredLanguage', value)
                  }>
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
          <Text style={styles.cardTitle}>{t('auth.agreements')}</Text>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.allAgreementRow}
            onPress={toggleAllAgreements}>
            {allAgreementsAccepted ? (
              <CheckOrange width={24} height={24} />
            ) : (
              <CheckGray width={24} height={24} />
            )}
            <Text style={styles.allAgreementText}>{t('auth.agreeToAll')}</Text>
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
                  {AGREEMENT_LABELS[item.id] || t(item.titleKey)}
                  {item.isRequired ? ' *' : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('AgreeDetail', {id: item.id, who: 'USER'})
                }>
                <Text style={styles.viewText}>{t('auth.view')}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <ButtonScarlet
          title={
            submitting ? t('auth.registering') : t('auth.completeRegistration')
          }
          disabled={!formValid || submitting}
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </ScrollView>
      <AlertModal
        visible={!!errorMessage}
        title={errorMessage}
        buttonText={t('common.confirm')}
        onPress={() => setErrorMessage('')}
      />
    </View>
  );
};

export default ForeignRegisterProfile;
