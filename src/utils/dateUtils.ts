import { Anniversary } from '../types';

export const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDDay = (days: number): string => {
  return `오늘은 ${days}일째`;
};

export const generateAutoAnniversaries = (startDate: Date): Anniversary[] => {
  const anniversaries: Anniversary[] = [];
  const start = new Date(startDate);
  const today = new Date();
  
  // 개발 환경에서는 알림 수를 줄임 (100일, 200일, 300일, 1년만)
  const isDev = __DEV__;
  const maxDays = isDev ? 300 : 1000;
  const maxYears = isDev ? 1 : 10;
  
  // 100일 단위 기념일 생성
  for (let i = 100; i <= maxDays; i += 100) {
    const anniversaryDate = new Date(start);
    anniversaryDate.setDate(anniversaryDate.getDate() + i);
    
    const daysUntil = calculateDaysBetween(today, anniversaryDate);
    
    anniversaries.push({
      id: `auto-${i}`,
      name: `${i}일`,
      date: anniversaryDate,
      isCustom: false,
      daysUntil: anniversaryDate >= today ? daysUntil : -daysUntil
    });
  }
  
  // 연 단위 기념일 생성
  for (let year = 1; year <= maxYears; year++) {
    const anniversaryDate = new Date(start);
    anniversaryDate.setFullYear(anniversaryDate.getFullYear() + year);
    
    const daysUntil = calculateDaysBetween(today, anniversaryDate);
    
    anniversaries.push({
      id: `auto-year-${year}`,
      name: `${year}년`,
      date: anniversaryDate,
      isCustom: false,
      daysUntil: anniversaryDate >= today ? daysUntil : -daysUntil
    });
  }
  
  return anniversaries.filter(anniversary => anniversary.daysUntil >= 0);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric'
  });
};

export const calculateDaysUntilAnniversary = (anniversaryDate: Date): number => {
  const today = new Date();
  const anniversary = new Date(anniversaryDate);
  
  // 올해 날짜로 설정
  anniversary.setFullYear(today.getFullYear());
  
  // 이미 지났으면 내년으로 설정
  if (anniversary < today) {
    anniversary.setFullYear(today.getFullYear() + 1);
  }
  
  return calculateDaysBetween(today, anniversary);
};

export const updateAnniversaryDaysUntil = (anniversaries: Anniversary[]): Anniversary[] => {
  return anniversaries.map(anniversary => ({
    ...anniversary,
    daysUntil: calculateDaysUntilAnniversary(anniversary.date)
  }));
};