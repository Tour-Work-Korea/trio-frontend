import {create} from 'zustand';

import userGuesthouseApi from '@utils/api/userGuesthouseApi';

const useAmenityStore = create((set, get) => ({
  amenities: [],
  isLoading: false,
  hasLoaded: false,

  fetchAmenities: async ({force = false} = {}) => {
    const {isLoading, hasLoaded} = get();

    if (isLoading || (hasLoaded && !force)) {
      return get().amenities;
    }

    set({isLoading: true});

    try {
      const response = await userGuesthouseApi.getGuesthouseAmenities();
      const amenities = Array.isArray(response.data) ? response.data : [];

      set({
        amenities,
        hasLoaded: true,
        isLoading: false,
      });

      return amenities;
    } catch (error) {
      console.warn('게스트하우스 편의시설 조회 실패', error);
      set({isLoading: false});
      return get().amenities;
    }
  },
}));

export default useAmenityStore;
