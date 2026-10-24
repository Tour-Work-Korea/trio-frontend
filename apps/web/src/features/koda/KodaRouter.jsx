import React, {useEffect, useState} from 'react';
import useLocaleStore from '@stores/localeStore';
import {eventRepository} from './services/liveEventRepository';
import KodaHomePage from './pages/KodaHomePage';
import KodaGatheringsPage from './pages/KodaGatheringsPage';
import KodaAboutPage from './pages/KodaAboutPage';
import ClubMyPage from './pages/ClubMyPage';
import ClubSignup from './pages/ClubSignup';
import KodaEventPage from './pages/KodaEventPage';
import EventHeader from './components/EventHeader';
import PageMotion from './components/PageMotion';
import {useEventMetadata} from './hooks';
import {copy} from './data/copy';

function ResourceMessage({status, retry}) {
  const language = useLocaleStore(state => state.language);
  const labels = copy[language];
  const message = labels[status];
  useEventMetadata({
    title: labels.page,
    description: message,
    path: window.location.pathname + window.location.search,
    language,
  });
  return (
    <div className="le-page le-page--detail">
      <EventHeader detail />
      <main className="le-resource-state" aria-busy={status === 'loading'}>
        <p role={status === 'error' ? 'alert' : 'status'}>{message}</p>
        {status === 'error' && (
          <button className="le-share" onClick={retry} type="button">
            {labels.retry}
          </button>
        )}
        {status !== 'loading' && (
          <a href={`/koda/?lang=${language}`}>
            {labels.backToMeetups} →
          </a>
        )}
      </main>
    </div>
  );
}

export default function KodaRouter({request}) {
  const [attempt, setAttempt] = useState(0);
  const [resource, setResource] = useState({status: 'loading'});
  useEffect(() => {
    // Club and app introductions do not depend on the events API.
    if (['about', 'my', 'join'].includes(request.type)) return;
    let active = true;
    setResource({status: 'loading'});
    async function read() {
      try {
        const data =
          request.type === 'home' || request.type === 'gatherings'
            ? await eventRepository.listEvents()
            : request.id
            ? await eventRepository.getEventDetails(request.id)
            : null;
        if (active)
          setResource(data ? {status: 'ready', data} : {status: 'notFound'});
      } catch {
        if (active) setResource({status: 'error'});
      }
    }
    read();
    return () => {
      active = false;
    };
  }, [request.type, request.id, attempt]);

  if (request.type === 'join') return <ClubSignup />;
  if (request.type === 'my')
    return (
      <PageMotion>
        <ClubMyPage />
      </PageMotion>
    );
  if (request.type === 'about')
    return (
      <PageMotion>
        <KodaAboutPage />
      </PageMotion>
    );
  if (resource.status !== 'ready')
    return (
      <ResourceMessage
        status={resource.status}
        retry={() => setAttempt(value => value + 1)}
      />
    );
  if (request.type === 'gatherings')
    return (
      <PageMotion>
        <KodaGatheringsPage {...resource.data} />
      </PageMotion>
    );
  return (
    <PageMotion>
      {request.type === 'home' ? (
        <KodaHomePage {...resource.data} />
      ) : (
        <KodaEventPage {...resource.data} />
      )}
    </PageMotion>
  );
}
