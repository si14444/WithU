import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AdBanner from "../components/AdBanner";
import CustomCalendar from "../components/CustomCalendar";
import SimplePhotoViewer from "../components/SimplePhotoViewer";
import { colors } from "../constants/colors";
import { Memory } from "../types";
import { formatDate } from "../utils/dateUtils";
import {
  addMemory,
  deleteMemory,
  getMemories,
  updateMemory,
} from "../utils/storage";

const CalendarScreen: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemo, setNewMemo] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      const loadedMemories = await getMemories();
      setMemories(loadedMemories);
    } catch (error) {
      console.error("Error loading memories:", error);
    }
  };

  const onDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const getMemoryForDate = (date: Date): Memory | undefined => {
    return memories.find(
      (memory) => memory.date.toDateString() === date.toDateString()
    );
  };

  const handleAddMemory = () => {
    setEditingMemory(null);
    setSelectedImage(null);
    setNewMemo("");
    setShowAddModal(true);
  };

  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory);
    setSelectedImage(memory.photo || null);
    setNewMemo(memory.memo);
    setShowAddModal(true);
  };

  const handleDeleteMemory = (memoryId: string) => {
    Alert.alert("추억 삭제", "정말로 이 추억을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMemory(memoryId);
            await loadMemories();
          } catch (error) {
            Alert.alert("오류", "추억 삭제 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  const handlePhotoPress = (memory: Memory) => {
    const memoriesWithPhotos = memories.filter((m) => m.photo);
    const index = memoriesWithPhotos.findIndex((m) => m.id === memory.id);
    if (index >= 0) {
      setPhotoViewerIndex(index);
      setShowPhotoViewer(true);
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "권한 필요",
        "사진을 선택하려면 갤러리 접근 권한이 필요합니다."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSaveMemory = async () => {
    if (!newMemo.trim()) {
      Alert.alert("알림", "메모를 입력해주세요.");
      return;
    }

    try {
      if (editingMemory) {
        // 수정 모드
        await updateMemory(editingMemory.id, {
          photo: selectedImage || undefined,
          memo: newMemo.trim(),
          timestamp: Date.now(),
        });
      } else {
        // 새 추억 추가
        const newMemory: Memory = {
          id: Date.now().toString(),
          date: selectedDate,
          photo: selectedImage || undefined,
          memo: newMemo.trim(),
          timestamp: Date.now(),
        };
        await addMemory(newMemory);
      }

      await loadMemories();
      setShowAddModal(false);
      setNewMemo("");
      setSelectedImage(null);
      setEditingMemory(null);
    } catch (error) {
      Alert.alert("오류", "추억 저장 중 오류가 발생했습니다.");
    }
  };

  const selectedMemory = getMemoryForDate(selectedDate);
  const memoryDates = memories.map((memory) => memory.date);

  return (
    <View style={styles.container}>
      {/* 캘린더 뷰 */}
      <ScrollView
        style={styles.calendarContainer}
        showsVerticalScrollIndicator={false}
      >
        <CustomCalendar
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          markedDates={memoryDates}
        />

        <View style={styles.memoryDetail}>
          <View style={styles.memoryHeader}>
            <View style={styles.dateHeaderContainer}>
              <Text style={styles.selectedDateText}>
                {formatDate(selectedDate)}
              </Text>
              {selectedMemory && (
                <View style={styles.memoryBadge}>
                  <Ionicons name="heart" size={14} color={colors.white} />
                  <Text style={styles.memoryBadgeText}>추억</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddMemory}
            >
              <Ionicons name="add" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {selectedMemory ? (
            <ScrollView
              style={styles.memoryContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedMemory.photo && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: selectedMemory.photo }}
                    style={styles.memoryImage}
                  />
                </View>
              )}
              <View style={styles.memoContainer}>
                <Text style={styles.memoryMemo}>{selectedMemory.memo}</Text>
              </View>

              {/* 수정/삭제 버튼 */}
              <View style={styles.memoryActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditMemory(selectedMemory)}
                >
                  <Ionicons name="pencil" size={16} color={colors.white} />
                  <Text style={styles.actionButtonText}>수정</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteMemory(selectedMemory.id)}
                >
                  <Ionicons name="trash" size={16} color={colors.white} />
                  <Text style={styles.actionButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.noMemory}>
              <View style={styles.noMemoryIcon}>
                <Ionicons
                  name="heart-outline"
                  size={48}
                  color={colors.primary}
                  opacity={0.3}
                />
              </View>
              <Text style={styles.noMemoryText}>이 날의 추억이 없습니다</Text>
              <Text style={styles.noMemorySubtext}>
                위의 + 버튼을 눌러 특별한 순간을 기록해보세요
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 하단 광고 배너 */}
      <AdBanner />

      {/* 사진 갤러리 뷰어 */}
      <SimplePhotoViewer
        visible={showPhotoViewer}
        memories={memories.filter((m) => m.photo)}
        initialIndex={photoViewerIndex}
        onClose={() => setShowPhotoViewer(false)}
      />

      {/* 추억 추가 모달 */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingMemory ? "추억 수정" : "새 추억"}
            </Text>
            <TouchableOpacity onPress={handleSaveMemory}>
              <Text style={styles.modalSave}>저장</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDateText}>{formatDate(selectedDate)}</Text>

            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={handleImagePicker}
            >
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color={colors.text.light} />
                  <Text style={styles.imagePlaceholderText}>사진 선택</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.memoInput}
              placeholder="이 날의 추억을 적어보세요..."
              multiline
              value={newMemo}
              onChangeText={setNewMemo}
              maxLength={500}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  calendarContainer: {
    flex: 1,
  },
  memoryDetail: {
    marginTop: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  memoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dateHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginRight: 10,
  },
  memoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memoryBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  memoryContent: {
    maxHeight: 400,
  },
  imageContainer: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  memoryImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },
  memoContainer: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  memoryMemo: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
    fontStyle: "italic",
  },
  noMemory: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noMemoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  noMemoryText: {
    fontSize: 18,
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: "600",
  },
  noMemorySubtext: {
    fontSize: 14,
    color: colors.text.light,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  memoryActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  modalSave: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDateText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  imagePickerButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: colors.text.light,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: colors.text.light,
    marginTop: 10,
  },
  memoInput: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default CalendarScreen;