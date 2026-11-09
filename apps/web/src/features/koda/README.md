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
- 정적 아카이브: `/koda/event/?id=itaewon`, `/koda/event/?id=regular`, `/koda/event/?id=halloween`

전용 설정의 development 모드는 API를 `https://dev.ddakji.kr/api/v1`, 결제 페이지의
WEB_BASE_URL을 `https://dev.ddakji.kr`로 지정합니다. 루트 .env와 기본 웹 설정은 변경하지 않습니다.
5173 이외의 포트에서는 백엔드 CORS 허용 여부를 별도로 확인해야 합니다.
기본 웹 실행에도 KODA 인증 복귀·구글 로그인 어댑터를 포함합니다. 개발 API에서 국내 신청까지 테스트할 때는 위 전용 실행 명령을 사용하세요.
기존 `/language-exchange/`의 알려진 페이지 주소는 쿼리와 해시를 유지해 `/koda/`로 이동합니다.

## 배포

기존 웹 주소의 `/koda/`를 사용하며 새 도메인·AWS 리소스는 필요하지 않습니다.
`.github/workflows/deploy-web.yml`이 마지막 성공 배포의 커밋과 비교해 범위를 결정합니다.

- KODA 페이지·컴포넌트·데이터·전용 이미지·HTML만 변경: 언어교환 전용 빌드와 부분 업로드.
- 공통 앱 코드·의존성·빌드 설정·웹 workflow 변경: 전체 웹 빌드 후 KODA 전용 결과를 합쳐 배포.
- KODA 안에서도 `auth/`, `hosting/`, `services/liveEventModel.js`, `components/KodaReservationHeader.jsx`,
  `styles/koda-hosted.css`와 Google 어댑터·브랜드/인증 스타일은 공통 로그인·예약 화면에 포함되므로 전체 웹 배포.
- 최초 전환, 배포 이력 없음/잘못된 이력, 수동 실행, 이력 커밋을 비교할 수 없는 경우: 전체 웹 배포.
- Android/iOS는 웹 전용 파일만 바뀐 push를 건너뜁니다. 공통 코드나 의존성이 함께 바뀌면 기존 빌드를 실행합니다.
  모바일 workflow 설정 파일만 수정한 경우에도 자동 앱 배포를 하지 않으며, 이때는 수동 실행으로 검증·배포합니다.
- develop은 기존 dev SSM·S3 prefix, main은 기존 prod SSM·S3 prefix를 그대로 사용합니다.

첫 전체 배포는 공통 SPA 진입점에 `/koda/entry.js` 로더를 설치합니다. 이후 언어교환 부분 배포는
`/koda/`, `/koda-assets/`, `/language-exchange/` 및 두 HTML 별칭만 업로드합니다.
루트 `index.html`과 일반 웹 `/assets/`는 바꾸지 않습니다. 언어교환 JS·CSS·폰트는
`/koda-assets/build/` 아래 해시 파일로 격리하며, 자산 → HTML → 안정된 entry.js 순서로 게시합니다.
기존 해시 파일은 열려 있는 페이지를 위해 삭제하지 않습니다. 누적 자산 정리는 별도 운영 작업입니다.
부분 배포의 CloudFront 무효화 범위는 `/koda*`, `/language-exchange*`입니다.

성공 커밋은 각 배포 prefix의 `web-deployment.json`에 저장합니다. 직전 push가 아닌 이 커밋부터
비교하므로 실패·취소된 배포의 공통 변경이 다음 부분 배포에서 누락되지 않습니다.
S3 업로드 중 새 실행이 끼어들지 않도록 실행 중인 웹 배포는 취소하지 않습니다.

CI와 동일한 로컬 빌드(환경 변수는 해당 배포 환경에 맞게 제공):

