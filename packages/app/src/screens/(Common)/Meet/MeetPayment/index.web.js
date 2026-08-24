import React from 'react';
import WebPaymentRedirect from '@web/WebPaymentRedirect';

export default function MeetPayment(props) {
  return <WebPaymentRedirect {...props} reservationType="PARTY" />;
}
