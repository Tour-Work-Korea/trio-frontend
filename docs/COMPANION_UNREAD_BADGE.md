# 채팅함 미읽음 배지

- 커뮤니티 오른쪽 채팅함 아이콘에 동행 채팅방 unreadCount 합계 표시. 0이면 숨기고 100 이상이면 99+ 표시.
- 기존 홈 알림함의 unreadBadge/unreadBadgeText 스타일 재사용. 기존 채팅 SVG 유지.
- 화면 복귀·앱 활성화 시 갱신하고, 커뮤니티를 보고 있는 동안 30초 간격으로 조회. 화면 이탈 시 조회 중단, 로그아웃 시 초기화.
- 최신 채팅 OpenAPI의 목록 unreadCount 필드 확인. 기존 context=COMPANION 조회 사용.
- 테스트·빌드·번역 검증·에뮬레이터 확인은 실행하지 않음.

| 추가 키 | 한국어 | 영어 |
|---|---|---|
| companion.inbox.unreadLabel | 안 읽은 채팅 메시지 {{value}}개, 채팅함 | Unread chat messages: {{value}}. Open inbox |
| companion.inbox.countOverflow | {{value}}+ | {{value}}+ |

이름·제목·메시지 등 사용자/서버 콘텐츠는 변경하거나 번역하지 않음.
