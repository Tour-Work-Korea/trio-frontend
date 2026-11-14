# 낭만모드 독립 웹

기존 게딱지 웹과 별도 빌드·배포되는 모바일 여행 소개 페이지입니다.

- 메인: `/trips/`
- 프로그램: `/trips/programs/`
- 상세: `/trips/reground-jeju/`
- 로그인: `/trips/login/` (기존 게딱지 카카오 계정)
- 신청: 로그인 후 기존 `/contents-reservation`으로 이동; 뒤로 가기는 낭만모드로 복귀

## 실행과 검증

저장소 루트에서 실행합니다. 별도 계정 환경변수는 필요하지 않습니다.

```sh
node node_modules/vite/bin/vite.js --config apps/trips/vite.config.mjs --host 127.0.0.1
node --test apps/trips/src/tests/*.test.mjs apps/trips/scripts/*.test.mjs
node node_modules/vite/bin/vite.js build --config apps/trips/vite.config.mjs
node apps/trips/scripts/verify-output.mjs apps/trips/dist
node scripts/verify-web-bundle.mjs apps/trips/dist
```

## 기존 웹과 배포 경계

- 여행 번들은 `apps/web` 코드를 포함하지 않습니다. 공유 웹에는 낭만모드에서 명시적으로 시작한 카카오 로그인·가입과 예약 뒤로 가기 어댑터만 추가합니다. 일반 게딱지·KODA 흐름은 기존 처리를 사용합니다.
- Pretendard 폰트 파일만 기존 저장소에서 읽어 독립 자산으로 출력합니다.
- 출력은 `trips/`, `trips-assets/`에 한정합니다. 루트 `index.html`, 기존 `/assets/`, `/koda/`는 생성하지 않습니다.
- 전용 워크플로 `deploy-trips.yml`은 main의 이 디렉터리 변경에만 동작합니다. 공유 웹 어댑터와 authModel 변경은 별도 웹 워크플로로 배포합니다. 모바일 워크플로는 이 경로들을 제외합니다.
- S3 저장 위치는 `s3://ddakji-react-apps/app-trips/`입니다. 기존 웹의 `app/`와 다르므로 기존 전체 배포의 삭제 범위에도 들어가지 않습니다.
- CloudFront `E2RF8PPEXW3Y9R`에 `nangman-trips-isolated` 원본과 `/trips`, `/trips/*`, `/trips-assets/*` 규칙만 추가합니다. 기본 원본·기존 경로·기존 함수·오류 응답 설정은 유지합니다.
- 새 함수 `nangman-trips-router`는 위 새 규칙에만 연결합니다. 기존 로그인·콘텐츠 주소에는 실행되지 않습니다.
- 새 CDN 설정은 `scripts/plan-cloudfront.mjs`로 기존 설정에서 생성하고 ETag 조건을 붙여 적용합니다. 이미 여행 규칙이 있으면 자동 덮어쓰기를 중단합니다.

## 데이터와 확장

목록은 운영 공개 API의 `/api/v1/user/parties/search`를 조회하여 숙소 97의 공개 DATE_EVENT만 표시합니다. 로컬에는 GET 전용 프록시를 사용합니다. 가격·모집 상태는 `/user/parties/{partyId}`로 갱신합니다. 공개 조회에는 로그인 정보를 전달하지 않습니다. 메뉴를 열면 기존 게딱지 세션을 확인하고, 로그인 상태에서는 내 예약·로그아웃을 제공합니다.

소개·일정·숙소·정가와 API 오류 시 상세 가격은 `src/data/regroundJeju.js`의 편집값입니다. 2박 3일 단일 옵션 1830: 정가 179,000원, 얼리버드 159,000원, 11월 19일까지. 종료 후 문구와 API 가격을 함께 확인해야 합니다. 가죽 북어 시간과 취소 및 환불 기준은 미정입니다. PRISM은 콘텐츠 4256(12월 5일 17시)에 연결합니다.

리그라운드의 새 공개 날짜 지정 이벤트는 목록에 자동 조회되고 기존 게딱지 상세로 연결됩니다. 자체 상세를 추가하려면 데이터, `model.js`, `trips/<slug>/index.html`, Vite input, CDN의 상세 라우팅을 함께 등록합니다. 다른 숙소를 추가하려면 `programsApi.js`의 숙소 선택·분류·기본 문구와 대표 프로그램을 변경합니다.

로그인 상태는 기존 쿠키 세션으로 확인합니다. 비회원은 전용 로그인 → 기존 카카오 인증·가입 → 선택한 프로그램 신청으로 이동합니다. 취소 시 원래 여행 위치로 복귀합니다. 로컬 로그인은 운영 주소로 연결합니다. 결제와 완료 화면은 기존 게딱지 화면을 사용합니다.

## 2026-11-15 워케이션 개편

메인은 소개·공간 사진·호스트·일정·참가비·선택 프로그램을 한 페이지로 제공합니다. 하단 신청 버튼은 콘텐츠 3861의 로그인·신청 흐름으로 연결합니다. 클래스 4133·4134와 파티 4256은 별도 신청입니다. 포틀럭·바레 사진을 일정 안에 배치했습니다. 공유 웹의 인증 어댑터를 먼저 배포하고, 전용 로그인을 배포합니다. `/trips/login/`은 기존 CDN의 여행 하위 경로 fallback으로 여행 진입 HTML을 받아 앱 라우터가 로그인 화면을 표시합니다. CDN 설정 변경은 필요하지 않습니다.
