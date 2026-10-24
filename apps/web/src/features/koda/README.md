# KODA CLUB

공개 주소와 전용 코드 이름은 `koda`로 통일합니다. 화면의 서비스 설명은 Language Exchange를 유지합니다.
기존 게딱지 앱의 인증·API·신청·결제 기능을 재사용하며, 기존 화면 소스를 직접 수정하지 않습니다.

## 로컬 실행

저장소 루트에서 실행합니다. 예전 설정 이름으로 실행 중인 서버는 종료한 뒤 다시 시작하세요.

```sh
npm run dev --workspace @trio/web -- --config vite.koda.config.js --port 5173 --strictPort
```

- 메인: http://localhost:5173/koda/
- 모임 목록: http://localhost:5173/koda/gatherings/
- 소개: http://localhost:5173/koda/about/
- 마이페이지: http://localhost:5173/koda/my/
- 이메일 가입: http://localhost:5173/koda/join/
- API 상세: `/koda/event/?id=party-{partyId}`
- 정적 아카이브: `/koda/event/?id=itaewon`, `/koda/event/?id=regular`

전용 설정의 development 모드는 API를 `https://dev.ddakji.kr/api/v1`, 결제 페이지의
WEB_BASE_URL을 `https://dev.ddakji.kr`로 지정합니다. 루트 .env와 기본 웹 설정은 변경하지 않습니다.
5173 이외의 포트에서는 백엔드 CORS 허용 여부를 별도로 확인해야 합니다.
기본 웹 실행 명령에는 KODA 인증 복귀 어댑터가 포함되지 않으므로 위 명령을 사용하세요.
기존 `/language-exchange/`의 알려진 페이지 주소는 쿼리와 해시를 유지해 `/koda/`로 이동합니다.

## 배포

기존 웹 주소의 `/koda/`에 함께 배포합니다. 새 도메인이나 별도 AWS 리소스는 필요하지 않습니다.
기존 `.github/workflows/deploy-web.yml`의 빌드 명령 한 줄만 교체했습니다.

```sh
KODA_DEPLOY_TARGET="$DEPLOY_ENV" npm exec --workspace @trio/web -- vite build --config vite.koda.config.js --outDir dist
```

- develop: 기존 dev SSM 환경 설정과 기존 개발 웹 배포 위치를 사용합니다.
- main: 기존 prod SSM 환경 설정과 기존 운영 웹 배포 위치를 사용합니다.
- 기존 S3 업로드, CDN 무효화, 브랜치 트리거는 그대로입니다.
- Android/iOS workflow도 그대로이므로 기존 조건에 해당하면 함께 실행됩니다. KODA만 단독 배포하는 구조가 아닙니다.
- `KODA_DEPLOY_TARGET=dev|prod`일 때 배포 환경과 API를 검사하고 신청·예약 조회를 활성화합니다.
  Vite의 production 최적화 모드와 실제 API 환경을 구분합니다. API 주소는 기존 SSM 설정을 따릅니다.
- 기본 `npm run build:web`, `apps/web/package.json`, `vite.config.js`, `src/main.jsx`, `index.html` 원본은 변경하지 않습니다.

전용 빌드는 기존 웹과 KODA HTML 진입점을 함께 출력합니다. 서버가 `/koda/` 요청에 루트
index.html을 반환하는 SPA fallback도 `hostedEntry.jsx`가 처리합니다. 일반 웹·로그인·결제 경로는
원래 웹 진입점을 불러오며, KODA에만 페이지 식별자와 스크롤 보정 스타일을 적용합니다.
기존 주소의 정적 리다이렉트 HTML도 생성합니다. 실제 CDN 응답과 캐시는 배포 후 확인해야 합니다.

Git push·merge·실제 배포는 수행하지 않았습니다. KODA 파일은 신규 파일이므로 배포 커밋에 아래
소스·HTML·설정·정적 자산을 모두 포함해야 합니다.

## 파일 구조

- `apps/web/src/features/koda/`: 페이지, 컴포넌트, 모델, 저장소, 인증/예약 복귀 어댑터, 스타일, 테스트.
- `apps/web/koda/`, `apps/web/koda.html`: HTML 진입점과 주소 별칭.
- `apps/web/public/koda-assets/`: 포스터, 로고, 과거 모임의 사진·영상.
- `apps/web/vite.koda.config.js`: 원래 Vite 설정을 확장하는 선택형 개발/빌드 설정.

