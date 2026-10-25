# 동행 기능 1차 구현 보고서

작성일: 2026-10-19

> 2026-10-20: 커뮤니티 동행 목록·상세는 다시 전달받은 시안대로 수정했다. 최신 화면 변경은 [디자인 수정 기록](COMPANION_DESIGN_CORRECTION.md)을 참고한다.

## 구현 범위

- 커뮤니티 동행 탭 → 전용 목록/상세/2단계 글쓰기 연결, 커뮤니티 상단 채팅함, 마이페이지 내 동행/채팅함 진입.
- 모집/참여 목록, 문의 및 신청 이력, 수락/거절/철회, 직접 마감 및 마지막 수락 전 확인창.
- 모집 중 개인방 유지, 마감 후 그룹 준비 상태 확인, 확정자 그룹 연결, 미확정자 채팅함 이동/종료 안내.
- 채팅함 전체/모집/참여 필터, 개인/그룹 구분, 메시지 이력/이전 페이지, WebSocket 전송/ACK 병합, 읽음 갱신, 재연결.
- 사진/카메라 업로드, 비공개 이미지 다운로드 URL 재발급, 장소 검색/공유, 대화 검색 및 선택한 메시지로 이동.
- 단체방 공지 읽기/작성자 수정, 공유한 사진·장소, 알림 설정, 나가기/재입장.
- 신고 사유/상세 입력 화면. 접수 API가 없어 제출은 비활성화하며 준비 중 안내를 표시.
- 요청 의도별 멱등 키 유지, 동일 메시지 재전송 시 clientMessageId 유지, 충돌/권한 오류 시 현재 상태 재조회.
- 새 고정 문구는 한국어·영어에 동일 키로 추가. 기존 버튼, AdaptiveText, Header, AlertModal/AdaptiveModal, Avatar, DatePicker, AppImage, 글꼴/색상을 재사용하고 필요한 배치만 동행 기능 안에서 조정.

## 기존 자산과 대체 아이콘

새 아이콘 파일은 생성하지 않았다. 사용자가 이미 추가한 `chat_bubbles_black.svg`, `chat_bubbles_blue.svg`를 그대로 사용했다. 기존 공용 SVG/컴포넌트/토큰은 변경하지 않았다.

