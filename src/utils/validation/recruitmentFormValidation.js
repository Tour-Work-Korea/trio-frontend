// 각 필드 유효성 검사 함수
export const isValidString = value =>
  typeof value === 'string' && value.trim().length > 0;
export const isValidNumber = value =>
  typeof value === 'number' && !isNaN(value);
export const isValidDate = date =>
  date instanceof Date && !isNaN(date.getTime());
export const isValidImageArray = arr => Array.isArray(arr) && arr.length > 0;
export const isValidHashtagArray = arr =>
  Array.isArray(arr) && arr.length > 0 && arr.length <= 3;
export const isValidAgeRange = (min, max) =>
  isValidNumber(min) && isValidNumber(max) && min <= max;

// 전체 폼 유효성 검사
export const validateRecruitForm = form => {
  const errors = [];

  if (!isValidString(form.recruitTitle))
    errors.push('공고 제목을 입력해주세요.');
  if (!isValidString(form.recruitShortDescription))
    errors.push('공고 소개를 입력해주세요.');
  if (!isValidDate(form.recruitStart) || !isValidDate(form.recruitEnd))
    errors.push('모집 시작일과 종료일을 모두 선택해주세요.');
  if (!isValidDate(form.workStartDate) || !isValidDate(form.workEndDate))
    errors.push('근무 시작일과 종료일을 모두 선택해주세요.');
  if (
    !isValidNumber(form.recruitNumberMale) &&
    !isValidNumber(form.recruitNumberFemale)
  )
    errors.push('모집 인원을 입력해주세요.');
  if (!isValidAgeRange(form.recruitMinAge, form.recruitMaxAge))
    errors.push('올바른 나이 범위를 입력해주세요.');
  if (!isValidString(form.location)) errors.push('근무 지역을 입력해주세요.');
  if (!isValidString(form.workType)) errors.push('근무 형태를 입력해주세요.');
  if (!isValidString(form.workPart)) errors.push('주요 업무를 입력해주세요.');
  if (!isValidString(form.recruitDetail))
    errors.push('상세 소개를 입력해주세요.');
  if (!isValidHashtagArray(form.hashtags))
    errors.push('태그는 1개 이상, 3개 이하로 선택해주세요.');
  if (!isValidNumber(form.guesthouseId))
    errors.push('게스트하우스를 선택해주세요.');

  return errors;
};
