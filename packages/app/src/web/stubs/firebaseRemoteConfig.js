const remoteConfig = () => ({
  setDefaults: async () => {},
  fetchAndActivate: async () => false,
  getValue: () => ({
    asString: () => '',
    asBoolean: () => false,
    asNumber: () => 0,
  }),
});

export default remoteConfig;
