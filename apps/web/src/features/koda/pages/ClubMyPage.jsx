import React, {useEffect, useState} from 'react';
import useLocaleStore from '@stores/localeStore';
import useUserStore from '@stores/userStore';
import userMyApi from '@utils/api/userMyApi';
import authApi from '@utils/api/authApi';
import reservationPaymentApi from '@utils/api/reservationPaymentApi';
import {useClubAuth} from '../auth/ClubAuth';
import {eventRepository} from '../services/liveEventRepository';
import {
  selectClubReservations,
  reservationLoadStatus,
} from '../services/clubAccountModel';
import ClubReservationCard from '../components/ClubReservationCard';
import {useEventMetadata} from '../hooks';
import EventHeader from '../components/EventHeader';
import ClubNavigation from '../components/ClubNavigation';
import KodaLogo from '../components/KodaLogo';
import '../styles/koda.css';
import '../styles/koda-home.css';
import '../styles/koda-my.css';

function ProfileAvatar({photoUrl, nickname}) {
  const [failedUrl, setFailedUrl] = useState(null);
  const source =
    typeof photoUrl === 'string' && /^(https?:\/\/|\/(?!\/))/.test(photoUrl)
      ? photoUrl
      : null;
  return (
    <span className="le-my-avatar" aria-hidden="true">
      {source && failedUrl !== source ? (
        <img
          src={source}
          alt=""
          width="50"
          height="50"
          onError={() => setFailedUrl(source)}
        />
      ) : (
        Array.from(nickname)[0]
      )}
    </span>
  );
}

