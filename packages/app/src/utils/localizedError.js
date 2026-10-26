import i18n from '../i18n';

const normalizeCode = code =>
  String(code || '')
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .toUpperCase();

export const getLocalizedErrorMessage = (
  error,
  fallbackKey = 'errors.generic',
) => {
  const data = error?.response?.data ?? error?.data ?? error;
  const code = normalizeCode(data?.code);
  const key = code ? `errors.code.${code}` : '';

  return key && i18n.exists(key) ? i18n.t(key) : i18n.t(fallbackKey);
};

export const localizeApiError = error => {
  if (error?.response?.data && typeof error.response.data === 'object') {
    error.response.data = {
      ...error.response.data,
      originalMessage: error.response.data.message,
      message: getLocalizedErrorMessage(error),
    };
  }

  return error;
};
