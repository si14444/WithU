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
  Alert,
} from "react-native";
import { PanGestureHandler, PinchGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { Memory } from "../types";
import { formatDate } from "../utils/dateUtils";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface PhotoViewerProps {
  visible: boolean;
  memories: Memory[];
  initialIndex: number;
  onClose: () => void;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({
  visible,
  memories,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const insets = useSafeAreaInsets();
  
  const flatListRef = useRef<FlatList>(null);
  const slideshowTimer = useRef<NodeJS.Timeout | null>(null);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  
  // 애니메이션 값들
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const photosWithImages = memories.filter(memory => memory.photo);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      resetZoom();
    }
  }, [visible, initialIndex]);

  useEffect(() => {
    if (isSlideshow && visible) {
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

  const resetZoom = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  const startSlideshow = () => {
    slideshowTimer.current = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % photosWithImages.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 3000); // 3초마다 다음 사진
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
    }, 3000); // 3초 후 컨트롤 숨김
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
    flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    resetZoom();
  };

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % photosWithImages.length;
    setCurrentIndex(nextIndex);
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    resetZoom();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentIndex(index);
      resetZoom();
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // 핀치 제스처 핸들러
  const pinchGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(setShowControls)(false);
    },
    onActive: (event) => {
      scale.value = event.scale;
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
      }
      runOnJS(setShowControls)(true);
      runOnJS(hideControlsAfterDelay)();
    },
  });

  // 팬 제스처 핸들러
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(setShowControls)(false);
    },
    onActive: (event) => {
      translateX.value = event.translationX / scale.value;
      translateY.value = event.translationY / scale.value;
    },
    onEnd: () => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      runOnJS(setShowControls)(true);
      runOnJS(hideControlsAfterDelay)();
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const renderPhoto = ({ item, index }: { item: Memory; index: number }) => (
    <View style={styles.photoContainer}>
      <TouchableOpacity 
        style={styles.photoTouchable}
        onPress={toggleControls}
        activeOpacity={1}
      >
        <PanGestureHandler onGestureEvent={panGestureHandler}>
          <Animated.View>
            <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
              <Animated.View style={animatedStyle}>
                <Image source={{ uri: item.photo! }} style={styles.photo} resizeMode="contain" />
              </Animated.View>
            </PinchGestureHandler>
          </Animated.View>
        </PanGestureHandler>
      </TouchableOpacity>
    </View>
  );

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
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          initialScrollIndex={initialIndex}
        />

        {/* 컨트롤 오버레이 */}
        {showControls && (
          <Animated.View 
            style={[styles.controlsOverlay, { paddingTop: insets.top }]}
          >
            {/* 상단 컨트롤 */}
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.controlButton} onPress={onClose}>
                <Ionicons name="close" size={28} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.photoInfo}>
                <Text style={styles.photoCounter}>
                  {currentIndex + 1} / {photosWithImages.length}
                </Text>
              </View>
              <TouchableOpacity style={styles.controlButton} onPress={toggleSlideshow}>
                <Ionicons 
                  name={isSlideshow ? "pause" : "play"} 
                  size={24} 
                  color={colors.white} 
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
          </Animated.View>
        )}

        {/* 좌우 네비게이션 버튼 */}
        {showControls && (
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

export default PhotoViewer;