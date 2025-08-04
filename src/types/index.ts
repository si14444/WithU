export interface Anniversary {
  id: string;
  name: string;
  date: Date;
  isCustom: boolean;
  daysUntil: number;
}

export interface Memory {
  id: string;
  date: Date;
  photo?: string;
  memo: string;
  timestamp: number;
}

export interface AppState {
  relationshipStartDate: Date | null;
  memories: Memory[];
  customAnniversaries: Anniversary[];
}