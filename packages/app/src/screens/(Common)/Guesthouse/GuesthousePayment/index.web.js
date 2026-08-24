import React from 'react';
import WebPaymentRedirect from '@web/WebPaymentRedirect';

export default function GuesthousePayment(props) {
  return <WebPaymentRedirect {...props} reservationType="GUESTHOUSE" />;
}
