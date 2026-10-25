import React, {useEffect, useRef, useState} from 'react';
import authApi from '@utils/api/authApi';
import {validateRegisterProfile} from '@utils/validation/registerValidation';
import {isEligibleBirthday} from '../auth/signupModel';

export default function SignupProfile({
  form,
  onChange,
  checkedNickname,
  onChecked,
  busy,
  canSubmit,
  onSubmit,
  ko,
}) {
  const [checking, setChecking] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const active = useRef(true);
  const pending = useRef(false);
  const currentNickname = useRef(form.nickname);
  currentNickname.current = form.nickname;
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const valid = validateRegisterProfile(form);
  const checkNickname = async () => {
    if (pending.current || !Object.values(valid.nickname).every(Boolean))
      return;
    const nickname = form.nickname;
    pending.current = true;
    setChecking(true);
    setNicknameError('');
    try {
      await authApi.checkNickname(nickname);
      if (active.current && currentNickname.current === nickname)
        onChecked(nickname);
    } catch (error) {
      if (active.current && currentNickname.current === nickname)
        setNicknameError(
          error?.response?.data?.message ||
            (ko
              ? '닉네임을 확인하지 못했어요. 다른 닉네임 또는 재시도를 선택해 주세요.'
              : 'Could not confirm this nickname. Try another name or retry.'),
        );
    } finally {
      pending.current = false;
      if (active.current) setChecking(false);
    }
  };
  const update = event => onChange(event.target.name, event.target.value);
  return (
    <form onSubmit={onSubmit} aria-busy={busy}>
      <fieldset disabled={busy} className="le-signup-fields">
        <label className="le-signup-label" htmlFor="signup-nickname">
          {ko ? '닉네임' : 'Nickname'}
        </label>
        <div className="le-signup-input-row">
          <input
            id="signup-nickname"
            name="nickname"
            value={form.nickname}
            maxLength={10}
            autoComplete="nickname"
            aria-describedby="signup-nickname-help"
            onChange={event => {
              update(event);
              onChecked('');
              setNicknameError('');
            }}
            required
          />
          <button
            type="button"
            onClick={checkNickname}
            disabled={
              checking ||
              checkedNickname === form.nickname ||
              !Object.values(valid.nickname).every(Boolean)
            }>
            {checking
              ? '…'
              : checkedNickname === form.nickname && form.nickname
              ? ko
                ? '확인 완료'
                : 'Available'
              : ko
              ? '중복 확인'
              : 'Check'}
          </button>
        </div>
        <p id="signup-nickname-help" className="le-signup-hint">
          {ko
            ? '한글, 영문, 숫자로 2–10자'
            : '2–10 Korean or Latin letters, or digits'}
        </p>
        {nicknameError && (
          <p role="alert" className="le-signup-error">
            {nicknameError}
          </p>
        )}
        {checkedNickname && checkedNickname === form.nickname && (
          <p className="le-signup-hint" role="status">
            {ko
              ? '사용할 수 있는 닉네임이에요.'
              : 'This nickname is available.'}
          </p>
        )}
        <label className="le-signup-label" htmlFor="signup-name">
          {ko ? '이름' : 'Full name'}
        </label>
        <input
          id="signup-name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={update}
          required
        />
        <label className="le-signup-label" htmlFor="signup-birthday">
          {ko ? '생년월일' : 'Date of birth'}
        </label>
        <input
          id="signup-birthday"
          name="birthday"
          type="date"
          autoComplete="bday"
          value={form.birthday}
          onChange={update}
          required
          aria-describedby="signup-birthday-help"
        />
        <p id="signup-birthday-help" className="le-signup-hint">
          {form.birthday && !isEligibleBirthday(form.birthday)
            ? ko
              ? '생년월일을 확인해 주세요. 만 14세 이상 가입할 수 있어요.'
              : 'Check your date of birth. You must be at least 14.'
            : ko
            ? '가입 시 만 14세 이상이어야 해요.'
            : 'You must be at least 14 to sign up.'}
        </p>
        <fieldset className="le-signup-gender">
          <legend>{ko ? '성별' : 'Gender'}</legend>
          {[
            ['M', ko ? '남성' : 'Male'],
            ['F', ko ? '여성' : 'Female'],
          ].map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="gender"
                value={value}
                checked={form.gender === value}
                onChange={update}
                required
              />
              {label}
            </label>
          ))}
        </fieldset>
        <label className="le-signup-label" htmlFor="signup-password">
          {ko ? '비밀번호' : 'Password'}
        </label>
        <div className="le-signup-input-row">
          <input
            id="signup-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            minLength={8}
            maxLength={20}
            value={form.password}
            onChange={update}
            required
            aria-describedby="signup-password-help"
          />
          <button
            type="button"
            aria-pressed={showPassword}
            onClick={() => setShowPassword(value => !value)}>
            {showPassword ? (ko ? '숨기기' : 'Hide') : ko ? '보기' : 'Show'}
          </button>
        </div>
        <p id="signup-password-help" className="le-signup-hint">
          {ko
            ? '8–20자 · 영문 대문자, 소문자, 숫자, 특수문자 모두 포함'
            : '8–20 characters, including uppercase, lowercase, number and symbol'}
        </p>
        <label className="le-signup-label" htmlFor="signup-confirm">
          {ko ? '비밀번호 확인' : 'Confirm password'}
        </label>
        <input
          id="signup-confirm"
          name="passwordConfirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          maxLength={20}
          value={form.passwordConfirm}
          onChange={update}
          required
        />
        {form.passwordConfirm && !valid.passwordConfirm.isMatched && (
          <p className="le-signup-error">
            {ko ? '비밀번호가 일치하지 않아요.' : 'Passwords do not match.'}
          </p>
        )}
        <button
          type="submit"
          className="le-signup-primary"
          disabled={!canSubmit || busy || checking}>
          {busy
            ? ko
              ? '가입 중…'
              : 'Creating account…'
            : ko
            ? '회원가입 완료'
            : 'Join KODA'}{' '}
          <span aria-hidden="true">↗</span>
        </button>
      </fieldset>
    </form>
  );
}