```sh
# 전체 웹 기반 파일 — 최초 전환/공통 변경 시
KODA_DEPLOY_TARGET=dev npm exec --workspace @trio/web -- vite build --config vite.koda.config.js --outDir dist
# 언어교환 전용 결과 — 모든 웹 배포에서 생성
KODA_DEPLOY_TARGET=dev KODA_BUILD_SCOPE=koda npm exec --workspace @trio/web -- vite build --config vite.koda.config.js --outDir dist-koda
node scripts/prepare-koda-web.mjs apps/web/dist-koda
node scripts/verify-web-bundle.mjs apps/web/dist-koda
# 전체 배포인 경우에만 합치기
cp -R apps/web/dist-koda/. apps/web/dist/
```

`prepare-koda-web.mjs`는 전용 정적 자산을 복사하고 업로드 허용 경로·런타임 자산을 검사합니다.
기존 `.env`와 일반 웹/모바일 원본 진입점은 유지합니다. 기본 `vite.config.js`에는 KODA 인증 복귀 플러그인과 Google 웹 client ID 노출만 추가합니다.
Git push·merge·실제 배포는 수행하지 않았습니다. AWS 권한·CDN 동작은 첫 배포 시 확인해야 합니다.

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
├─ hosting/        # 기존 웹과 함께 제공하는 진입/빌드 어댑터
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
이태원·치킨·지난 할로윈 언어교환 정적 아카이브를 표시합니다.
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

이태원·치킨·지난 할로윈 아카이브는 기존 내용을 프론트에 보관하며 신청은 비활성화합니다.
지난 할로윈(2026-10-31)은 기존 포스터와 안내로 목록·달력·상세에 표시합니다. 어드민 API 변경은 필요하지 않습니다.
새 회차는 기존 API를 사용합니다.
진행 안내와 콘텐츠 소개는 공통 상세에서 표시하며 줄바꿈과 안전한 http(s) 링크를 지원합니다.

## 영어 참가비 표시

영어 화면의 회차별 USD 참가비는 운영자가 정한 고정 금액이며 환율 환산값이 아닙니다.
11월 25일 모임(`party-3982`)은 `data/englishAdmissionPrices.js`에서 일반 $17 / 얼리버드 $12.5 USD로 지정합니다.
지난 이태원 $12, 치킨챗 $15, 할로윈 $22는 각 아카이브의 `pricing.displayLabel.en`에 보관합니다.
목록·달력·상세는 같은 가격 모델을 사용합니다. 한국어 표시와 국내 결제 요청의 KRW 금액은 바꾸지 않습니다.
API 참가비가 바뀌면 기존 USD 가격을 자동 재사용하지 않고 확인 대기로 표시합니다.

## 임시 PayPal 결제

해외카드 정식 연동 전에는 상세 페이지의 신청하기 → 로그인·회원가입 → 한국인/외국인 선택창을 제공합니다.
한국인·외국인 모두 사이트 로그인이 필요하며 이미 로그인한 회원은 선택창으로 바로 이동합니다.
외국인을 직접 선택한 경우에만 구글폼 신청 버튼이 나타납니다. 계정의 국적이나 화면 언어로 자동 판별하지 않습니다.
한국인은 기존 국내 신청 화면으로 이동합니다. 선택창에 결제 통화·수단을 안내하고,
선택 후 해당 참가비를 표시합니다. 외국인에게는 입금 확인과 확정 이메일 수신 후 참가가 확정됨을 안내합니다.
선택값은 계정에 저장하지 않습니다.
최종 흐름은 사이트 로그인 → 외국인 선택 → 해당 회차 구글폼 → 폼 안의 PayPal 링크입니다.
`data/registrationForms.js`에 회차별 폼 URL을 지정합니다. 이번 회차는 운영자가 제공한 Google Form을 연결했습니다. URL이 없는 회차는 외국인 제출 버튼을 비활성화합니다. 이전 할로윈 폼이나 PayPal 직접 이동으로 대체하지 않습니다.
공통 PayPal 수취 링크는 `https://paypal.me/yangskorean/`이며 폼에서 안내합니다. 웹은 결제 금액·신청자 정보를 외부 주소에 자동 추가하지 않습니다.

