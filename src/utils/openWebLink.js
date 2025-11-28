import {Linking} from 'react-native';

export const openWebLink = async url => {
  if (!url || typeof url !== 'string') return;
  const safeUrl = url.trim();
  if (!/^https?:\/\//i.test(safeUrl)) return;
  try {
    const can = await Linking.canOpenURL(safeUrl);
    if (can) await Linking.openURL(safeUrl);
  } catch {
    console.warn('링크 열기 실패');
  }
};
