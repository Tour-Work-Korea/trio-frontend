# 낭만모드 독립 웹

기존 게딱지 웹과 별도 빌드·배포되는 모바일 여행 소개 페이지입니다.

- 메인: `/trips/`
- 프로그램: `/trips/programs/`
- 상세: `/trips/reground-jeju/`
- 신청: `https://ddakji.kr/contents/{partyId}`에서 기존 로그인·예약 진행
- MENU 로그인: `https://ddakji.kr/login`

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

- `apps/web`의 진입점, Vite 설정, 인증·예약·KODA 코드를 변경하거나 번들에 포함하지 않습니다.
- Pretendard 폰트 파일만 기존 저장소에서 읽어 독립 자산으로 출력합니다.
- 출력은 `trips/`, `trips-assets/`에 한정합니다. 루트 `index.html`, 기존 `/assets/`, `/koda/`는 생성하지 않습니다.
- 전용 워크플로 `deploy-trips.yml`은 main의 이 디렉터리 변경에만 동작합니다. 기존 웹 워크플로는 그대로 유지하며 모바일 워크플로에는 새 경로 제외만 추가했습니다.
- S3 저장 위치는 `s3://ddakji-react-apps/app-trips/`입니다. 기존 웹의 `app/`와 다르므로 기존 전체 배포의 삭제 범위에도 들어가지 않습니다.
- CloudFront `E2RF8PPEXW3Y9R`에 `nangman-trips-isolated` 원본과 `/trips`, `/trips/*`, `/trips-assets/*` 규칙만 추가합니다. 기본 원본·기존 경로·기존 함수·오류 응답 설정은 유지합니다.
- 새 함수 `nangman-trips-router`는 위 새 규칙에만 연결합니다. 기존 로그인·콘텐츠 주소에는 실행되지 않습니다.
- 새 CDN 설정은 `scripts/plan-cloudfront.mjs`로 기존 설정에서 생성하고 ETag 조건을 붙여 적용합니다. 이미 여행 규칙이 있으면 자동 덮어쓰기를 중단합니다.

## 데이터와 확장

목록은 운영 공개 API의 `/api/v1/user/parties/search`를 조회하여 숙소 97의 공개 DATE_EVENT만 표시합니다. 로컬에는 GET 전용 프록시를 사용합니다. 가격·모집 상태는 `/user/parties/{partyId}`로 갱신합니다. 로그인 세션을 읽거나 저장하지 않습니다.

소개·일정·숙소·정가와 API 오류 시 상세 가격은 `src/data/regroundJeju.js`의 편집값입니다. 정가: 2박 3일 179,000원, 1박 2일 139,000원. 얼리버드: 각각 159,000원, 119,000원, 11월 19일까지. 종료 후 문구와 API 가격을 함께 확인해야 합니다. 가죽 북어 시간·PRISM 신청 정보·취소 및 환불 기준은 미정입니다.

리그라운드의 새 공개 날짜 지정 이벤트는 목록에 자동 조회되고 기존 게딱지 상세로 연결됩니다. 자체 상세를 추가하려면 데이터, `model.js`, `trips/<slug>/index.html`, Vite input, CDN의 상세 라우팅을 함께 등록합니다. 다른 숙소를 추가하려면 `programsApi.js`의 숙소 선택·분류·기본 문구와 대표 프로그램을 변경합니다.

기존 로컬 시안의 내부 로그인 모달, 로그인 후 낭만모드 복귀, 낭만모드 결제 완료 화면은 이 첫 배포에 포함하지 않습니다. 신청·로그인·회원가입·결제 정책은 기존 게딱지 운영 화면을 따릅니다.
