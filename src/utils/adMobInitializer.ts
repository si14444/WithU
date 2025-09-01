import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

export const initializeAdMob = async (): Promise<void> => {
  try {
    // AdMob 초기화
    await mobileAds().initialize();
    
    // 광고 설정
    await mobileAds().setRequestConfiguration({
      // 최대 광고 콘텐츠 등급 설정 (일반)
      maxAdContentRating: MaxAdContentRating.G,
      
      // 태그된 어린이 광고 처리 설정
      tagForChildDirectedTreatment: false,
      
      // 성인 미만 사용자 처리 설정
      tagForUnderAgeOfConsent: false,
      
      // 테스트 디바이스 ID (개발 중에만 사용)
      testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
    });
    
    console.log('AdMob initialized successfully');
  } catch (error) {
    console.error('AdMob initialization failed:', error);
  }
};