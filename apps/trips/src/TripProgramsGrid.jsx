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
      {!item.status && <ApplyLink id={item.id} className="pg-apply">신청하기 ↗</ApplyLink>}
    </article>
  );
}

export default function TripProgramsGrid({programs, id = 'trip-programs'}) {
  const [filter, setFilter] = useState('trip');
  const {cards, status, retry} = usePrograms(programs);
  const visible = cards.filter(item => item.category === filter);
  return (
    <section
      className="pg-programs"
      id={id}
      aria-label="트립, 클래스, 파티 프로그램">
      <div className="pg-filters" role="group" aria-label="프로그램 종류">
        {filters.map(item => (
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
        notes[filter] ? <p className="pg-program-note">{notes[filter]}</p> : null
      ) : (
        <p className="pg-empty">
          아직 등록된 {filters.find(item => item.id === filter).label}{' '}
          프로그램이 없어요.
        </p>
      )}
    </section>
  );
}
