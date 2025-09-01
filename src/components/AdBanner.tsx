import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { colors } from "../constants/colors";
import { getBannerAdUnitId } from "../utils/adMobConfig";

interface AdBannerProps {
  style?: object;
}

const AdBanner: React.FC<AdBannerProps> = ({ style }) => {
  const insets = useSafeAreaInsets();

  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  const adUnitId = getBannerAdUnitId();

  const handleAdLoaded = () => {
    setAdLoaded(true);
    setAdError(false);
  };

  const handleAdFailedToLoad = (error: any) => {
    console.log('Ad failed to load:', error);
    setAdError(true);
    setAdLoaded(false);
  };

  if (adError) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Text style={styles.errorText}>광고를 불러올 수 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }, style]}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
      {!adLoaded && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>광고 로딩 중...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 100,
    padding: 10,
    backgroundColor: colors.white,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  errorContainer: {
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.text.light,
    fontSize: 12,
  },
  placeholderContainer: {
    marginTop: 10,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: colors.border,
  },
  placeholderText: {
    color: colors.text.light,
    fontSize: 12,
  },
});

export default AdBanner;
