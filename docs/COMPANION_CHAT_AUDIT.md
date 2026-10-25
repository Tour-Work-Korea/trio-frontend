# 동행 채팅 진입 점검 — 2026-10-21

## 실제 앱에서 확인한 사실

- iPhone 17 Pro 시뮬레이터의 동행 ID 4, 게시글 ID 25로 확인.
- 상세 응답: status=OPEN, myParticipationStatus=INQUIRING, allowedActions=[APPLY], chatSyncStatus=FAILED.
- GET https://dev.ddakji.kr/api/v1/user/companions/4/chat-access: HTTP 200, 응답은 {"status":"FAILED"}. reason과 room ID 없음. 개발자 도구의 실제 응답 객체로 확인.
- 인증 실패나 잘못된 게시글 ID 전달은 아님. companionId=4와 postId=25를 올바르게 구분.
- 현재 로그인으로 채팅함 진입 시 오류 화면이 아닌 빈 목록 표시. 채팅 서버 주소/로그인 연결은 동작.

## 명세·코드 대조

- 최신 https://docs.ddakji.kr/v3/api-docs.yaml 및 https://chat-dev.ddakji.kr/v3/api-docs 확인.
- 문의 생성 POST /user/companions/{id}/inquiries: body 없음, Idempotency-Key 사용. 기존 프론트 일치.
- 방 준비 GET /user/companions/{id}/chat-access: READY와 room ID를 받아야 진입. FAILED를 방으로 취급하지 않는 동작 일치.
- 기존 INQUIRING 사용자에게 OPEN_INQUIRY 액션이 없는 것은 백엔드 allowedActions 구현과 일치. 상태 조회 버튼을 눌렀을 때 문의 생성 POST를 무작정 반복하면 새 revision을 계속 생성하므로 변경하지 않음.
- REST 채팅 목록/상세/메시지/검색/멤버/공지/읽음/알림/이미지/나가기/재입장 경로와 요청 필드 대조.
- 네이티브 WebSocket은 /ws/chat/rooms/{roomId}와 Authorization Bearer 헤더 사용.

## 백엔드 소스로 확인한 실패 의미

trio-backend dev:
- CompanionService.java 171행 getChatAccess: 방 ID가 없으면 동행의 동기화 상태를 반환. FAILED reason은 null 전달.
- CompanionChatOutboxScheduler.java 115행 markFailed: 실패 메시지를 result JSON으로 저장하고, 최종 실패일 때 동행 chatSyncStatus를 FAILED로 변경.
- CompanionService.java 351행 retryChatSync: 관리자용 실패 이벤트 재처리 기능 별도 존재. 이번 점검에서는 실행하지 않음.
- 서버 중지 중 요청이 실패 한도에 도달했을 가능성은 있으나, 실제 last error/로그를 확인하지 않았으므로 정확한 최초 실패 원인은 미확정.

## 검증과 한계

- npx jest --runInBand --watch=false Companion: 2개 suite, 20개 테스트 통과.
- 서버 FAILED 응답에 오래된 방 ID가 있어도 진입하지 않는 테스트 및 네이티브 WebSocket 경로/인증/프레임 수신 테스트 추가.
- 이전 날짜 정책을 기대하던 오래된 테스트를 사용자가 요청한 오늘부터 선택 정책으로 수정.
- 실제 방 ID가 제공되지 않아 메시지 송수신, WebSocket 연결 성공, 사진 전송은 끝까지 검증할 수 없음.
- 기존 실패 화면 버튼 너비 문제는 이전 수정으로 해결. 이번 점검에서는 새 고정 문구/번역 키/제품 동작 변경 없음. 사용자 콘텐츠 번역 없음.

## 백엔드 확인 대상

동행 ID 4의 실패한 chat outbox 이벤트에 저장된 error와 로그를 확인하고, 원인 조치 후 기존 실패 이벤트 retryChatSync 재처리 필요 여부 판단.

## SigNoz 실제 실패 로그 확인

사용자가 열어 준 모니터링 화면에서 지난 하루, `body contains 'companionId=4'`로 조회.

- 2026-10-20 23:14:19.590부터 2026-10-21 01:17:23.948(KST)까지 같은 작업의 반복 실패 기록 확인.
- 메시지: `동행 chat outbox 처리 실패. id=7, companionId=4, revision=1, message=503 Service Temporarily Unavailable`.
- 따라서 이 작업의 실제 실패 응답은 백엔드→채팅 서버 호출의 HTTP 503으로 확인됨. 프론트의 잘못된 본문이나 방 ID 전달 오류라는 근거는 없음.
- 현재 인스턴스 시작과 별개로 outbox ID 7의 실패 이벤트를 서버에서 재처리해야 함. 로그 확인만 수행했으며 관리자 재처리 호출은 실행하지 않음.
