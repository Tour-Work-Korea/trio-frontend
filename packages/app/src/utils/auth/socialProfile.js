const cleanSocialValue = value => {
  if (value == null) {
    return '';
  }

  const text = String(value);
  return text === 'null' || text === 'undefined' ? '' : text;
};

const normalizeGender = value => {
  const gender = cleanSocialValue(value).toLowerCase();

  if (gender === 'female' || gender === 'f') {
    return 'F';
  }
  if (gender === 'male' || gender === 'm') {
    return 'M';
  }

  return '';
};

const normalizeBirthday = ({birthday, birthyear}) => {
  const rawBirthday = cleanSocialValue(birthday);
  const rawBirthyear = cleanSocialValue(birthyear);

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawBirthday)) {
    return rawBirthday;
  }

  if (/^\d{4}$/.test(rawBirthyear) && /^\d{2}-\d{2}$/.test(rawBirthday)) {
    return `${rawBirthyear}-${rawBirthday}`;
  }

  if (/^\d{4}$/.test(rawBirthyear) && /^\d{4}$/.test(rawBirthday)) {
    return `${rawBirthyear}-${rawBirthday.slice(0, 2)}-${rawBirthday.slice(2)}`;
  }

  return '';
};

export const normalizeSocialProfile = data => {
  const profile = data?.profile || data?.socialProfile || data?.response || {};

  return {
    email: cleanSocialValue(profile.email || data?.email),
    nickname: cleanSocialValue(profile.nickname || data?.nickname),
    name: cleanSocialValue(profile.name || data?.name),
    birthday: normalizeBirthday({
      birthday: profile.birthday || data?.birthday,
      birthyear: profile.birthyear || data?.birthyear,
    }),
    gender: normalizeGender(profile.gender || data?.gender),
  };
};

export const mergeSocialProfiles = (...profiles) =>
  profiles.reduce(
    (merged, profile = {}) => ({
      email: merged.email || profile.email || '',
      nickname: merged.nickname || profile.nickname || '',
      name: merged.name || profile.name || '',
      birthday: merged.birthday || profile.birthday || '',
      gender: merged.gender || profile.gender || '',
    }),
    {},
  );
