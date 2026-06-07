# 웹 구현 TODO

현재 리포는 모바일 앱과 웹을 같은 코드베이스에서 실행하는 모노레포 구조로 바뀌어 있습니다.

```txt
apps/mobile
apps/web
packages/app
```

웹은 Vite + React Native Web 기반으로 실행하고, 앱 화면 코드는 `packages/app`에서 최대한 공유합니다.

## 완료된 작업

- 웹 앱 워크스페이스 생성: `apps/web`
- 공통 앱 코드 분리: `packages/app`
- 웹 실행 명령 추가: `npm run web`
- 웹 빌드 명령 추가: `npm run build:web`
- 모바일 실행 명령 정리
- GitHub Actions 경로 재정리
- 웹 결제 화면 차단
- 웹용 `react-native` alias/stub 구성
- 네비게이션 웹 stub 구성
- 하단 탭바 웹 렌더링 추가
- SafeArea 웹 stub 구성
- AsyncStorage 웹 stub 구성
- SVG import를 웹에서도 컴포넌트처럼 렌더하도록 처리
- API base URL 웹 stub 연결
- 앱 전용 `require(...)` 이미지 로딩 제거
- `Image.resolveAssetSource` 웹 대응

## 현재 웹 실행 상태

웹 실행:

```bash
npm run web
```

브라우저:

```txt
http://localhost:5173/
```

확인된 검증:

```bash
npm run build:web
npm test -- --runInBand --watchman=false
```

## 남은 작업

### 1. 웹 화면 품질 정리

지금 웹은 앱 화면을 우선 뜨게 만든 상태입니다.

해야 할 것:

- 상단 헤더/하단 탭바 위치 최종 확인
- 모바일 웹 viewport별 세로 높이 확인
- 스크롤 영역이 앱과 동일하게 동작하는지 확인
- 탭 전환 시 화면 상태 유지 여부 확인
- SVG 아이콘 크기/정렬 확인
- 앱과 웹의 여백 차이 정리

### 2. 웹 네비게이션 개선

현재 웹 네비게이션은 React Navigation 원본을 쓰지 않고, 웹용 최소 stub으로 동작합니다.

해야 할 것:

- 뒤로가기 히스토리 보강
- nested navigation params 처리 보강
- 브라우저 URL 라우팅 연결 여부 결정
- 새로고침 후 현재 화면 복원 여부 결정
- 로그인 필요 화면 진입 처리 확인

### 3. 로그인/인증

앱 전용 로그인 SDK는 웹에서 그대로 쓸 수 없습니다.

앱 전용:

- `@react-native-seoul/kakao-login`
- NICE 인증 WebView
- FCM 토큰 연동

웹에서 해야 할 것:

- 기존 웹 로그인/토큰 정책 확인 후 프론트 연결
- 카카오 웹 OAuth 또는 JavaScript SDK 연결 필요 여부 확인
- 소셜 로그인 redirect 처리 필요 여부 확인
- NICE 인증을 웹 방식으로 교체

참고:

- 로그인/토큰은 기존 웹 또는 백오피스 설정을 우선 재사용합니다.
- access token / refresh token 정책은 별도 신규 설계 대상으로 보지 않습니다.

### 4. 지도

앱은 네이버맵 React Native SDK를 사용합니다.

앱 전용:

- `@mj-studio/react-native-naver-map`

현재 웹에서는 stub 처리되어 있습니다.

웹에서 해야 할 것:

- 네이버 지도 JavaScript SDK 연결
- 게스트하우스 지도 화면 구현
- 게스트하우스 리스트 맵 구현
- 일자리 지도 구현
- Meet 상세 지도 영역 구현

### 5. WebView 기반 기능 교체

앱에서는 `react-native-webview`로 처리하던 기능이 있습니다.

대상:

- 주소 검색
- 약관 HTML 표시
- NICE 본인인증
- 소셜 로그인 일부
- 이벤트 배너 HTML
- 결제창

웹에서 해야 할 것:

- 주소 검색은 브라우저 방식으로 구현
- 약관은 iframe 또는 직접 HTML 렌더링으로 구현
- 인증/소셜 로그인은 웹 redirect 흐름으로 구현
- 결제는 현재 정책대로 웹에서 막기 유지

### 6. 이미지 업로드

앱 전용:

- `react-native-image-picker`
- `react-native-image-resizer`

웹에서 해야 할 것:

- `<input type="file">` 기반 선택 구현
- 브라우저 이미지 압축 구현
- `FormData` 업로드 구현
- 커뮤니티 작성 확인
- 프로필 수정 확인
- 리뷰 작성 확인

### 7. 푸시 알림

앱 전용:

- `@react-native-firebase/messaging`
- FCM 토큰 저장
- 앱 내부 알림 이동

웹에서 해야 할 것:

- 서비스 워커 추가
- 브라우저 알림 권한 처리
- 웹 FCM 토큰 저장
- 알림 클릭 시 웹 라우팅 처리

초기 웹 버전에서는 알림센터 조회만 먼저 열어도 됩니다.

### 8. 광고

앱 전용:

- `react-native-google-mobile-ads`

웹에서 해야 할 것:

- Google AdSense 또는 Google Ad Manager로 교체
- 광고 미사용 시 빈 영역 제거

