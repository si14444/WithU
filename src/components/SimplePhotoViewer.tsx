import { Ionicons } from "@expo/vector-icons";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Modal,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { Memory } from "../types";
import { formatDate } from "../utils/dateUtils";
import { useInterstitialAd } from "./InterstitialAdManager";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface PhotoViewerProps {
  visible: boolean;
  memories: Memory[];
  initialIndex: number;
  onClose: () => void;
}

const SimplePhotoViewer: React.FC<PhotoViewerProps> = ({
  visible,
  memories,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [viewStartTime] = useState(Date.now());
  const insets = useSafeAreaInsets();
  const { showAd } = useInterstitialAd();
  
  const flatListRef = useRef<FlatList>(null);
  const slideshowTimer = useRef<NodeJS.Timeout | null>(null);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);

  const photosWithImages = memories.filter(memory => memory.photo);

  useEffect(() => {
    if (visible && photosWithImages.length > 0) {
      const validIndex = Math.min(initialIndex, photosWithImages.length - 1);
      setCurrentIndex(validIndex);
      
      // FlatList 초기 위치 설정을 지연시킴
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ 
          index: validIndex, 
          animated: false 
        });
      }, 100);
    }
  }, [visible, initialIndex]);

  useEffect(() => {
    if (isSlideshow && visible && photosWithImages.length > 1) {
      startSlideshow();
    } else {
      stopSlideshow();
    }
    return () => stopSlideshow();
  }, [isSlideshow, visible]);

  useEffect(() => {
    if (showControls) {
      hideControlsAfterDelay();
    }
    return () => {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    };
  }, [showControls]);

  const startSlideshow = () => {
    slideshowTimer.current = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % photosWithImages.length;
        flatListRef.current?.scrollToIndex({ 
          index: nextIndex, 
          animated: true 
        });
        return nextIndex;
      });
    }, 3000);
  };

  const stopSlideshow = () => {
    if (slideshowTimer.current) {
      clearInterval(slideshowTimer.current);
      slideshowTimer.current = null;
    }
  };

  const hideControlsAfterDelay = () => {
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    controlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const toggleControls = () => {
    setShowControls(prev => !prev);
    if (!showControls) {
      hideControlsAfterDelay();
    }
  };

  const toggleSlideshow = () => {
    setIsSlideshow(prev => !prev);
    setShowControls(true);
    hideControlsAfterDelay();
  };

  const goToPrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : photosWithImages.length - 1;
    setCurrentIndex(prevIndex);
    flatListRef.current?.scrollToIndex({ 
      index: prevIndex, 
      animated: true 
    });
  };

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % photosWithImages.length;
    setCurrentIndex(nextIndex);
    flatListRef.current?.scrollToIndex({ 
      index: nextIndex, 
      animated: true 
    });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderPhoto = ({ item, index }: { item: Memory; index: number }) => (
    <View style={styles.photoContainer}>
      <TouchableOpacity 
        style={styles.photoTouchable}
        onPress={toggleControls}
        activeOpacity={1}
      >
        <Image 
          source={{ uri: item.photo! }} 
          style={styles.photo} 
          resizeMode="contain" 
        />
      </TouchableOpacity>
    </View>
  );

  const getItemLayout = (_: any, index: number) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  });

  if (photosWithImages.length === 0) {
    return null;
  }

  const currentMemory = photosWithImages[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar hidden={!showControls} />
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={photosWithImages}
          renderItem={renderPhoto}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={getItemLayout}
          keyExtractor={(item) => item.id}
          onScrollToIndexFailed={(info) => {
            // 스크롤 실패 시 대안 처리
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({ 
                index: info.index, 
                animated: false 
              });
            });
          }}
        />

        {/* 컨트롤 오버레이 */}
        {showControls && (
          <View style={[styles.controlsOverlay, { paddingTop: insets.top }]}>
            {/* 상단 컨트롤 */}
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.controlButton} onPress={() => {
                const viewDuration = Date.now() - viewStartTime;
                onClose();
                // 10초 이상 본 경우 전면 광고 표시 시도
                if (viewDuration > 10000) {
                  setTimeout(() => {
                    showAd('gallery_closed');
                  }, 500);
                }
              }}>
                <Ionicons name="close" size={28} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.photoInfo}>
                <Text style={styles.photoCounter}>
                  {currentIndex + 1} / {photosWithImages.length}
                </Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.controlButton, 
                  photosWithImages.length <= 1 && styles.disabledButton
                ]} 
                onPress={photosWithImages.length > 1 ? toggleSlideshow : undefined}
                disabled={photosWithImages.length <= 1}
              >
                <Ionicons 
                  name={isSlideshow ? "pause" : "play"} 
                  size={24} 
                  color={photosWithImages.length > 1 ? colors.white : colors.text.light} 
                />
              </TouchableOpacity>
            </View>

            {/* 하단 정보 */}
            <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
              <Text style={styles.photoDate}>{formatDate(currentMemory.date)}</Text>
              {currentMemory.memo && (
                <Text style={styles.photoMemo} numberOfLines={3}>
                  {currentMemory.memo}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* 좌우 네비게이션 버튼 */}
        {showControls && (
          <>
            {photosWithImages.length > 1 && (
              <>
                <TouchableOpacity 
                  style={[styles.navButton, styles.prevButton]} 
                  onPress={goToPrevious}
                >
                  <Ionicons name="chevron-back" size={32} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.navButton, styles.nextButton]} 
                  onPress={goToNext}
                >
                  <Ionicons name="chevron-forward" size={32} color={colors.white} />
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  photoContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  photoTouchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  photo: {
    width: screenWidth,
    height: screenHeight,
  },
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  controlButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  disabledButton: {
    opacity: 0.5,
  },
  photoInfo: {
    flex: 1,
    alignItems: "center",
  },
  photoCounter: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  photoDate: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  photoMemo: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -25 }],
    padding: 15,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
});

export default SimplePhotoViewer;