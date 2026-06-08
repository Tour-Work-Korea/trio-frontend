const memoryStore = new Map();

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const AsyncStorage = {
  async getItem(key) {
    const storage = getStorage();
    return storage ? storage.getItem(key) : memoryStore.get(key) ?? null;
  },
  async setItem(key, value) {
    const stringValue = String(value);
    const storage = getStorage();
    if (storage) {
      storage.setItem(key, stringValue);
    } else {
      memoryStore.set(key, stringValue);
    }
  },
  async removeItem(key) {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(key);
    }
    memoryStore.delete(key);
  },
  async clear() {
    const storage = getStorage();
    if (storage) {
      storage.clear();
    }
    memoryStore.clear();
  },
};

export default AsyncStorage;
