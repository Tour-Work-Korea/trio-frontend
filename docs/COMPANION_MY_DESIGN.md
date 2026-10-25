# 내 동행 디자인 반영

마이페이지의 채팅함 메뉴를 제거하고 내 동행만 유지했습니다. 모집·참여 카드, 모집글별 문의 목록, 모집 관리, 마감 후 단체 채팅 이동을 연결했습니다. 모든 동행 채팅의 입력·전송 디자인은 둥근 흰색 입력란과 주황색 전송 텍스트로 통일했습니다.

## 추가 고정 문구

| 번역 키 | 한국어 | 영어 |
|---|---|---|
| companion.myUi.organizerHelp | 내가 모집한 동행의 참여 현황과 문의를 확인해요. | Check participation and inquiries for the trips you organize. |
| companion.myUi.participantHelp | 문의 중인 동행부터 확정된 동행까지 모아봐요. | See the trips you have asked about or joined. |
| companion.myUi.recruitmentSummary | 수락 대기 {{pending}}명 · 채팅 문의 {{inquiries}}건 | {{pending}} awaiting approval · {{inquiries}} chat inquiries |
| companion.myUi.waiting | 작성자의 수락을 기다리고 있어요. | Waiting for the organizer to accept your request. |
| companion.myUi.participationHelp | 채팅에서 동행 참여 현황을 확인해요. | Check your participation status in the chat. |
| companion.myUi.viewPost | 동행 글 보기 | View post |
| companion.myUi.chatCount | 채팅 {{value}} | Chats {{value}} |
| companion.myUi.inquiryButton | 동행 채팅 문의 {{value}} | Trip chat inquiries {{value}} |
| companion.myUi.inquiryTitle | 동행 채팅 | Trip chats |
| companion.myUi.inquiryHelp | 이 글로 들어온 {{value}}명의 문의예요. / 각 사람과 1:1로 대화해요. | {{value}} people have asked about this post. / Chat privately with each person. |
| companion.myUi.pendingHeading | 확인을 기다리는 참여 요청 {{value}} | Requests awaiting approval {{value}} |
| companion.myUi.confirmedHeading | 확정된 동행 {{value}}명 | Confirmed participants {{value}} |
| companion.myUi.peoplePolicy | 작성자 외 {{capacity}}명 모집 · 총 최대 {{total}}명 / 현재 작성자 포함 {{confirmed}}명 확정 · 수락 대기 제외 | Recruiting {{capacity}} participants · Maximum {{total}} including organizer / {{confirmed}} confirmed including organizer · Pending requests excluded |
| companion.myUi.confirmedRatio | 확정 {{confirmed}} / {{capacity}}명 | Confirmed {{confirmed}} / {{capacity}} |
| companion.myUi.totalConfirmed | 총 {{value}}명 확정 | {{value}} confirmed in total |

글 제목, 작성자 닉네임, 문의자 이름, 메시지는 사용자·백엔드 원문을 유지합니다. 기존 날짜·주소 표시 유틸리티와 아이콘을 재사용합니다.

## 확인 범위

최신 메인 OpenAPI 및 chat OpenAPI를 갱신해 /companions/me 요약, 상세, management summary/applications 및 채팅 목록 계약과 정적 대조했습니다. 요약에 없는 참여 상태·작성자는 상세/게시글에서 가져오며, 인원·문의 수는 management summary를 사용합니다. 모집 마감 처리와 단체방 연결은 기존 API를 유지합니다.

테스트 실행은 요청 전 금지 지침에 따라 수행하지 않았습니다. 빌드·번역 검증·기기 UI 확인도 실행하지 않았습니다.

개수 번역 키 chatCount, inquiryButton, inquiryHelp, pendingHeading, confirmedHeading, totalConfirmed는 양 언어에 _one/_other도 추가했습니다. 영어 inquiryHelp_one: “{{value}} person has asked about this post. Chat privately with them.” 나머지 복수형은 위 기본 문구와 같습니다.
