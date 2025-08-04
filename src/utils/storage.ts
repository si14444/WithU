import AsyncStorage from '@react-native-async-storage/async-storage';
import { Memory, Anniversary } from '../types';

const KEYS = {
  RELATIONSHIP_START_DATE: 'relationshipStartDate',
  MEMORIES: 'memories',
  CUSTOM_ANNIVERSARIES: 'customAnniversaries'
};

export const saveRelationshipStartDate = async (date: Date): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.RELATIONSHIP_START_DATE, date.toISOString());
  } catch (error) {
    console.error('Error saving relationship start date:', error);
    throw error;
  }
};

export const getRelationshipStartDate = async (): Promise<Date | null> => {
  try {
    const dateString = await AsyncStorage.getItem(KEYS.RELATIONSHIP_START_DATE);
    return dateString ? new Date(dateString) : null;
  } catch (error) {
    console.error('Error getting relationship start date:', error);
    return null;
  }
};

export const saveMemories = async (memories: Memory[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.MEMORIES, JSON.stringify(memories));
  } catch (error) {
    console.error('Error saving memories:', error);
    throw error;
  }
};

export const getMemories = async (): Promise<Memory[]> => {
  try {
    const memoriesString = await AsyncStorage.getItem(KEYS.MEMORIES);
    if (!memoriesString) return [];
    
    const memories = JSON.parse(memoriesString);
    return memories.map((memory: any) => ({
      ...memory,
      date: new Date(memory.date)
    }));
  } catch (error) {
    console.error('Error getting memories:', error);
    return [];
  }
};

export const addMemory = async (memory: Memory): Promise<void> => {
  try {
    const existingMemories = await getMemories();
    const updatedMemories = [...existingMemories, memory];
    await saveMemories(updatedMemories);
  } catch (error) {
    console.error('Error adding memory:', error);
    throw error;
  }
};

export const updateMemory = async (memoryId: string, updatedMemory: Partial<Memory>): Promise<void> => {
  try {
    const existingMemories = await getMemories();
    const memoryIndex = existingMemories.findIndex(memory => memory.id === memoryId);
    
    if (memoryIndex === -1) {
      throw new Error('Memory not found');
    }
    
    existingMemories[memoryIndex] = { ...existingMemories[memoryIndex], ...updatedMemory };
    await saveMemories(existingMemories);
  } catch (error) {
    console.error('Error updating memory:', error);
    throw error;
  }
};

export const deleteMemory = async (memoryId: string): Promise<void> => {
  try {
    const existingMemories = await getMemories();
    const updatedMemories = existingMemories.filter(memory => memory.id !== memoryId);
    await saveMemories(updatedMemories);
  } catch (error) {
    console.error('Error deleting memory:', error);
    throw error;
  }
};

export const saveCustomAnniversaries = async (anniversaries: Anniversary[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.CUSTOM_ANNIVERSARIES, JSON.stringify(anniversaries));
  } catch (error) {
    console.error('Error saving custom anniversaries:', error);
    throw error;
  }
};

export const getCustomAnniversaries = async (): Promise<Anniversary[]> => {
  try {
    const anniversariesString = await AsyncStorage.getItem(KEYS.CUSTOM_ANNIVERSARIES);
    if (!anniversariesString) return [];
    
    const anniversaries = JSON.parse(anniversariesString);
    return anniversaries.map((anniversary: any) => ({
      ...anniversary,
      date: new Date(anniversary.date)
    }));
  } catch (error) {
    console.error('Error getting custom anniversaries:', error);
    return [];
  }
};