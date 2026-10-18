import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

import i18n, {DEFAULT_LANGUAGE, normalizeLanguage} from '../i18n';

const LOCALE_STORAGE_KEY = 'locale-store';

const useLocaleStore = create(
  persist(
    set => ({
      language: DEFAULT_LANGUAGE,
      hasExplicitSelection: false,
      isInitialized: false,
      selectionRevision: 0,
      pendingServerLanguages: {},

      setLanguage: async (language, {explicit = true} = {}) => {
        const normalizedLanguage = normalizeLanguage(language);

        set(state => ({
          language: normalizedLanguage,
          hasExplicitSelection: explicit || state.hasExplicitSelection,
          selectionRevision: state.selectionRevision + 1,
        }));
        await i18n.changeLanguage(normalizedLanguage);
      },

      clearExplicitSelection: () => set({hasExplicitSelection: false}),
      setPendingServerLanguage: (accountKey, language) =>
        set(state => ({
          pendingServerLanguages: {
            ...state.pendingServerLanguages,
            [accountKey]: language,
          },
        })),
      clearPendingServerLanguage: accountKey =>
        set(state => {
          const pendingServerLanguages = {...state.pendingServerLanguages};
          delete pendingServerLanguages[accountKey];
          return {pendingServerLanguages};
        }),
    }),
    {
      name: LOCALE_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      skipHydration: true,
      partialize: state => ({
        language: state.language,
        hasExplicitSelection: state.hasExplicitSelection,
        pendingServerLanguages: state.pendingServerLanguages,
      }),
    },
  ),
);

let initializationPromise;

export const initializeLocale = () => {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        await useLocaleStore.persist.rehydrate();
      } finally {
        const language = normalizeLanguage(useLocaleStore.getState().language);

        try {
          await i18n.changeLanguage(language);
        } finally {
          useLocaleStore.setState({language, isInitialized: true});
        }
      }
    })();
  }

  return initializationPromise;
};

export default useLocaleStore;
