import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { saveRelationshipStartDate } from '../utils/storage';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const insets = useSafeAreaInsets();

  const handleDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleConfirm = async () => {
    try {
      await saveRelationshipStartDate(selectedDate);
      onComplete();
    } catch (error) {
      Alert.alert('오류', '날짜 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={[colors.primaryLight, colors.primary]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>WithU</Text>
          <Text style={styles.subtitle}>위듀</Text>
          
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              연인과의 특별한 순간을{'\n'}
              기록하고 기념해보세요
            </Text>
          </View>
          
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>
              연애 시작일을 알려주세요
            </Text>
            
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
          
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>시작하기</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  gradient: {
    flex: 1
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10
  },
  subtitle: {
    fontSize: 24,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 50
  },
  descriptionContainer: {
    marginBottom: 60
  },
  description: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9
  },
  dateContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 50
  },
  dateLabel: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 20,
    opacity: 0.9
  },
  dateButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  dateText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600'
  },
  confirmButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  confirmText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold'
  }
});

export default OnboardingScreen;