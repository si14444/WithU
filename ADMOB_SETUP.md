# Google AdMob 설정 완료

## 설정 완료된 사항

### 1. 패키지 및 기본 설정
- ✅ `react-native-google-mobile-ads` v15.4.0 설치됨
- ✅ `app.json`에 AdMob 플러그인 설정 완료
  - Android App ID: `ca-app-pub-4535163023491412~4138729900`  
  - iOS App ID: `ca-app-pub-4535163023491412~2721722360`

### 2. AdMob 유틸리티 파일 생성
- ✅ `src/utils/adMobConfig.ts` - 광고 단위 ID 관리
- ✅ `src/utils/adMobInitializer.ts` - AdMob 초기화 설정

### 3. 컴포넌트 업데이트
- ✅ `src/components/AdBanner.tsx` - 배너 광고 활성화
- ✅ `App.tsx` - AdMob 초기화 호출 추가

### 4. 홈 화면 통합
- ✅ `src/screens/HomeScreen.tsx`에 AdBanner 컴포넌트 연결됨

## 테스트 방법

1. **개발 환경**
   ```bash
   npm start
   # 또는
   expo start
   ```

2. **디바이스/시뮬레이터에서 확인**
   - 개발 모드에서는 Google의 테스트 광고가 표시됩니다
   - 홈 화면 하단에 배너 광고가 나타납니다

## 실제 배포 시 필요한 작업

### 1. 실제 광고 단위 ID 설정
`src/utils/adMobConfig.ts` 파일에서 다음 ID들을 실제 값으로 변경:

```typescript
export const AD_UNIT_IDS = {
  banner: {
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // 실제 iOS 배너 ID
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY', // 실제 Android 배너 ID
  },
  // ...
};
```

### 2. Google AdMob 콘솔에서 설정
1. [Google AdMob 콘솔](https://admob.google.com) 로그인
2. 앱 등록 및 광고 단위 생성
3. 생성된 광고 단위 ID를 코드에 적용

### 3. 앱 스토어 배포 전 확인사항
- AdMob 정책 준수 확인
- 적절한 광고 위치 배치
- 사용자 경험 저해하지 않는 광고 빈도

## 추가 광고 유형 구현 가능

현재는 배너 광고만 구현되어 있으며, 필요 시 다음 유형들도 추가 가능:

1. **전면 광고 (Interstitial)**
2. **보상형 광고 (Rewarded)**
3. **네이티브 광고 (Native)**

## 문제 해결

### 광고가 표시되지 않는 경우
1. 인터넷 연결 확인
2. AdMob 앱 ID와 광고 단위 ID 확인
3. 테스트 디바이스에서 테스트 광고 활성화 여부 확인
4. 로그에서 오류 메시지 확인

### 로그 확인 방법
```bash
# React Native 로그 확인
npx react-native log-android  # Android
npx react-native log-ios      # iOS

# 또는 Expo 개발자 도구에서 로그 확인
```

## 현재 상태
✅ Google AdMob 설정 완료 및 테스트 준비 완료