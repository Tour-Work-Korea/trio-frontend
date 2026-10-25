# 동행 단체 채팅 디자인 반영

모집 마감 시 백엔드가 작성자와 확정 참여자를 단체방에 자동 포함합니다. 개인방에서 상태 변경을 확인해 준비된 단체방으로 이동합니다. 모집 중 개별 수락 즉시 단체방을 생성하는 기능은 현재 API에서 지원하지 않습니다.

채팅방 정보, 멤버, 대화 검색, 공지 보기·수정, 공유 사진·장소, 알림 선택, 신고, 첨부·장소 공유 화면을 참조 디자인에 맞게 조정했습니다.

## 추가 번역

| 키 (`companion.group.` 접두사) | 한국어 | 영어 |
|---|---|---|
| attachmentHelp | 사진을 고르거나 만날 장소를 검색해 공유해요. | Choose a photo or search for a meeting place to share. |
| viewPlace | 장소 보기 | View place |
| disableNotifications | 알림 끄기 | Turn notifications off |
| enableNotifications | 알림 켜기 | Turn notifications on |
| editNoticeTitle | 약속 공지 수정 | Edit meeting notice |
| me | {{name}} · 나 | {{name}} · Me |
| meetingPlace | 만나는 장소 | Meeting place |
| meetingTime | 만나는 시간 | Meeting time |
| membersHeading | 함께하는 멤버 {{value}} | Members {{value}} |
| membersHeading_one | 함께하는 멤버 {{value}} | Member {{value}} |
| membersHeading_other | 함께하는 멤버 {{value}} | Members {{value}} |
| notificationResult | 새 메시지는 채팅방에서 확인할 수 있어요. | You can check new messages in the chat room. |
| off | OFF | OFF |
| on | ON | ON |
| reportDone | 신고가 접수됐어요 | Your report has been submitted |
| reportDoneBody | 내용을 확인한 후 필요한 조치를 진행할게요. | We will review your report and take appropriate action. |
| reportPlaceholder | 상황을 간단히 알려 주세요. | Briefly describe what happened. |
| reportTarget | 신고할 멤버를 선택해 주세요 | Select a member to report |
| searchCount | 검색 결과 {{value}}개 | {{value}} results |
| searchCount_one | 검색 결과 {{value}}개 | {{value}} result |
| searchCount_other | 검색 결과 {{value}}개 | {{value}} results |
| searchHint | 메시지를 누르면 해당 대화 위치로 이동해요. | Tap a message to jump to it in the conversation. |
| searchResults | 검색 결과 | Search results |
| searchSender | {{name}} · {{time}} | {{name}} · {{time}} |
| selectedPlace | 선택한 장소 | Selected place |
| viewAllShared | 공유한 항목 더 보기 | View more shared items |
| organizerSender | {{name}} · 작성자 | {{name}} · Organizer |

사용자·백엔드 데이터인 방 제목, 멤버 이름, 메시지, 공지, 장소 이름·주소는 번역하지 않습니다. 주소는 trimJejuPrefix를 적용합니다.

## API 정적 대조

최신 메인 OpenAPI, chat OpenAPI 및 WebSocket AsyncAPI를 다시 읽었습니다. 멤버 프로필 조회, 알림 PATCH, 공지 PUT(content 문자열), 신고 POST(targetUserId, reasonType, roomId, description), 메시지 조회·위치 공유 계약에 맞췄습니다. 불쾌한 사진·메시지 신고는 현재 enum에 맞춰 OTHER로 전송합니다. 공지 시간·장소는 별도 필드가 없어 content에 읽을 수 있는 줄바꿈 형식으로 저장하며 기존 일반 공지도 표시합니다. 서버가 제공하지 않는 공지 작성 시각은 만들지 않습니다.

## 자산 및 확인 범위

기존 SVG를 재사용했습니다. 정확히 대응하는 자산이 없는 고정 공지·신고·퇴장 표시는 기존 지도 핀·경고·오른쪽 화살표로 대체했습니다.

사용자 요청 전 테스트 금지 규칙에 따라 실행 테스트, 빌드, i18n 검증, 에뮬레이터 확인은 수행하지 않았습니다. 파일 형식 정리 및 코드·API 정적 확인만 수행했습니다.
