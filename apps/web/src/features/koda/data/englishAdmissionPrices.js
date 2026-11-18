// Organizer-set USD admission prices, not exchange-rate conversions.
// The KRW check prevents a later server price change from showing a stale USD fee.
export const englishAdmissionPrices = {
  'party-3982': {
    krwAmount: 20000,
    usdAmount: 17,
    earlyBird: {
      krwAmount: 15000,
      usdAmount: 12.5,
      startsAt: '2026-11-08T00:00:00+09:00',
      endsAt: '2026-11-15T00:00:00+09:00',
    },
    // Organizer-confirmed USD fees; option IDs match the current admin options.
    discounts: [
      {
        optionId: 1648,
        krwAmount: 15000,
        usdAmount: 13,
        label: {ko: '재참여', en: 'Returning participant'},
      },
      {
        optionId: 1649,
        krwAmount: 17000,
        usdAmount: 15,
        label: {ko: '친구 동반 (1인당)', en: 'Bring a friend (per person)'},
      },
    ],
  },
};
