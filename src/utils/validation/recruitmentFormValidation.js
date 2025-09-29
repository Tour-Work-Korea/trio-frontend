// 문자열: 공백 제거 후 비어있지 않은지
const isNonEmpty = v => typeof v === 'string' && v.trim().length > 0;

// 숫자: 문자열이어도 숫자로 파싱해서 검증
const toNum = v =>
  v === '' || v === null || v === undefined ? NaN : Number(v);
const isFiniteNum = v => Number.isFinite(toNum(v));

// 날짜: Date 객체이거나 ISO 문자열이어도 허용
const toDate = v => (v instanceof Date ? v : v ? new Date(v) : null);
const isValidDate = v => {
  const d = toDate(v);
  return d instanceof Date && !isNaN(d.getTime());
};
const isDateOrder = (start, end) =>
  isValidDate(start) && isValidDate(end) && toDate(start) <= toDate(end);

// 배열: 최소 1개 이상 (← 기존 length >= 0 버그 수정)
const hasItems = arr => Array.isArray(arr) && arr.length > 0;

export const computeValidSections = data => {
  const {
    recruitTitle,
    recruitShortDescription,
    recruitStart,
    recruitEnd,
    entryStartDate,
    entryEndDate,
    recruitNumberMale,
    recruitNumberFemale,
    recruitNumberNoGender,
    recruitCondition, // [{id, title}] 배열 가정
    recruitMinAge,
    recruitMaxAge,
    workType,
    workDuration,
    workPart, // ['예약 관리', ...]
    welfare, // ['식사 제공', ...]
    recruitImage, // [{recruitImageUrl, isThumbnail}]
    recruitDetail,
    guesthouseId,
  } = data;

  // 숫자 강제 파싱 (TextInput에서 온 문자열도 처리)
  const male = toNum(recruitNumberMale);
  const female = toNum(recruitNumberFemale);
  const noGender = toNum(recruitNumberNoGender);
  const minAge = toNum(recruitMinAge);
  const maxAge = toNum(recruitMaxAge);

  // --- 섹션별 ---
  const title = isNonEmpty(recruitTitle);
  const guesthouse = Number.isInteger(guesthouseId) && guesthouseId > 0;
  const shortDescription = isNonEmpty(recruitShortDescription);

  // "모집 조건"
  const headcountOk =
    isFiniteNum(male) &&
    male >= 0 &&
    isFiniteNum(female) &&
    female >= 0 &&
    isFiniteNum(noGender) &&
    noGender >= 0 &&
    // 최소 1명 이상 조건을 원하면 아래 한 줄 추가:
    male + female + noGender > 0;

  const ageOk =
    isFiniteNum(minAge) &&
    isFiniteNum(maxAge) &&
    minAge >= 0 &&
    maxAge >= 0 &&
    minAge <= maxAge;

  const conditionTagsOk = hasItems(recruitCondition); // 최소 1개

  const recruitConditionValid =
    isValidDate(recruitStart) &&
    isValidDate(recruitEnd) &&
    isDateOrder(recruitStart, recruitEnd) &&
    isValidDate(entryStartDate) &&
    isValidDate(entryEndDate) &&
    isDateOrder(entryStartDate, entryEndDate) &&
    headcountOk &&
    ageOk &&
    conditionTagsOk;

  // "근무 조건"
  const workConditionValid =
    isNonEmpty(workType) &&
    hasItems(workPart) &&
    isNonEmpty(workDuration) &&
    hasItems(welfare);

  // "근무지 정보" (썸네일 필수면 some(img => img?.isThumbnail) 추가)
  const workInfoValid = hasItems(recruitImage); //isNonEmpty(location) &&

  // "상세 정보"
  const detailInfo = isNonEmpty(recruitDetail);

  return {
    title,
    guesthouse,
    shortDescription,
    recruitCondition: recruitConditionValid,
    workCondition: workConditionValid,
    workInfo: workInfoValid,
    detailInfo,
  };
};