```text
src/features/koda/
├─ pages/          # 메인·목록·상세·소개·가입·마이페이지
├─ components/     # 헤더·달력·로그인 모달·후기·가입 입력 등
├─ data/           # 문구·후기·모임 카탈로그
│  └─ archive/     # 이태원·치킨·기존 할로윈 고정 데이터
├─ services/       # 콘텐츠 저장소·API 데이터 변환·표시 모델
├─ auth/           # 인증 상태·가입 모델·인증/예약 복귀
├─ build/          # 기존 웹과 함께 제공하는 진입/빌드 어댑터
├─ styles/         # KODA CSS
├─ tests/          # Node 회귀 테스트
├─ main.jsx        # HTML 진입점
├─ KodaRouter.jsx  # 페이지 선택
├─ hooks.js        # 페이지 공통 훅
└─ README.md
```

`data/events.js`가 `data/archive/`의 고정 모임을 기존 순서로 묶어 제공합니다.
폴더 정리는 파일 이동과 참조 경로 변경만 수행합니다. HTML 주소·정적 자산 위치·화면·API 동작은 유지합니다.

기존 `.le-*` CSS 클래스는 전용 스타일의 범위로 유지합니다. 서비스명/경로 변경과 무관한 공유 코드는 옮기지 않습니다.

## 콘텐츠와 신청

공개 목록과 달력에는 `isVisible=true`, `organizerType=PLATFORM`인 API 콘텐츠와
어드민 등록 전의 이태원·치킨 언어교환 정적 아카이브를 표시합니다.
현재는 게딱지 주최 콘텐츠가 모두 언어교환이라는 운영 규칙입니다. 다른 프로그램을 등록하기 **전에**
백엔드에 브랜드/프로그램 구분을 추가하고 `liveEventModel.js`의 `isClubContent()`를 변경해야 합니다.

`liveEventRepository.js`는 기존 userMeetApi를 주입하고, `bookingEventRepository.js`는 목록과 상세 조회,
신청 대상 재확인, 예약 소속 조회를 담당합니다. `liveEventModel.js`에서 화면 데이터로 변환합니다.

1. `/user/parties/search`의 모든 페이지를 조회하고 공개 PLATFORM 콘텐츠를 분류합니다.
2. `/user/parties/{partyId}`로 실제 회차 정보를 조회합니다. 상세 동시 요청은 최대 4건입니다.
3. 신청할 때 같은 회차의 공개 여부·모집 상태·신청 가능 여부·정원을 다시 확인합니다.
4. 기존 `/contents-reservation`에 해당 partyId를 전달하고 공통 요금 조회·예약 생성·결제를 사용합니다.

회차가 삭제/비공개/마감되면 다른 회차로 대체 신청하지 않습니다. 템플릿 ID나 프론트 표시 가격으로
예약을 만들지 않습니다. 규모가 커지면 서버 필터·페이지네이션·목록 상태 필드가 필요합니다.
검색에서 사라진 과거 회차가 자동으로 공개 아카이브에 쌓이는 구조는 아닙니다.

이태원·치킨 아카이브는 기존 내용·사진·후기를 프론트에 보관하며 신청은 비활성화합니다.
과거 halloween 정적 상세 주소도 유지하지만 목록에는 넣지 않습니다. 새 할로윈 회차는 API를 사용합니다.
진행 안내와 콘텐츠 소개는 공통 상세에서 표시하며 줄바꿈과 안전한 http(s) 링크를 지원합니다.

## 인증·마이페이지·복귀

KODA 로그인 모달은 기존 이메일 로그인 API와 사용자 저장소를 사용합니다. 카카오는 기존 웹
소셜 로그인/OAuth 화면을 재사용합니다. Google 버튼은 제공하지 않습니다.
이메일 가입은 `/koda/join/`에서 기존 약관·이메일/SMS OTP·닉네임 확인·가입 API를 사용합니다.
해외 이메일 가입을 위한 별도 API는 추가하지 않았습니다.

