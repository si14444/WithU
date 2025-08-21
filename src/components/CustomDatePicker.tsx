import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../constants/colors";

interface CustomDatePickerProps {
  visible: boolean;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  visible,
  selectedDate,
  onDateSelect,
  onClose,
}) => {
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());

  const months = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDatePress = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateSelect(newDate);
  };

  const isSelectedDate = (day: number) => {
    return selectedDate.getFullYear() === currentYear &&
           selectedDate.getMonth() === currentMonth &&
           selectedDate.getDate() === day;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === currentYear &&
           today.getMonth() === currentMonth &&
           today.getDate() === day;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderCalendarDays = () => {
    const days = generateCalendarDays();
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      const week = days.slice(i, i + 7);
      weeks.push(week);
    }

    return weeks.map((week, weekIndex) => (
      <View key={weekIndex} style={styles.weekRow}>
        {week.map((day, dayIndex) => (
          <TouchableOpacity
            key={dayIndex}
            style={[
              styles.dayButton,
              day === null && styles.emptyDay,
              isSelectedDate(day!) && styles.selectedDay,
              isToday(day!) && !isSelectedDate(day!) && styles.todayDay,
            ]}
            onPress={() => day && handleDatePress(day)}
            disabled={day === null}
          >
            {isSelectedDate(day!) ? (
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.selectedDayGradient}
              >
                <Text style={styles.selectedDayText}>{day}</Text>
              </LinearGradient>
            ) : (
              <Text style={[
                styles.dayText,
                isToday(day!) && styles.todayText,
                day === null && styles.emptyDayText,
              ]}>
                {day}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    ));
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>날짜 선택</Text>
                <Text style={styles.headerSubtitle}>특별한 날을 골라주세요</Text>
              </View>

              <View style={styles.headerIcon}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </View>
            </View>
          </View>

          <View style={styles.calendarContainer}>
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateMonth('prev')}
              >
                <Ionicons name="chevron-back" size={24} color={colors.primary} />
              </TouchableOpacity>
              
              <View style={styles.monthYearContainer}>
                <Text style={styles.monthText}>
                  {months[currentMonth]}
                </Text>
                <Text style={styles.yearText}>{currentYear}</Text>
              </View>

              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateMonth('next')}
              >
                <Ionicons name="chevron-forward" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysContainer}>
              {weekDays.map((day, index) => (
                <View key={index} style={styles.weekDayItem}>
                  <Text style={[
                    styles.weekDayText,
                    index === 0 && styles.sundayText,
                    index === 6 && styles.saturdayText,
                  ]}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            <ScrollView 
              style={styles.calendarGrid}
              showsVerticalScrollIndicator={false}
            >
              {renderCalendarDays()}
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <View style={styles.selectedDateContainer}>
              <Ionicons name="heart" size={16} color={colors.primary} />
              <Text style={styles.selectedDateText}>
                선택된 날짜: {selectedDate.toLocaleDateString("ko-KR")}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 24,
    width: "100%",
    maxWidth: 350,
    maxHeight: "75%",
    elevation: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  headerIcon: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  monthYearContainer: {
    alignItems: "center",
  },
  monthText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  yearText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  weekDaysContainer: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  weekDayItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  sundayText: {
    color: colors.error,
  },
  saturdayText: {
    color: colors.primary,
  },
  calendarGrid: {
    paddingHorizontal: 4,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dayButton: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 1,
    borderRadius: 8,
  },
  selectedDay: {
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  selectedDayGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDayText: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.white,
  },
  todayDay: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  emptyDay: {
    backgroundColor: "transparent",
  },
  dayText: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: "500",
  },
  todayText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  emptyDayText: {
    color: "transparent",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  selectedDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDateText: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: "600",
    marginLeft: 6,
  },
});

export default CustomDatePicker;