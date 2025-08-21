import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddAnniversaryModal from "../components/AddAnniversaryModal";
import AdBanner from "../components/AdBanner";
import { colors } from "../constants/colors";
import { Anniversary, Memory } from "../types";
import {
  calculateDaysBetween,
  formatDate,
  formatDDay,
  generateAutoAnniversaries,
  updateAnniversaryDaysUntil,
} from "../utils/dateUtils";
import {
  addCustomAnniversary,
  deleteCustomAnniversary,
  getCustomAnniversaries,
  getMemories,
  getRelationshipStartDate,
  updateCustomAnniversary,
} from "../utils/storage";

const HomeScreen: React.FC = () => {
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [upcomingAnniversaries, setUpcomingAnniversaries] = useState<
    Anniversary[]
  >([]);
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddAnniversaryModal, setShowAddAnniversaryModal] = useState(false);
  const [editingAnniversary, setEditingAnniversary] = useState<Anniversary | null>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const loadData = async () => {
    try {
      const startDate = await getRelationshipStartDate();
      if (startDate) {
        const today = new Date();
        const days = calculateDaysBetween(startDate, today);
        setCurrentDay(days);

        // 자동 기념일 생성
        const autoAnniversaries = generateAutoAnniversaries(startDate);

        // 사용자 정의 기념일 로드
        const customAnniversaries = await getCustomAnniversaries();

        // 사용자 정의 기념일의 daysUntil 값 업데이트
        const updatedCustomAnniversaries = updateAnniversaryDaysUntil(customAnniversaries);

        // 모든 기념일 합치고 날짜순 정렬
        const allAnniversaries = [...autoAnniversaries, ...updatedCustomAnniversaries]
          .filter((anniversary) => anniversary.daysUntil >= 0)
          .sort((a, b) => a.daysUntil - b.daysUntil)
          .slice(0, 5); // 상위 5개만 표시

        setUpcomingAnniversaries(allAnniversaries);

        // 최근 추억 로드 (최신 3개)
        const memories = await getMemories();
        const sortedMemories = memories
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 3);
        setRecentMemories(sortedMemories);
      }
    } catch (error) {
      console.error("Error loading home data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getDayText = (daysUntil: number): string => {
    if (daysUntil === 0) return "오늘";
    if (daysUntil === 1) return "내일";
    return `${daysUntil}일 후`;
  };

  const handleAddAnniversary = () => {
    setEditingAnniversary(null);
    setShowAddAnniversaryModal(true);
  };

  const handleEditAnniversary = (anniversary: Anniversary) => {
    setEditingAnniversary(anniversary);
    setShowAddAnniversaryModal(true);
  };

  const handleDeleteAnniversary = (anniversary: Anniversary) => {
    if (!anniversary.isCustom) {
      Alert.alert("알림", "자동 기념일은 삭제할 수 없습니다.");
      return;
    }

    Alert.alert(
      "기념일 삭제",
      `'${anniversary.name}' 기념일을 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCustomAnniversary(anniversary.id);
              await loadData();
            } catch (error) {
              Alert.alert("오류", "기념일 삭제 중 오류가 발생했습니다.");
            }
          },
        },
      ]
    );
  };

  const handleSaveAnniversary = async (anniversary: Omit<Anniversary, "id" | "daysUntil">) => {
    try {
      if (editingAnniversary) {
        await updateCustomAnniversary(editingAnniversary.id, anniversary);
      } else {
        await addCustomAnniversary(anniversary);
      }
      await loadData();
      setShowAddAnniversaryModal(false);
    } catch (error) {
      Alert.alert("오류", "기념일 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      {/* 상단 SafeArea 배경 */}
      {/* <View style={[styles.topSafeArea, { height: insets.top }]} /> */}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* D-Day 카드 */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.ddayCard}
        >
          <View style={styles.ddayContent}>
            <Ionicons name="heart" size={40} color={colors.white} />
            <Text style={styles.ddayText}>{formatDDay(currentDay)}</Text>
            <Text style={styles.ddaySubtext}>함께한 소중한 시간</Text>
          </View>
        </LinearGradient>

        {/* 다가오는 기념일 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>다가오는 기념일</Text>
            <TouchableOpacity
              style={styles.addAnniversaryButton}
              onPress={handleAddAnniversary}
            >
              <Ionicons name="add" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {upcomingAnniversaries.length > 0 ? (
            upcomingAnniversaries.map((anniversary) => (
              <View key={anniversary.id} style={styles.anniversaryItem}>
                <View style={styles.anniversaryInfo}>
                  <View style={styles.anniversaryHeader}>
                    <Text style={styles.anniversaryName}>{anniversary.name}</Text>
                    {anniversary.isCustom && (
                      <View style={styles.anniversaryActions}>
                        <TouchableOpacity
                          style={styles.anniversaryActionButton}
                          onPress={() => handleEditAnniversary(anniversary)}
                        >
                          <Ionicons name="pencil" size={14} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.anniversaryActionButton}
                          onPress={() => handleDeleteAnniversary(anniversary)}
                        >
                          <Ionicons name="trash" size={14} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <Text style={styles.anniversaryDate}>
                    {formatDate(anniversary.date)}
                  </Text>
                </View>
                <View style={styles.anniversaryDays}>
                  <Text style={styles.daysUntilText}>
                    {getDayText(anniversary.daysUntil)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={colors.text.light}
              />
              <Text style={styles.emptyText}>다가오는 기념일이 없습니다</Text>
            </View>
          )}
        </View>

        {/* 최근 추억 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="images" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>최근 추억</Text>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => navigation.navigate("Memory" as never)}
            >
              <Text style={styles.moreText}>더보기</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {recentMemories.length > 0 ? (
            <View>
              {recentMemories.map((memory) => (
                <TouchableOpacity
                  key={memory.id}
                  style={styles.memoryItem}
                  onPress={() => navigation.navigate("Memory" as never)}
                >
                  <View style={styles.memoryContent}>
                    <View style={styles.memoryDateContainer}>
                      <Text style={styles.memoryDate}>
                        {formatDate(memory.date)}
                      </Text>
                    </View>
                    <Text style={styles.memoryMemo} numberOfLines={2}>
                      {memory.memo}
                    </Text>
                  </View>
                  {memory.photo && (
                    <Image 
                      source={{ uri: memory.photo }} 
                      style={styles.memoryThumbnail}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="images-outline"
                size={48}
                color={colors.text.light}
              />
              <Text style={styles.emptyText}>아직 저장된 추억이 없습니다</Text>
              <TouchableOpacity
                style={styles.addMemoryButton}
                onPress={() => navigation.navigate("Memory" as never)}
              >
                <Text style={styles.addMemoryText}>첫 추억 만들기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 플로팅 액션 버튼 */}
      <TouchableOpacity
        style={[styles.floatingButton, { bottom: insets.bottom + 80 }]}
        onPress={() => navigation.navigate("Memory" as never)}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.floatingGradient}
        >
          <Ionicons name="camera" size={28} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      {/* 하단 광고 배너 */}
      <AdBanner />

      {/* 기념일 추가 모달 */}
      <AddAnniversaryModal
        visible={showAddAnniversaryModal}
        onClose={() => setShowAddAnniversaryModal(false)}
        onSave={handleSaveAnniversary}
        editingAnniversary={editingAnniversary}
      />
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
  ddayCard: {
    margin: 20,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  ddayContent: {
    alignItems: "center",
  },
  ddayText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
    marginTop: 10,
    marginBottom: 5,
  },
  ddaySubtext: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginLeft: 8,
    flex: 1,
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  moreText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
    fontWeight: "600",
  },
  anniversaryItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  anniversaryInfo: {
    flex: 1,
  },
  anniversaryName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  anniversaryDate: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  anniversaryDays: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  daysUntilText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.light,
    marginTop: 10,
    textAlign: "center",
  },
  addMemoryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 20,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: "center",
  },
  addMemoryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    width: 66,
    height: 66,
    borderRadius: 33,
    elevation: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  floatingGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
  },
  memoryItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  memoryContent: {
    flex: 1,
    marginRight: 12,
  },
  memoryDateContainer: {
    marginBottom: 6,
  },
  memoryDate: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  memoryMemo: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 20,
  },
  memoryThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  addAnniversaryButton: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  anniversaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  anniversaryActions: {
    flexDirection: "row",
    gap: 8,
  },
  anniversaryActionButton: {
    padding: 4,
  },
});

export default HomeScreen;
