import {create} from 'zustand';

export const useStaffRegionStore = create(set => ({
  region: 'ALL',
  setRegion: region => set({region}),
}));

export const withRecruitRegion = (params = {}, region = 'ALL') => {
  const {locationIds, ...compatibleParams} = params;

  return {
    ...compatibleParams,
    region: region || 'ALL',
  };
};
