import React, { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StackNavigator from './src/navigation/StackNavigator';
import OnboardingScreen from './src/components/OnboardingScreen';
import { getRelationshipStartDate } from './src/utils/storage';
import { setupNotificationListener } from './src/utils/notifications';
import { initializeAdMob } from './src/utils/adMobInitializer';
import InterstitialAdManager, { useInterstitialAd } from './src/components/InterstitialAdManager';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasStartDate, setHasStartDate] = useState(false);
  const [appStartTime] = useState(Date.now());
  const { showAd } = useInterstitialAd();

  useEffect(() => {
    // Google Mobile Ads 초기화
    initializeAdMob();
    
    // 알림 리스너 설정
    const unsubscribe = setupNotificationListener();
    
    checkStartDate();
    
    // 앱 상태 변화 감지
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // 앱이 백그라운드로 갈 때 시간 저장
        await AsyncStorage.setItem('lastAppCloseTime', Date.now().toString());
      } else if (nextAppState === 'active') {
        // 앱이 다시 활성화될 때 전면 광고 표시 시도
        setTimeout(() => {
          showAd('app_resume');
        }, 2000); // 2초 후 표시 (사용자가 앱에 적응할 시간)
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // 앱 첫 실행 후 30초 뒤 전면 광고 표시 시도
    const firstAdTimer = setTimeout(() => {
      showAd();
    }, 30000);

    return () => {
      unsubscribe();
      subscription?.remove();
      clearTimeout(firstAdTimer);
    };
  }, []);

  const checkStartDate = async () => {
    try {
      const startDate = await getRelationshipStartDate();
      setHasStartDate(!!startDate);
    } catch (error) {
      console.error('Error checking start date:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setHasStartDate(true);
  };

  if (isLoading) {
    return null; // 또는 로딩 스크린
  }

  return (
    <SafeAreaProvider>
      {!hasStartDate ? (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      ) : (
        <NavigationContainer>
          <StackNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}
