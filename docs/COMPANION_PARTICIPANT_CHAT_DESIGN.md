# 참여자 채팅 디자인 수정 — 2026-10-21

개인방 모집 요약, 참여 전 안내와 하단 요청 버튼, 수락 대기 카드와 취소 버튼, 거절 안내 카드와 다른 동행 링크를 적용했습니다. 개인방은 말풍선 밖 시간과 텍스트 전송, 단체방은 멤버 수·검색·메뉴·고정 공지·미읽음 수·화살표 전송을 적용했습니다. iOS 키보드 회피에 헤더 높이와 안전영역을 반영했습니다.

API 요청과 참여/취소·방 전환 로직은 유지했습니다. 최신 API 문서를 읽고 상태 필드를 대조했습니다.

## 자산 및 대체 사항

기존 more_v_gray, calendar_400gray, x_gray, chevron_right_gray 및 검색·목록·더하기·화살표 SVG를 재사용했습니다. 압정과 동일한 자산은 없어 공지 아이콘은 map_pin_black으로 대체했습니다. 메시지 API에 프로필 사진 URL이 없어 기존 Avatar 기본 이미지를 사용했습니다.

## 추가 고정 문구

| 키 | 한국어 | 영어 |
|---|---|---|
| companion.chat.schedule | {{dates}} · {{location}} | {{dates}} · {{location}} |
| companion.chat.remaining | {{value}}자리 남음 | {{value}} spots left |
| companion.chat.remaining_one | {{value}}자리 남음 | {{value}} spot left |
| companion.chat.remaining_other | {{value}}자리 남음 | {{value}} spots left |
| companion.chat.requestSent | 참여 요청을 보냈어요 | Request sent |
| companion.chat.waitingBody | 작성자가 수락하면 동행이 확정돼요. / 아직 모집 인원에는 포함되지 않아요. | Your participation is confirmed when the organizer accepts. / You are not included in the confirmed count yet. |
| companion.chat.requestHint | 대화 후 참여를 요청해 주세요. / 작성자가 수락하면 동행이 확정돼요. | Request to join after chatting. / Your participation is confirmed when the organizer accepts. |
| companion.chat.deletionHint | 모집이 마감되면 이 개인방과 대화가 삭제돼요. | This private chat and its messages are deleted when recruitment closes. |
| companion.chat.rejectedHeading | 동행 참여가 성사되지 않았어요 | Your participation was not confirmed |
| companion.chat.rejectedBadge | 요청 거절됨 | Declined |
| companion.chat.rejectedDescription | 호스트가 참여 요청을 정중히 거절했습니다. / 다른 멋진 동행을 찾아 여행을 즐겨보세요! | The organizer declined your request. / Find another travel companion and enjoy your trip! |
| companion.chat.findOthers | 다른 동행 둘러보기 | Browse other companions |
| companion.chat.groupMembers | 단체 · {{value}}명 | Group · {{value}} members |
| companion.chat.groupMembers_one | 단체 · {{value}}명 | Group · {{value}} member |
| companion.chat.groupMembers_other | 단체 · {{value}}명 | Group · {{value}} members |
| companion.chat.groupOpened | 모집이 마감되어 단체방이 열렸어요. | Recruitment has closed and the group chat is open. |
| companion.chat.back | 뒤로 가기 | Go back |

제목·소개·장소·공지·이름·메시지는 서버/사용자 원문을 유지했습니다.
이번 변경은 사용자 지시에 따라 테스트·빌드·번역 검증·브라우저·에뮬레이터 확인을 실행하지 않았습니다.