`ClubMyPage.jsx`는 기존 프로필 API와 `reservationPaymentApi.getPartyReservationList()`를 재사용합니다.
예약의 실제 partyId로 PLATFORM 소속을 확인하고 다가오는/지난 모임을 표시합니다.
예약 번호는 표시하지 않습니다. 인증/통신 실패를 예약 없음으로 숨기지 않습니다.
공개 목록에서 빠진 예약은 소속 확인이 가능하면 표시하되 공개 상세 링크를 숨깁니다. 404/410은 제외합니다.
마이페이지 예약 조회는 사용자가 정상 동작을 확인했습니다.

인증·예약 복귀 어댑터는 KODA에서 시작한 흐름에만 적용합니다. 허용된 내부 KODA 경로만 사용하며,
개인정보 없이 sessionStorage에 인증 복귀는 30분, 예약 복귀는 1시간 보관합니다.
URL에 돌아왔다는 이유만으로 결제 성공으로 판단하지 않고 서버 상태를 다시 조회합니다.
전용 Vite 설정은 MeetReservation의 Header import만 KodaReservationHeader로 연결합니다.
KODA 복귀 표식이 없는 신청은 원래 헤더 동작을 사용합니다. 공유 소스를 수정하지 않아도 빌드 시
어댑터가 포함되므로 일반 게딱지 인증·신청의 회귀 확인은 필요합니다.

## 후기와 미디어

제공받은 실제 후기 14건은 reviews.js에 보관하고 테스트 후기는 제외했습니다.
운영자 요청으로 개선 의견 2건과 `굿굿` 후기 1건은 published:false로 두어 공개하지 않습니다.
닉네임·원문·별점·날짜를 유지하며, 선별 후기이므로 전체 평균/총 후기 수 요약은 표시하지 않습니다.
메인은 모임 구분 없이 작은 카드 목록으로, 상세는 해당 시리즈 또는 지난 모임 후기로 표시합니다.
API 회차의 후기는 템플릿 ID로 연결하며 제목으로 임의 매칭하지 않습니다. 후기 작성 API는 아직 없습니다.

고정 아카이브 자산은 public/koda-assets에 보관해 함께 배포합니다. 영상은 controls/playsInline,
preload="none"/poster를 사용하고 자동 재생하지 않습니다. 갤러리 사진은 지연 로딩합니다.
기존 점검에서 정적 파일은 약 20MB, MP4 2개는 약 3.33/4.57MB였으며 Chrome 재생을 확인했습니다.
GPS 메타데이터가 있는 itaewon-group.jpg, 큰 포스터와 사용하지 않는 이미지의 정리는 별도 작업입니다.
API의 partyImages/partyEventImageUrls는 이미지로 처리합니다. 신규 어드민 영상 업로드 연동에는
미디어 유형·포스터·URL 계약이 필요합니다. 실제 CDN Range/Content-Type과 Safari 재생은 별도 확인 대상입니다.

## 검증

```sh
node --test apps/web/src/features/koda/tests/*.test.mjs
API_BASE_URL=https://dev.ddakji.kr/api/v1 WEB_BASE_URL=https://dev.ddakji.kr KODA_DEPLOY_TARGET=dev npm exec --workspace @trio/web -- vite build --config vite.koda.config.js --outDir /private/tmp/koda-hosted-dev
```

기본 전용 빌드 출력은 dist-koda이며 배포 명령은 dist로 덮어씁니다. KODA_DEPLOY_TARGET을 지정하지
않은 production 빌드는 기존처럼 신청을 활성화하지 않습니다.

2026-10-24 경로 변경 검증: Node 테스트 78개 통과, dev/prod 환경을 명시한 빌드 성공.
공통 재사용 번들의 500kB 초과 경고는 남아 있습니다. 실제 예약 제출·결제·환불·OTP 가입·카카오 OAuth
전체 흐름은 이번 경로 변경 검증에서 실행하지 않았습니다.
API 상세 메타데이터는 브라우저에서 갱신하므로 JS를 실행하지 않는 공유 크롤러에는 기본 HTML 정보가 보일 수 있습니다.
KODA 전용 취소/환불 UI, 후기 등록, Google 로그인, WhatsApp은 아직 제공하지 않습니다.
