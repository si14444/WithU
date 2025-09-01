import React, { useEffect, useRef } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInterstitialAdUnitId } from '../utils/adMobConfig';

interface InterstitialAdManagerProps {
  onAdClosed?: () => void;
  onAdFailure?: (error: any) => void;
}

class InterstitialAdManager {
  private static instance: InterstitialAdManager;
  private interstitialAd: InterstitialAd;
  private isLoaded = false;
  private isShowing = false;
  private lastShownTime = 0;
  private showCount = 0;
  
  // 광고 표시 간격 (밀리초)
  private readonly MIN_INTERVAL = 3 * 60 * 1000; // 3분
  private readonly MAX_DAILY_SHOWS = 5; // 하루 최대 5번

  private constructor() {
    this.interstitialAd = InterstitialAd.createForAdRequest(getInterstitialAdUnitId());
    this.setupEventListeners();
    this.loadAd();
    this.loadStoredData();
  }

  public static getInstance(): InterstitialAdManager {
    if (!InterstitialAdManager.instance) {
      InterstitialAdManager.instance = new InterstitialAdManager();
    }
    return InterstitialAdManager.instance;
  }

  private setupEventListeners() {
    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
      this.isLoaded = true;
    });

    this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial ad failed to load:', error);
      this.isLoaded = false;
      // 5초 후 재시도
      setTimeout(() => this.loadAd(), 5000);
    });

    this.interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
      console.log('Interstitial ad opened');
      this.isShowing = true;
    });

    this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      this.isShowing = false;
      this.lastShownTime = Date.now();
      this.showCount++;
      this.saveStoredData();
      // 새로운 광고 로드
      this.loadAd();
    });
  }

  private loadAd() {
    if (!this.isLoaded && !this.isShowing) {
      this.interstitialAd.load();
    }
  }

  private async loadStoredData() {
    try {
      const storedData = await AsyncStorage.getItem('interstitialAdData');
      if (storedData) {
        const data = JSON.parse(storedData);
        const today = new Date().toDateString();
        
        if (data.date === today) {
          this.showCount = data.showCount || 0;
          this.lastShownTime = data.lastShownTime || 0;
        } else {
          // 새로운 날이면 카운트 리셋
          this.showCount = 0;
          this.lastShownTime = 0;
        }
      }
    } catch (error) {
      console.error('Failed to load interstitial ad data:', error);
    }
  }

  private async saveStoredData() {
    try {
      const data = {
        date: new Date().toDateString(),
        showCount: this.showCount,
        lastShownTime: this.lastShownTime,
      };
      await AsyncStorage.setItem('interstitialAdData', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save interstitial ad data:', error);
    }
  }

  private canShowAd(): boolean {
    const now = Date.now();
    
    // 하루 최대 횟수 초과
    if (this.showCount >= this.MAX_DAILY_SHOWS) {
      console.log('Daily ad limit reached');
      return false;
    }

    // 최소 간격 미달
    if (now - this.lastShownTime < this.MIN_INTERVAL) {
      console.log('Ad shown too recently');
      return false;
    }

    // 광고가 로드되지 않음
    if (!this.isLoaded) {
      console.log('Interstitial ad not loaded');
      return false;
    }

    // 이미 표시 중
    if (this.isShowing) {
      console.log('Interstitial ad already showing');
      return false;
    }

    return true;
  }

  public async showAd(): Promise<boolean> {
    if (!this.canShowAd()) {
      return false;
    }

    try {
      await this.interstitialAd.show();
      return true;
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
      this.isLoaded = false;
      this.loadAd();
      return false;
    }
  }

  // 특정 조건에서 광고 표시
  public async showAdOnCondition(condition: 'memory_saved' | 'anniversary_added' | 'app_resume' | 'gallery_closed'): Promise<boolean> {
    console.log(`Attempting to show ad on condition: ${condition}`);
    
    // 조건별 추가 로직
    switch (condition) {
      case 'memory_saved':
        // 5번째 추억 저장 후에만 표시
        const memoryCount = await this.getMemoryCount();
        if (memoryCount % 5 !== 0) return false;
        break;
        
      case 'app_resume':
        // 앱 재시작 시 30분 이상 경과한 경우만
        const lastCloseTime = await this.getLastAppCloseTime();
        if (Date.now() - lastCloseTime < 30 * 60 * 1000) return false;
        break;
        
      case 'gallery_closed':
        // 갤러리를 10초 이상 본 경우만
        // (이 로직은 갤러리 컴포넌트에서 시간 측정 필요)
        break;
    }

    return this.showAd();
  }

  private async getMemoryCount(): Promise<number> {
    try {
      const memories = await AsyncStorage.getItem('memories');
      return memories ? JSON.parse(memories).length : 0;
    } catch {
      return 0;
    }
  }

  private async getLastAppCloseTime(): Promise<number> {
    try {
      const time = await AsyncStorage.getItem('lastAppCloseTime');
      return time ? parseInt(time) : 0;
    } catch {
      return 0;
    }
  }
}

// React 컴포넌트로 사용할 수 있는 Hook
export const useInterstitialAd = () => {
  const managerRef = useRef<InterstitialAdManager>();

  useEffect(() => {
    managerRef.current = InterstitialAdManager.getInstance();
  }, []);

  const showAd = async (condition?: 'memory_saved' | 'anniversary_added' | 'app_resume' | 'gallery_closed') => {
    if (!managerRef.current) return false;
    
    if (condition) {
      return managerRef.current.showAdOnCondition(condition);
    } else {
      return managerRef.current.showAd();
    }
  };

  return { showAd };
};

export default InterstitialAdManager;