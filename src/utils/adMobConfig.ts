import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// AdMob 앱 ID
export const ADMOB_APP_ID = {
  ios: 'ca-app-pub-4535163023491412~2721722360',
  android: 'ca-app-pub-4535163023491412~4138729900',
};

// 광고 단위 ID
export const AD_UNIT_IDS = {
  banner: {
    ios: __DEV__ ? TestIds.BANNER : 'ca-app-pub-4535163023491412/1234567890', // 실제 배포 시 진짜 ID로 변경
    android: __DEV__ ? TestIds.BANNER : 'ca-app-pub-4535163023491412/1234567890', // 실제 배포 시 진짜 ID로 변경
  },
  interstitial: {
    ios: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-4535163023491412/0987654321', // 실제 배포 시 진짜 ID로 변경
    android: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-4535163023491412/0987654321', // 실제 배포 시 진짜 ID로 변경
  },
  rewarded: {
    ios: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-4535163023491412/1122334455', // 실제 배포 시 진짜 ID로 변경
    android: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-4535163023491412/1122334455', // 실제 배포 시 진짜 ID로 변경
  },
};

// 플랫폼별 광고 단위 ID 가져오기
export const getBannerAdUnitId = (): string => {
  return Platform.OS === 'ios' ? AD_UNIT_IDS.banner.ios : AD_UNIT_IDS.banner.android;
};

export const getInterstitialAdUnitId = (): string => {
  return Platform.OS === 'ios' ? AD_UNIT_IDS.interstitial.ios : AD_UNIT_IDS.interstitial.android;
};

export const getRewardedAdUnitId = (): string => {
  return Platform.OS === 'ios' ? AD_UNIT_IDS.rewarded.ios : AD_UNIT_IDS.rewarded.android;
};