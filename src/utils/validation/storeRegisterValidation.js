export const isValidName = name => name.trim().length > 0;

export const isValidBusinessType = type => type.trim().length > 0;

export const isValidEmployeeCount = count =>
  !isNaN(count) && parseInt(count, 10) >= 0;

export const isValidPhone = phone => /^0\d{8,}$/.test(phone);

export const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidAddress = address => address.trim().length > 0;

export const isValidBusinessNumber = number => /^\d{10}$/.test(number); // 숫자 10자리

export const isValidImageUri = uri => typeof uri === 'string' && uri.length > 0;

export const validateStoreForm1 = form => {
  const errors = [];

  if (!isValidName(form.name))
    errors.push('상호명 또는 법인명을 입력해주세요.');
  if (!isValidBusinessType(form.businessType))
    errors.push('사업장 유형을 입력해주세요.');
  if (!isValidEmployeeCount(form.employeeCount))
    errors.push('직원 수를 정확히 입력해주세요.');
  if (!isValidEmail(form.managerEmail))
    errors.push('담당자 이메일 형식이 올바르지 않습니다.');
  if (!isValidName(form.managerName))
    errors.push('담당자 이름을 입력해주세요.');

  return errors;
};

export const validateStoreForm2 = form => {
  const errors = [];

  if (!isValidAddress(form.address)) errors.push('주소를 입력해주세요.');
  // if (!isValidBusinessNumber(form.businessRegistrationNumber))
  //   errors.push('10자리 숫자 사업자등록번호를 입력해주세요.');
  if (!isValidImageUri(form.img.uri))
    errors.push('사업자 등록증 이미지를 첨부해주세요.');
  if (!isValidPhone(form.businessPhone))
    errors.push('전화번호 형식을 확인해주세요.');

  return errors;
};
// 전체 폼 유효성 검사
export const validateStoreForm = form => {
  const errors = [];

  if (!isValidName(form.name))
    errors.push('상호명 또는 법인명을 입력해주세요.');
  if (!isValidBusinessType(form.businessType))
    errors.push('사업장 유형을 입력해주세요.');
  if (!isValidEmployeeCount(form.employeeCount))
    errors.push('직원 수를 정확히 입력해주세요.');
  if (!isValidPhone(form.businessPhone))
    errors.push('전화번호 형식을 확인해주세요.');
  if (!isValidEmail(form.managerEmail))
    errors.push('담당자 이메일 형식이 올바르지 않습니다.');
  if (!isValidName(form.managerName))
    errors.push('담당자 이름을 입력해주세요.');
  if (!isValidAddress(form.address)) errors.push('주소를 입력해주세요.');
  // if (!isValidBusinessNumber(form.businessRegistrationNumber))
  //   errors.push('10자리 숫자 사업자등록번호를 입력해주세요.');
  if (!isValidImageUri(form.img.uri))
    errors.push('사업자 등록증 이미지를 첨부해주세요.');

  return errors;
};
