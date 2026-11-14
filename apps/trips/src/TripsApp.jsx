import React, {useEffect, useRef, useState} from 'react';
import TripsHeader from './TripsHeader.jsx';
import TripsIndex from './TripsIndex.jsx';
import {useSales, SectionTitle, Schedule, Booking} from './TripSections.jsx';
import TripsPrograms from './TripsPrograms.jsx';
import TripsLogin from './TripsLogin.jsx';
import {WorkationStory} from './WorkationStory.jsx';
import AppDownload from './AppDownload.jsx';
import {ApplyLink} from './ApplyLink.jsx';
import {formatPrice, optionPrice, tripRoute} from './model.js';

const Arrow = () => <span aria-hidden="true">↗</span>;
function Header() {
  return (
    <>
      <a className="nm-skip" href="#trip-main">
        본문으로 건너뛰기
      </a>
      <TripsHeader detail />
    </>
  );
}
function Footer() {
  return (
    <footer className="nm-footer">
      <AppDownload />
      <div className="nm-footer-bottom">
        <nav className="nm-footer-contacts" aria-label="게딱지 연락처">
          <a
            href="https://www.instagram.com/guesthouse_ddakji/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="게딱지 인스타그램 (새 탭)"
            title="게딱지 인스타그램">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle
                cx="17.5"
                cy="6.5"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </a>
          <a
            href="tel:01041230075"
            aria-label="게딱지에 전화하기: 010-4123-0075"
            title="전화 010-4123-0075">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M21 16.5v3a2 2 0 0 1-2.2 2 18 18 0 0 1-7.8-2.8 18 18 0 0 1-5.5-5.5 18 18 0 0 1-2.8-7.9A2 2 0 0 1 4.7 3h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1l-1.3 1.3a14 14 0 0 0 5.5 5.5l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 1.2Z" />
            </svg>
          </a>
          <a
            href="mailto:support@ddakji.kr"
            aria-label="게딱지에 이메일 보내기: support@ddakji.kr"
            title="이메일 support@ddakji.kr">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </a>
        </nav>
        <small>© 게딱지 · 낭만모드</small>
      </div>
    </footer>
  );
}
function ShareButton({trip}) {
  const [notice, setNotice] = useState('');
  const [manual, setManual] = useState(false);
  const url = `https://ddakji.kr/trips/${trip.slug}/`;
  async function share() {
    try {
      if (navigator.share)
        await navigator.share({title: `${trip.title} | 낭만모드`, url});
      else {
        await navigator.clipboard.writeText(url);
        setNotice('여행 링크를 복사했어요.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setManual(true);
        setNotice('아래 링크를 복사해주세요.');
      }
    }
  }
  return (
    <div className="nm-share">
      <button type="button" onClick={share} aria-label="여행 공유하기">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 16V3m0 0L7 8m5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
        </svg>
      </button>
      <span role="status">{notice}</span>
      {manual && (
        <input
          aria-label="공유할 여행 링크"
          readOnly
          value={url}
          onFocus={event => event.target.select()}
        />
      )}
    </div>
  );
}
function Photo({
  photo,
  onOpen,
  className = '',
  priority = false,
  expandable = true,
}) {
  const image = (
    <img
      src={photo.src}
      alt={photo.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      width="1024"
      height="1280"
    />
  );
  return expandable ? (
    <button
      className={`nm-photo ${className}`}
      type="button"
      onClick={() => onOpen(photo)}
      aria-label={`${photo.alt} 크게 보기`}>
      {image}
      <span aria-hidden="true">↗</span>
    </button>
  ) : (
    <div className={`nm-photo ${className}`}>{image}</div>
  );
}
function PhotoDialog({photo, onClose}) {
  const ref = useRef(null);
  useEffect(() => {
    if (photo && !ref.current.open) ref.current.showModal();
    if (!photo && ref.current.open) ref.current.close();
  }, [photo]);
  return (
    <dialog
      ref={ref}
      className="nm-lightbox"
      onClose={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) ref.current.close();
      }}
      aria-label="여행 사진 크게 보기">
      <button
        className="nm-lightbox-close"
        autoFocus
        onClick={() => ref.current.close()}
        aria-label="사진 닫기">
        닫기 ×
      </button>
      {photo && (
        <figure>
          <img src={photo.src} alt={photo.alt} />
          <figcaption>{photo.alt}</figcaption>
          <a
            className="nm-text-link"
            href={photo.src}
            target="_blank"
            rel="noreferrer">
            원본 크기로 열기 <Arrow />
          </a>
        </figure>
      )}
    </dialog>
  );
}
function ClassCard({item, sale, onOpen}) {
  const regular = optionPrice(sale, item.regularOptionId, item.regularPrice);
  const discounted = optionPrice(sale, item.tripOptionId, item.tripPrice);
  return (
    <article className="nm-class-card" id={`class-${item.partyId}`}>
      <div className="nm-class-overview">
        <Photo photo={{src: item.image, alt: item.alt}} onOpen={onOpen} />
        <div>
          <p className="nm-eyebrow">{item.date}</p>
          <h3>{item.title}</h3>
          <p className="nm-class-subtitle">{item.subtitle}</p>
        </div>
      </div>
      {item.description && (
        <p className="nm-class-description">{item.description}</p>
      )}
      <p className="nm-class-time">
        {item.date} · {item.time}
      </p>
      <div className="nm-class-price">
        <span>
          일반 <b>{formatPrice(regular)}</b>
        </span>
        <strong>
          트립 동반 신청 <b>{formatPrice(discounted)}</b>
        </strong>
      </div>
      <details className="nm-more">
        <summary>
          참여 안내 자세히 보기 <span aria-hidden="true">＋</span>
        </summary>
        <ul>
          {item.notes.map(note => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <Photo photo={{src: item.image, alt: item.alt}} onOpen={onOpen} />
      </details>
      <ApplyLink id={item.partyId} className="nm-text-link">
        {sale?.isApplyOpen === false
          ? '클래스 모집 상태 확인'
          : '클래스 신청하기'}{' '}
        <Arrow />
      </ApplyLink>
    </article>
  );
}
function Detail({trip}) {
  const sales = useSales(trip);
  const [photo, setPhoto] = useState(null);
  const sale = sales[trip.partyId];
  const fullPrice = optionPrice(
    sale,
    trip.priceOptions[0].id,
    trip.priceOptions[0].amount,
    trip.priceOptions.length === 1,
  );
  const ended = Date.now() > new Date(trip.endDate).getTime();
  useEffect(() => {
    document.title = `${trip.title} | 낭만모드 by 게딱지`;
  }, [trip]);
  return (
    <>
      <Header />
      <main id="trip-main">
        <section className="nm-hero" aria-labelledby="trip-title">
          <div
            className={`nm-hero-photo${
              trip.heroIsPhoto ? ' wk-detail-photo' : ''
            }`}>
            <Photo
              photo={{src: trip.hero, alt: trip.heroAlt}}
              onOpen={setPhoto}
              priority
              expandable={false}
            />
          </div>
          <div className="nm-hero-copy">
            <p className="nm-collaboration">{trip.collaboration}</p>
            <div className="nm-hero-title-row">
              <h1 id="trip-title">{trip.title}</h1>
              <ShareButton trip={trip} />
            </div>
            <p className="nm-hero-subtitle">{trip.subtitle}</p>
          </div>
        </section>
        <section className="nm-at-a-glance" aria-label="여행 핵심 정보">
          <dl className="nm-facts">
            <div>
              <dt>일정</dt>
              <dd>
                {trip.datesShort}
                <small>
                  {trip.year}년 · {trip.duration}
                </small>
              </dd>
            </div>
            <div>
              <dt>장소</dt>
              <dd>
                {trip.stay.name}
                <small>{trip.location}</small>
              </dd>
            </div>
            <div>
              <dt>인원</dt>
              <dd>최대 {trip.capacity}명</dd>
            </div>
            <div>
              <dt>참가비</dt>
              <dd>
                {formatPrice(fullPrice)}
                <small>{trip.duration} · 1인 얼리버드</small>
              </dd>
            </div>
          </dl>
        </section>
        <nav className="nm-section-nav" aria-label="여행 상세 목차">
          <a href="#story">소개</a>
          <a href="#schedule">일정</a>
          <a href="#classes">선택 프로그램</a>
          <a href="#booking">신청 안내</a>
        </nav>
        <div id="story">
          <WorkationStory trip={trip} />
        </div>
        <Schedule trip={trip} />
        <Booking trip={trip} sale={sale} />
        <section id="classes" className="nm-section nm-classes">
          <SectionTitle
            title="원할 때만, 클래스와 파티"
            subtitle="워케이션에 포함되지 않는 선택 프로그램이에요. 원하는 것만 별도 신청·결제해요."
          />
          <div className="nm-classes-grid">
            {trip.classes.map(item => (
              <ClassCard
                key={item.partyId}
                item={item}
                sale={sales[item.partyId]}
                onOpen={setPhoto}
              />
            ))}
          </div>
          <p className="nm-note">
            트립 예약 시 함께 신청하면 각 클래스 1만 원 할인. 가죽 북어 클래스는
            현장 추가 신청 시 할인이 적용되지 않아요.
          </p>
          <article className="wk-optional-party-detail">
            <small>선택 파티 · 별도 신청·비용</small>
            <h3>{trip.optionalParty.title}</h3>
            <p>
              {trip.optionalParty.date} · 호스트 {trip.optionalParty.hosts}
            </p>
            <p>체크아웃 이후, 더 함께하고 싶은 분만 참여해요.</p>
            <a className="nm-text-link" href={trip.optionalParty.url}>
              연말파티 자세히 보기 <Arrow />
            </a>
          </article>
        </section>
        <section id="stay" className="nm-section nm-stay">
          <SectionTitle title="어디에서 머무나요?" />
          <p className="nm-stay-name">{trip.stay.name}</p>
          <p className="nm-stay-description">{trip.stay.description}</p>
          <p className="nm-stay-brief">
            남녀 분리 공용객실 · 워크스페이스 · 무료 Wi-Fi
          </p>
          <address>{trip.stay.address}</address>
          <details className="nm-more">
            <summary>
              숙소 사진과 위치 보기 <span aria-hidden="true">＋</span>
            </summary>
            <div className="nm-stay-pictures">
              {trip.stay.images.map(item => (
                <Photo key={item.src} photo={item} onOpen={setPhoto} />
              ))}
            </div>
            <div className="nm-stay-links">
              <a className="nm-text-link" href={trip.stay.url}>
                숙소 자세히 보기 <Arrow />
              </a>
              <a
                className="nm-text-link"
                href={trip.stay.mapUrl}
                target="_blank"
                rel="noreferrer">
                지도 보기 <Arrow />
              </a>
            </div>
          </details>
        </section>
      </main>
      <Footer />
      <aside className="nm-booking-bar" aria-label="트립 신청">
        <div>
          <span>{trip.duration} · 얼리버드 11.19까지</span>
          <strong>{formatPrice(fullPrice)}</strong>
        </div>
        <a className="nm-button" href={ended ? trip.contentUrl : '#booking'}>
          {ended
            ? '지난 여행 보기'
            : sale?.isApplyOpen === false
            ? '모집 상태 확인'
            : '참가비 보기'}{' '}
          <Arrow />
        </a>
      </aside>
      <PhotoDialog photo={photo} onClose={() => setPhoto(null)} />
    </>
  );
}
function Index({programsOnly = false}) {
  useEffect(() => {
    document.title = programsOnly
      ? '프로그램 | 낭만모드 by 게딱지'
      : '낭만모드 | 게딱지가 만드는 여행';
  }, [programsOnly]);
  return (
    <div
      className={`nm-index-shell${programsOnly ? ' nm-programs-shell' : ''}`}>
      {programsOnly ? <TripsPrograms /> : <TripsIndex />}
      <Footer />
    </div>
  );
}
export default function TripsApp() {
  const route = tripRoute(window.location.pathname);
  useEffect(() => {
    // Hash targets are rendered by React after the browser's initial navigation.
    // Move to the requested day/class once those sections exist.
    const targetId = window.location.hash.slice(1);
    if (!targetId) return;
    const frame = requestAnimationFrame(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({behavior: 'instant', block: 'start'});
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  if (route?.page === 'detail') return <Detail trip={route.trip} />;
  if (route?.page === 'login') return <TripsLogin />;
  if (route?.page === 'index') return <Index />;
  if (route?.page === 'programs') return <Index programsOnly />;
  return (
    <>
      <Header />
      <main className="nm-not-found" id="trip-main">
        <p className="nm-hand">아직 쓰이지 않은 페이지예요.</p>
        <h1>여행을 찾을 수 없어요.</h1>
        <a className="nm-button" href="/trips/">
          여행 목록으로 <Arrow />
        </a>
      </main>
      <Footer />
    </>
  );
}
