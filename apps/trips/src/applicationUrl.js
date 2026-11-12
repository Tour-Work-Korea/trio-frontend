export function applicationUrl(id) {
  if (!Number.isSafeInteger(Number(id)) || !/^[1-9]\d{0,9}$/.test(String(id))) {
    throw new Error('Invalid program ID');
  }
  return `https://ddakji.kr/contents/${id}`;
}
