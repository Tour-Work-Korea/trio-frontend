const foregroundListeners = new Set();

export const subscribeForegroundNotification = listener => {
  foregroundListeners.add(listener);

  return () => {
    foregroundListeners.delete(listener);
  };
};

export const publishForegroundNotification = remoteMessage => {
  foregroundListeners.forEach(listener => {
    try {
      listener(remoteMessage);
    } catch (error) {
      console.warn('foreground notification listener error:', error);
    }
  });
};
