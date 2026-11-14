import React from 'react';
import './workation.css';

export function WorkationStory({trip}) {
  return (
    <section className="wk-people" aria-labelledby="workation-hosts">
      <h2 id="workation-hosts">함께하는 사람들</h2>
      <p className="wk-people-copy">
        게딱지 운영자와 리그라운드 대표, 디자이너와 기획자가 함께해요. 밥을 먹고
        걸으며 서로의 일과 쉼을 이야기해요.
      </p>
      <img
        className="wk-people-image"
        src={trip.teamImage}
        alt="함께하는 사람들: 트립 호스트 하늘·선혜·윤영, 현장 메이커 기원·건한·승용, SOLV 디렉터 민수, 별도 클래스·파티 진행자 환성농원·핑거레스트·윤아·승민"
        width="2480"
        height="3100"
        loading="lazy"
      />
      <p className="wk-people-note">
        클래스와 연말파티는 별도 선택 프로그램이에요.
      </p>
      <div className="wk-audience-brief">
        <h3>이런 분과 함께하고 싶어요</h3>
        <ul>
          <li>나만의 일·프로젝트를 준비하는 분</li>
          <li>퇴사·이직 후 다음을 고민하는 분</li>
          <li>새로운 사람과 관점을 만나고 싶은 분</li>
          <li>그냥 제주에서 쉬어가고 싶은 분</li>
        </ul>
      </div>
    </section>
  );
}
