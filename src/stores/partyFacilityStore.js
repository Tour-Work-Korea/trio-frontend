import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import hostMeetApi from '@utils/api/hostMeetApi';

const usePartyFacilityStore = create(
  persist(
    (set, get) => ({
      facilities: [],
      lastFetchedAt: null,
      isLoading: false,

      fetchPartyFacilities: async ({force = false} = {}) => {
        if (get().isLoading) {
          return get().facilities;
        }
        if (!force && get().facilities.length > 0) {
          return get().facilities;
        }

        set({isLoading: true});
        try {
          const res = await hostMeetApi.getPartyFacilities();
          const list = Array.isArray(res?.data) ? res.data : [];
          set({facilities: list, lastFetchedAt: Date.now()});
          return list;
        } catch (e) {
          console.warn(
            'getPartyFacilities error',
            e?.response?.data || e?.message,
          );
          return get().facilities;
        } finally {
          set({isLoading: false});
        }
      },

      clearPartyFacilities: () =>
        set({
          facilities: [],
          lastFetchedAt: null,
          isLoading: false,
        }),
    }),
    {
      name: 'party-facility-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default usePartyFacilityStore;