export default function ClubMyPage() {
  const language = useLocaleStore(state => state.language);
  const {ready, authenticated, openLogin} = useClubAuth();
  const userId = useUserStore(state => state.userProfile?.userId);
  const ko = language === 'ko';
  const [profile, setProfile] = useState({status: 'loading'});
  const [reservations, setReservations] = useState({status: 'loading'});
  const [attempt, setAttempt] = useState(0);
  const [tab, setTab] = useState('upcoming');
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  useEventMetadata({
    title: ko ? '마이페이지' : 'My KODA',
    description: 'Your moments at KODA CLUB.',
    path: '/koda/my/',
    language,
  });

  useEffect(() => {
    let active = true;
    setProfile({status: 'loading'});
    setReservations({status: 'loading'});
    if (!authenticated) return;
    userMyApi
      .getMyProfile()
      .then(({data}) => {
        if (!data || typeof data !== 'object')
          throw new Error('Invalid profile');
        if (active) setProfile({status: 'ready', data});
      })
      .catch(() => {
        if (active) setProfile({status: 'error'});
      });
    async function loadReservations() {
      try {
        if (!eventRepository.bookingEnabled) {
          if (active) setReservations({status: 'notConnected'});
          return;
        }
        const {data} = await reservationPaymentApi.getPartyReservationList();
        const {events} =
          await eventRepository.resolveReservationEvents(data);
        const list = selectClubReservations(data, events);
        if (active)
          setReservations({
            status: 'ready',
            data: list,
          });
      } catch (error) {
        if (active) setReservations({status: reservationLoadStatus(error)});
      }
    }
    void loadReservations();
    return () => {
      active = false;
    };
  }, [authenticated, userId, attempt]);

  const logout = async () => {
    if (logoutBusy) return;
    setLogoutBusy(true);
    setLogoutError(false);
    try {
      // Reuse the existing web endpoint; don't report success if cookie logout fails.
      await authApi.logout();
      useUserStore.getState().clearUser();
      setProfile({status: 'loading'});
      setReservations({status: 'loading'});
    } catch {
      setLogoutError(true);
    } finally {
      setLogoutBusy(false);
    }
  };
  const retry = () => setAttempt(value => value + 1);
  const tabs = [
    ['upcoming', ko ? '다가오는 모임' : 'Upcoming'],
    ['past', ko ? '지난 모임' : 'Past'],
  ];
  const selected =
    reservations.data?.filter(item => item.category === tab) || [];
  const nickname =
    profile.data?.nickname || profile.data?.name || (ko ? '친구' : 'friend');
  const browse = (
    <a
      className="le-my-browse"
      href={`/koda/gatherings/?lang=${language}`}>
      {ko ? '모임 둘러보기' : 'Explore meetups'}{' '}
      <span aria-hidden="true">↗</span>
    </a>
  );
  const error = (
    <div className="le-my-state" role="alert">
      <p>
        {ko
          ? '정보를 불러오지 못했어요.'
          : 'We couldn’t load this information.'}
      </p>
      <button onClick={retry} type="button">
        {ko ? '다시 시도' : 'Try again'}
      </button>
    </div>
  );
  return (
    <div className="le-page le-page--hub le-page--my">
      <a className="le-skip" href="#my-content">
        {ko ? '본문으로 이동' : 'Skip to content'}
      </a>
      <EventHeader detail />
      <ClubNavigation language={language} page="my" />
      <main id="my-content" className="le-my-content">
        <header className="le-my-heading">
          <p>YOUR LITTLE CORNER</p>
          <h1>My KODA.</h1>
        </header>
        {!ready ? (
          <p role="status" className="le-my-state">
            {ko ? '계정을 확인하고 있어요…' : 'Checking your account…'}
          </p>
        ) : !authenticated ? (
          <>
            <section className="le-my-welcome">
              <h2>
                {ko ? '다음 만남도, 여기서.' : 'Your next hello starts here.'}
              </h2>
              <p>
                {ko
                  ? '로그인하고 내 모임과 계정 정보를 확인하세요.'
                  : 'Log in to see your meetups and account.'}
              </p>
              <button
                className="le-my-primary"
                onClick={openLogin}
                type="button">
                {ko ? 'KODA 로그인' : 'Log in to KODA'}{' '}
                <span aria-hidden="true">↗</span>
              </button>
            </section>
            {browse}
          </>
        ) : (
          <>
            {profile.status === 'ready' ? (
              <section className="le-my-profile">
                <ProfileAvatar
                  key={userId}
                  photoUrl={profile.data.photoUrl}
                  nickname={nickname}
                />
                <div>
                  <p>{ko ? '반가워요,' : 'Good to see you,'}</p>
                  <h2>
                    {nickname}
                    {ko ? '님.' : '.'}
                  </h2>
                </div>
              </section>
            ) : profile.status === 'error' ? (
              error
            ) : (
              <p role="status">
                {ko ? '프로필을 불러오고 있어요…' : 'Loading your profile…'}
              </p>
            )}
            <section
              className="le-my-reservations"
              aria-labelledby="my-reservations-title">
              <div className="le-my-section-title">
                <h2 id="my-reservations-title">
                  {ko ? '나의 모임' : 'My meetups'}
                </h2>
                <span>MY GATHERINGS</span>
              </div>
              <div
                className="le-my-tabs"
                role="group"
                aria-label={ko ? '예약 분류' : 'Filter reservations'}>
                {tabs.map(([key, label]) => (
                  <button
                    type="button"
                    key={key}
                    aria-pressed={tab === key}
                    onClick={() => setTab(key)}>
                    {label}
                  </button>
                ))}
              </div>
              <div aria-live="polite">
                {reservations.status === 'notConnected' ? (
                  <div className="le-my-state">
                    <span aria-hidden="true">↗</span>
                    <h3>
                      {ko
                        ? '우리의 다음 만남을 준비하고 있어요.'
                        : 'Getting ready for our next hello.'}
                    </h3>
                    <p>
                      {ko
                        ? '예약 내역은 신청 기능 오픈과 함께 제공돼요.'
                        : 'Reservations will appear here when booking opens.'}
                    </p>
                  </div>
                ) : reservations.status === 'loading' ? (
                  <p role="status" className="le-my-state">
                    {ko ? '예약을 불러오고 있어요…' : 'Loading reservations…'}
                  </p>
                ) : reservations.status === 'authError' ? (
                  <div className="le-my-state" role="alert">
                    <h3>
                      {ko ? '신청 내역을 확인할 수 없어요.' : 'Unable to access your reservations.'}
                    </h3>
                    <p>
                      {ko
                        ? '로그인 인증 문제로 조회가 거절됐어요. 신청 내역이 없다는 뜻은 아니에요.'
                        : 'Authentication was declined. This does not mean you have no reservations.'}
                    </p>
                    <button onClick={retry} type="button">
                      {ko ? '다시 불러오기' : 'Reload reservations'}
                    </button>
                  </div>
                ) : reservations.status === 'error' ? (
                  error
                ) : selected.length ? (
                  selected.map(item => (
                    <ClubReservationCard
                      key={item.reservationId}
                      item={item}
                      language={language}
                    />
                  ))
                ) : (
                  <div className="le-my-state">
                    <p>
                      {ko
                        ? '이 분류에 해당하는 예약이 없어요.'
                        : 'No reservations in this category.'}
                    </p>
                  </div>
                )}
              </div>
              {browse}
            </section>
            <section
              className="le-my-account"
              aria-labelledby="my-account-title">
              <div className="le-my-section-title">
                <h2 id="my-account-title">{ko ? '계정 정보' : 'Account'}</h2>
                <span>MY ACCOUNT</span>
              </div>
              {profile.status === 'ready' && (
                <dl>
                  {[
                    [ko ? '닉네임' : 'Nickname', profile.data.nickname],
                    [ko ? '이메일' : 'Email', profile.data.email],
                    [ko ? '연락처' : 'Phone', profile.data.phone],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value || '—'}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <p>
                {ko
                  ? '게딱지와 함께 사용하는 계정이에요.'
                  : 'Your account is shared with Ddakji.'}
              </p>
            </section>
            <button
              type="button"
              className="le-my-logout"
              onClick={logout}
              disabled={logoutBusy}>
              {logoutBusy
                ? ko
                  ? '로그아웃 중…'
                  : 'Logging out…'
                : ko
                ? '로그아웃'
                : 'Log out'}
            </button>
            {logoutError && (
              <p role="alert">
                {ko
                  ? '로그아웃하지 못했어요. 다시 시도해 주세요.'
                  : 'Couldn’t log out. Please try again.'}
              </p>
            )}
          </>
        )}
      </main>
      <footer className="le-club-footer">
        <div>
          <KodaLogo />
          <a href={`/koda/?lang=${language}`}>
            {ko ? '클럽 메인으로' : 'Back to the club'} ↗
          </a>
        </div>
        <small>Hosted by Koin × Ddakji</small>
      </footer>
    </div>
  );
}
