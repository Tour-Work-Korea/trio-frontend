# 작성자 채팅 디자인 수정 — 2026-10-21

- 작성자 개인방 제목에 관리 API의 문의자 userName 우선 사용.
- 상단 모집 요약 및 말풍선/시간/입력창은 참여자 시점과 같은 디자인 사용.
- PENDING: 파란 카드에 문의자 이름, 일정, 현재 확정 인원(작성자 포함), 좌우 거절·수락 버튼.
- REJECTED: 대화 위에 파란 거절 안내와 일정·확정 인원 행 표시.
- ACCEPTED: 수락 안내 유지. 마지막 인원 수락 시 기존 모집 마감 확인 후 단체방으로 전환.
- 기존 하단 중복 거절·수락 버튼과 대화 내 모집관리 버튼 제거.
- 단체방은 앞서 적용한 멤버 수·검색·메뉴·상단 공지·미읽음 수·화살표 전송 디자인 사용.

기존 calendar_400gray.svg, people_gray.svg, more_v_gray.svg 및 기존 버튼/폰트/색상 재사용. 이번 작업의 신규 대체 아이콘은 없음. 공지 압정의 map_pin_black 대체와 기본 아바타 사용은 앞선 참여자 화면과 동일.

최신 API 문서에서 관리 응답의 userName/status/requestGeneration/directRoomId 및 기존 수락·거절 호출 필드를 대조. API 변경 없음. 테스트·빌드·번역 검증·에뮬레이터 확인은 요청에 따라 실행하지 않음.

## 추가 고정 문구

| 키 | 한국어 | 영어 |
|---|---|---|
| companion.chat.organizerRequest | {{name}}님이 참여를 요청했어요 | {{name}} requested to join |
| companion.chat.confirmedNow | 현재 {{value}}명 확정 | {{value}} people currently confirmed |
| companion.chat.confirmedNow_one | 현재 {{value}}명 확정 | {{value}} person currently confirmed |
| companion.chat.confirmedNow_other | 현재 {{value}}명 확정 | {{value}} people currently confirmed |

이름·제목·메시지·공지·장소는 서버/사용자 원문 유지. 기존 거절·수락·날짜·총 인원·인원수 번역 키 재사용.
