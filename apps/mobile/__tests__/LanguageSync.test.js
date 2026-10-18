import useLocaleStore from '@stores/localeStore';
import useUserStore from '@stores/userStore';
import userMyApi from '@utils/api/userMyApi';
import {
  changeLanguageForCurrentUser,
  synchronizeLanguageForAuthenticatedAccount,
} from '@utils/languageSync';

jest.mock('@utils/api/userMyApi', () => ({
  getPreferredLanguage: jest.fn(),
  updatePreferredLanguage: jest.fn(),
}));

const signedInUser = {
  accessToken: 'test-access-token',
  userRole: 'USER',
  userProfile: {userId: 17, email: 'user@example.com'},
};

describe('language account synchronization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserStore.setState({
      accessToken: null,
      userRole: null,
      userProfile: {userId: null, email: ''},
    });
    useLocaleStore.setState({
      language: 'ko',
      hasExplicitSelection: false,
      selectionRevision: 0,
      pendingServerLanguages: {},
    });
  });

  test('changes only local UI while signed out', async () => {
    const result = await changeLanguageForCurrentUser('en');

    expect(result).toEqual({localOnly: true, synced: false});
    expect(useLocaleStore.getState().language).toBe('en');
    expect(userMyApi.updatePreferredLanguage).not.toHaveBeenCalled();
  });

  test('keeps an explicit local choice and patches it after login', async () => {
    useUserStore.setState(signedInUser);
    useLocaleStore.setState({
      language: 'en',
      hasExplicitSelection: true,
    });
    userMyApi.getPreferredLanguage.mockResolvedValue({
      data: {language: 'KO', label: '한국어'},
    });
    userMyApi.updatePreferredLanguage.mockResolvedValue({
      data: {language: 'EN', label: 'English'},
    });

    await synchronizeLanguageForAuthenticatedAccount();

    expect(userMyApi.updatePreferredLanguage).toHaveBeenCalledWith('EN');
    expect(useLocaleStore.getState().language).toBe('en');
  });

  test.each(['JA', 'ZH'])('maps a legacy %s account value to English without overwriting the server', async language => {
    useUserStore.setState(signedInUser);
    userMyApi.getPreferredLanguage.mockResolvedValue({
      data: {language, label: language},
    });

    await synchronizeLanguageForAuthenticatedAccount();

    expect(useLocaleStore.getState().language).toBe('en');
    expect(useLocaleStore.getState().hasExplicitSelection).toBe(false);
    expect(userMyApi.updatePreferredLanguage).not.toHaveBeenCalled();
  });

  test('keeps a failed save pending under the current account only', async () => {
    useUserStore.setState(signedInUser);
    userMyApi.updatePreferredLanguage.mockRejectedValue(new Error('offline'));

    const result = await changeLanguageForCurrentUser('en');

    expect(result.synced).toBe(false);
    expect(useLocaleStore.getState().pendingServerLanguages).toEqual({
      'USER:17': 'EN',
    });
  });
});
