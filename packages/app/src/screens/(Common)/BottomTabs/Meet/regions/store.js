import {create} from 'zustand';

export const useMeetRegionStore = create(set => ({
  region: 'ALL',
  setRegion: region => set({region}),
}));
