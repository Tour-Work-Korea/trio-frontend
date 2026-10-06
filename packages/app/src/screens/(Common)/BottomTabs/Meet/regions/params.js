export const withPartyRegion = (params = {}, region = 'ALL') => ({
  ...params,
  region: region || 'ALL',
});
