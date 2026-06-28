const Geolocation = {
  getCurrentPosition: (success, error, options) => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error, options);
      return;
    }

    success?.({
      coords: {
        latitude: 33.4996,
        longitude: 126.5312,
      },
    });
  },
  watchPosition: () => 0,
  clearWatch: () => {},
  stopObserving: () => {},
};

export default Geolocation;
