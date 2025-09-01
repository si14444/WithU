import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// AdMob 앱 ID
export const ADMOB_APP_ID = {
  ios: 'ca-app-pub-4535163023491412~2721722360',
  android: 'ca-app-pub-4535163023491412~4138729900',
};

// 환경변수에서 광고 단위 ID 가져오기
const getEnvAdId = (envVar: string | undefined, fallback: string): string => {
  return envVar || fallback;
};

// 광고 단위 ID
export const AD_UNIT_IDS = {
  banner: {
    ios: __DEV__ ? TestIds.BANNER : getEnvAdId(process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID, 'ca-app-pub-4535163023491412/5894664707'),
    android: __DEV__ ? TestIds.BANNER : getEnvAdId(process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID, 'ca-app-pub-4535163023491412/7754541283'),
  },
  interstitial: {
    ios: __DEV__ ? TestIds.INTERSTITIAL : getEnvAdId(process.env.EXPO_PUBLIC_ADMOB_IOS_FULL_ID, 'ca-app-pub-4535163023491412/1644444415'),
    android: __DEV__ ? TestIds.INTERSTITIAL : getEnvAdId(process.env.EXPO_PUBLIC_ADMOB_ANDROID_FULL_ID, 'ca-app-pub-4535163023491412/8724572677'),
  },
  rewarded: {
    ios: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-4535163023491412/1122334455', // 보상형 광고는 나중에 추가
    android: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-4535163023491412/1122334455', // 보상형 광고는 나중에 추가
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