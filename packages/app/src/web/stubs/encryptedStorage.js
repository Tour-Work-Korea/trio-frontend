const memoryStore = new Map();

const EncryptedStorage = {
  setItem: async (key, value) => {
    memoryStore.set(key, value);
  },
  getItem: async key => memoryStore.get(key) ?? null,
  removeItem: async key => {
    memoryStore.delete(key);
  },
  clear: async () => {
    memoryStore.clear();
  },
};

export default EncryptedStorage;
