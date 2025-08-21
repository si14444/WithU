import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Anniversary } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('anniversary', {
      name: '기념일 알림',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B8A',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

export const scheduleAnniversaryNotification = async (
  anniversary: Anniversary,
  daysBefore: number = 1
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Notification permissions not granted');
      return null;
    }

    const notificationDate = new Date(anniversary.date);
    notificationDate.setDate(notificationDate.getDate() - daysBefore);
    notificationDate.setHours(10, 0, 0, 0); // 오전 10시에 알림

    // 과거 날짜면 알림 스케줄하지 않음
    if (notificationDate <= new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 기념일이 다가와요!',
        body: daysBefore === 0 
          ? `오늘은 ${anniversary.name} 기념일이에요! 🎊`
          : `${daysBefore}일 후 ${anniversary.name} 기념일이에요! 💕`,
        data: { 
          anniversaryId: anniversary.id,
          anniversaryName: anniversary.name,
          type: 'anniversary'
        },
        sound: true,
      },
      trigger: {
        date: notificationDate,
        channelId: 'anniversary',
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

export const scheduleMultipleAnniversaryNotifications = async (
  anniversaries: Anniversary[],
  notificationSettings: { 
    oneDayBefore: boolean;
    onTheDay: boolean;
    threeDaysBefore: boolean;
  } = {
    oneDayBefore: true,
    onTheDay: true,
    threeDaysBefore: false
  }
): Promise<void> => {
  try {
    // 기존 기념일 알림 모두 취소
    await cancelAllAnniversaryNotifications();

    for (const anniversary of anniversaries) {
      if (notificationSettings.threeDaysBefore) {
        await scheduleAnniversaryNotification(anniversary, 3);
      }
      
      if (notificationSettings.oneDayBefore) {
        await scheduleAnniversaryNotification(anniversary, 1);
      }
      
      if (notificationSettings.onTheDay) {
        await scheduleAnniversaryNotification(anniversary, 0);
      }
    }
  } catch (error) {
    console.error('Error scheduling multiple notifications:', error);
  }
};

export const cancelAllAnniversaryNotifications = async (): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const anniversaryNotifications = scheduledNotifications.filter(
      notification => notification.content.data?.type === 'anniversary'
    );
    
    for (const notification of anniversaryNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

export const setupNotificationListener = () => {
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification response:', response);
    const data = response.notification.request.content.data;
    
    if (data?.type === 'anniversary') {
      // 기념일 알림 탭 시 처리
      console.log('Anniversary notification tapped:', data.anniversaryName);
    }
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
};