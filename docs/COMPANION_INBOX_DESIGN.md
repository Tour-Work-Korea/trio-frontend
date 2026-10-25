# 채팅함 디자인 수정 — 2026-10-21

- 왼쪽 뒤로가기·채팅함 제목, 오른쪽 검색 아이콘.
- 전체·모집·참여 칩 및 테두리 없는 대화 목록.
- 역할 배지·제목·단체방 인원·최근 메시지·시간·주황색 미읽음 배지.
- 단체방은 겹친 아바타, 개인방은 단일 아바타.
- 빈 채팅함에서는 필터와 검색을 숨기고 중앙의 연한 파란 원·채팅 아이콘·안내·동행 찾아보기 버튼 표시.
- 검색은 현재 목록의 방 제목과 최근 메시지 미리보기 대상으로 동작.
- 기존 chat_bubbles_blue, search_black, chevron_left_gray 및 Avatar 재사용. 추가 아이콘 대체 없음.
- 메시지/프로필 이니셜·사진은 목록 명세에 없어 기존 기본 아바타 사용. 임의 이름이나 사진은 넣지 않음.
- 별도 동행 소개 필드가 없어 부제는 제공된 noticePreview가 있을 때만 표시.

## API 정적 대조

최신 메인 API YAML 및 실행 중 채팅 서버 OpenAPI를 읽었습니다. 목록의 실제 필드 lastMessagePreview/lastMessageAt/unreadCount를 사용합니다. 기존 lastMessageContent 참조를 lastMessagePreview로 변경했습니다. 목록에는 myMemberRole/activeMemberCount가 없으므로 방 상세 응답을 최대 4개 동시 조회하여 보완하고, 전체·모집·참여는 보완한 역할로 필터링합니다. 부가 조회가 실패해도 전체 목록에서는 기존 방을 유지합니다.

## 추가 고정 문구

| 키 | 한국어 | 영어 |
|---|---|---|
| companion.inbox.yesterday | 어제 | Yesterday |
| companion.inbox.searchPlaceholder | 채팅방 이름이나 메시지 검색 | Search room names or messages |
| companion.inbox.noMatches | 조건에 맞는 대화가 없어요. | No conversations match your filters. |

기존 채팅함·전체·모집·참여·빈 상태·동행 찾아보기 문구는 번역 키를 재사용했습니다. 방 제목·최근 메시지·공지 미리보기는 서버/사용자 원문을 유지합니다.

사용자 지시에 따라 이번 변경의 테스트·빌드·번역 검증·브라우저·에뮬레이터 확인은 실행하지 않았습니다.
