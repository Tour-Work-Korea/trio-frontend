import React from 'react';
import {useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Header from '@components/Header';
import {BOOKING_RETURN_KEY} from '../auth/bookingReturn';
import {reservationBackTarget} from '../auth/reservationBack';

// Only the opt-in KODA build resolves MeetReservation's Header to this adapter.
// Other screens and non-KODA reservations retain the original Header behavior.
export default function KodaReservationHeader(props) {
  const route = useRoute();
  const {t} = useTranslation();
  const destination = reservationBackTarget(
    route.params,
    props.title === t('common.reservation'),
  );
  const onPress = destination
    ? () => {
        try {
          window.sessionStorage.removeItem(BOOKING_RETURN_KEY);
        } catch {
          // Returning does not depend on storage availability.
        }
        window.location.replace(destination);
      }
    : props.onPress;
  return <Header {...props} onPress={onPress} />;
}
