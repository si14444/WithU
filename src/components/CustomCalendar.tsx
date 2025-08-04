import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';

const { width: screenWidth } = Dimensions.get('window');
const CALENDAR_WIDTH = screenWidth - 40;
const DAY_SIZE = (CALENDAR_WIDTH - 60) / 7;

interface CustomCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  markedDates?: Date[];
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ 
  selectedDate, 
  onDateChange, 
  markedDates = [] 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const isMarkedDate = (date: Date) => {
    return markedDates.some(markedDate => isSameDay(date, markedDate));
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const handleDatePress = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateChange(newDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = isSameDay(date, selectedDate);
      const todayDate = isToday(date);
      const hasMemory = isMarkedDate(date);
      const isPastDate = date > new Date();

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isPastDate && styles.disabledDay
          ]}
          onPress={() => !isPastDate && handleDatePress(day)}
          disabled={isPastDate}
        >
          <View style={[
            styles.dayContainer,
            todayDate && styles.todayContainer,
            isSelected && styles.selectedContainer,
            hasMemory && !isSelected && styles.memoryContainer
          ]}>
            {isSelected ? (
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.selectedGradient}
              >
                <Text style={[styles.dayText, styles.selectedText]}>
                  {day}
                </Text>
              </LinearGradient>
            ) : (
              <Text style={[
                styles.dayText,
                todayDate && styles.todayText,
                hasMemory && styles.memoryText,
                isPastDate && styles.disabledText
              ]}>
                {day}
              </Text>
            )}
            {hasMemory && !isSelected && (
              <View style={styles.memoryDot} />
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.monthYearContainer}>
          <Text style={styles.monthText}>
            {monthNames[currentMonth.getMonth()]}
          </Text>
          <Text style={styles.yearText}>
            {currentMonth.getFullYear()}
          </Text>
        </View>

        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Day Labels */}
      <View style={styles.dayLabelsContainer}>
        {dayNames.map((dayName, index) => (
          <View key={dayName} style={styles.dayLabelCell}>
            <Text style={[
              styles.dayLabelText,
              (index === 0 || index === 6) && styles.weekendLabel
            ]}>
              {dayName}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {renderCalendarDays()}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>선택된 날</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={styles.legendText}>추억이 있는 날</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primaryLight }]} />
          <Text style={styles.legendText}>오늘</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  monthYearContainer: {
    alignItems: 'center'
  },
  monthText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2
  },
  yearText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500'
  },
  dayLabelsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  dayLabelCell: {
    width: DAY_SIZE,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dayLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary
  },
  weekendLabel: {
    color: colors.primary
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5
  },
  dayContainer: {
    width: DAY_SIZE - 4,
    height: DAY_SIZE - 4,
    borderRadius: (DAY_SIZE - 4) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  selectedContainer: {
    transform: [{ scale: 1.1 }]
  },
  selectedGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (DAY_SIZE - 4) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  todayContainer: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary
  },
  memoryContainer: {
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.primaryLight
  },
  disabledDay: {
    opacity: 0.3
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary
  },
  selectedText: {
    color: colors.white,
    fontWeight: 'bold'
  },
  todayText: {
    color: colors.primary,
    fontWeight: 'bold'
  },
  memoryText: {
    color: colors.text.primary,
    fontWeight: 'bold'
  },
  disabledText: {
    color: colors.text.light
  },
  memoryDot: {
    position: 'absolute',
    bottom: 2,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6
  },
  legendText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500'
  }
});

export default CustomCalendar;