import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../constants/colors";
import { Anniversary } from "../types";
import CustomDatePicker from "./CustomDatePicker";

interface AddAnniversaryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (anniversary: Omit<Anniversary, "id" | "daysUntil">) => void;
  editingAnniversary?: Anniversary | null;
}

const AddAnniversaryModal: React.FC<AddAnniversaryModalProps> = ({
  visible,
  onClose,
  onSave,
  editingAnniversary,
}) => {
  const [name, setName] = useState(editingAnniversary?.name || "");
  const [selectedDate, setSelectedDate] = useState(
    editingAnniversary?.date || new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("알림", "기념일 이름을 입력해주세요.");
      return;
    }

    const anniversary = {
      name: name.trim(),
      date: selectedDate,
      isCustom: true,
    };

    onSave(anniversary);
    handleClose();
  };

  const handleClose = () => {
    setName(editingAnniversary?.name || "");
    setSelectedDate(editingAnniversary?.date || new Date());
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {editingAnniversary ? "기념일 수정" : "새 기념일"}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>저장</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.label}>기념일 이름</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 첫 만남, 첫 키스, 프로포즈 등"
                value={name}
                onChangeText={setName}
                maxLength={30}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>날짜</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateButtonContent}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.dateText}>
                    {selectedDate.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.text.light}
                />
              </TouchableOpacity>

            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Ionicons
                  name="information-circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.infoText}>
                  추가한 기념일은 홈 화면의 "다가오는 기념일" 목록에 표시되며, 알림
                  설정이 활성화된 경우 기념일 알림을 받을 수 있습니다.
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      
      {showDatePicker && (
        <CustomDatePicker
          visible={showDatePicker}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  saveText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text.primary,
  },
  dateButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 12,
  },
  infoSection: {
    marginTop: 20,
  },
  infoCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});

export default AddAnniversaryModal;