### 9. 앱 업데이트/버전 체크

앱 전용:

- `@react-native-firebase/remote-config`
- `react-native-device-info`
- 앱스토어/플레이스토어 이동

웹에서 해야 할 것:

- 배포 버전 확인 방식 결정
- 새 배포 감지 시 새로고침 유도
- 강제 업데이트 모달 웹 정책 결정

### 10. 외부 링크/앱 열기

앱에서는 `Linking`으로 외부 앱을 여는 흐름이 있습니다.

웹에서 해야 할 것:

- 외부 URL 새 탭 열기
- 지도 웹 URL로 이동
- 앱 설치 유도 링크 분리
- 네이버 길찾기 웹 URL 처리

## 다음 우선순위

1. 웹 화면 레이아웃 QA
2. 지도 웹 SDK 연결
3. 이미지 업로드 웹 구현
4. 주소 검색/NICE 인증 웹 구현
5. 약관/HTML 콘텐츠 웹 처리
6. 푸시/광고/버전 체크 후순위 처리

## 백엔드/설정 요청사항

로그인/토큰은 기존 웹 설정을 재사용하는 전제로 제외합니다.

### 1. CORS / 도메인 허용

- 개발 웹 도메인 허용: `http://localhost:5173`
- 운영 웹 도메인 허용
- API 요청 헤더 허용 확인: `Authorization`, `Content-Type`
- 이미지 업로드나 인증 콜백에서 추가 헤더가 필요한지 확인

### 2. NICE 본인인증 웹 처리

- 웹용 NICE 인증 요청 URL/콜백 URL 구성
- 인증 완료 후 프론트로 전달할 값 확정
- 기존 앱 WebView 방식 대신 웹 redirect 또는 popup 방식으로 처리 가능한지 확인

### 3. 네이버 지도

- 네이버 지도 JavaScript SDK Client ID 또는 Key 제공
- 개발/운영 웹 도메인 등록
- 지도 화면에서 사용할 위도/경도 데이터 확인
- 게스트하우스, 일자리, Meet 상세 API 응답에 좌표값이 항상 포함되는지 확인

### 4. 이미지 업로드

- 웹 브라우저 `multipart/form-data` 업로드 허용 확인
- 커뮤니티 작성, 프로필 수정, 리뷰 작성 API가 웹 FormData 업로드로 동작하는지 확인
- 이미지 최대 용량, 확장자, 업로드 개수 제한값 공유
- 서버에서 이미지 리사이징/압축을 하는지, 프론트에서 해야 하는지 확인

### 5. 주소 검색

- 웹에서 사용할 주소검색 방식 결정
  - 예: 카카오 주소검색, 도로명주소 API, 자체 주소 API
- 주소 저장 시 필요한 필드 확정
  - 예: 도로명주소, 지번주소, 우편번호, 위도/경도
- 좌표 변환이 서버에서 필요한지, 프론트에서 처리해야 하는지 확인

### 6. 약관/HTML 콘텐츠

- 약관 HTML을 웹에서 접근 가능한 URL 또는 API로 제공
- 이벤트 배너 HTML을 웹에서 iframe/direct render로 처리 가능한지 확인
- HTML 콘텐츠에 외부 script가 포함되는지 확인

### 7. 푸시 알림

- 초기 웹 버전에서는 알림센터 조회 API만 웹에서 열 수 있으면 됨
- 추후 웹 푸시 사용 시 FCM Web 설정 필요
- FCM Web VAPID Key 제공
- 웹 FCM token 저장 API 필요
- 알림 클릭 시 이동할 웹 route/path 값 제공

### 8. 광고

- 웹 광고 사용 여부 결정
- 사용 시 AdSense 또는 Google Ad Manager 슬롯 ID 제공
- 미사용 시 웹에서는 광고 영역 제거 예정

### 9. 버전/배포 체크

- 웹에서 새 배포 감지 기능이 필요한지 결정
- 필요하면 현재 웹 버전/hash를 내려주는 API 또는 정적 설정 제공
- 강제 업데이트 모달을 웹에서도 유지할지 정책 결정

### 10. 외부 링크/지도 길찾기

- 앱 딥링크 대신 웹에서 열어야 하는 URL 목록 확인
- 네이버 지도/길찾기 웹 URL에 필요한 주소, 좌표 데이터 확인
- 앱 설치 유도 링크를 웹에서 어떻게 보여줄지 정책 확인

## 백엔드 우선 확인 항목

- 웹 도메인 CORS 허용
- 네이버 지도 JS SDK 키 발급 및 도메인 등록
- NICE 웹 인증 방식/콜백 정리
- 이미지 업로드 API 웹 FormData 동작 확인
- 주소 검색 방식 결정
- 약관/HTML 콘텐츠 웹 제공 방식 확인

## 구현 원칙

화면 코드는 공유하고, 플랫폼 차이가 큰 기능만 분리합니다.

```txt
feature.native.js
feature.web.js
```

예시:

```txt
payment.native.js
payment.web.js

map.native.js
map.web.js

storage.native.js
storage.web.js
```

웹에서 임시 stub으로 막아둔 기능은 나중에 실제 웹 구현으로 교체해야 합니다.
