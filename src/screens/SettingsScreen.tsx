import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AdBanner from "../components/AdBanner";
import { colors } from "../constants/colors";
import { generateAutoAnniversaries } from "../utils/dateUtils";
import {
  cancelAllAnniversaryNotifications,
  requestNotificationPermissions,
  scheduleMultipleAnniversaryNotifications,
} from "../utils/notifications";
import {
  getCustomAnniversaries,
  getRelationshipStartDate,
} from "../utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    onTheDay: true,
    oneDayBefore: true,
    threeDaysBefore: false,
  });
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setNotificationSettings(settings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          "알림 권한 필요",
          "기념일 알림을 받으려면 알림 권한을 허용해주세요.",
          [
            { text: "취소", style: "cancel" },
            {
              text: "설정으로 이동",
              onPress: () => {
                // 설정 앱으로 이동하는 로직
              },
            },
          ]
        );
        return;
      }

      // 기념일 알림 스케줄링
      await scheduleNotificationsWithSettings({ ...notificationSettings, enabled });
    } else {
      // 모든 알림 취소
      await cancelAllAnniversaryNotifications();
    }

    const newSettings = { ...notificationSettings, enabled };
    setNotificationSettings(newSettings);
    await saveNotificationSettings(newSettings);
  };

  const scheduleNotifications = async () => {
    try {
      const startDate = await getRelationshipStartDate();
      if (!startDate) return;

      const autoAnniversaries = generateAutoAnniversaries(startDate);
      const customAnniversaries = await getCustomAnniversaries();
      const allAnniversaries = [...autoAnniversaries, ...customAnniversaries];

      await scheduleMultipleAnniversaryNotifications(allAnniversaries, {
        onTheDay: notificationSettings.onTheDay,
        oneDayBefore: notificationSettings.oneDayBefore,
        threeDaysBefore: notificationSettings.threeDaysBefore,
      });
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  };

  const handleNotificationSettingChange = async (
    setting: string,
    value: boolean
  ) => {
    const newSettings = { ...notificationSettings, [setting]: value };
    setNotificationSettings(newSettings);
    await saveNotificationSettings(newSettings);

    if (newSettings.enabled) {
      await scheduleNotificationsWithSettings(newSettings);
    }
  };

  const saveNotificationSettings = async (settings: typeof notificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const scheduleNotificationsWithSettings = async (settings: typeof notificationSettings) => {
    try {
      // 기존 알림 모두 취소
      await cancelAllAnniversaryNotifications();
      
      const startDate = await getRelationshipStartDate();
      if (!startDate) return;

      const autoAnniversaries = generateAutoAnniversaries(startDate);
      const customAnniversaries = await getCustomAnniversaries();
      const allAnniversaries = [...autoAnniversaries, ...customAnniversaries];

      await scheduleMultipleAnniversaryNotifications(allAnniversaries, {
        onTheDay: settings.onTheDay,
        oneDayBefore: settings.oneDayBefore,
        threeDaysBefore: settings.threeDaysBefore,
      });
    } catch (error) {
      console.error('Error scheduling notifications with settings:', error);
    }
  };

  const SettingItem: React.FC<{
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }> = ({ title, subtitle, value, onValueChange, disabled = false }) => (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.settingSubtitle, disabled && styles.disabledText]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ 
          false: disabled ? colors.border : colors.border, 
          true: disabled ? colors.border : colors.primaryLight 
        }}
        thumbColor={
          disabled 
            ? colors.text.light 
            : value 
              ? colors.primary 
              : colors.white
        }
        disabled={disabled}
        ios_backgroundColor={disabled ? colors.border : colors.border}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 상단 SafeArea 배경 */}
      {/* <View style={[styles.topSafeArea, { height: insets.top }]} /> */}

      <ScrollView style={styles.scrollView}>
        {/* 알림 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림 설정</Text>

          <SettingItem
            title="기념일 알림"
            subtitle="다가오는 기념일을 알림으로 받아보세요"
            value={notificationSettings.enabled}
            onValueChange={handleNotificationToggle}
          />

          <SettingItem
            title="당일 알림"
            subtitle="기념일 당일 오전 10시에 알림"
            value={notificationSettings.onTheDay}
            onValueChange={(value) =>
              handleNotificationSettingChange("onTheDay", value)
            }
            disabled={!notificationSettings.enabled}
          />

          <SettingItem
            title="1일 전 알림"
            subtitle="기념일 하루 전에 미리 알림"
            value={notificationSettings.oneDayBefore}
            onValueChange={(value) =>
              handleNotificationSettingChange("oneDayBefore", value)
            }
            disabled={!notificationSettings.enabled}
          />

          <SettingItem
            title="3일 전 알림"
            subtitle="기념일 3일 전에 미리 알림"
            value={notificationSettings.threeDaysBefore}
            onValueChange={(value) =>
              handleNotificationSettingChange("threeDaysBefore", value)
            }
            disabled={!notificationSettings.enabled}
          />
        </View>

        {/* 앱 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.menuItemText}>앱 버전</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.versionText}>1.0.0</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.light}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.menuItemText}>도움말</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.light}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="shield-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.menuItemText}>개인정보 처리방침</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.light}
            />
          </TouchableOpacity>
        </View>

        {/* 데이터 관리 섹션 */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>데이터 관리</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              Alert.alert(
                "데이터 백업",
                "현재 버전에서는 지원되지 않는 기능입니다.",
                [{ text: "확인" }]
              );
            }}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="cloud-upload-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.menuItemText}>데이터 백업</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.light}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              Alert.alert(
                "모든 데이터 삭제",
                "정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
                [
                  { text: "취소", style: "cancel" },
                  {
                    text: "삭제",
                    style: "destructive",
                    onPress: () => {
                      // 데이터 삭제 로직
                    },
                  },
                ]
              );
            }}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="trash-outline" size={24} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>
                모든 데이터 삭제
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.light}
            />
          </TouchableOpacity>
        </View> */}
      </ScrollView>

      {/* 하단 광고 배너 */}
      <AdBanner />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topSafeArea: {
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    backgroundColor: colors.white,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingText: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  disabledText: {
    color: colors.text.light,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 15,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginRight: 8,
  },
});

export default SettingsScreen;