회차가 신청 가능할 때만 버튼을 표시하고, 클릭 시 서버에서 같은 회차의 공개 여부·정원·마감을
다시 확인한 뒤 해당 회차의 구글폼으로 이동합니다. 이동 직전에도 사이트 로그인 상태를 확인합니다.
국내 예약·결제 절차는 거치지 않으며, 회원 계정과 PayPal 입금 내역이 자동으로 연결되지는 않습니다.
PayPal은 국내 예약 생성 기능의 활성화 설정과 독립적입니다. 운영 API를 읽는 로컬 미리보기에서도
모집 중인 회차에는 PayPal을 표시합니다. 로컬 development에서는 운영·개발 Ddakji API 모두 국내 신청을 허용하며,
명시적인 비활성화 설정과 배포 환경의 활성화 플래그는 그대로 적용합니다.
국내 결제가 비활성인 화면에서도 선택창은 열리며, 한국인을 선택하면 국내 결제 이용 불가를 안내합니다.
외국인 선택 시 폼 주소가 등록된 경우에만 구글폼으로 진행할 수 있습니다. 국내 신청은 이 설정과 독립적입니다.
공통 링크이므로 PayPal 수취 내역의 이름·이메일과 참가 회차를 운영자가 대조하고 이메일로 참가를 확정합니다.
이 버튼은 예약 생성·자동 확정·이메일 발송·환불 API를 호출하지 않으며, PayPal에서 돌아와도 성공으로 표시하지 않습니다.
구글폼 신청·PayPal 입금은 게딱지 예약 API/마이페이지에 자동 기록되지 않습니다. 운영자가 명단·입금·확정 메일·환불·정원을 관리합니다. 해외카드 결제 전환 시 폼 경로를 정식 게딱지 예약 흐름으로 교체해야 합니다.

## 인증·마이페이지·복귀

KODA 로그인 모달은 카카오·Google·이메일을 제공합니다. 카카오는 기존 웹 소셜 로그인/OAuth 화면을 재사용합니다.
Google은 KODA 전용 웹 어댑터에서 Google Identity Services를 사용합니다. `GOOGLE_CLIENT_ID`는 Google 웹 OAuth 클라이언트여야 하며 운영/개발/localhost 출처가 등록되어야 합니다.
기존 Google 회원은 KODA로 직접 복귀하며 신규 회원은 기존 SocialOriginSelect 가입 절차를 거친 후 복귀합니다.
기본 웹 설정과 KODA 설정 모두 인증 복귀 코드를 포함합니다. 소셜 로그인 출발 전 원래 KODA 주소를 저장하며, 일반 게딱지 로그인에는 복귀 동작을 적용하지 않습니다.
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
KODA 전용 취소/환불 UI, 후기 등록, WhatsApp은 아직 제공하지 않습니다.

### 이번 회차의 임시 영어 번역과 PayPal 할인

`data/englishEventCopy.js`는 party-3982의 한국어 원문과 일치할 때만 영어 제목·장소·소개·진행 안내를 적용합니다. 어드민 원문이 바뀌면 번역도 갱신해야 하며, API가 영어 값을 제공하면 그 값을 우선합니다.
`englishAdmissionPrices.js`에 기본 $17, 재참여 $13, 친구 동반 $15/인을 안내합니다. 운영자가 확정한 고정 USD 가격이며 실시간 환전이 아닙니다. 서버 옵션 ID·금액이 일치할 때만 할인 안내를 표시합니다.
외국인은 별도 DM 확인 없이 구글폼의 신청·결제 안내에 따라 PayPal에 USD 금액을 직접 입력합니다. 친구 동반 할인은 각자 신청하며 중복 할인은 불가합니다. 운영자가 입금 확인 후 이메일로 참가를 확정합니다. PayPal에 금액을 자동 전달하거나 할인 자격을 자동 검증하지 않습니다.

