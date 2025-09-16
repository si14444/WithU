import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
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
import { PanGestureHandler, State } from "react-native-gesture-handler";
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
import { useInterstitialAd } from "../components/InterstitialAdManager";

const { width: screenWidth } = Dimensions.get('window');

const MemoryScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<"calendar" | "timeline">("calendar");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemo, setNewMemo] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);
  const [viewedItemsCount, setViewedItemsCount] = useState(0);
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const { showAd } = useInterstitialAd();

  // Tinder-style animation refs
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

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
    const memoriesWithPhotos = memories.filter(m => m.photo);
    const index = memoriesWithPhotos.findIndex(m => m.id === memory.id);
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

  const renderCalendarView = () => {
    const selectedMemory = getMemoryForDate(selectedDate);
    const memoryDates = memories.map((memory) => memory.date);

    return (
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
    );
  };

  const onSwipe = (direction: 'left' | 'right') => {
    setViewedItemsCount(prev => {
      const newCount = prev + 1;
      // 10-20개 스와이프 후 전면 광고 표시
      if (newCount >= 10 && newCount <= 20 && Math.random() < 0.5) {
        setTimeout(() => {
          showAd();
          setViewedItemsCount(0);
        }, 1000);
      }
      return newCount;
    });

    setCurrentMemoryIndex(prev => {
      const sortedMemories = [...memories].sort((a, b) => b.timestamp - a.timestamp);
      const nextIndex = prev + 1;
      return nextIndex >= sortedMemories.length ? 0 : nextIndex;
    });

    // 애니메이션 리셋
    translateX.setValue(0);
    translateY.setValue(0);
    rotate.setValue(0);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, translationY, velocityX } = event.nativeEvent;
      const threshold = screenWidth * 0.3;

      if (Math.abs(translationX) > threshold || Math.abs(velocityX) > 1000) {
        // 스와이프 완료 - 카드를 화면 밖으로
        const direction = translationX > 0 ? 'right' : 'left';
        const toValueX = direction === 'right' ? screenWidth : -screenWidth;
        const toValueY = translationY + (Math.abs(translationX) * 0.3);

        Animated.parallel([
          Animated.timing(translateX, {
            toValue: toValueX,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: toValueY,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: direction === 'right' ? 1 : -1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onSwipe(direction);
        });
      } else {
        // 스와이프 취소 - 원래 위치로 돌아가기
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  // 제스처 중 회전 효과
  const rotateInterpolate = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  // translateX에 따른 자동 회전 효과
  const gestureRotate = translateX.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const renderTinderCard = (memory: Memory, index: number, isTop: boolean = false) => {
    const cardStyle = isTop ? {
      transform: [
        { translateX },
        { translateY },
        { rotate: gestureRotate },
      ],
      zIndex: 2,
    } : {
      transform: [
        { scale: 0.95 },
        { translateY: -10 },
      ],
      opacity: 0.8,
      zIndex: 1,
    };

    return (
      <Animated.View
        key={memory.id}
        style={[styles.tinderCard, cardStyle]}
      >
        <ScrollView
          style={styles.cardScrollContent}
          contentContainerStyle={styles.cardScrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* 카드 헤더 */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardDateText}>
              {formatDate(memory.date)}
            </Text>
            <Text style={styles.cardIndexText}>
              {index + 1} / {memories.length}
            </Text>
          </View>

          {/* 사진 */}
          {memory.photo && (
            <View style={styles.cardImageContainer}>
              <TouchableOpacity onPress={() => handlePhotoPress(memory)}>
                <Image
                  source={{ uri: memory.photo }}
                  style={styles.cardImage}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* 메모 */}
          <View style={styles.cardMemoContainer}>
            <Text style={styles.cardMemo}>{memory.memo}</Text>
          </View>

          {/* 액션 버튼들 (최상위 카드에만 표시) */}
          {isTop && (
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.cardActionButton, styles.editButton]}
                onPress={() => handleEditMemory(memory)}
              >
                <Ionicons name="pencil" size={18} color={colors.white} />
                <Text style={styles.actionButtonText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cardActionButton, styles.deleteButton]}
                onPress={() => handleDeleteMemory(memory.id)}
              >
                <Ionicons name="trash" size={18} color={colors.white} />
                <Text style={styles.actionButtonText}>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderTimelineView = () => {
    const sortedMemories = [...memories].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    if (sortedMemories.length === 0) {
      return (
        <View style={styles.emptyTimelineContainer}>
          <View style={styles.emptyTimeline}>
            <Ionicons name="time-outline" size={64} color={colors.text.light} />
            <Text style={styles.emptyTimelineText}>
              아직 저장된 추억이 없습니다
            </Text>
            <TouchableOpacity
              style={styles.addFirstMemoryButton}
              onPress={handleAddMemory}
            >
              <Text style={styles.addFirstMemoryText}>첫 추억 만들기</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const currentMemory = sortedMemories[currentMemoryIndex];
    const nextMemory = sortedMemories[currentMemoryIndex + 1];

    return (
      <View style={styles.tinderContainer}>
        {/* 스와이프 힌트 */}
        <View style={styles.tinderHint}>
          <View style={styles.swipeHint}>
            <Ionicons name="heart-dislike" size={20} color={colors.error} />
            <Text style={styles.swipeHintText}>좌우로 스와이프하여 추억 보기</Text>
            <Ionicons name="heart" size={20} color={colors.primary} />
          </View>
        </View>

        {/* 카드 스택 컨테이너 */}
        <View style={styles.cardStackContainer}>
          {/* 다음 카드 (뒤에) */}
          {nextMemory && renderTinderCard(nextMemory, currentMemoryIndex + 1, false)}

          {/* 현재 카드 (앞에) - 제스처 적용 */}
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            {renderTinderCard(currentMemory, currentMemoryIndex, true)}
          </PanGestureHandler>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 상단 SafeArea 배경 */}
      {/* <View style={[styles.topSafeArea, { height: insets.top }]} /> */}

      {/* 뷰 토글 헤더 */}
      <View style={styles.header}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "calendar" && styles.activeToggle,
            ]}
            onPress={() => setViewMode("calendar")}
          >
            <Ionicons
              name="calendar"
              size={20}
              color={viewMode === "calendar" ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === "calendar" && styles.activeToggleText,
              ]}
            >
              달력
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "timeline" && styles.activeToggle,
            ]}
            onPress={() => setViewMode("timeline")}
          >
            <Ionicons
              name="list"
              size={20}
              color={viewMode === "timeline" ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.toggleText,
                viewMode === "timeline" && styles.activeToggleText,
              ]}
            >
              타임라인
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 콘텐츠 */}
      {viewMode === "calendar" ? renderCalendarView() : renderTimelineView()}

      {/* 하단 광고 배너 */}
      <AdBanner />

      {/* 사진 갤러리 뷰어 */}
      <SimplePhotoViewer
        visible={showPhotoViewer}
        memories={memories.filter(m => m.photo)}
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
  topSafeArea: {
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: colors.border,
    borderRadius: 20,
    padding: 2,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  activeToggle: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: "600",
  },
  activeToggleText: {
    color: colors.white,
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
  // Tinder-style 스타일
  tinderContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tinderHint: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  swipeHintText: {
    fontSize: 14,
    color: colors.text.light,
    marginHorizontal: 12,
    fontWeight: "500",
  },
  cardStackContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  tinderCard: {
    position: "absolute",
    width: screenWidth - 40,
    height: "90%",
    backgroundColor: colors.white,
    borderRadius: 20,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: "hidden",
  },
  cardScrollContent: {
    flex: 1,
  },
  cardScrollContainer: {
    flexGrow: 1,
    padding: 25,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  cardDateText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  cardIndexText: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: "600",
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  cardImageContainer: {
    marginBottom: 25,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardImage: {
    width: "100%",
    height: 350,
    resizeMode: "cover",
  },
  cardMemoContainer: {
    backgroundColor: colors.background,
    padding: 25,
    borderRadius: 20,
    marginBottom: 30,
    borderLeftWidth: 6,
    borderLeftColor: colors.primary,
  },
  cardMemo: {
    fontSize: 20,
    color: colors.text.primary,
    lineHeight: 30,
    fontStyle: "italic",
    textAlign: "center",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  cardActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minWidth: 120,
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  emptyTimelineContainer: {
    flex: 1,
    padding: 20,
  },
  emptyTimeline: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTimelineText: {
    fontSize: 18,
    color: colors.text.light,
    marginTop: 20,
    textAlign: "center",
  },
  addFirstMemoryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  addFirstMemoryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
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

export default MemoryScreen;
