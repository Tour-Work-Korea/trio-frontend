# 게하·파티 앱 링크 연결

## 운영 연결 설정 (2026-11-08)

Apple Developer에서 Associated Domains 활성화를 완료했다는 사용자 확인에 따라
운영 도메인 `ddakji.kr`에 다음 설정을 반영했다.

- iOS: Xcode Associated Domains capability, `applinks:ddakji.kr` entitlement,
  AppDelegate의 Universal Link → RCTLinkingManager 전달.
- 웹: `public/.well-known/apple-app-site-association`에 기존 entitlement의
  앱 식별자 `59P3UT5738.com.haneul.workaway` 등록.
  게하·콘텐츠 상세 경로를 연결하며 검색·리뷰·인기 목록 및 하위 화면은 제외한다.
- Android: HTTPS 상세 경로를 `autoVerify` 필터로 등록. 기존 ddakji 커스텀
  스킴은 독립 필터로 유지한다. `assetlinks.json`에는 사용자가 제공한 Play 앱
  서명 인증서 SHA-256과 기존 패키지 `com.triofrontendapp`을 사용한다.
- 웹 배포 workflow: 두 인증 파일을 S3에 `application/json`, 5분 캐시로
  명시 업로드한 뒤 기존 CloudFront 캐시 무효화 단계로 연결한다.

기존 앱의 HTTPS 상세 URL 해석기는 `https://ddakji.kr/guesthouses/{숫자ID}`와
`https://ddakji.kr/contents/{숫자ID}`를 해당 상세 화면으로 전달한다.
쿼리의 `shared=1`은 앱 상세 ID 해석에 영향을 주지 않는다.

## 사용자 동작

- 인증된 운영 공유 링크를 외부 앱에서 누르면 설치된 새 앱의 상세 화면으로
  연결한다. 앱이 없으면 웹 상세를 보여준다.
- 웹에 들어온 모바일 사용자는 기존 ‘앱으로 보기’ / ‘웹으로 계속 보기’를
  사용한다. QR 및 OS 스토어 선택 버튼은 없다.
- ‘앱으로 보기’의 기존 커스텀 스킴 시도가 앱을 열지 못하면 OS별 스토어로
  자동 이동한다. 이 타이머 방식에는 아래 Safari 제약이 남아 있다.
- PC는 웹 상세를 바로 보여준다.
- 웹 선택 후에는 shared 표시를 제거하고 같은 탭에서 선택을 기억한다.

## 배포 시 필요한 사항

이 작업은 파일 수정과 정적 검토만 수행했다. 앱 배포·웹 배포·커밋·푸시는
실행하지 않았다. Apple 포털 설정이나 예전 앱 배포만으로 이 코드가 적용되지는 않는다.

1. 웹 배포로 운영 도메인의 `/.well-known/apple-app-site-association` 및
   `/.well-known/assetlinks.json`을 먼저 공개한다. 두 경로는 인증·리다이렉트·
   SPA 주소 재작성 없이 HTTPS 200 JSON을 제공해야 한다. CDN/인프라의 해당
   경로 예외 처리는 이 저장소 밖의 설정이므로 여기서 적용 여부를 확정하지 않았다.
2. iOS 서명 프로파일에 Associated Domains 권한이 포함되어야 한다.
   기존 Fastlane match는 CI에서 readonly로 인증서를 가져오므로, 오래된
   프로파일이라면 Apple 권한 활성화 후 프로파일을 갱신해 match 저장소에
   반영해야 한다. 실제 인증서/프로파일 발급은 이 작업에서 수행하지 않았다.
3. 이번 entitlement와 AppDelegate를 포함한 iOS 앱, HTTPS 필터를 포함한
   Android 앱을 새로 빌드·배포해야 한다. 스토어에 이미 올라간 구버전은
   저장소 수정만으로 바뀌지 않는다.
4. 배포 후 새 앱을 설치한 실제 기기에서 외부 메시지의 공유 링크로 확인한다.
   OS/Apple CDN 인증 캐시와 사용자의 ‘브라우저로 열기’ 선택에 영향을 받는다.

## 개발 환경과 남은 제약

- 개발 API 데이터를 운영 ID로 오인하지 않도록 개발 앱 공유 도메인은
  `https://app-dev.ddakji.kr`이다. 현재 이 도메인은 접근 인증이 있으므로
  운영 앱의 Associated Domains/App Links 대상에 넣지 않았다. 개발 웹 링크를
  검증하려면 별도로 공개 인증 파일 제공과 환경 분리 정책이 필요하다.
- 운영 `/guesthouses/14`는 운영 API에 존재하지 않는 데이터로 확인한 이력이
  있다. 인증 설정으로 개발 데이터가 운영 서버에 생기는 것은 아니다.
- Safari는 같은 도메인 내 링크 이동이나 사용자의 브라우저 선호에 따라 웹을
  유지할 수 있다. 웹에서 커스텀 스킴을 여는 확인창을 오래 기다린 경우의
  스토어 이동 충돌은 이전 실제 검증에서 미해결이다. Universal Links 설정이
  이 웹 타이머 경로까지 해결했다고 주장하지 않는다.
- Android는 `/guesthouses/`, `/contents/` 하위 경로를 네이티브 필터가 받지만,
  현재 앱 상세 해석기는 숫자 ID의 상세 주소만 처리한다. 공유 주소는 해당
  숫자 ID 형식으로만 생성한다.
- 이번 설정 변경 후 테스트·빌드는 새로 실행하지 않았다. 기존 테스트 결과와
  구체적인 실패/미검증 범위는 `DEEPLINK_TEST_REPORT.md`에 기록했다.

## 공식 문서

- Apple: https://developer.apple.com/documentation/xcode/supporting-associated-domains
- Apple Safari 제약: https://developer.apple.com/documentation/technotes/tn3155-debugging-universal-links
- Android: https://developer.android.com/training/app-links/verify-applinks
