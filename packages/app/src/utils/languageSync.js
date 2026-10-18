import useLocaleStore from '@stores/localeStore';
import useUserStore from '@stores/userStore';
import userMyApi from '@utils/api/userMyApi';
import {normalizeLanguage, toApiLanguage} from '../i18n';

const accountQueues = new Map();

export const getLanguageAccountKey = () => {
  const {accessToken, userRole, userProfile} = useUserStore.getState();
  if (!accessToken || !userRole) {
    return null;
  }

  const identifier = userProfile?.userId ?? userProfile?.email;
  return identifier == null || identifier === ''
    ? null
    : `${userRole}:${identifier}`;
};

const updateCachedPreferredLanguage = language => {
  useUserStore.setState(state => ({
    userProfile: {
      ...state.userProfile,
      preferredLanguage: language,
    },
  }));
};

const enqueueServerUpdate = (accountKey, apiLanguage) => {
  const localeState = useLocaleStore.getState();
  localeState.setPendingServerLanguage(accountKey, apiLanguage);

  const previous = accountQueues.get(accountKey) ?? Promise.resolve();
  const task = previous
    .catch(() => undefined)
    .then(async () => {
      const response = await userMyApi.updatePreferredLanguage(apiLanguage);
      const savedLanguage = response?.data?.language ?? apiLanguage;
      const latestPending =
        useLocaleStore.getState().pendingServerLanguages[accountKey];

      updateCachedPreferredLanguage(savedLanguage);
      if (latestPending === apiLanguage) {
        useLocaleStore.getState().clearPendingServerLanguage(accountKey);
      }

      return response;
    });

  accountQueues.set(accountKey, task);
  task
    .finally(() => {
      if (accountQueues.get(accountKey) === task) {
        accountQueues.delete(accountKey);
      }
    })
    .catch(() => undefined);

  return task;
};

export const changeLanguageForCurrentUser = async language => {
  const normalizedLanguage = normalizeLanguage(language);
  await useLocaleStore.getState().setLanguage(normalizedLanguage);

  const accountKey = getLanguageAccountKey();
  if (!accountKey) {
    return {localOnly: true, synced: false};
  }

  try {
    await enqueueServerUpdate(accountKey, toApiLanguage(normalizedLanguage));
    return {localOnly: false, synced: true};
  } catch (error) {
    return {localOnly: false, synced: false, error};
  }
};

export const synchronizeLanguageForAuthenticatedAccount = async () => {
  const accountKey = getLanguageAccountKey();
  if (!accountKey) {
    return {skipped: true};
  }

  const stateBeforeRequest = useLocaleStore.getState();
  const revisionBeforeRequest = stateBeforeRequest.selectionRevision;
  const pendingLanguage = stateBeforeRequest.pendingServerLanguages[accountKey];

  if (pendingLanguage) {
    await enqueueServerUpdate(accountKey, pendingLanguage);
    return {source: 'pending'};
  }

  const response = await userMyApi.getPreferredLanguage();
  const stateAfterRequest = useLocaleStore.getState();

  if (
    stateAfterRequest.selectionRevision !== revisionBeforeRequest ||
    stateAfterRequest.hasExplicitSelection
  ) {
    const localLanguage = toApiLanguage(stateAfterRequest.language);
    if (response?.data?.language !== localLanguage) {
      await enqueueServerUpdate(accountKey, localLanguage);
    }
    return {source: 'local'};
  }

  const serverLanguage = normalizeLanguage(response?.data?.language);
  await stateAfterRequest.setLanguage(serverLanguage, {explicit: false});
  updateCachedPreferredLanguage(response?.data?.language ?? 'KO');
  return {source: 'server'};
};
