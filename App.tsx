import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import mobileAds from 'react-native-google-mobile-ads';
import StackNavigator from './src/navigation/StackNavigator';
import OnboardingScreen from './src/components/OnboardingScreen';
import { getRelationshipStartDate } from './src/utils/storage';
import { setupNotificationListener } from './src/utils/notifications';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasStartDate, setHasStartDate] = useState(false);

  useEffect(() => {
    // Google Mobile Ads 초기화 (주석 처리)
    // mobileAds().initialize();
    
    // 알림 리스너 설정
    const unsubscribe = setupNotificationListener();
    
    checkStartDate();
    
    return unsubscribe;
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
