export const getPartyGuesthouseId = party =>
  party?.guesthouseId ??
  party?.guesthouse?.id ??
  party?.profileSummary?.guesthouseId ??
  null;
