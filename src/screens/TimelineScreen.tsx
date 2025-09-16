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
import { useInterstitialAd } from "../components/InterstitialAdManager";
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

const { width: screenWidth } = Dimensions.get("window");

const TimelineScreen: React.FC = () => {
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

  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory);
    setSelectedImage(memory.photo || null);
    setNewMemo(memory.memo);
    setSelectedDate(memory.date);
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

  const onSwipe = (direction: "left" | "right") => {
    setViewedItemsCount((prev) => {
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

    setCurrentMemoryIndex((prev) => {
      const sortedMemories = [...memories].sort(
        (a, b) => b.timestamp - a.timestamp
      );
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
        const direction = translationX > 0 ? "right" : "left";
        const toValueX = direction === "right" ? screenWidth : -screenWidth;
        const toValueY = translationY + Math.abs(translationX) * 0.3;

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
            toValue: direction === "right" ? 1 : -1,
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

  // translateX에 따른 자동 회전 효과
  const gestureRotate = translateX.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const renderTinderCard = (
    memory: Memory,
    index: number,
    isTop: boolean = false
  ) => {
    const cardStyle = isTop
      ? {
          transform: [
            { translateX },
            { translateY },
            { rotate: gestureRotate },
          ],
          zIndex: 2,
        }
      : {
          transform: [{ scale: 0.95 }, { translateY: -10 }],
          opacity: 0.8,
          zIndex: 1,
        };

    return (
      <Animated.View key={memory.id} style={[styles.tinderCard, cardStyle]}>
        <ScrollView
          style={styles.cardScrollContent}
          contentContainerStyle={styles.cardScrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* 카드 헤더 */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardDateText}>{formatDate(memory.date)}</Text>
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
            <Text style={styles.emptySubtext}>
              달력 화면에서 추억을 만들어 보세요
            </Text>
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
            <Text style={styles.swipeHintText}>
              좌우로 스와이프하여 추억 보기
            </Text>
            <Ionicons name="heart" size={20} color={colors.primary} />
          </View>
        </View>

        {/* 카드 스택 컨테이너 */}
        <View style={styles.cardStackContainer}>
          {/* 다음 카드 (뒤에) */}
          {nextMemory &&
            renderTinderCard(nextMemory, currentMemoryIndex + 1, false)}

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
      {/* 타임라인 뷰 */}
      {renderTimelineView()}

      {/* 하단 광고 배너 */}
      <AdBanner />

      {/* 사진 갤러리 뷰어 */}
      <SimplePhotoViewer
        visible={showPhotoViewer}
        memories={memories.filter((m) => m.photo)}
        initialIndex={photoViewerIndex}
        onClose={() => setShowPhotoViewer(false)}
      />

      {/* 추억 수정 모달 */}
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
            <Text style={styles.modalTitle}>추억 수정</Text>
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
    paddingTop: 10,
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
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTimeline: {
    alignItems: "center",
  },
  emptyTimelineText: {
    fontSize: 20,
    color: colors.text.secondary,
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.text.light,
    textAlign: "center",
    lineHeight: 24,
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

export default TimelineScreen;