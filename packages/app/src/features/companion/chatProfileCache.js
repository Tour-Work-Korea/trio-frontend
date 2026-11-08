import {chatApi} from './api';
import {chatGeneration} from './chatAuth';

const TTL = 60000;
const LIMIT = 128;
let generation;
const profiles = new Map();

// Cache only display metadata, scoped to the current login session. Never cache
// read counts, room access, tokens, or signed image/download URLs here.
export function getChatProfile(userId) {
  const current = chatGeneration();
  if (generation !== current) {
    profiles.clear();
    generation = current;
  }
  const key = String(userId);
  const existing = profiles.get(key);
  if (existing && existing.expires > Date.now()) {
    return existing.promise;
  }
  if (profiles.size >= LIMIT) {
    profiles.delete(profiles.keys().next().value);
  }
  const entry = {expires: Infinity};
  entry.promise = chatApi
    .profile(userId)
    .then(({data}) => {
      entry.data = data;
      entry.expires = Date.now() + TTL;
      return data;
    })
    .catch(error => {
      if (profiles.get(key) === entry) {
        profiles.delete(key);
      }
      throw error;
    });
  profiles.set(key, entry);
  return entry.promise;
}

export function peekChatProfile(userId) {
  if (generation !== chatGeneration()) {
    return undefined;
  }
  const entry = profiles.get(String(userId));
  return entry?.expires > Date.now() ? entry.data : undefined;
}