### 2026-11-08 점검 및 임시 운영

KODA 프론트 기획·개발 담당은 이하늘입니다. 운영 main 기준의 `release/koda-only` 작업 공간은 `/private/tmp/trio-koda-release`이며 변경은 아직 미커밋·미배포입니다. develop에는 별도 동행·채팅 작업이 있으므로 전체 병합하지 않습니다.

- 얼리버드: 11월 8일 00:00부터 11월 14일 23:59(KST)까지, 15,000원 / $12.5 USD. 다른 할인과 중복하지 않습니다. 배지는 기간 종료 시 사라지지만 실제 금액은 어드민에서 20,000원으로 복원해야 합니다. 복원 시 영어 기본 가격은 $17입니다.
- 현재 운영 API에는 기본 얼리버드 15,000원 외에 재참여 15,000원·친구 동반 17,000원 옵션이 남아 있습니다. 얼리버드 기간에 사용하지 않을 옵션은 어드민에서 정리해야 합니다. 옵션이 재생성되었으므로 종료 후 할인 재개 시 USD 매핑의 옵션 ID·금액도 재확인해야 합니다.
- 이번 회차 구글폼 URL은 `data/registrationForms.js`에 연결했습니다. 외국인 신청 시 폼으로 이동하고 폼 안의 PayPal 링크로 결제합니다. 한국인 신청은 독립적으로 기존 예약·결제를 사용합니다.
- 고정 아카이브·USD 가격·원문 매칭 영어 번역·Google Form 연결은 임시 프론트 설정입니다. 정식 다국어/해외카드 API 전환 시 해당 설정을 교체합니다.
- 전체 테스트 96개, 운영 기준 전체/부분 빌드 및 브라우저 번들 require 검사를 통과했습니다. `packages/app`, `apps/mobile`, 루트 의존성 파일은 운영 main과 동일합니다.
- 최초에는 인증 어댑터와 부분 배포 기반 반영을 위한 전체 웹 배포가 필요합니다. 이후 KODA 전용 변경만 부분 배포합니다. 공통 빌드 설정·인증 경계 변경은 전체 배포 대상입니다.
- 실제 계정의 신규 가입 완료·카카오/Google 복귀·국내 결제·환불·AWS 배포는 이번 점검에서 수행하지 않았습니다. 배포 전 실제 환경에서 최종 확인이 필요합니다.

2026-11-08 운영자 확정 변경: 이번 회차 USD 가격은 얼리버드 $12.5 / 일반 $17 / 재참여 $13 / 친구 동반 $15(1인). 제공받은 이번 회차 Google Form을 연결했으며 국내 가격과 과거 모임 가격은 유지합니다.

### 외국인 웹 프로필 입력 수정 (2026-11-09)

`ForeignRegisterProfileWeb.jsx`는 기존 외국인 소셜 가입 화면의 웹 전용 어댑터입니다. 기존 API·약관·가입 완료 경로를 유지하고, 번역된 문자열을 상태 키로 사용하던 오류를 고정 키로 수정합니다. 국적은 국가명 선택 후 ISO 두 글자 코드로 보내며 닉네임 입력과 확인 버튼이 좁은 화면 안에서 함께 줄어들도록 배치합니다. 모바일 및 공통 원본 소스는 수정하지 않습니다. 공통 가입 계약이 변경되면 웹 어댑터도 함께 동기화해야 합니다.

이 화면과 국가 데이터는 공통 가입 번들에 포함되므로 전체 웹 배포 대상으로 분류합니다. 영어 입력 → 국적 선택 → 기존 API 요청 계약의 회귀 검사 포함 99개 테스트와 운영 빌드 검사를 통과했습니다. 이번 실행 환경에서는 브라우저 제어 호스트가 없어 실제 iPhone 화면 검증은 수행하지 못했습니다.
