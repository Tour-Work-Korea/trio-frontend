const PAYMENT_WINDOW_PREFIX = 'trio-payment';

export const prepareWebPaymentWindow = () => {
  if (typeof window === 'undefined') {
    return {name: null, windowRef: null};
  }

  const name = `${PAYMENT_WINDOW_PREFIX}-${Date.now()}`;
  const windowRef = window.open('about:blank', name);

  return {name, windowRef};
};
