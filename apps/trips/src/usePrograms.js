import {useCallback, useEffect, useState} from 'react';
import {
  eventCards,
  fetchDateEvents,
  REGROUND_GUESTHOUSE_ID,
} from './programsApi.js';

export default function usePrograms(
  programs,
  guesthouseId = REGROUND_GUESTHOUSE_ID,
) {
  const [state, setState] = useState({status: 'loading', events: []});
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt(value => value + 1), []);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    setState({status: 'loading', events: []});
    fetchDateEvents({guesthouseId, signal: controller.signal})
      .then(events => {
        if (active) setState({status: 'ready', events});
      })
      .catch(() => {
        if (active) setState({status: 'error', events: []});
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [guesthouseId, attempt]);
  return {
    status: state.status,
    cards: eventCards(state.events, programs),
    retry,
  };
}
