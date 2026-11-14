import React, {useState} from 'react';
import usePrograms from './usePrograms.js';
import {ApplyLink} from './ApplyLink.jsx';
import './trip-programs-grid.css';

const filters = [
  {id: 'trip', label: '트립'},
  {id: 'class', label: '클래스'},
  {id: 'party', label: '파티'},
];
const notes = {
  class:
    '클래스는 별도 신청이에요. 참가비와 할인 조건은 상세 안내에서 확인해주세요.',
  party: '파티마다 참여 대상과 신청 방식이 달라요. 상세 안내를 확인해주세요.',
};

function ProgramCard({item}) {
  return (
    <article className={`pg-card pg-card-${item.category}`}>
      <a href={item.href}>
        <div className="pg-card-heading">
          <span className="pg-card-eyebrow">{item.eyebrow}</span>
          {item.status && <span className="pg-card-status">{item.status}</span>}
          <h3>{item.title}</h3>
          <p className="pg-card-caption">{item.caption}</p>
        </div>
        {item.image ? (
          <div
            className={`pg-card-image${
              item.contain ? ' pg-image-contain' : ''
            }`}>
            <img
              src={item.image}
              alt={item.alt}
              width="300"
              height="320"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="pg-card-image pg-image-placeholder">
            {item.eyebrow}
          </div>
        )}
        <div className="pg-card-info">
          <p>{item.date}</p>
          <p>{item.time}</p>
          <div>
            <strong>{item.price}</strong>
            <span aria-hidden="true">↗</span>
          </div>
          <small>{item.note}</small>
        </div>
      </a>
      {!item.status && (
        <ApplyLink id={item.id} className="pg-apply">
          신청하기 ↗
        </ApplyLink>
      )}
    </article>
  );
}

export default function TripProgramsGrid({
  programs,
  id = 'trip-programs',
  optionalOnly = false,
}) {
  const shownFilters = optionalOnly
    ? filters.filter(item => item.id !== 'trip')
    : filters;
  const [filter, setFilter] = useState(optionalOnly ? 'class' : 'trip');
  const {cards, status, retry} = usePrograms(programs);
  const visible = cards.filter(item => item.category === filter);
  return (
    <section
      className={`pg-programs${optionalOnly ? ' pg-programs-optional' : ''}`}
      id={id}
      aria-label={
        optionalOnly ? '별도 선택 프로그램' : '트립, 클래스, 파티 프로그램'
      }>
      {optionalOnly && (
        <div className="pg-optional-heading">
          <h2>클래스와 연말파티는 선택이에요</h2>
          <p>
            워케이션 참가비에 포함되지 않아요.
            <br />
            참여하고 싶은 분만 별도로 신청·결제해주세요.
          </p>
        </div>
      )}
      <div className="pg-filters" role="group" aria-label="프로그램 종류">
        {shownFilters.map(item => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <p className="pg-count" role="status">
        {status === 'loading'
          ? '프로그램을 불러오는 중이에요.'
          : status === 'error'
          ? '프로그램을 불러오지 못했어요.'
          : `${filters.find(item => item.id === filter).label} · ${
              visible.length
            }개의 프로그램`}
      </p>
      <div className="pg-grid">
        {visible.map(item => (
          <ProgramCard item={item} key={item.id} />
        ))}
      </div>
      {status === 'error' ? (
        <div className="pg-load-error" role="alert">
          <p>잠시 후 다시 시도해주세요.</p>
          <button type="button" onClick={retry}>
            다시 불러오기 ↻
          </button>
        </div>
      ) : status === 'loading' ? (
        <div className="pg-loading" aria-hidden="true" />
      ) : visible.length ? (
        notes[filter] ? (
          <p className="pg-program-note">{notes[filter]}</p>
        ) : null
      ) : (
        <p className="pg-empty">
          {optionalOnly && filter === 'party'
            ? '12.05 토요일 17:00 연말파티 · 신청 정보 준비 중'
            : `아직 등록된 ${
                filters.find(item => item.id === filter).label
              } 프로그램이 없어요.`}
        </p>
      )}
    </section>
  );
}
