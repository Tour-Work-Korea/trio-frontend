const messaging = () => ({
  getToken: async () => null,
  onMessage: () => () => {},
  onNotificationOpenedApp: () => () => {},
  getInitialNotification: async () => null,
  setBackgroundMessageHandler: () => {},
  onTokenRefresh: () => () => {},
});

export default messaging;
