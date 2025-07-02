//닉네임 유효성 검사
export const hasNoSpecialChars = nickname =>
  /^[가-힣a-zA-Z0-9]*$/.test(nickname); // 특수문자 제외
export const isNicknameLengthValid = nickname =>
  nickname.length >= 2 && nickname.length <= 10;

//비밀번호 유효성 검사
export const hasUppercase = password => /[A-Z]/.test(password);
export const hasLowercase = password => /[a-z]/.test(password);
export const hasNumber = password => /\d/.test(password);
export const hasSpecialChars = password => /[^A-Za-z0-9]/.test(password);
export const isPasswordLengthValid = password =>
  password.length >= 8 && password.length <= 20;

export const isPasswordMatched = (pw, confirmPw) => pw === confirmPw;

export const validateRegisterInfo = form => {
  const errors = [];

  // 이름
  if (!form.name?.trim() && form.name.length > 0) {
    errors.push('name');
  }
  // 생년월일
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birthday)) {
    errors.push('birthday');
  }
  // 성별
  if (form.gender !== 'M' && form.gender !== 'F') {
    errors.push('gender');
  }
  return errors;
};

export const validateRegisterProfile = form => {
  return {
    nickname: {
      hasNoSpecialChars: hasNoSpecialChars(form.nickname),
      isLengthValid: isNicknameLengthValid(form.nickname),
    },
    password: {
      hasUpperLowercase:
        hasUppercase(form.password) && hasLowercase(form.password),
      // hasLowercase: hasLowercase(form.password),
      hasNumber: hasNumber(form.password),
      isLengthValid: isPasswordLengthValid(form.password),
      hasSpecialChar: hasSpecialChars(form.password),
    },
    passwordConfirm: {
      isMatched: isPasswordMatched(form.password, form.passwordConfirm),
    },
  };
};
