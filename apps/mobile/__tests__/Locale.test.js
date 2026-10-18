import AsyncStorage from '@react-native-async-storage/async-storage';

import i18n, {
  normalizeLanguage,
  toAcceptLanguage,
  toApiLanguage,
} from '@trio/app/src/i18n';
import useLocaleStore, {initializeLocale} from '@stores/localeStore';

describe('locale foundation', () => {
  beforeAll(async () => {
    await AsyncStorage.clear();
    await initializeLocale();
  });

  afterAll(async () => {
    await useLocaleStore.getState().setLanguage('ko', {explicit: false});
    useLocaleStore.getState().clearExplicitSelection();
    await useLocaleStore.persist.clearStorage();
  });

  test.each([
    ['ko', 'ko'],
    ['KO', 'ko'],
    ['ko-KR', 'ko'],
    ['en', 'en'],
    ['EN', 'en'],
    ['en-US', 'en'],
    ['JA', 'en'],
    ['zh-CN', 'en'],
    ['unsupported', 'ko'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeLanguage(input)).toBe(expected);
  });

  test('maps frontend languages to API and request-header values', () => {
    expect(toApiLanguage('ko')).toBe('KO');
    expect(toApiLanguage('en')).toBe('EN');
    expect(toAcceptLanguage('ko')).toBe('ko');
    expect(toAcceptLanguage('en')).toBe('en');
  });

  test('changes translations immediately and records an explicit choice', async () => {
    await useLocaleStore.getState().setLanguage('en');

    expect(useLocaleStore.getState().language).toBe('en');
    expect(useLocaleStore.getState().hasExplicitSelection).toBe(true);
    expect(i18n.t('common.cancel')).toBe('Cancel');

    await useLocaleStore.getState().setLanguage('ko');
    expect(i18n.t('common.cancel')).toBe('취소');
  });
});