| 위치 | 사용 자산 | 디자인과 다른 부분 |
| --- | --- | --- |
| 채팅방 메뉴 | `bullet_list_black.svg` | 동일한 세 줄 메뉴가 없어 검정 목록 아이콘으로 대체 |
| 메시지 전송 | `arrow_right_white.svg`를 -90도 회전 | 전용 위쪽 전송 아이콘 대신 기존 흰 화살표 회전. 주황/비활성 회색 버튼은 기존 색상 사용 |
| 사진 첨부·공유 메뉴 | `Photo.svg` | 디자인의 검정 사진 아이콘 대신 회색(#747D8F) 사진 추가 아이콘 |
| 약속 공지 메뉴 | `map_pin_black.svg` | 압정 자산이 없어 검정 장소 핀으로 대체 |
| 채팅 알림 메뉴 | `bell_gray.svg` | 검정 종 대신 기존 회색 종 |
| 신고 메뉴 | `warning_alarm_orange.svg` | 깃발 자산이 없어 주황 경고 아이콘으로 대체 |
| 나가기 메뉴 | `arrow_right_black.svg` | 문/나가기 자산이 없어 검정 오른쪽 화살표로 대체 |
| 신고 사유 선택 | `radio_button_enabled.svg`, `radio_button_disabled.svg` | 기존 주황/회색 라디오 사용. 시안의 작은 원과 크기·채움 차이 |
| 프로필 이미지가 없는 사용자 | 기존 `Avatar` 기본 로고 | 시안의 이니셜 원 대신 기존 앱의 기본 프로필 표시 |

카메라, 검색, 위치, 달력, 인원, 더하기/빼기, 뒤로가기, 닫기는 기존 자산을 재사용했다. 알림 스위치는 기존 React Native 컨트롤에 공용 주황/회색과 흰색 손잡이를 적용했다.

## 최신 API 대조 및 미해결 계약

[최신 문서](https://docs.ddakji.kr/docs/index.html)의 `/v3/api-docs.yaml`을 작업 시작과 종료 시 새로 내려받아 확인했다. 동행 CRUD/문의/신청/취소/수락/거절/마감/관리/내 목록/접근 확인 및 커뮤니티 사진 발급의 15개 메서드·경로, 전체 교체 PATCH 필수값, 정원 제한과 ChatAccess 상태를 대조했다.

- 상세에는 images/updatedAt이 없다. 기존 커뮤니티 상세로 보충하지만, 그 이미지 응답에도 objectKey가 없다. **사진이 있는 글은 objectKey를 추정하지 않고 편집 저장을 막는다.** 이미지가 없고 updatedAt을 받을 수 있는 글은 수정할 수 있다. 이미지 보존 편집을 완성하려면 응답 확장이 필요하다.
- Summary에는 소개/작성자/구체적 장소가 없다. 실제 목록은 받은 제목·일정·지역·인원을 우선 표시한다. 상세는 동행 상세와 공통 게시글 상세를 함께 사용한다. 일반 커뮤니티 게시글 목록에도 companionId가 없어 기존 전체 게시글에서 특정 동행으로 바로 연결하는 추가 계약이 필요하다.
- 본인 참여 Summary에는 참여 상태가 없어 참여 카드에서 상세를 보충 조회한다.
- 채팅 멤버 API의 보장 필드는 ID/역할/멤버십/알림이다. 이름·프로필이 없을 때는 사용자 ID와 기존 기본 프로필을 표시한다. 멤버 프로필 완성에는 공개 프로필 계약이 필요하다.
- 활동/지역 코드표 API가 없어 WALK/FOOD/PHOTO/SWIM/OTHER 및 JEJU_NORTH/SOUTH/EAST/WEST를 임시 선택지로 사용한다. 출시 전 백엔드와 코드표 확정이 필요하다.
- 채팅 공지는 content 한 필드 계약에 맞춰 시간·장소·안내 내용을 하나의 공지로 입력한다.
- 신고 접수 API가 문서에 없어 실제 신고는 전송하지 않는다.
- 기획의 개인방/대화 삭제와 백엔드 가이드의 종료 문의방 읽기 전용 이력 정책이 다르다. 프론트는 종료 개인방의 접근/전송을 막고 현재 권한에 맞게 이동하지만 서버의 기록 삭제 정책은 별도 확정이 필요하다.
- 채팅 개발 서버 문서 확인 요청은 503을 반환했다. 네트워크 복구 후 재확인에서도 일반 동행 목록 API는 200이지만 채팅 문서/목록은 AWS 로드밸런서에서 503을 반환했다. 채팅 REST/소켓 계약은 사용자가 전달한 구현 가이드를 기준으로 작성했으며 **실서버 채팅·스토리지 연동 완료를 의미하지 않는다.**
- 브라우저 BFF 세션 마커는 JWT가 아니므로 채팅 서버에 보내지 않는다. 웹 세션만 있는 경우 앱 로그인 안내를 표시한다. 웹 채팅을 완성하려면 별도의 안전한 채팅 인증 연동이 필요하다.
- 초안 수정/삭제·확정 후 취소·재모집·방 전체 삭제·메시지 반응 기능은 추가하지 않았다. 발행 실패 시 같은 초안/키로 재시도하며, 초안 정리 API는 없다.

## 환경 설정

- `COMPANION_ENABLED=true`: 출시 환경에서 새 동행 진입점 활성화. 기본은 개발 빌드에서만 활성화하며 `false`로 끌 수 있다.
- `CHAT_BASE_URL`: 채팅 서버 origin. 명시적으로 문서화된 개발 CORE 주소를 사용할 때만 `https://chat-dev.ddakji.kr`을 기본값으로 사용하며 운영 주소는 추정하지 않는다.
- 백엔드의 생성 기능 플래그 및 채팅 연동 배포는 별도로 활성화해야 한다.

## 검증

- `node scripts/validate-i18n-resources.mjs`: 한국어/영어 키 일치 확인.
- `npx jest --runInBand --watch=false Companion`: 16개 테스트 통과. 동행 날짜/마감/상태, ACK 순서/송신자 구분/중복, API 요청 계약, 비공개 첨부 접근 제한, 업로드 실패·발행 메타데이터 검증.
- 웹 배포 빌드 성공. 저장소의 dist 파일 대신 임시 출력 경로 사용. 번들 크기 경고는 남아 있다.
- 수정 파일 ESLint 오류 0건. 동행 로컬 화면의 인라인 스타일 경고가 남아 있다.
- `http://localhost:5173`에서 실제 동행 탭/빈 목록과 진입을 확인.
- 별도 임시 UI fixture로 한국어/영어 320px 화면을 검증. 글쓰기 2단계, 마지막 수락 확인창 취소 시 상태 유지, 수락 후 단체방 전환, 메시지 ACK 병합을 확인. 이 fixture는 서버에 게시글·메시지·신고를 생성하지 않는다. 검증 후 임시 소스는 제거한다.
- Android/iOS 실기기 실행, 실제 로그인 계정의 동행 생성·스토리지 업로드·실시간 채팅은 아직 검증하지 않았다.
- 새로운 의존성은 추가하지 않았다. 커밋/푸시는 하지 않았다.

## 번역하지 않은 서버·사용자 콘텐츠

게시글 제목/소개, 닉네임, 채팅방 이름, 채팅 메시지, 작성자 공지, 장소명·주소, 서버가 관리하는 카테고리 이름은 원문을 유지한다. 알려지지 않은 활동/지역 코드도 임의로 번역하지 않는다. 주소 표시에는 `trimJejuPrefix`를 적용한다. 고정 UI 선택지/상태/안내만 아래 리소스로 번역한다.

## 추가·변경한 고정 문구 전체

총 199개 키. 아래 표의 한국어·영어를 각각 `ko.json`, `en.json`에 동일 키로 추가했다.

| 번역 키 | 한국어 | English |
| --- | --- | --- |
| `companion.accept` | 수락하기 | Accept |
| `companion.acceptAndGroup` | 수락하고 단체방으로 | Accept and open group chat |
| `companion.acceptLastTitle` | 수락하고 모집을 마감할까요? | Accept and close recruitment? |
| `companion.acceptedBody` | 모집 중에는 개인 대화를 이어가세요. 모집이 마감되면 단체방이 열려요. | Continue chatting privately while recruitment is open. The group chat opens when recruitment closes. |
| `companion.acceptedEditRule` | 확정 참여자가 있으면 활동과 지역을 바꿀 수 없고, 확정 인원보다 적게 모집할 수 없어요. | With confirmed participants, activity and area are fixed and capacity cannot fall below the confirmed count. |
| `companion.acceptedOrganizerTitle` | 참여 요청을 수락했어요 | You accepted the request |
| `companion.acceptedTitle` | 참여가 확정됐어요 | Your participation is confirmed |
| `companion.access.CLOSED` | 이 개인 채팅은 종료됐어요 | This private chat has ended |
| `companion.access.FAILED` | 채팅방을 준비하지 못했어요 | Could not prepare your chat |
| `companion.access.NONE` | 아직 연결된 채팅방이 없어요 | No linked chat yet |
| `companion.access.PENDING` | 채팅방을 준비하고 있어요 | Preparing your chat |
| `companion.access.READY` | 채팅방 접근을 다시 확인해 주세요 | Check your chat access |
| `companion.access.TIMEOUT` | 채팅방 준비가 지연되고 있어요 | Your chat is taking longer to prepare |
| `companion.accessHelp` | 방 준비 상태와 현재 참여 권한을 다시 확인할 수 있어요. | Check again for room readiness and your current access. |
| `companion.activeMembers` | 함께하는 멤버 {{value}}명 | {{value}} active members |
| `companion.activeMembers_one` | 함께하는 멤버 {{value}}명 | {{value}} active member |
| `companion.activeMembers_other` | 함께하는 멤버 {{value}}명 | {{value}} active members |
| `companion.activity.FOOD` | 식사·카페 | Food / café |
| `companion.activity.OTHER` | 기타 | Other |
| `companion.activity.PHOTO` | 사진 | Photography |
| `companion.activity.SWIM` | 수영 | Swimming |
| `companion.activity.WALK` | 산책·관광 | Walk / sightseeing |
| `companion.activityLabel` | 어떤 동행인가요? * | Activity * |
| `companion.addPhoto` | 사진 추가 | Add photo |
| `companion.apply` | 동행 참여 요청하기 | Request to join |
| `companion.attach` | 사진 또는 장소 첨부 | Attach a photo or place |
| `companion.attachTitle` | 무엇을 보낼까요? | What would you like to share? |
| `companion.camera` | 카메라 | Camera |
| `companion.capacityLabel` | 추가 모집 인원 (작성자 제외) * | People to recruit (excluding you) * |
| `companion.capacityValue` | 참여 확정 {{confirmed}} / 모집 {{capacity}}명 · 작성자 제외 | {{confirmed}} confirmed / {{capacity}} places · excluding organizer |
| `companion.chat` | 채팅하기 | Chat |
| `companion.chatAuthRequired` | 채팅 서버 인증이 필요해요. 앱에서 로그인 후 이용해 주세요. | Chat requires an access token. Please log in through the app. |
| `companion.chatImageLimit` | 채팅 사진은 장당 10MB까지 전송할 수 있어요. | Chat photos must be 10 MB or smaller. |
| `companion.chatNotConfigured` | 채팅을 준비 중이에요. 잠시 후 다시 이용해 주세요. | Chat is not available yet. Please try again later. |
| `companion.chatUnavailable` | 지금은 채팅방에 입장할 수 없어요 | This chat is currently unavailable |
| `companion.close` | 모집 마감하기 | Close recruitment |
| `companion.closeAndGroup` | 마감하고 단체방으로 | Close and open group chat |
| `companion.closeBody` | 이 동행의 개인방과 대화가 삭제돼요. 작성자와 확정 참여자는 새 단체방에서 대화해요. | Private chats for this plan will be deleted. The organizer and confirmed participants can continue in a new group chat. |
| `companion.closeEmptyBody` | 이 동행의 개인방과 대화가 삭제돼요. 확정된 참여자가 없어 단체방은 생성되지 않아요. | Private chats for this plan will be deleted. No group chat will be created because there are no confirmed participants. |
| `companion.closeTitle` | 모집을 마감할까요? | Close recruitment? |
| `companion.closedDone` | 모집이 마감됐어요 | Recruitment is closed |
| `companion.closesAt` | {{date}} {{time}}에 모집이 마감돼요. | Recruitment closes on {{date}} at {{time}} KST. |
| `companion.closesEarly` | 정원이 차면 먼저 마감될 수 있어요. | Recruitment may close earlier when full. |
| `companion.confirmed` | 확정된 동행 | Confirmed participants |
| `companion.confirmedMember` | 확정 참여자 | Confirmed participant |
| `companion.conflict` | 상태가 변경됐어요. 새로고침 후 다시 확인해 주세요. | The state has changed. Refresh to see the latest information. |
| `companion.connection.CONNECTED` | 연결됨 | Connected |
| `companion.connection.CONNECTING` | 채팅 연결 중이에요 | Connecting to chat… |
| `companion.connection.DISCONNECTED` | 채팅 연결이 끊겼어요 | Chat disconnected |
| `companion.connection.ERROR` | 채팅 연결을 확인해 주세요 | Check your chat connection |
| `companion.coordinates` | 위도 {{latitude}} · 경도 {{longitude}} | Latitude {{latitude}} · Longitude {{longitude}} |
| `companion.dateLabel` | 날짜 * | Dates * |
| `companion.dateLocked` | 등록한 일정은 수정할 수 없어요. | Dates cannot be changed after publishing. |
| `companion.dateRange` | {{start}} ~ {{end}} | {{start}} – {{end}} |
| `companion.dateValidation` | 시작일과 종료일을 확인해 주세요. 일정은 최대 30일이에요. | Check the dates. Plans can cover up to 30 days. |
| `companion.deadlineRule` | 모집은 시작일 전날 오후 6시에 마감돼요. 하루 일정도 선택할 수 있어요. | Recruitment closes at 6 PM KST the day before the start date. Single-day plans are welcome. |
| `companion.deadlineValidation` | 모집 마감 전인 일정을 선택해 주세요. 마감은 시작일 전날 오후 6시예요. | Choose dates before the recruitment deadline: 6 PM KST the day before the start. |
| `companion.decrease` | 모집 인원 줄이기 | Decrease capacity |
| `companion.descriptionCount` | 10~1,000자 · 현재 {{count}}자 | 10–1,000 characters · {{count}} entered |
| `companion.descriptionLabel` | 동행 소개 * | Introduction * |
| `companion.descriptionPlaceholder` | 함께할 활동과 원하는 동행을 소개해 주세요. | Describe the plan and who you would like to join. |
| `companion.directDeletion` | 모집이 마감되면 이 개인방과 대화가 삭제돼요. 참여가 확정되면 단체방에서 대화를 이어갈 수 있어요. | This private chat will be deleted when recruitment closes. Confirmed participants can continue in a group chat. |
| `companion.discard` | 그만두기 | Discard |
| `companion.discardBody` | 입력한 내용은 저장되지 않아요. | Your changes will not be saved. |
| `companion.discardTitle` | 작성을 그만둘까요? | Discard this draft? |
| `companion.disconnected` | 채팅 연결을 확인한 뒤 다시 전송해 주세요. | Reconnect before sending a message. |
| `companion.draftPending` | 이미 생성된 초안이 있어요. 내용을 바꾸지 않고 등록을 다시 시도해 주세요. | A draft has already been created. Retry publishing without changing the content. |
| `companion.edit` | 글 수정 | Edit post |
| `companion.editNotice` | 공지 수정 | Edit notice |
| `companion.editUnavailable` | 이 글은 아직 수정할 수 없어요. 잠시 후 다시 시도해 주세요. | This post cannot be edited yet. Please try again later. |
| `companion.endDate` | 종료일 | End date |
| `companion.error` | 불러오지 못했어요. 잠시 후 다시 시도해 주세요. | Something went wrong. Please try again. |
| `companion.find` | 동행 찾아보기 | Find companions |
| `companion.forbidden` | 이 작업에 대한 권한이 없어요. 상태를 다시 확인해 주세요. | You do not have access to this action. Refresh to check the current state. |
| `companion.goChat` | 채팅으로 이동 | Open chat |
| `companion.groupChat` | 단체 채팅 | Group chat |
| `companion.imageLimit` | 사진은 최대 5장, 장당 20MB까지 등록할 수 있어요. | Add up to 5 photos, each up to 20 MB. |
| `companion.imageUnavailable` | 사진을 불러올 수 없어요. 눌러서 다시 확인해 주세요. | Photo unavailable. Tap to retry. |
| `companion.inbox` | 채팅함 | Chats |
| `companion.inboxEmpty` | 아직 동행 대화가 없어요 | No companion chats yet |
| `companion.inboxEmptyBody` | 함께하고 싶은 동행을 찾아<br>먼저 인사를 건네 보세요. | Find a plan you like<br>and start a conversation. |
| `companion.increase` | 모집 인원 늘리기 | Increase capacity |
| `companion.info` | 동행 정보 | Plan details |
| `companion.inquiries` | 채팅 문의 | Inquiries |
| `companion.inquiryEnded` | 문의한 동행의 모집이 마감되어 개인 채팅이 종료됐어요. | Recruitment has closed, so your private conversation has ended. |
| `companion.leave` | 채팅방 나가기 | Leave chat |
| `companion.leaveBody` | 새 메시지를 받지 않지만 동행 참여는 유지돼요. 내 동행에서 단체방에 다시 입장할 수 있어요. | You will stop receiving messages, but remain a participant. Rejoin the group chat from My companions. |
| `companion.leaveTitle` | 채팅방에서 나갈까요? | Leave this chat? |
| `companion.listEmpty` | 아직 등록된 동행이 없어요 | No companion posts yet |
| `companion.listEmptyBody` | 함께하고 싶은 여행을 먼저 제안해 보세요. | Be the first to suggest a trip together. |
| `companion.loadMore` | 더 보기 | Load more |
| `companion.loading` | 불러오는 중이에요 | Loading… |
| `companion.locationValue` | {{region}} · {{place}} | {{region}} · {{place}} |
| `companion.loginRequired` | 로그인하고 동행을 시작해 보세요 | Log in to find companions |
| `companion.manage` | 모집 관리 | Manage recruitment |
| `companion.memberId` | 사용자 {{id}} | User {{id}} |
| `companion.messagePlaceholder` | 메시지를 입력하세요 | Write a message |
| `companion.metric.confirmedCount` | 참여 확정 / 모집 | Confirmed / capacity |
| `companion.metric.inquiryCount` | 채팅 문의 | Inquiries |
| `companion.metric.pendingCount` | 수락 대기 | Pending |
| `companion.my` | 내 동행 | My companions |
| `companion.myDescription` | 내가 모집한 동행과 문의·참여한 동행을 확인해요. | Find plans you organize and plans you have asked about or joined. |
| `companion.myEmpty` | 아직 동행 내역이 없어요 | No companion plans yet |
| `companion.noGroup` | 확정된 참여자가 없어 단체방은 생성되지 않아요. | No group chat is created when there are no confirmed participants. |
| `companion.noNotice` | 아직 등록된 약속 공지가 없어요. | No meeting notice yet. |
| `companion.noResults` | 검색 결과가 없어요. | No messages found. |
| `companion.notFound` | 삭제되었거나 볼 수 없는 동행이에요. | This plan is unavailable or has been deleted. |
| `companion.notice` | 약속 공지 | Meeting notice |
| `companion.noticeContent` | 공지 내용 | Notice content |
| `companion.noticeHeading` | 만나는 시간과 장소 | Meeting details |
| `companion.noticeHelp` | 만나는 시간, 장소와 안내 내용을 한 번에 적어 주세요. | Include the meeting time, place and other instructions. |
| `companion.noticePinned` | 작성자가 등록한 공지는 채팅방 상단에 고정돼요. | The organizer’s notice is pinned at the top of the chat. |
| `companion.notification` | 채팅 알림 | Chat notifications |
| `companion.notificationBody` | 이 채팅방의 새 메시지 알림 | New messages in this chat |
| `companion.notificationOff` | 알림을 껐어요. 새 메시지는 채팅방에서 확인할 수 있어요. | Notifications are off. You can still read new messages in the chat. |
| `companion.notificationOn` | 알림을 켰어요 | Notifications are on |
| `companion.olderMessages` | 이전 대화 보기 | Load older messages |
| `companion.organizer` | 작성자 | Organizer |
| `companion.participation.ACCEPTED` | 참여 확정 | Confirmed |
| `companion.participation.CLOSED_UNCONFIRMED` | 미확정 마감 | Closed without confirmation |
| `companion.participation.INQUIRING` | 문의 중 | Inquiring |
| `companion.participation.PENDING` | 수락 대기 | Awaiting acceptance |
| `companion.participation.REJECTED` | 참여 요청 거절 | Declined |
| `companion.participation.REMOVED` | 참여 종료 | Participation ended |
| `companion.participation.WITHDRAWN` | 참여 요청 취소 | Request withdrawn |
| `companion.people` | {{value}}명 | {{value}} people |
| `companion.peoplePolicy` | 모집 인원은 작성자를 제외해요. 수락 대기 인원은 확정 인원에 포함하지 않아요. | Capacity excludes the organizer. Pending requests do not count as confirmed participants. |
| `companion.people_one` | {{value}}명 | {{value}} person |
| `companion.people_other` | {{value}}명 | {{value}} people |
| `companion.photo` | 사진 | Photo |
| `companion.photoCount` | {{count}} / 5 | {{count}} / 5 |
| `companion.photoMessage` | 사진 | Photo |
| `companion.photosLabel` | 사진 (선택) | Photos (optional) |
| `companion.place` | 장소 | Place |
| `companion.placeLabel` | 만날 장소 (선택) | Meeting place (optional) |
| `companion.placePlaceholder` | 구체적인 만남 장소를 입력해 주세요 | Enter a meeting place |
| `companion.placeSearch` | 장소 검색 | Search for a place |
| `companion.publish` | 동행 글 등록하기 | Publish companion post |
| `companion.publishRetry` | 등록이 중단되면 같은 내용으로 다시 시도해 주세요. 생성된 초안으로 이어서 등록해요. | If publishing fails, retry with the same content to continue the existing draft. |
| `companion.ratio` | {{confirmed}} / {{capacity}} | {{confirmed}} / {{capacity}} |
| `companion.reconnect` | 다시 연결 | Reconnect |
| `companion.region.JEJU_EAST` | 제주 · 동부 | Jeju · East |
| `companion.region.JEJU_NORTH` | 제주 · 북부 | Jeju · North |
| `companion.region.JEJU_SOUTH` | 제주 · 남부 | Jeju · South |
| `companion.region.JEJU_WEST` | 제주 · 서부 | Jeju · West |
| `companion.regionLabel` | 지역 * | Area * |
| `companion.reject` | 거절 | Decline |
| `companion.rejectedBody` | 다른 동행을 찾아보세요. 이 동행에는 다시 신청할 수 없어요. | Explore other plans. You cannot apply to this plan again. |
| `companion.rejectedOrganizerBody` | 다른 참여 요청을 계속 확인할 수 있어요. | You can continue reviewing other requests. |
| `companion.rejectedOrganizerTitle` | 참여 요청을 거절했어요 | You declined the request |
| `companion.rejectedTitle` | 참여 요청이 거절됐어요 | Your request was declined |
| `companion.rejoin` | 단체방 다시 입장 | Rejoin group chat |
| `companion.removePhoto` | {{index}}번째 사진 삭제 | Remove photo {{index}} |
| `companion.report` | 신고하기 | Report |
| `companion.reportDescription` | 신고 내용 (선택) | Details (optional) |
| `companion.reportHeading` | 신고 사유를 선택해 주세요 | Choose a reason to report |
| `companion.reportPrivacy` | 신고 내용은 상대방에게 공개되지 않아요. | Your report is not shared with the other person. |
| `companion.reportReason.ABUSE` | 욕설·비방 | Abuse or harassment |
| `companion.reportReason.INAPPROPRIATE` | 불쾌한 사진이나 메시지 | Inappropriate photos or messages |
| `companion.reportReason.OTHER` | 기타 | Other |
| `companion.reportReason.SPAM` | 스팸·광고 | Spam or advertising |
| `companion.reportUnavailable` | 채팅 신고는 아직 준비 중이에요 | Chat reporting is not available yet |
| `companion.reportUnavailableBody` | 신고 기능을 준비 중이에요. 아직 신고를 접수할 수 없어요. | Reporting is coming soon. Reports cannot be submitted yet. |
| `companion.requests` | 문의 및 참여 요청 | Inquiries and requests |
| `companion.retry` | 다시 확인하기 | Try again |
| `companion.role.ORGANIZER` | 모집 | Organizing |
| `companion.role.PARTICIPANT` | 참여 | Joining |
| `companion.roomInfo` | 채팅방 정보 | Chat info |
| `companion.save` | 저장하기 | Save |
| `companion.saveNotice` | 공지 저장하기 | Save notice |
| `companion.search` | 대화 검색 | Search conversation |
| `companion.searchLabel` | 검색어 | Search query |
| `companion.send` | 전송 | Send |
| `companion.sendPending` | 전송 확인 중 · 눌러서 재전송 | Awaiting confirmation · tap to resend |
| `companion.sharePlace` | 장소 공유 | Share a place |
| `companion.shareThisPlace` | 이 장소 공유하기 | Share this place |
| `companion.shared` | 공유한 사진·장소 | Shared photos and places |
| `companion.sharedEmpty` | 불러온 대화에 공유한 사진이나 장소가 없어요. | No shared photos or places in the loaded messages. |
| `companion.startConversation` | 동행과 첫 인사를 나눠 보세요. | Say hello to your travel companion. |
| `companion.startDate` | 시작일 | Start date |
| `companion.status.CANCELLED` | 운영 중단 | Stopped |
| `companion.status.CLOSED` | 모집 마감 | Closed |
| `companion.status.DRAFT` | 임시 저장 | Draft |
| `companion.status.OPEN` | 모집 중 | Recruiting |
| `companion.stepIntro` | 2. 소개 | 2. Introduction |
| `companion.stepSchedule` | 1. 일정과 모집 | 1. Schedule and group |
| `companion.stepValue` | {{step}} / 2 | {{step}} / 2 |
| `companion.submitReport` | 신고 접수하기 | Submit report |
| `companion.title` | 동행 | Travel companions |
| `companion.titleLabel` | 제목 * | Title * |
| `companion.titlePlaceholder` | 어떤 동행을 찾고 있나요? | What would you like to do together? |
| `companion.totalPeople` | 총 {{value}}명 · 작성자 포함 | {{value}} people total · including organizer |
| `companion.totalPeople_one` | 총 {{value}}명 · 작성자 포함 | {{value}} person total · including organizer |
| `companion.totalPeople_other` | 총 {{value}}명 · 작성자 포함 | {{value}} people total · including organizer |
| `companion.unread` | 안 읽음 {{value}} | {{value}} unread |
| `companion.validation` | 제목, 활동, 지역, 모집 인원을 확인하고 소개를 10~1,000자로 입력해 주세요. | Check the title, activity, area and capacity, and enter a 10–1,000 character introduction. |
| `companion.viewConversation` | 대화 보기 | View conversation |
| `companion.withdraw` | 참여 요청 취소 | Withdraw request |
| `companion.write` | 동행 글쓰기 | Find companions |
