const Geolocation = {
  getCurrentPosition: success => {
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
