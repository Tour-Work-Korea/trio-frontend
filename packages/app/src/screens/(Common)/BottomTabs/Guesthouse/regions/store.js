import {create} from 'zustand';
import {regionGuesthouseApi} from './api';

export const useGuesthouseRegionStore = create((set, get) => ({
  region: 'ALL',
  regions: [{code: 'ALL', displayName: '전체', mapBounds: null}],
  loaded: false,
  loading: false,
  setRegion: region => set({region}),
  loadRegions: async () => {
    if (get().loaded || get().loading) {
      return;
    }
    set({loading: true});
    try {
      const {data} = await regionGuesthouseApi.getServiceRegions();
      if (!Array.isArray(data) || !data.some(item => item.code === 'ALL')) {
        throw new Error('서비스 지역 응답 형식 오류');
      }
      set({regions: data, loaded: true});
    } catch (error) {
      console.warn('서비스 지역 조회 실패', error);
    } finally {
      set({loading: false});
    }
  },
}));
