import useUserStore from '@stores/userStore';
import EncryptedStorage from 'react-native-encrypted-storage';

// logger.js
const ON = __DEV__; // 개발 환경에서만 로깅

export const mask = token => {
  if (!token || typeof token !== 'string') return String(token);
  const head = token.slice(0, 3);
  const tail = token.slice(-4);
  return `${head}…${tail} (len:${token.length})`;
};

export const log = {
  info: (...args) => ON && console.log('[INFO]', ...args),
  warn: (...args) => ON && console.warn('[WARN]', ...args),
  error: (...args) => ON && console.error('[ERROR]', ...args),
  time: label => ON && console.time(label),
  timeEnd: label => ON && console.timeEnd(label),
};

export const probeWriteRead = async () => {
  try {
    const k = 'probe-token';
    await EncryptedStorage.setItem(k, 'ok');
    const v = await EncryptedStorage.getItem(k);
    log.info('🧪 probe write/read:', v === 'ok');
    await EncryptedStorage.removeItem(k);
  } catch (e) {
    log.warn('probeWriteRead error:', e?.message);
  }
};

export const dumpSecureState = async () => {
  try {
    const rt = await EncryptedStorage.getItem('refresh-token');
    const {accessToken, userRole} = useUserStore.getState();
    log.info(
      '🔍 dumpSecureState',
      '\n  refresh?',
      !!rt,
      '\n  accessToken?',
      !!accessToken,
      '\n  userRole=',
      userRole,
    );
  } catch (e) {
    log.warn('dumpSecureState error:', e?.message);
  }
};
